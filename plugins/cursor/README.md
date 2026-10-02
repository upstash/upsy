# Upsy for Cursor and Grok Bot

Connect your assistant to your Upsy memory, files, connected accounts, and cloud
browser. Each connection receives only the access you grant in Upsy.

The package includes the **Use Upsy** skill, a logo, and a remote MCP connection
to `https://upsy.ai/connect`. It uses OAuth with dynamic client registration and
PKCE. Sign in to Upsy when the client prompts you, then choose the resources and
actions this connection can access. No API key or shared client secret is needed.

## Try it in Cursor

From the root of a clone of [upstash/upsy](https://github.com/upstash/upsy):

```sh
mkdir -p ~/.cursor/plugins/local/upsy
cp -R plugins/cursor/. ~/.cursor/plugins/local/upsy/
```

Reload Cursor with **Developer: Reload Window**. In **Customize**, find Upsy,
connect its MCP server, and complete the Upsy sign-in and consent flow. Check that
the **Use Upsy** skill and permitted tools appear. Invoke the skill with
`/use-upsy` or ask a relevant question.

Local imports must be enabled by your team. An installed marketplace plugin with
the same name takes precedence over the local copy. See
[Cursor's local plugin instructions](https://cursor.com/docs/plugins#test-plugins-locally).

## Use it in Grok Bot

Grok Bot uses Cursor's connector system. Once Upsy is available in your
marketplace, add the connector and authenticate in your browser. Attach Upsy to
the task with `@`. A local Cursor installation does not establish that the
connector is available in Grok Bot; verify it in the Grok Bot app too.

Before public listing, teams can import this repository through their Cursor
Team Marketplace and select the Upsy entry. Availability depends on your account
and team policy. See [Cursor team marketplaces](https://cursor.com/docs/plugins)
and [Grok Bot connector policy](https://docs.x.ai/grok-bot/teams-and-enterprises#connector-policy).

## Test before submission

Use a test Upsy account and grant only Memory and Files initially:

1. Complete OAuth, then ask: "Read my Upsy memory and list my files."
2. Ask: "Use Upsy to prepare a project brief from my memory and files."
   Verify the skill reads real records and cites their returned names or IDs.
3. Ask: "Save cursor-upsy-check.txt with the text 'Upsy connection check', then
   read it back." Verify the saved text and file ID.
4. Ask: "Suggest adding 'Prefers morning meetings' to my Upsy memory."
   Verify it remains a pending suggestion until approved in Upsy.
5. Request an unavailable connector action. Verify the assistant explains the
   missing connection or permission and does not bypass it with the browser.
6. Revoke the connection in Upsy and verify subsequent tool calls are denied.

Repeat connection and read checks in Grok Bot. Connected-service and browser
workflows need separate checks with the required grants and a compatible client.
Record real results; package validation alone does not verify client behavior.

## Submit to the Cursor marketplace

This repository's `.cursor-plugin/marketplace.json` points to `plugins/cursor`.
Submit `https://github.com/upstash/upsy` at
[cursor.com/marketplace/publish](https://cursor.com/marketplace/publish) after
testing. Use the Upstash publisher identity and a monitored contact address.
Complete the publisher form and terms, then wait for Cursor's review. Confirm
the resulting connector is discoverable in both Cursor and Grok Bot.

Bot templates are a separate sharing feature. This package distributes a
connector and skill; it contains no account grants, bot conversations, reviewer
credentials, or user files.

## Privacy and license

Use [Upsy's History](https://upsy.ai) to review tool activity and manage or revoke
access from the Agents page. Memory suggestions require approval in Upsy.
Connected assistants receive permitted data under their own privacy policies.

- [Privacy Policy](https://upsy.ai/privacy)
- [Terms of Service](https://upsy.ai/terms)
- [Support](https://upstash.com/contact)

The files in this plugin package are licensed under [MIT](LICENSE). Upsy's hosted
service is governed by its Terms of Service.
