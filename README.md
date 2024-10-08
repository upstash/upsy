<img src="./static/upsy-logo.svg" height="52">

# Upsy: Your new mate on Discord & Slack. Powered by AI.

> [!NOTE]  
> **This project is a Community Project.**
>
> The project is maintained and supported by the community. Upstash may contribute but does not officially support or assume responsibility for it.

Upsy is an open source Discord & Slack bot that provides **fast, accurate answers whenever you have a question**. 

## How to use it?

- Mention Upsy in a question within a channel, and Upsy will respond in a thread.

- If someone asks a question in a channel, react with a ❓ or 🤔 emoji. Upsy will then create a thread and give an answer.

- Ask Upsy questions directly in DM for immediate responses.

- Teach Upsy new information by sending messages or uploading documents in DM. 


https://github.com/user-attachments/assets/7ae088d2-ba57-4ab5-9839-f14cb7d08604


## Discord Setup

### Create a Discord Application

Create an application at “https://discord.com/developers/applications".

### Privileged Gateway Intents

To enable the bot to access the message history, you need to enable the `Privileged Gateway Intents`. Go to the `Bot` section of your Discord application and enable the `MESSAGE CONTENT INTENT ` and `SERVER MEMBERS INTENT`.

<img src="https://raw.githubusercontent.com/upstash/upsy/master/up1.png" width="500" border="1" />

### Default Install Settings 

Go to Settings > Installation, check only `Guild Install`  (uncheck `User Install`)

<img src="https://raw.githubusercontent.com/upstash/upsy/master/up2.png" width="500" border="1" />


After choosing Install Link (Settings > Installation) as Discord provided link, you need to update scopes and permissions under Default Install Settings as follows:

Scopes: applications.commands, bot

Bot Permissions: Send Messages, Read Message History, View Channels, Send Messages in Threads.

<img src="https://raw.githubusercontent.com/upstash/upsy/master/up3.png" width="500" border="1" />

### Get your Bot Token
Reset token in the bot section of your Discord application.
Your token should start with "MTIzMz…" You can also set an icon for your Upsy app.

<img src="https://raw.githubusercontent.com/upstash/upsy/master/up4.png" width="500" border="1" />

### Config File
Clone the discord folder and set your token into config/config.json file


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
You need to create Redis and Vector databases from [Upstash](https://console.upstash.com)

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
<h2>Contributing</h2>
</summary>

Upsy is a work in progress, so we'll add more features and improve the current ones. We've collected a few ideas we believe would make Upsy an even more helpful companion:

- Add documents to the context so that Upsy can memorize and use them as context.
- Add a web interface to manage Upsy so you can add new information to Upsy’s memory via the web interface and configure Upsy’s behavior
- More proactive Upsy - Upsy will initiate conversations with you or respond to welcome, birthday, etc. messages
- Ability to choose personal characters for Upsy, such as friendlier, funnier, or more serious

If one of these ideas sounds like something you'd like to work on, contributions are very welcome! You can contribute by adding new features, fixing bugs, improving the documentation, writing blog posts, or by sharing Upsy on social media.
</details>
