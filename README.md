<div align="center">
  <img src="https://raw.githubusercontent.com/Danushka-Madushan/cloudflare-clearance-viewer/refs/heads/main/public/logo-128.png" alt="Cloudflare Clearance Viewer" width="96" />
  <h1>Cloudflare Clearance Viewer</h1>
  <p>A minimal Chrome extension to inspect and copy <code>cf_clearance</code> cookies from any active tab - instantly.</p>

  <img src="https://img.shields.io/badge/Manifest-v3-blue?style=flat-square" alt="Manifest v3" />
  <img src="https://img.shields.io/badge/Built%20with-React%20%2B%20TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Bundler-Vite%20%2B%20CRXJS-646cff?style=flat-square&logo=vite&logoColor=white" />
</div>

---

## What is `cf_clearance`?

When Cloudflare's bot protection challenges a browser (e.g. via Turnstile or a JavaScript challenge), a `cf_clearance` cookie is issued upon successful verification. This cookie acts as a short-lived pass that proves the browser has already cleared the challenge.

Developers often need this token to:

- Replicate authenticated sessions in scripts or API clients
- Debug bot-protection issues on Cloudflare-protected sites
- Pass clearance tokens to tools like `curl`, Postman, or Playwright

**Cloudflare Clearance Viewer** makes retrieving this token effortless - no DevTools spelunking required.

## Features

- 🔍 **Instant scanning** - reads `cf_clearance` cookies from the active tab on popup open
- 🔀 **Partitioned cookie support** - detects both standard and [CHIPS](https://developer.chrome.com/docs/privacy-sandbox/chips/)-partitioned cookies
- 📋 **One-click copy** - copies the token to your clipboard with visual confirmation
- ♻️ **Manual refresh** - re-scan at any time with the refresh button
- 🎨 **Clean UI** - minimal, Google-style design that stays out of your way
- ⚡ **Zero runtime dependencies** - no background service worker, no data collection

## Preview

<div align="center">
  <img src="https://raw.githubusercontent.com/Danushka-Madushan/cloudflare-clearance-viewer/refs/heads/main/screens/snapshot.png" alt="Cloudflare Clearance Viewer screenshot" width="360" />
</div>

### Install From Source (Developer Mode)

1. **Clone the repository**
   ```bash
   git clone https://github.com/Danushka-Madushan/cloudflare-clearance-viewer.git
   cd cloudflare-clearance-viewer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load into Chrome**
   - Navigate to `chrome://extensions/`
   - Enable **Developer mode** (top-right toggle)
   - Click **Load unpacked** and select the `dist/` folder

5. **Pin the extension** to your toolbar for quick access

## Usage

1. Navigate to any Cloudflare-protected website and complete the challenge if prompted
2. Click the **Cloudflare Clearance Viewer** icon in your Chrome toolbar
3. The extension will automatically scan the current tab for `cf_clearance` cookies
4. Click **Copy Clearance Token** to copy the value to your clipboard

Each cookie card displays:
- The **domain** it belongs to
- Whether it is **Standard** or **Partitioned**
- A scrollable preview of the **raw token value**

## Development

```bash
# Start the dev server with hot-reload
npm run dev
```

Then load the `dist/` directory as an unpacked extension in Chrome. Changes will be reflected after reloading the extension.

### Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 + TypeScript |
| Bundler | Vite |
| Extension Bridge | [CRXJS Vite Plugin](https://crxjs.dev/vite-plugin) |
| Manifest | Chrome Extension Manifest V3 |

### Project Structure

```
cloudflare-clearance-viewer/
├── public/               # Extension icons (16–128px)
├── src/
│   └── popup/            # Popup UI (App.tsx, index.html)
├── manifest.config.ts    # Chrome extension manifest
├── vite.config.ts        # Vite + CRXJS configuration
└── package.json
```

### Permissions Used

| Permission | Purpose |
|---|---|
| `cookies` | Read `cf_clearance` cookies for the active tab |
| `activeTab` | Access the URL of the currently open tab |
| `host_permissions: <all_urls>` | Query cookies across all domains |

---

## Privacy

This extension operates **entirely locally**. It does not transmit any data to external servers, does not use analytics, and has no background service worker. Cookie values never leave your browser.

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request for bug fixes, improvements, or new features.

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feat/your-feature`
5. Open a Pull Request
