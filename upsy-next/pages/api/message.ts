import type { NextApiRequest, NextApiResponse } from "next";
import {
    findBotsUserId,
    getRawBody,
    saveChannelHistory,
    sendSlackMessage
} from "@/lib/slack";
import {addDocument, isQuestion, query} from "@/lib/llm.mjs";
import {verifySignatureAppRouter} from "@upstash/qstash/dist/nextjs";

export const fetchCache = 'force-no-store'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const rawBody = await getRawBody(req);
    const data = JSON.parse(Buffer.from(rawBody).toString('utf8'));
    if (data.event && data.event.type === "member_joined_channel") {
        const event = data.event;
        console.log("member_joined_channel");
        console.log(event);
        const botId  = await findBotsUserId();
        if(event.user === botId) {
            console.log("upsy joining");
            await saveChannelHistory(event.channel);
            return res.status(200).json({ message: "upsy joined the channel" });
        } else {
            console.log("skipping someone else joining");
            return res.status(200).json({ message: "another member joined channel" });
        }
    }
    else if (data.event && data.event.type === "message") {
        const event = data.event;
        const msg = event.text;
        let response = "NONE";
        console.log("NEW MESSAGE");
        console.log("--------------------");
        console.log(msg);


        const messageLowerCase = msg.toLowerCase();
        let isItQuestion = false;
        console.log("answer:"+response)
        if(event.channel_type === "im"  ) {
            response = await query("im", event.text, event.channel, event.user, true);
            if(response && response.trim() !== "NONE") {
                await sendSlackMessage(event.channel, response);
            }
            isItQuestion = await isQuestion(msg);
        } else if(event.channel_type === "channel" ) {
            isItQuestion = await isQuestion(msg);

            if (isItQuestion || messageLowerCase.includes("upsy")) {
                if (messageLowerCase.includes("upsy")) {
                    response = await query("im", event.text, event.channel, event.user, true);
                }
                else {
                    response = await query("channel", event.text, event.channel, event.user, true);
                }
                if(response && response.trim() !== "NONE") {
                    await sendSlackMessage(event.channel, response);
                }
            }
        }

        console.log("isItQuestion:"+isItQuestion);
        if (!isItQuestion) {
            await addDocument( { type: "slack-message", channelId: event.channel, content:msg }, msg);
        }


        return res.status(200).json({ message: "message received" });
    }

    return res.status(200).json({ message: "Unknown event type" });
}

// @ts-ignore
export const POST = verifySignatureAppRouter(handler);

export const config = {
    api: {
        bodyParser: false,
    },
};