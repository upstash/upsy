
## Features

No matter how old or buried within a channel the answer to your question might be, Upsy will find relevant messages from its memory and respond immediately and only if it's sure of the answer. Upsy stores only data you explicitly allow it to process by adding it to specific channels and stores all data in your own database.

**🧠 Unified Memory:** Upsy's memory works across channels you've added Upsy to. Get to-the-point answers even if the corresponding information is buried deep within another channel.

**🔒 Privacy Preserved:** Upsy only accesses data from the channel you add it to. It is open source and self-hosted. The communication between the Upsy server, Discord and Slack is encrypted.

**⌚ Works Retrospectively:** Add Upsy to any channel, and it will store the channel history in its memory. The bot jumps in only if someone asks a question it can find a relevant answer to or if someone mentions Upsy in their message.

**💡 Add Data via DMs:** Communicate with Upsy via Direct Messages (DMs). You can even add new information to Upsy’s memory by interacting in DMs that it can then use to answer questions in any other channel.


## Slack Setup

To create a new Slack app in your team account, go to https://api.slack.com/apps, click `Create New App`, then select `from an app manifest`. After selecting your workspace, copy and paste the below configuration into the JSON editor:

<details>
<summary>App manifest</summary>

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
        "mpim:read",
        "files:read"
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
</details>


#### Click on `Create`.

After clicking on Create:

- Go to OAuth & Permissions in the App dashboard
- Click `Install to Workspace` and install.

One last step is to enable Upsy for direct messages. Go to your `Features` > `App Home` and set the checkbox for "Allow users to send Slash commands and messages from the messages tab".

Congratulations, you've created your Slack app! 🎉 Keep this dashboard open because we'll need the generated Slack tokens in the next step.

### 3. Backend Deployment

The backend is a simple Node application that runs Slack's Bolt SDK. We will deploy it on Fly, but it can be hosted anywhere that supports Node.

#### 3.1. Local Deployment

Clone the Upsy repository:

```bash
git clone git@github.com:upstash/upsy.git
cd upsy/slack
```

Set the environment variables either in Dockerfile or fly.toml:

```properties
OPENAI_API_KEY=""
UPSTASH_REDIS_REST_TOKEN=""
UPSTASH_REDIS_REST_URL=""
UPSTASH_VECTOR_REST_TOKEN=""
UPSTASH_VECTOR_REST_URL=""
SLACK_ACCESS_TOKEN=""
SLACK_SIGNING_SECRET=""
SLACK_APP_TOKEN=""
```

Run the following commands to start the server:

```bash
docker build -f slack/Dockerfile -t upsy-slack .
docker run -d -p 3000:3000 upsy-slack
```

Update the Request URL in the Slack dashboard (Features > Event Subscriptions) to point to your local server, you can use ngrok to expose your local server to the internet.

example: `https://your-ngrok-url/slack/events`

#### 3.2. Fly.io Deployment

Clone the Upsy repository:

```bash
git clone git@github.com:upstash/upsy.git
cd upsy/slack
```

Edit the environment variables either in Dockerfile or fly.toml:

```properties
# Retrieved here: https://platform.openai.com/api-keys
OPENAI_API_KEY=

# Retrieved here: https://console.upstash.com/   
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Retrieved here: https://console.upstash.com/vector
UPSTASH_VECTOR_REST_URL=
UPSTASH_VECTOR_REST_TOKEN=

# Retrieved from the Slack dashboard we just created. 
# SLACK_ACCESS_TOKEN should start with xoxb-.  `Features > OAuth & Permissions`
# SLACK_SIGNING_SECRET  `Settings > Basic Information`
# SLACK_APP_TOKEN should start with xapp-. `Settings > Basic Information > App-Level Tokens`
SLACK_ACCESS_TOKEN=
SLACK_SIGNING_SECRET=
SLACK_APP_TOKEN=
```

First create a Fly app by running `fly launch`. Say `Yes` to the question `Would you like to copy its configuration to the new app?`

Deploy your app to Fly.io by running the below command:

```bash
fly deploy
```

Once we deployed our project, Fly will give us the URL for this deployment. Copy the URL of your Fly app, i.e., https://your-upsy.fly.dev and head to your Slack dashboard. Find the `Features > Event Subscriptions` menu on the sidebar and enter the URL  appending 'slack/events' to  Request URL input field in Slack. The final result looks like this:

`https://your-upsy.fly.dev/slack/events`

and you should see the message `Verified` on Slack dashboard.

Fly.io allows you to see runtime logs in case you're curious about what Upsy is doing under the hood when a message on Slack comes in! Simply run:

```bash
fly logs
```
Now we are ready to test Upsy!

<details>
<summary>
<h2>Testing</h2>
</summary>

Once you complete the deployment step, you can install it to your Slack workspace. If Upsy looks unresponsive check the troubleshooting section below.

The simplest way to test the integration is by asking Upsy questions via direct messages or adding it to a channel with prior messages. It'll jump into the conversation to answer questions if it's confident in the answer or will respond if you mention it directly.

> 🔥 **Pro Tip**
>
> Once you add Upsy to a channel or send it a direct message, check your Upstash Vector data browser. You should see the data appearing here.

In addition to keeping a long history of the entire chat to draw answers from, Upsy also keeps a short-term memory to provide fast, accurate responses to recent chat topics. Test this by messaging a number and then ask to increment that number :)

Because we've built Upsy to work cross-channel with unified memory, you can always add additional information via direct messages, which it then uses to answer questions in channels and vice-versa.
</details>


<details>
<summary>
<h2>Troubleshooting</h2>
</summary>

**DM Issues:** If you see "Sending messages to this app has been turned off" in the DM screen of Upsy, try restarting your Slack. If that doesn't resolve the issue, you can remove Upsy from your workspace, reinstall it, and approve the requested scopes.

**Non-responsiveness:** If Upsy appears online but does not answer back:

- Check the runtime logs in the Fly.io.
- Verify that your Slack token and signing keys are correct

**Memory not working:**
If Upsy answers but is not aware of the channel history to answer your questions:
- Verify that Upsy has indexed the chat history via the Upstash Vector dashboard, where you should see this data appearing
- Check the runtime logs on the Fly.io after adding it to a channel; you should see logs indicating that the indexing process has started

**Fly deployment issue**
If the `fly deploy` command looks stuck, try `fly deploy --local-only` which builds the image locally then push it to the fly.

</details>



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

