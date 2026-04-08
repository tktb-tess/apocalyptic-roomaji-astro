// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import remarkDirective from 'remark-directive';
import * as H from './handlers';

// https://astro.build/config
export default defineConfig({
  output: 'static',
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
        table: H.tableHandler,
        textDirective: H.textDirectiveHandler,
      },
    },
  },
});
