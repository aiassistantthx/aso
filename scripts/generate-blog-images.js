#!/usr/bin/env node

/**
 * Generate blog post images using DALL-E 3
 * Usage: node scripts/generate-blog-images.js
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('❌ Error: OPENAI_API_KEY environment variable is required');
  console.error('   Set it via: export OPENAI_API_KEY=your-api-key');
  process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const BLOG_IMAGES_DIR = path.join(__dirname, '..', 'public', 'blog');

const BLOG_POSTS = [
  {
    slug: 'screenshots-best-practices',
    filename: 'screenshots-best-practices.png',
    prompt: 'Modern minimalist illustration of App Store screenshot design best practices. Show a stylized iPhone with colorful app screenshots floating around it, design elements like rulers and color palettes. Coral and white color scheme, clean flat design style, professional tech aesthetic. No text.',
  },
  {
    slug: 'screenshot-tools-2026',
    filename: 'screenshot-tools-2026.png',
    prompt: 'Modern illustration comparing different screenshot creation tools. Show multiple stylized app mockup tools on a desk - laptops, design software interfaces, device frames. Coral accent color with neutral background, clean isometric style, tech SaaS aesthetic. No text.',
  },
  {
    slug: 'screenshot-sizes-2026',
    filename: 'screenshot-sizes-2026.png',
    prompt: 'Technical illustration showing various Apple device dimensions and sizes. Display iPhone 16, iPad Pro, Apple Watch in a clean grid layout with dimension lines and measurements. Coral and light gray color scheme, blueprint-style technical drawing aesthetic. No text.',
  },
  {
    slug: 'how-to-create-screenshots',
    filename: 'how-to-create-screenshots.png',
    prompt: 'Step-by-step workflow illustration for creating app screenshots. Show a visual pipeline: camera capture, editing software, device mockup, localization flags, export arrow. Coral accent color, clean modern infographic style, horizontal flow. No text.',
  },
];

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(filepath);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

async function generateImage(post) {
  console.log(`\n📸 Generating image for: ${post.slug}`);
  console.log(`   Prompt: ${post.prompt.substring(0, 80)}...`);

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: post.prompt,
      n: 1,
      size: '1792x1024', // Landscape format for blog cards
      quality: 'standard',
    });

    const imageUrl = response.data?.[0]?.url;
    if (!imageUrl) {
      throw new Error('No image URL in response');
    }

    const filepath = path.join(BLOG_IMAGES_DIR, post.filename);
    await downloadImage(imageUrl, filepath);

    console.log(`   ✅ Saved to: ${filepath}`);
    return filepath;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('🎨 Blog Image Generator');
  console.log('========================\n');

  // Ensure directory exists
  if (!fs.existsSync(BLOG_IMAGES_DIR)) {
    fs.mkdirSync(BLOG_IMAGES_DIR, { recursive: true });
    console.log(`📁 Created directory: ${BLOG_IMAGES_DIR}`);
  }

  const results = [];

  for (const post of BLOG_POSTS) {
    const result = await generateImage(post);
    results.push({ slug: post.slug, success: !!result, path: result });

    // Small delay between requests
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\n========================');
  console.log('📊 Summary:');
  results.forEach(r => {
    console.log(`   ${r.success ? '✅' : '❌'} ${r.slug}`);
  });

  const successCount = results.filter(r => r.success).length;
  console.log(`\n   Total: ${successCount}/${results.length} images generated`);
}

main().catch(console.error);
