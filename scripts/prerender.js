#!/usr/bin/env node
/**
 * Prerender script for LocalizeShots
 * Runs after build to generate static HTML for SEO-critical pages
 */

import Prerenderer from '@prerenderer/prerenderer';
import PuppeteerRenderer from '@prerenderer/renderer-puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const staticDir = path.join(__dirname, '..', 'dist');

// Routes to prerender for SEO
const routes = [
  '/',
  '/features',
  '/about',
  '/ios-screenshots',
  '/android-screenshots',
  '/alternatives',
  '/compare/appscreens',
  '/compare/applaunchpad',
  '/compare/screenshots-pro',
  '/compare/appure',
  '/tools/size-calculator',
  '/blog',
  '/blog/app-store-screenshot-best-practices',
  '/blog/best-app-store-screenshots',
  '/blog/app-store-screenshot-sizes',
  '/blog/app-screenshot-tools-2024',
  '/login',
  '/register',
  '/terms',
  '/privacy',
  '/refund',
];

async function prerender() {
  console.log('Starting prerendering...');
  console.log(`Static directory: ${staticDir}`);
  console.log(`Routes to prerender: ${routes.length}`);

  const prerenderer = new Prerenderer({
    staticDir,
    renderer: new PuppeteerRenderer({
      renderAfterDocumentEvent: 'render-event',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }),
  });

  try {
    await prerenderer.initialize();

    const renderedRoutes = await prerenderer.renderRoutes(routes);

    for (const renderedRoute of renderedRoutes) {
      const outputDir = path.join(staticDir, renderedRoute.route);
      const outputFile = path.join(outputDir, 'index.html');

      // Create directory if it doesn't exist
      await fs.mkdir(outputDir, { recursive: true });

      // Write the prerendered HTML
      await fs.writeFile(outputFile, renderedRoute.html);

      console.log(`Prerendered: ${renderedRoute.route}`);
    }

    console.log(`\nSuccessfully prerendered ${renderedRoutes.length} routes!`);
  } catch (error) {
    console.error('Prerender error:', error);
    process.exit(1);
  } finally {
    await prerenderer.destroy();
  }
}

prerender();
