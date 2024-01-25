# Upsy: Your new mate on Slack. Powered by AI.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fupstash%2Fupsy%2Ftree%2Fmaster%2Fupsy-next&env=OPENAI_API_KEY,UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN,QSTASH_TOKEN,QSTASH_NEXT_SIGNING_KEY,QSTASH_CURRENT_SIGNING_KEY,UPSTASH_VECTOR_REST_URL,UPSTASH_VECTOR_REST_TOKEN,SLACK_ACCESS_TOKEN,SLACK_SIGNING_SECRET&project-name=upsy&repository-name=upsy)



Upsy is a unique Slack bot that acts like your colleague but with a superpower: it remembers all conversations. When you add Upsy to a Slack channel, it pulls all conversations from the channel's history and starts listening to new messages. If a question is asked, Upsy checks his memory context and answers if he finds a relevant response in the context, which comprises all messages across all channels.

// todo image

## Features

**Channel Conversations:** Add Upsy to any channel, and it will store the channel history into its memory. In the channel, Upsy jumps in only if a question is asked that has an answer in Upsy’s memory or if someone mentions Upsy in their message.

**Direct Messages:** Communicate with Upsy via Direct Messages (DMs). Here, it functions similarly to ChatGPT. You can add new information to Upsy’s memory by interacting in DMs.

**Unified Memory:** Upsy possesses a single, combined memory. This enables him to use information learned from one channel in another channel.

Upsy is an open-source project. You can deploy and run the backend and integrate it into your Slack channel. The code is customizable, allowing you to tailor Upsy’s behavior to your preferences. We will guide you through setting up Upsy for your Slack workspace step by step.

## Stack

