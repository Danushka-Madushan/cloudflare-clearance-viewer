import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json'

export default defineManifest({
  manifest_version: 3,
  name: "Cloudflare Clearance Viewer",
  description: "Instantly view and copy cf_clearance cookies from any Cloudflare-protected site. One click. No DevTools needed.",
  version: pkg.version,
  icons: {
    16: 'public/logo-16.png',
    32: 'public/logo-32.png',
    34: 'public/logo-34.png',
    48: 'public/logo-48.png',
    128: 'public/logo-128.png',
  },
  action: {
    default_icon: {
      48: 'public/logo-48.png',
    },
    default_popup: 'src/popup/index.html',
  },
  permissions: ['cookies', 'activeTab'],
  host_permissions: ['<all_urls>'],
})
