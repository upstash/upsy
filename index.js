import "dotenv/config";
import SlackBolt from "@slack/bolt";
import moment from "moment";
import { Redis } from "@upstash/redis";
import * as llm from "./upsy-next/lib/llm.mjs";

const redis = Redis.fromEnv();

// Usage
const { App } = SlackBolt;

/*
https://upsy.vercel.app/api/event
https://upsy.fly.dev/slack/events
 */

const SLACK_ACCESS_TOKEN = process.env.SLACK_ACCESS_TOKEN;
const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET;
const SLACK_APP_TOKEN = process.env.SLACK_APP_TOKEN;

// Initializes your app with your bot token and signing secret
const app = new App({
  token: SLACK_ACCESS_TOKEN,
  signingSecret: SLACK_SIGNING_SECRET,
  socketMode: false, // add this
  appToken: SLACK_APP_TOKEN,
});

const historyPeriod = moment().subtract(12, "months").unix();

async function saveChannelHistory(channelId) {
  try {
    async function fetchMessages(cursor) {
      const result = await app.client.conversations.history({
        channel: channelId,
        oldest: historyPeriod.toString(),
        limit: 1000, // Slack recommends a reasonable default
        cursor: cursor, // cursor for pagination
      });

      // Print messages
      const messagesArray = [];
      if (result.ok && result.messages) {
        console.warn("result.messages.length:" + result.messages.length);
        for (const message of result.messages) {
          if (
            !message.bot_id &&
            message.type === "message" &&
            message.subtype !== "channel_join" &&
            message.text
          ) {
            messagesArray.push(message.text);
          }
        }
        await llm.addDocuments(
          messagesArray,
          channelId,
          "slack-channel-history",
        );

        // If more messages are available, fetch them
        if (result.response_metadata && result.response_metadata.next_cursor) {
          await fetchMessages(result.response_metadata.next_cursor);
        }
      }
    }

    // Start the message fetching process
    await fetchMessages(0);
  } catch (error) {
    console.error(error);
  }
}

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);
  console.log("⚡️ Bolt app is running!");

  const result = await app.client.auth.test();
  console.log("Bot User ID:", result.user_id);
  const botId = result.user_id;

  app.event("member_joined_channel", async ({ event, client, logger }) => {
    try {
      // Check if the joined member is your bot
      console.log(event);
      if (event.user === botId) {
        console.log("upsy joining");
        await saveChannelHistory(event.channel);
      }
    } catch (error) {
      logger.error(error);
    }
  });

  // Listens to incoming messages that contain "hello"
  app.message(/.*/, async ({ event, say }) => {
    // This will match any message and respond with "hello"
    if (event.bot_profile && event.bot_profile.name === "upsy") {
      console.log("skipping messages received from upsy");
      return;
    }

    if (event.type !== "message" || event.user === "USLACKBOT") {
      console.log("skipping non message event");
      return;
    }

    const msg = event.text;

    if (event.client_msg_id) {
      const isDuplicate = await redis.setnx(event.client_msg_id, "1");
      if (isDuplicate == 0) {
        console.log(
          "duplicate message received, skipping:" + event.client_msg_id,
        );
        console.log(event);
        return res
          .status(200)
          .json({ message: "duplicate message received, skipping" });
      }
    }

    let response = "NONE";
    console.log("NEW MESSAGE");
    console.log(event);
    console.log(msg);

    const messageLowerCase = msg.toLowerCase();
    let isItQuestion = false;
    if (event.channel_type === "im") {
      response = await llm.query(
        "im",
        event.text,
        event.channel,
        event.user,
        true,
      );
      console.log("answer:" + response);
      if (response && response.trim() !== "NONE") {
        await say(response);
      }
      isItQuestion = await llm.isQuestion(msg);
    } else if (event.channel_type === "channel") {
      isItQuestion = await llm.isQuestion(msg);

      if (isItQuestion || messageLowerCase.includes("upsy")) {
        if (messageLowerCase.includes("upsy")) {
          response = await llm.query(
            "im",
            event.text,
            event.channel,
            event.user,
            true,
          );
        } else {
          response = await llm.query(
            "channel",
            event.text,
            event.channel,
            event.user,
            true,
          );
        }
        console.log("answer:" + response);
        if (response && response.trim() !== "NONE") {
          await say(response);
        }
      }
    }

    console.log("isItQuestion:" + isItQuestion);
    if (!isItQuestion) {
      await llm.addDocument(
        { type: "slack-message", channelId: event.channel, content: msg },
        msg,
      );
    }
  });
})();
