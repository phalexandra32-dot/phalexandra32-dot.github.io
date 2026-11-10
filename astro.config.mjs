import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://phalexandra32-dot.github.io',
  base: '/akinclusilab.github.io',
  integrations: [
    mdx(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'one-dark-pro',
    },
  },
  output: 'static',
});
