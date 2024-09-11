<img src="./static/upsy-logo.svg" height="52">

# Upsy: Your new mate on Discord & Slack. Powered by AI.

> [!NOTE]  
> **This project is a Community Project.**
>
> The project is maintained and supported by the community. Upstash may contribute but does not officially support or assume responsibility for it.

Upsy is an open source Discord & Slack bot that remembers your conversations to provide **fast, accurate answers whenever you have a question**.

## Table of Contents

1. [Tech Stack](#user-content-upsys-defaults)
2. [Features](#user-content-features)
3. [Setup](#user-content-setup)
4. [Testing](#user-content-testing)
5. [Troubleshooting](#user-content-troubleshooting)
6. [How Upsy Works](#user-content-how-upsy-works)
7. [Development](#user-content-development)
8. [Contributing](#user-content-contributing)


## Tech Stack

We've chosen the following tech stack because it works reliably out of the box. Because of the modular design, you can completely customize any part of Upsy to fit your needs.

- Backend: **Node.js**
- AI Integration: **OpenAI API**
- Data Storage: **[Upstash Vector](https://upstash.com/docs/vector/overall/whatisvector) & [Upstash Redis](https://upstash.com/docs/redis/overall/getstarted)**
- LLM Orchestration: **[Langchain](https://langchain.com)**
- Deployment Option: **[Fly.io](https://fly.io)**


## Features

No matter how old or buried within a channel the answer to your question might be, Upsy will find relevant messages from its memory and respond immediately and only if it's sure of the answer. Upsy stores only data you explicitly allow it to process by adding it to specific channels and stores all data in your own database.

**🧠 Unified Memory:** Upsy's memory works across channels you've added Upsy to. Get to-the-point answers even if the corresponding information is buried deep within another channel.

**🔒 Privacy Preserved:** Upsy only accesses data from the channel you add it to. It is open source and self-hosted. The communication between the Upsy server, Discord and Slack is encrypted.

**⌚ Works Retrospectively:** Add Upsy to any channel, and it will store the channel history in its memory. The bot jumps in only if someone asks a question it can find a relevant answer to or if someone mentions Upsy in their message.

**💡 Add Data via DMs:** Communicate with Upsy via Direct Messages (DMs). You can even add new information to Upsy’s memory by interacting in DMs that it can then use to answer questions in any other channel.


## Setup

### 1. Getting Started

To get started, you'll need an [OpenAI](https://openai.com), [Fly](https://fly.io/), [Upstash](https://console.upstash.com), [Discord](https://discord.com/register) and [Slack](https://slack.com/get-started#/createnew) accounts. After signing in to Upstash, create one Redis and one Vector database - these will later contain your Slack data. Unless you change the default configuration, choose a dimension of 1536 for your Upstash Vector database. Simply creating these databases is enough for now; we'll get back to this step in the setup.


## Discord Setup

### Create a Discord Application

Create an application at “https://discord.com/developers/applications".

### Privileged Gateway Intents

To enable the bot to access the message history, you need to enable the `Privileged Gateway Intents`. Go to the `Bot` section of your Discord application and enable the `MESSAGE CONTENT INTENT ` and `SERVER MEMBERS INTENT`.

### Default Install Settings 

After choosing Install Link (Settings > Installation) as Discord provided link, you need to update scopes and permissions under Default Install Settings as follows:

Scopes: applications.commands, bot

Bot Permissions: Send Messages, Read Message History, Use Slash Commands, Add Reactions, Embed Links, Read Messages/View Channels, Send Messages in Threads, Use External Emojis, Send TTS Messages.


### Get your Bot Token
Reset token in the bot section of your Discord application.
Your token should start with "MTIzMz…"

### Put your token into config/config.json file

```json
{
    "client": {
        "token": "MTIzMz...",
    },
} 
```
### Get your Application ID and put it into config/config.json file

You can find your application ID in the General Information section of your Discord application. 

```json
{
    "client": {
		    "id":"123333333333333333",
        "token": "MTIzMz...",
    },
} 
```

### Set the environment variables either in Dockerfile or fly.toml:

```properties
OPENAI_API_KEY=""
UPSTASH_REDIS_REST_TOKEN=""
UPSTASH_REDIS_REST_URL=""
UPSTASH_VECTOR_REST_TOKEN=""
UPSTASH_VECTOR_REST_URL=""
```

### You can either run the bot locally or deploy it to Fly.io

#### Local Deployment

```bash
docker build -f discord/Dockerfile -t upsy-discord .
docker run -d -p 3001:3001 upsy-discord
```

#### Fly.io Deployment

```bash
fly launch
fly deploy
```

Don't forget to run `fly scale count 1` to make sure only one instance is running.


### Add the bot to your Discord server

To add the bot to your Discord server, you need to generate an OAuth2 URL. Go to the Installation section of your Discord application and under Install Link, select the discord provided link. You can then add the bot to your server.

At this point, you should see the bot online in your Discord server.

## Slack Setup

Checkout [Upsy Slack documentation](./slack/README.md).

### Notes:

Your initial discord commands will be registered at docker build time.
For deleting, updating or adding new commands, you need to run `npm run commands:*` commands.

Discord template used in this project is:  [Discord-Bot-TypeScript-Template](https://github.com/KevinNovak/Discord-Bot-TypeScript-Template)

<details>
<summary>
<h2>How Upsy Works</h2>
</summary>

Upsy is an open-source project. You have complete control over the code, and all information Upsy retrieves is stored securely in your own Upstash database. We've chosen convenient defaults that work great out of the box, but the code is fully customizable for you to tailor Upsy to your needs. Here's an overview of **how it works under the hood**:

<img src="./static/how-upsy-works.png" width="800">

<br/>
<br/>

And here's how Upsy knows which messages to store and which ones to answer:

<img src="./static/how-upsy-thinks.png" width="800">
</details>




<details>
<summary>
<h2>Development</h2>
</summary>

> 🔥 **Pro Tip**
>
> Enable the `Socket mode` in your Slack dashboard. This mode allows your app to use the Events API without exposing a public HTTP Request URL.

To get started in development for a Fly.io deployment, use the root folder:

```bash
   npm install
   node index.js
```
</details>


<details>
<summary>
<h2>Contributing</h2>
</summary>

Upsy is a work in progress, so we'll add more features and improve the current ones. We've collected a few ideas we believe would make Upsy an even more helpful companion:

- Add documents to the context so that Upsy can memorize and use them as context.
- Add a web interface to manage Upsy so you can add new information to Upsy’s memory via the web interface and configure Upsy’s behavior
- More proactive Upsy - Upsy will initiate conversations with you or respond to welcome, birthday, etc. messages
- Ability to choose personal characters for Upsy, such as friendlier, funnier, or more serious

If one of these ideas sounds like something you'd like to work on, contributions are very welcome! You can contribute by adding new features, fixing bugs, improving the documentation, writing blog posts, or by sharing Upsy on social media.
</details>
