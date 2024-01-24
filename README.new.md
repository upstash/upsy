Upsy: Your New AI-Powered Mate on Slack
Upsy is a unique Slack bot that acts like your colleague but with a superpower: it remembers all conversations. When you add Upsy to a Slack channel, it pulls all conversations from the channel's history and starts listening to new messages. If a question is asked, Upsy checks his memory context and answers if he finds a relevant response in the context, which comprises all messages across all channels.

Image showcasing Upsy in action to be added

Features
Channel Conversations: Add Upsy to any channel, and it will incorporate the channel history into its memory. In the channel, Upsy jumps in only if a question is asked that has an answer in Upsy’s memory or if someone mentions Upsy in their message.
Direct Messages: Communicate with Upsy via Direct Messages (DMs). Here, it functions similarly to ChatGPT. You can add new information to Upsy’s memory by interacting in DMs.
Unified Memory: Upsy possesses a single, combined memory. This enables him to use information learned from one channel in another channel.
Upsy is an open-source project. You can deploy and run the backend and integrate it into your Slack channel. The code is customizable, allowing you to tailor Upsy’s behavior to your preferences. We will guide you through setting up Upsy for your Slack workspace step by step.

Technology Stack
Backend: Node.js (Fly.io version), Next.js (Vercel version)
AI Integration: OpenAI for embedding and chat API
Data Storage: Upstash Vector for vector store, Upstash Redis for chat history
LLM Orchestration: Langchain
Deployment Options: Fly.io, Vercel
Setup and Deployment Guide
0. Prerequisites
   Create an OpenAI account to obtain an API key. Set up an Upstash account to create Redis and Vector databases. These keys will be required as environment variables in the backend deployment step.

1. Slack App Setup
   Create a Slack app in your team account. Go to https://api.slack.com/apps, click on Create New App, then select From an app manifest. After selecting your workspace, copy and paste the below configuration into the JSON editor:

json
Copy code
{
// JSON Configuration Here
}
After clicking on Create, go to OAuth & Permissions in the App dashboard, click on Install to Workspace, and install it. You will then have an access token to be used in the next step.

Congratulations, you've created your Slack app. We will revisit this dashboard to copy Slack tokens in the next step.

2. Backend Deployment
   We have two options for hosting our applications: deploying to Fly.io or Vercel.

2.1 Fly.io Deployment
Clone the Upsy repository:

bash
Copy code
git clone git@github.com:upstash/upsy.git
Rename fly.toml.example to fly.toml and set the environment variables correctly:

properties
Copy code
// Environment Variables Here
Deploy your app to Fly.io by running the below command:

bash
Copy code
fly deploy
Monitor the deployment logs:

bash
Copy code
fly logs
Warning: For production use, secure your environment variables on the Fly platform.

2.2 Vercel Deployment
Deploy Upsy backend to Vercel by clicking the provided Deploy button. Ensure all environment variables are set correctly:

properties
Copy code
// Environment Variables Here
After deployment, update your Slack app's Event & Subscriptions with your Vercel app URL. Then, add APP_URL as an environment variable in Vercel and redeploy.

Warning: 
For production use, secure your environment variables on the Vercel platform.

3. Testing Upsy
   Test Upsy by asking questions in DM or adding it to a channel. Upsy responds based on its memory. Add Upsy to a channel, ask a question related to the channel history, and check the Upstash Vector dashboard to see if the history is stored correctly.

Upsy also keeps a short-term conversation memory. To test this, say a number to Upsy, and then ask it to increment the number in the next message. You can also tell new information to Upsy in DM and then ask about it in a public channel.

Troubleshooting
DM Issues: If you see "Sending messages to this app has been turned off" in the DM screen of Upsy, try restarting Slack. If unresolved, remove and reinstall Upsy.
Non-responsiveness: Check logs in Vercel or Fly. Verify the accuracy of your Slack token and signing keys.
Context Awareness: Ensure Upsy is adding the channel history to Vector when added to a channel.
Behavior Adjustment: Check the llm.mjs file to modify Upsy's prompts and the temperature parameter for adjusting chattiness.
Future Work
Upsy is a work in progress with future plans including document context integration, a web interface for management, more proactive conversation features, and customizable character traits.

We welcome community support through feature additions, bug fixes, documentation improvement, blogging, and social media sharing.