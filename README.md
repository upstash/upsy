# Upsy

Upsy connects AI assistants to your memory, files, connected accounts, and cloud
browser with the access you choose.

- [Upsy](https://upsy.ai/home)
- [Core application source](https://github.com/upstash/upsy-core)
- [ChatGPT plugin](plugins/chatgpt/)

## ChatGPT plugin

The plugin package lives in `plugins/chatgpt/`. It includes the manifest, MCP
configuration, icons, and the **Use Upsy** skill. It connects to
`https://upsy.ai/connect` through OAuth; account credentials and client secrets
are not part of the package.

Build and validate the upload ZIP with Python 3:

```sh
python3 plugins/build-chatgpt.py
```

The output is `dist/upsy-0.1.0.zip`. The builder includes only the six plugin
files listed in the script and runs local metadata, asset, and credential checks.
Directory submission and publishing are managed separately in the OpenAI portal.
Keep reviewer credentials and private submission details outside this repository.
