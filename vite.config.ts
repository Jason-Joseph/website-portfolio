import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import content from './src/content'

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string)

// The hero card is complete in the HTML (no shift when the script fills it in),
// and content.ts stays the single source of truth.
const prefillHero = {
  name: 'prefill-hero',
  transformIndexHtml(html: string) {
    const { profile, contact } = content
    return html
      .replace('<strong data-f="name"></strong>', `<strong data-f="name">${esc(profile.name)}</strong>`)
      .replace('<span data-f="title"></span>', `<span data-f="title">${esc(profile.title)}</span>`)
      .replace('<span data-f="loc"></span>', `<span data-f="loc">${esc(contact.location)}</span>`)
      .replace('<p class="lead" data-f="tagline"></p>', `<p class="lead" data-f="tagline">${esc(profile.tagline)}</p>`)
      .replace('<a class="btn primary" data-f="mail">', `<a class="btn primary" data-f="mail" href="mailto:${esc(contact.email)}">`)
      .replace('<a class="btn" data-f="linkedin"', `<a class="btn" data-f="linkedin" href="${esc(contact.linkedin)}"`)
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), prefillHero],
  // The three.js city is one lazy chunk loaded after the page is readable,
  // so its size does not block first paint.
  build: { chunkSizeWarningLimit: 700 },
})
