import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from "@astrojs/react";
import image from "@astrojs/image";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: 'https://photo.stephanegelibert.com',
  integrations: [
    sitemap(),
    react(),
    image({
      serviceEntryPoint: '@astrojs/image/sharp'
    }), tailwind()
]
});