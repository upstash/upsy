# Upsy: Your new mate on Slack. Powered by AI.

Upsy is a Slack bot which acts like your collegue but with one super power. He can keep all conversations in his mind. When you add Upsy to a Slack channel, it will pull all conversations in channel history and starts to listen new messages. When a question is asked, Upsy checks his memory context, he answers if he finds an answer in the context which is composed of all messages in all channels.

// todo image

## Features

- Channel conversations: Add Upsy to any channel so he will add the channel history to his memory. In channel, Upsy jumps in only if one asks a question which has an answer in the Upsy’s memory or if one mentions Upsy in their message.
- Direct messages: You can communicate with Upsy via DMs. This time it will act just like ChatGPT. You can add new information to Upsy’s memory by entering in DM.
- Upsy has a single combined memory. So he can use an information that he learnt from a channel in another channel.

Upsy is an open source project. You can deploy and run the backend and add it to your  Slack channel. You can modify the code depending on your preferences to customize his behaviour. We will show you how to set up Upsy for your own Slack step by step.

## Stack

Backend: Node (fly version), Next.js (Vercel version)

Embedding and chat api: OpenAI

Vector store: Upstash Vector

Chat history: Upstash Redis

LLM Orchestration: Langchain

Deployment: Fly or Vercel

## 0 - Prerequisites

We need to create and OpenAI account and get API key. Also we will need an Upstash account to create Upstash Redis and Vector databases. In the backend deployment step we will need these keys to set as environement variables.

## 1 - Slack App Set up

We will create a Slack app in our team account. Go to [https://api.slack.com/apps](https://api.slack.com/apps) then click on `Create New App` then select `From an app manifest.` After selecting workspace, copy/paste the below configuration to the json editor.

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

In the App dashboard click on `OAuth&Permissions`. Click `Install to Workspace`,  and install. Now we have an access token which will be used in the next step.

Congratulations, we have created our Slack app. We will revisit this dashboard to copy Slack tokens in the next step.

## 2 - Backend Deployment

We have two options about hosting our applications. You can either deploy to Fly or Vercel.


### 2.1 - Fly Deployment

First clone the upsy repository.

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

Different than Vercel, we do not need to set QStash variables, as QStash is not required in Fly version. 

On your project folder, deploy your app to fly by running the below command.

```bash
fly deploy
```

You can check the logs by running the below command.

```bash
fly logs
```

> [!WARNING]  
> If you are planning to use Upsy in production, put your environment variables as secrets to Fly platform.


### 2.2 - Vercel Deployment

<a href="[https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fupstash%2Fupsy%2Ftree%2Fmaster%2Fupsy-next&env=OPENAI_API_KEY,UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN,QSTASH_TOKEN,QSTASH_NEXT_SIGNING_KEY,QSTASH_CURRENT_SIGNING_KEY,UPSTASH_VECTOR_REST_URL,UPSTASH_VECTOR_REST_TOKEN,SLACK_ACCESS_TOKEN,SLACK_SIGNING_SECRET&project-name=upsy&repository-name=upsy](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fupstash%2Fupsy%2Ftree%2Fmaster%2Fupsy-next&env=OPENAI_API_KEY,UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN,QSTASH_TOKEN,QSTASH_NEXT_SIGNING_KEY,QSTASH_CURRENT_SIGNING_KEY,UPSTASH_VECTOR_REST_URL,UPSTASH_VECTOR_REST_TOKEN,SLACK_ACCESS_TOKEN,SLACK_SIGNING_SECRET&project-name=upsy&repository-name=upsy)"><img src="[https://vercel.com/button](https://vercel.com/button)" alt="Deploy with Vercel"/></a>

We can deploy Upsy backend to Vercel by clicking on the Deploy button above, we need to set the environment variables correctly.

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

Once, the project is deployed, go to your Slack dashboard. On the left menu click on `Event & Subscriptions` Copy your Vercel app url, append `/api/event` (example: [https://upsy.vercel.app/api/event](https://upsy.vercel.app/api/event)) then paste into Request URL input.

As last step, we will add an environment to Vercel app. Go to `Settings` then `Environment Variables` then add `APP_URL` and set it to your Vercel app url (example: [https://upsy.vercel.app](https://upsy.vercel.app)). You need to redeploy project to make this change effective.

You can check the logs in Vercel console or by running the below command.

```bash
vercel logs  <YOUR_APP_URL> -f
```

> [!WARNING]  
> If you are planning to use Upsy in production, put your environment variables as secrets to Vercel platform.

## 3 - Testing Upsy 
The simplest way to test the integration is asking questions to Upsy in DM. You can also add Upsy to a channel and ask questions there. Upsy answers questions in channel if only if he knows the answer. But if you mention upsy in the question he will try to answer even if he does not know the answer. 

When you add Upsy to a channel he will pull the history and store them in Upstash Vector. So add Upsy to a channel then ask a question which is mentioned in channel history. You can also check Upstash Vector dashboard to see the channel history is stored in the vector.

In addition to Vector storage, Upsy keeps a short term conversation memory. To test that you can simply say a number and Upsy will remember it. Then you can ask Upsy to increment the number in the next message. 

You can say a new information to Upsy in DM and ask about it in a public channel. Upsy should answer correctly.



## How does it work?

### Troubleshooting

If you see `Sending messages to this app has been turned off` in DM screen of Upsy; then you can try restarting your Slack. If it is not resolved you can remove Upsy from your workspace and reinstall and approve the reuqested scopes.

If Upsy seems online but never answers back things to check:
- Check the logs in Vercel or Fly console.
- If you run on Vercel, check th logs on QStash console.
- Check if your Slack token and signing keys are correct.

If Upsy answers but not aware of the context (channel history):
- Check the logs in Vercel or Fly console to see if Upsy pulls the history and adds to Vector when you add Upsy to a channel.
- Check the Upstash Vector dashboard to see if the channel history is stored in the vector.

If you think Upsy talks too much or be intrusive:
- Check out the code and update the prompts in llm.mjs file. You can also change the `temperature` parameter to make Upsy more talkative or less talkative. You need to deploy the application.


## Future Work

