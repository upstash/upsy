import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import {Readable} from "node:stream";
import moment from "moment";
import {addDocuments} from "@/lib/llm.mjs";


const SLACK_ACCESS_TOKEN = process.env.SLACK_ACCESS_TOKEN as string;
const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET as string;


export async function verifyRequest(req: NextApiRequest, rawBody) {
    const requestBody = rawBody;
    const headers = req.headers;

    const timestamp = headers["x-slack-request-timestamp"];
    const slackSignature = headers["x-slack-signature"] as string;
    const baseString = "v0:" + timestamp + ":" + requestBody;

    const hmac = crypto
        .createHmac("sha256", SLACK_SIGNING_SECRET)
        .update(baseString)
        .digest("hex");
    const computedSlackSignature = "v0=" + hmac;
    // console.log("computedSlackSignature: " + computedSlackSignature);
    // console.log("slackSignature: " + slackSignature);
    const isValid = crypto.timingSafeEqual(Buffer.from(computedSlackSignature), Buffer.from(slackSignature));

    return isValid;
}

export async function findBotsUserId() {
    const response = await fetch('https://slack.com/api/auth.test', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${SLACK_ACCESS_TOKEN}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    if (!response.ok) {
        throw new Error('Slack API request failed: ' + response.statusText);
    }

    const data = await response.json();

    if (!data.ok) {
        throw new Error('Error from Slack: ' + data.error);
    }

    return data.user_id; // This is the bot's user ID
}


export async function sendSlackMessage(channelId: string, message: string) {
    const response = await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SLACK_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
            text: message,
            channel: channelId
        }),
        cache: "no-store",
    });
    return {
        response
    };
}

const historyPeriod = moment().subtract( 48, 'months').unix();

export async function saveChannelHistory(channelId) {
    try {
        async function fetchMessages(cursor) {
            let currentCursor = 0;
            if (cursor) {
                currentCursor = cursor;
            }
            // console.log("fetching messages for channel:" + channelId + " cursor:" + currentCursor);

            const response = await fetch("https://slack.com/api/conversations.history", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    Authorization: `Bearer ${SLACK_ACCESS_TOKEN}`,
                },
                body: JSON.stringify({
                    channel: channelId,
                    oldest: historyPeriod.toString(),
                    limit: 1000,
                    cursor: currentCursor
                }),
                cache: "no-store",
            });

            const result = await response.json();

            const messagesArray: string[] = [];
            if (result.ok && result.messages) {
                console.warn("result.messages.length:" + result.messages.length)
                for (const message of result.messages) {
                    if (!message.bot_id && message.type === "message" && message.subtype !== "channel_join" && message.text) {
                        messagesArray.push(message.text);
                    }
                }
                await addDocuments(messagesArray, channelId, "slack-channel-history");

                // If more messages are available, fetch them
                if (result.response_metadata && result.response_metadata.next_cursor) {
                    await fetchMessages(result.response_metadata.next_cursor);
                }
            }
        }

        // Start the message fetching process
        await fetchMessages(0);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

export async function getRawBody(readable: Readable): Promise<Buffer> {
    const chunks = [];
    for await (const chunk of readable) {
        // @ts-ignore
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}