# GChat Copy Link

A Safari extension that adds a copy-link button to the header of Google Chat's conversation pane, next to "Open in full screen". In split-pane mode you can copy a link without maximizing first.

![The 🔗 button in the conversation pane header, next to expand and close](docs/header.png)

- When the pane shows a thread, it copies the thread link: `https://chat.google.com/room/<space>/<thread>`
- When the pane shows a space or DM, it copies that conversation's link: `https://chat.google.com/room/<space>` or `/dm/<id>`

## Layout

- `extension/`: the web extension (`manifest.json`, `content.js`, `content.css`, icons)
- `GChat Copy Link/`: the Xcode wrapper app that Safari needs, generated with `safari-web-extension-converter`. It references the files in `extension/` directly.
- `install.sh`: builds, signs and installs the app to `~/Applications` without launching it

## Install

```sh
./install.sh
```

Then, once: Safari › Settings › Extensions › tick **Google Chat Copy Link** › Edit Websites › allow `chat.google.com` and `mail.google.com`.

The build is signed with an Apple Development certificate (team `VNB5T45XDL`, set in the Xcode project). To build with another account, change `DEVELOPMENT_TEAM`. An unsigned build only runs while Develop › Allow Unsigned Extensions is on, and Safari turns that off on every restart.

The wrapper app is a background app (`LSUIElement`), so it never shows in the Dock and doesn't need to be running.

## How it finds the link

- The pane header: `header[data-open-conversation-in-full-screen-event-type-xid]`. Its `jsdata` holds `space/<id>` or `dm/<id>`.
- Thread view: the header's `aria-label` ends in "Thread", and the thread id is the `data-topic-id` of the `c-wiz` messages under that header.

If Google changes these attributes, the button won't appear. Check them again in Web Inspector.
