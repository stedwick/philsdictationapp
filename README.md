# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

<!--TODO: [Deploy] -->
<!--TODO: [Test] in more browsers-->
<!--https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API#browser_compatibility-->
<!--TODO: [Google Analytics] free alternative-->
<!--https://kagi.com/search?q=Google+analytics+free+alternative-->
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