**Backend:** Node.js ([Fly.io](https://fly.io) version), Next.js ([Vercel](https://vercel.com) version)

**AI Integration:** OpenAI for embedding and chat API

**Data Storage:** Upstash Vector for vector store, Upstash Redis for chat history

**LLM Orchestration:** [Langchain](https://langchain.com)

**Deployment Options:** [Fly.io](https://fly.io), [Vercel](https://vercel.com)

## 0 - Prerequisites

Create an [OpenAI](https://openai.com) account to obtain an API key. Set up an [Upstash](https://console.upstash.com) account and create one Redis and one Vector database. These keys will be required as environment variables in the backend deployment step.

## 1 - Slack App Set up

Create a Slack app in your team account. Go to https://api.slack.com/apps, click on Create New App, then select From an app manifest. After selecting your workspace, copy and paste the below configuration into the JSON editor:

```json
{
    "display_information": {
        "name": "upsy",
        "description": "Your new mate on Slack. Powered by AI.",
        "background_color": "#000000"
    },
    "features": {
        "bot_user": {
            "display_name": "upsy",
            "always_online": true
        }
    },
    "oauth_config": {
        "scopes": {
            "bot": [
                "app_mentions:read",
                "channels:history",
                "channels:join",
                "channels:read",
                "chat:write",
                "groups:history",
                "im:history",
                "im:read",
                "im:write",
                "im:write.invites",
                "mpim:history",
                "reactions:read",
                "reactions:write",
                "users:read",
                "groups:read",
                "mpim:read"
            ]
        }
    },
    "settings": {
        "event_subscriptions": {
            "request_url": "https://example.com/",
            "bot_events": [
                "member_joined_channel",
                "member_left_channel",
                "message.channels",
                "message.groups",
                "message.im",
                "message.mpim"
            ]
        },
        "org_deploy_enabled": false,
        "socket_mode_enabled": false,
        "token_rotation_enabled": false
    }
}
```

Click on `Create`.

After clicking on Create, go to OAuth & Permissions in the App dashboard, click on Install to Workspace, and install it. You will then have an access token to be used in the next step.

Congratulations, you've created your Slack app. We will revisit this dashboard to copy Slack tokens in the next step.

## 2 - Backend Deployment

We have two options for hosting our application: deploying to Fly.io or Vercel.


### 2.1 - Fly Deployment

Clone the Upsy repository:

```bash
git clone git@github.com:upstash/upsy.git
```                                      
                          
Rename `fly.toml.example` to `fly.toml` and set the environment variables correctly.

```properties

[env]
OPENAI_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
UPSTASH_VECTOR_REST_URL=
UPSTASH_VECTOR_REST_TOKEN=
SLACK_ACCESS_TOKEN= -> Bot User OAuth Token
SLACK_SIGNING_SECRET=
```


Deploy your app to Fly.io by running the below command:

```bash
fly deploy
```

Monitor the logs:

```bash
fly logs
```

> [!WARNING]  
> Warning: For production use, secure your environment variables using secrets on the Fly platform.



### 2.2 - Vercel Deployment
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fupstash%2Fupsy%2Ftree%2Fmaster%2Fupsy-next&env=OPENAI_API_KEY,UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN,QSTASH_TOKEN,QSTASH_NEXT_SIGNING_KEY,QSTASH_CURRENT_SIGNING_KEY,UPSTASH_VECTOR_REST_URL,UPSTASH_VECTOR_REST_TOKEN,SLACK_ACCESS_TOKEN,SLACK_SIGNING_SECRET&project-name=upsy&repository-name=upsy)                              

Deploy Upsy backend to Vercel by clicking the provided Deploy button. Ensure all environment variables are set correctly:

```properties
OPENAI_API_KEY= 
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
QSTASH_TOKEN=
QSTASH_CURRENT_SIGNING_KEY=
QSTASH_NEXT_SIGNING_KEY=
UPSTASH_VECTOR_REST_URL=
UPSTASH_VECTOR_REST_TOKEN=
SLACK_ACCESS_TOKEN= -> Bot User OAuth Token
SLACK_SIGNING_SECRET=
APP_URL= -> your Vercel app url. you will add this after deployment 
```

Once, the project is deployed, go to your Slack dashboard. On the left menu click on `Event & Subscriptions`. Enter Vercel app url appending `/api/event` (example: [https://upsy.vercel.app/api/event](https://upsy.vercel.app/api/event)) to the Request URL input.


Finally, add APP_URL (your Vercel app url) as an environment variable in Vercel and redeploy.

You can check the logs in Vercel console or by running the below command.

```bash
vercel logs  <YOUR_APP_URL> -f
```

> [!WARNING]  
> For production use, secure your environment variables as secrets on the Vercel platform.


## 3 - Testing Upsy

The simplest way to test the integration is by asking questions to Upsy in DM. You can also add Upsy to a channel and ask questions there. Upsy answers questions in the channel only if he knows the answer. However, if you mention Upsy in the question, he will try to answer even if he does not know the answer.

When you add Upsy to a channel, it will copy history to Upstash Vector. Therefore, add Upsy to a channel and then ask a question that is mentioned in the channel history. You can also check the Upstash Vector dashboard to see if the channel history is stored in the vector db.

In addition to Vector storage, Upsy also keeps a short-term conversation memory. To test this, you can simply say a number, and Upsy will remember it. Afterwards, you can ask Upsy to increment the number in the next message.

You can provide new information to Upsy in DM and ask about it in a public channel. Upsy should answer correctly.



## How does it work?
Upsy runs on RAG architecture. So when a message is received by Upsy backend it collects the context from Upstash Vector and sends it to OpenAI for embedding. Morevoer it collects the conversation history from Upstash Redis. Then it sends the question, history and context to Langchain to get the answer. Finally, it sends the answer to Slack.   

<img src="https://raw.githubusercontent.com/upstash/upsy/master/architecture.png" width="800">

<img src="https://raw.githubusercontent.com/upstash/upsy/master/algorithm.png" width="600">


### Troubleshooting


**DM Issues:** If you see "Sending messages to this app has been turned off" in the DM screen of Upsy, then you can try restarting your Slack. If the issue is not resolved, you can remove Upsy from your workspace, reinstall it, and approve the requested scopes.

**Non-responsiveness:** If Upsy appears online but never answers back, things to check include:
- Check the logs in Vercel or Fly console.
- If you are running on Vercel, check the logs on QStash console.
- Check if your Slack token and signing keys are correct.

**Context Awareness:** If Upsy answers but is not aware of the context (channel history), please do the following:

- Verify if Upsy pulls the history and adds it to Vector when you add Upsy to a channel by checking the logs in Vercel or Fly console.
- Check the Upstash Vector dashboard to confirm if the channel history is stored in the vector.

**Behavior Adjustment:** If you think Upsy talks too much or be intrusive:
- Check out the code and update the prompts in llm.mjs file. You can also change the `temperature` parameter to make Upsy more talkative or less talkative. You need to deploy the application.

### Development
Enable Socket mode from Slack dashboard for easier development.

For Fly version use the root folder. 
```bash
   npm install
   node index.js
```

For Vercel version use the `upsy-next` folder.
```bash
   cd upsy-next
   npm install
   npm run dev
```

## Future Work
Upsy is a work in progress. We will be adding more features and improving the current ones. We hope to receive support from the community through contributions. Here are some of the features we plan to add.

- Add documents to the context so that Upsy can memorize and use them as context.

- Add a web interface to manage Upsy so that users can add new information to Upsy’s memory via the web interface and configure Upsy’s behavior.

- More proactive Upsy - Upsy will initiate conversations with you or respond to welcome, birthday, etc. messages.

- Ability to choose personal characters for Upsy, such as ones that are friendlier, funnier, or more serious, etc.

Upsy is open source. We are looking for your contributions. You can contribute by adding new features, fixing bugs, improving the documentation, writing blog posts, and sharing on social media, among other things.

