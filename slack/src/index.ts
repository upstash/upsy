import { App } from "@slack/bolt";
import moment = require("moment");
import { Redis } from "@upstash/redis";
import {
  addDocuments,
  addDocument,
  query,
  isQuestion,
  isWorthReaction,
} from "./llm/llm";
import { extractTextFromDocx, extractTextFromPDF } from "./utils/util";

const redis = Redis.fromEnv();

// Usage
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
      let messages = [];

      if (result.ok && result.messages) {
        console.warn("result.messages.length:" + result.messages.length);
        for (const message of result.messages) {
          if (
            !message.bot_id &&
            message.type === "message" &&
            message.subtype !== "channel_join" &&
            message.text
          ) {
            let metadata = {
              id: (message as any).client_msg_id,
              type: 'slack-message',
              author: (message as any).user,
              guildId: (message as any).team,
              channelId: (message as any).channel,
              content: message.text,
          }
            messages.push({id: (message as any).client_msg_id, content: message.text, metadata: metadata});
          }
        }
        await addDocuments(messages);

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
  console.log("⚡️⚡️⚡️⚡️⚡️ Bolt app is running!");

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
  app.message(/.*/, async ({ event, say, client }) => {
    // console.log(JSON.stringify(event));

    console.log("START");

    // This will match any message and respond with "hello"
    if (event.type !== "message" || (event as any).user === "USLACKBOT") {
      console.log("skipping non message event");
      return;
    }

    if (event.type !== "message" || (event as any).user === "USLACKBOT") {
      console.log("skipping non message event");
      return;
    }

    let msg = (event as any).text;

    if ((event as any).client_msg_id) {
      const isDuplicate = await redis.setnx((event as any).client_msg_id, "1");
      if (isDuplicate == 0) {
        console.log(
          "duplicate message received, skipping:" + (event as any).client_msg_id
        );
      }
    }

    let response = "NONE";
    const authorInfo = await app.client.users.info({
      user: (event as any).user,
    });


    const messageLowerCase = msg.toLowerCase();
    let upsyMentioned =
      messageLowerCase.includes("upsy") ||
      messageLowerCase.includes(botId.toLowerCase());

    console.log(event.channel_type);
    console.log("upsyMentioned:" + upsyMentioned);


    let reaction = await isWorthReaction(msg);
    if (reaction && !upsyMentioned) {
      try {
        await client.reactions.add({
          channel: event.channel,
          timestamp: event.ts,
          name: reaction, // Reaction emoji
        });
      } catch (error) {
        console.error("Error adding reaction:", error);
      }
    }

    let isItQuestion = false;
    if (event.channel_type == "im") {
      try {
        await client.reactions.add({
          channel: event.channel,
          timestamp: event.ts,
          name: "runner", // Reaction emoji
        });
      } catch (error) {
        console.error("Error adding reaction:", error);
      }

      response = await query(
        "im",
        (event as any).text,
        event.channel,
        (event as any).user,
        true
      );
      if (response && response.trim() !== "NONE") {
        await say(response + " <@" + (event as any).user + ">");
      }
      isItQuestion = await isQuestion(msg);
    } else if (event.channel_type == "channel") {
      isItQuestion = await isQuestion(msg);
      if (upsyMentioned) {
        try {
          await client.reactions.add({
            channel: event.channel,
            timestamp: event.ts,
            name: "runner", // Reaction emoji
          });
        } catch (error) {
          console.error("Error adding reaction:", error);
        }

        console.log("UPSY MENTIONED");
        response = await query(
          "im",
          (event as any).text,
          event.channel,
          (event as any).user,
          true
        );
      }
      console.log("answer:" + response);
      if (response && response.trim() !== "NONE") {
        await say(response + " <@" + (event as any).user + ">");
      }
    }

    //Save Message/Files Part
    //TODO: add filtering while saving messages so that non-valuable messages are not saved
    console.log("isItQuestion:" + isItQuestion);
    if (!isItQuestion) {
      if ((event as any).files) {
        for (let i = 0; i < (event as any).files.length; i++) {
          const attachment = (event as any).files[i];
          let msgText = "";
          if (attachment.mimetype === "application/pdf") {
            console.log(attachment);
            msgText =
              "Author: " +
              (authorInfo as any).user.real_name +
              "Attachment Name: " +
              attachment.name +
              " Attachment Url:" +
              attachment.url_private +
              " Attachment Description:" +
              (event as any).text +
              ", Attachment Upload Date: " +
              new Date().toLocaleDateString() +
              ", Attachment Text: " +
              (await extractTextFromPDF(attachment.url_private));
          } else if (
            attachment.mimetype ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          ) {
            msgText =
              "Author: " +
              (authorInfo as any).user.real_name +
              "Attachment Name: " +
              attachment.name +
              ", Attachment Url:" +
              attachment.url_private +
              ", Attachment Description:" +
              (event as any).text +
              ", Attachment Upload Date: " +
              new Date().toLocaleDateString() +
              ", Attachment Text: " +
              (await extractTextFromDocx(attachment.url_private));
          }
          await addDocument(
            {
              id: (event as any).client_msg_id + "-" + i,
              type: "slack-message",
              author: authorInfo?.user?.real_name,
              guildId: (event as any).team,
              channelId: event.channel,
              content: msgText,
            },
            msg
          );
        }
      } else {
        msg += ", Date: " + new Date().toLocaleDateString();
        msg += ", Author: " + authorInfo?.user?.real_name;

        await addDocument(
          {
            id: (event as any).client_msg_id,
            type: "slack-message",
            author: authorInfo?.user?.real_name,
            guildId: (event as any).team,
            channelId: event.channel,
            content: msg,
          },
          msg
        );
      }
    }
  });
})();
