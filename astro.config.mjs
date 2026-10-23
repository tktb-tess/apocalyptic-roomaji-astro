// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import remarkDirective from 'remark-directive';
import remarkToc from 'remark-toc';
import { unified } from '@astrojs/markdown-remark';
import * as H from './plugin/handlers';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    inlineStylesheets: 'never',
  },
  server: {
    port: 8000,
  }, 
  markdown: {
    processor: unified({
      remarkPlugins: [remarkDirective, [remarkToc, { heading: '目次' }]],
      remarkRehype: {
        handlers: {
          table: H.tableHandler,
          textDirective: H.tdHandler,
        },
      },
    }),
  },
});
