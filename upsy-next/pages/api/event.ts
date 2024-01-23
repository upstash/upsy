import type {NextApiRequest, NextApiResponse} from "next";
import {getRawBody, verifyRequest} from "@/lib/slack";
import {Client} from "@upstash/qstash";
import {Redis} from "@upstash/redis";


export const fetchCache = 'force-no-store'

const redis = Redis.fromEnv();

let botId;
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // get current time in millis
    const now = new Date().getTime();
    const rawBody = await getRawBody(req);
    const body = JSON.parse(Buffer.from(rawBody).toString('utf8'));

    if (body.type === "url_verification") {
        return res.status(200).send({
            challenge: body.challenge,
        });
    }

    if (!await verifyRequest(req, rawBody)) {
        console.log("verification.failed:" + body.event.text);
        return res.status(401).json({message: "verification failed"});
    }
    // else {
    //     console.log("verification.success:" + body.event.type);
    // }

    if (body.type === "event_callback" && body.event && !body.event.bot_id) {
        const event = body.event;

        if (event.client_msg_id) {
            const isDuplicate = await redis.setnx(body.event.client_msg_id, "1");
            if (isDuplicate == 0) {
                console.log("duplicate message received, skipping:" + body.event.client_msg_id);
                console.log(event)
                return res.status(200).json({message: "duplicate message received, skipping"});
            }
        }

        if(event.bot_profile && event.bot_profile.name === "upsy") {
            // console.log("skipping messages received from upsy");
            return res.status(200).json({ message: "skipping messages received from upsy" });
        }

        if(event.user === 'USLACKBOT' || event.subtype === "channel_join") {
            // console.log("skipping non message event");
            return res.status(200).json({ message: "skipping non user messages" });
        }


        const c = new Client({
            token: "eyJVc2VySUQiOiI4ZTRjYjM0OS04ZjY0LTRhNTgtODRiMS1iMDNiNTk5NmNhODgiLCJQYXNzd29yZCI6IjMwY2EzYmU2MTk4MzQzMmVhM2IxNTRjMTAzMjhhOGQ2In0=",
        });

        const qstashResponse = await c.publishJSON({
            url: "https://upsy-next.vercel.app/api/message",
            // or topic: "the name or id of a topic"
            body: {
                event: body.event,
            },
        });

        // find time difference
        const diff = new Date().getTime() - now;
        console.log(body.event);
        console.log("time.diff:" + diff);

        return res.status(200).json({message: "message received"});
    }

    return res.status(200).json({message: "Unknown event type 222"});
}

export const config = {
    api: {
        bodyParser: false,
    },
};