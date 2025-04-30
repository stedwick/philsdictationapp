# TaterTalk 🎙️ ~~Tauri~~ + React + Typescript

A dictation application built with ~~Tauri~~, React, and TypeScript that provides speech-to-text functionality.

## Quick Start

To run the application with Docker:

```bash
docker compose --profile proxy --profile tatertalk down && docker compose --profile proxy --profile tatertalk up --watch --build
```

Then visit http://tatertalk.docker.localhost

### Optional HTTPS Setup

For HTTPS support, you can use mkcert to generate local certificates:

1. Install mkcert: https://github.com/FiloSottile/mkcert
2. Generate certificates:
   ```bash
   mkcert -install
   mkcert "*.docker.localhost"
   ```
3. Place the generated certificates in `.config/docker/certs/`:
   - `cert.pem` (certificate)
   - `key.pem` (private key)
4. Access the application via https://tatertalk.docker.localhost

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + ~~[Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)~~

<!--TODO: [PWA] install-->
<!--TODO: [Test] in more browsers-->
<!--https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API#browser_compatibility-->
<!--https://kagi.com/search?q=Google+analytics+free+alternative-->
<!--MAYBE: [App Stores] https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable-->

## Deploy

```
npm config set prefix="~/.npm-global"
npm install netlify-cli -g
netlify login
netlify link
npm run build
npm run preview
netlify deploy --dir dist --alias syncta-speech
```
