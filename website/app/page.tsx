import cx from "@/utils/cx";
import { IconExternalLink, IconLineDotted } from "@tabler/icons-react";
import Container from "@/components/container";
import UpsyLogo from "@/components/upsy-logo";
import SlackLogo from "@/components/slack-logo";
import Link from "@/components/link";
import UpstashLogo from "@/components/upstash-logo";
import FlyLogo from "@/components/fly-logo";
import OpenAiLogo from "@/components/openai-logo";

export default function Index() {
  return (
    <main className={cx("py-12 text-center sm:py-16 md:py-24")}>
      <Container className="flex max-w-screen-md flex-col items-center lg:max-w-screen-lg">
        {/**/}

        {/* logos */}
        <div className="inline-flex items-center gap-4">
          <UpsyLogo className="inline-flex cursor-pointer" />
          <IconLineDotted className="opacity-40" size={32} />
          <SlackLogo className="inline-flex" />
        </div>

        {/* title */}
        <h1 className="mt-16 text-2xl font-bold md:w-3/4 md:text-4xl lg:text-5xl">
          Upsy is your new colleague in Slack with a superpower: <br />
          <span className="underline decoration-emerald-900/20 decoration-wavy decoration-2 underline-offset-4">
            it remembers everything!
          </span>
        </h1>

        {/* desc */}
        <h3 className="mt-4 text-lg md:w-3/4 lg:mt-6 lg:text-xl">
          When Upsy is added to a Slack channel, it stores all conversations to
          use them in answering questions.
        </h3>

        {/* cta */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 md:mt-10 md:gap-4">
          <Link
            href="https://github.com/upstash/upsy?tab=readme-ov-file#creating-your-own-upsy"
            theme="primary"
          >
            <span>Setup Guide</span>
            <IconExternalLink stroke={1.5} size={20} />
          </Link>
        </div>

        {/* screenshot */}
        <div className="mt-16 md:mt-20">
          <img
            src="/caps.png"
            className="rounded-2xl border-[6px] border-emerald-900/20 drop-shadow-2xl"
            alt="upsy on slack"
          />
        </div>

        {/* stack */}
        <div className="mt-10">
          <p>Upsy is powered by the modern serverless Al application stack:</p>

          <div className="mt-3 flex items-center justify-center gap-6">
            <a className="underline" href="https://upstash.com" target="_blank">
              <UpstashLogo />
            </a>

            <a className="underline" href="https://fly.io" target="_blank">
              <FlyLogo />
            </a>

            <a className="underline" href="http://openai.com" target="_blank">
              <OpenAiLogo />
            </a>
          </div>
        </div>
      </Container>
    </main>
  );
}
