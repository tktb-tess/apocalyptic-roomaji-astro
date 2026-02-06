// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import remarkDirective from 'remark-directive';
import { tableHandler, textDirectiveHandler } from './handlers';

// https://astro.build/config
export default defineConfig({
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()],
  },
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
