// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import remarkDirective from 'remark-directive';
import { tableHandler, textDirectiveHandler } from './handlers';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: vercel(),
  server: {
    port: 8000,
  },
  markdown: {
    remarkPlugins: [remarkDirective],
    remarkRehype: {
      handlers: {
        table: tableHandler,
        textDirective: textDirectiveHandler,
      },
    },
  },
});
