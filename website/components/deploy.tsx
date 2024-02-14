"use client";

import { codeToHtml } from "shiki";

export default async function Deploy({}) {
  const settings = {
    lang: "bash",
    theme: "github-light",
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">What you will need?</h2>

      <p>
        Retrieved here:{" "}
        <a className="underline" href="https://platform.openai.com/api-keys">
          https://platform.openai.com/api-keys
        </a>
      </p>

      <div
        dangerouslySetInnerHTML={{
          __html: await codeToHtml(`OPENAI_API_KEY=`, settings),
        }}
      />

      <p>
        Retrieved here:{" "}
        <a className="underline" href="https://console.upstash.com/">
          https://console.upstash.com/
        </a>
      </p>
      <div
        dangerouslySetInnerHTML={{
          __html: await codeToHtml(
            `UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=`,
            settings,
          ),
        }}
      />

      <p>
        Retrieved here:{" "}
        <a className="underline" href="https://console.upstash.com/qstash">
          https://console.upstash.com/qstash
        </a>
      </p>
      <div
        dangerouslySetInnerHTML={{
          __html: await codeToHtml(
            `QSTASH_TOKEN=
QSTASH_CURRENT_SIGNING_KEY=
QSTASH_NEXT_SIGNING_KEY=`,
            settings,
          ),
        }}
      />

      <p>
        Retrieved here:{" "}
        <a className="underline" href="https://console.upstash.com/vector">
          https://console.upstash.com/vector
        </a>
      </p>
      <div
        dangerouslySetInnerHTML={{
          __html: await codeToHtml(
            `UPSTASH_VECTOR_REST_URL=
UPSTASH_VECTOR_REST_TOKEN=`,
            settings,
          ),
        }}
      />

      <p>
        Retrieved here:{" "}
        <a className="underline" href="https://api.slack.com/apps/">
          https://api.slack.com/apps/
        </a>
      </p>
      <div
        dangerouslySetInnerHTML={{
          __html: await codeToHtml(
            `# SLACK_ACCESS_TOKEN is the bot user OAuth token
SLACK_ACCESS_TOKEN=
SLACK_SIGNING_SECRET=`,
            settings,
          ),
        }}
      />

      <p>Your Vercel app url - we'll add this after deployment</p>
      <div
        dangerouslySetInnerHTML={{
          __html: await codeToHtml(`APP_URL=`, {
            lang: "bash",
            theme: "github-light",
          }),
        }}
      />

      <p>
        <a
          target="_blank"
          className="underline"
          href="https://github.com/upstash/upsy?tab=readme-ov-file#creating-your-own-upsy"
        >
          Check the installation guide for more
        </a>
      </p>

      <p>
        <a
          target="_blank"
          href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fupstash%2Fupsy%2Ftree%2Fmaster%2Fupsy-next&env=OPENAI_API_KEY,UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN,QSTASH_TOKEN,QSTASH_NEXT_SIGNING_KEY,QSTASH_CURRENT_SIGNING_KEY,UPSTASH_VECTOR_REST_URL,UPSTASH_VECTOR_REST_TOKEN,SLACK_ACCESS_TOKEN,SLACK_SIGNING_SECRET&project-name=upsy&repository-name=upsy"
        >
          <img src="https://vercel.com/button" alt="Deploy with Vercel" />
        </a>
      </p>
    </div>
  );
}
