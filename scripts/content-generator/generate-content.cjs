#!/usr/bin/env node

/**
 * LocalizeShots Auto Content Generator
 *
 * Generates blog articles and pages automatically using AI.
 * Run via cron/launchd for daily publishing.
 *
 * Usage:
 *   node generate-content.js --type=blog
 *   node generate-content.js --type=page
 *   node generate-content.js --type=both
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  projectRoot: path.resolve(__dirname, '../..'),
  blogDir: 'src/content/blog',
  pagesDir: 'src/pages',
  sitemapPath: 'public/sitemap.xml',
  reportPath: path.resolve(__dirname, 'reports'),
  openaiApiKey: process.env.OPENAI_API_KEY || fs.readFileSync(
    path.resolve(__dirname, '../../server/.env'), 'utf-8'
  ).match(/OPENAI_API_KEY=(.+)/)?.[1]?.trim(),
};

// Blog topics queue - will be consumed and regenerated
const BLOG_TOPICS = [
  {
    slug: 'app-store-screenshot-mistakes',
    title: '10 Common App Store Screenshot Mistakes That Kill Downloads',
    keywords: ['app store screenshots', 'ASO mistakes', 'conversion optimization'],
    outline: 'Common mistakes developers make with screenshots and how to fix them'
  },
  {
    slug: 'screenshot-ab-testing-guide',
    title: 'A/B Testing App Store Screenshots: Complete Guide',
    keywords: ['A/B testing', 'screenshots', 'conversion rate optimization'],
    outline: 'How to set up and run screenshot A/B tests on iOS and Android'
  },
  {
    slug: 'app-store-seasonal-aso',
    title: 'Seasonal ASO: Optimizing Your App for Holidays and Events',
    keywords: ['seasonal ASO', 'holiday marketing', 'app store optimization'],
    outline: 'Calendar-based ASO strategies for major holidays and events'
  },
  {
    slug: 'mobile-game-screenshot-strategies',
    title: 'Screenshot Strategies for Mobile Games: What Works in 2026',
    keywords: ['mobile games', 'game screenshots', 'gaming ASO'],
    outline: 'Specific screenshot strategies for different game genres'
  },
  {
    slug: 'app-subtitle-optimization',
    title: 'App Store Subtitle Optimization: 30 Characters That Matter',
    keywords: ['app subtitle', 'ASO', 'keyword optimization'],
    outline: 'How to write effective subtitles for maximum ASO impact'
  },
  {
    slug: 'competitor-screenshot-analysis',
    title: 'How to Analyze Competitor Screenshots for ASO Insights',
    keywords: ['competitor analysis', 'ASO research', 'screenshot strategy'],
    outline: 'Framework for analyzing and learning from competitor screenshots'
  },
  {
    slug: 'app-store-video-preview-guide',
    title: 'App Preview Videos: When and How to Use Them',
    keywords: ['app preview', 'video marketing', 'App Store'],
    outline: 'Complete guide to App Store preview videos'
  },
  {
    slug: 'aso-for-saas-apps',
    title: 'ASO for SaaS Apps: B2B App Store Optimization',
    keywords: ['SaaS ASO', 'B2B apps', 'enterprise apps'],
    outline: 'Specific ASO strategies for SaaS and B2B applications'
  },
  {
    slug: 'app-ratings-and-reviews-strategy',
    title: 'App Ratings and Reviews: The Complete ASO Strategy',
    keywords: ['app ratings', 'reviews', 'ASO strategy'],
    outline: 'How ratings and reviews impact ASO and how to improve them'
  },
  {
    slug: 'google-play-vs-app-store-aso',
    title: 'Google Play vs App Store: ASO Differences You Need to Know',
    keywords: ['Google Play', 'App Store', 'ASO comparison'],
    outline: 'Platform-specific ASO strategies and key differences'
  },
  {
    slug: 'screenshot-copywriting-formulas',
    title: 'Screenshot Copywriting: 7 Formulas That Convert',
    keywords: ['copywriting', 'screenshot headlines', 'conversion'],
    outline: 'Proven headline formulas for App Store screenshots'
  },
  {
    slug: 'aso-keyword-research-2026',
    title: 'ASO Keyword Research in 2026: Tools and Techniques',
    keywords: ['keyword research', 'ASO tools', 'app keywords'],
    outline: 'Modern keyword research methods and best tools'
  },
  {
    slug: 'localization-roi-calculator',
    title: 'Calculating ROI of App Localization: A Data-Driven Approach',
    keywords: ['localization ROI', 'app translation', 'international ASO'],
    outline: 'How to measure and predict ROI from localization efforts'
  },
  {
    slug: 'app-store-feature-graphics',
    title: 'Designing App Store Feature Graphics That Get Featured',
    keywords: ['feature graphic', 'App Store featuring', 'app design'],
    outline: 'How to create graphics that catch Apple/Google attention'
  },
  {
    slug: 'aso-metrics-kpis',
    title: 'Essential ASO Metrics and KPIs to Track in 2026',
    keywords: ['ASO metrics', 'KPIs', 'app analytics'],
    outline: 'Key metrics for measuring ASO success'
  }
];

// Page topics queue
const PAGE_TOPICS = [
  {
    slug: 'screenshot-size-guide',
    type: 'tool',
    title: 'Complete Screenshot Size Guide for All Devices',
    description: 'Reference guide for all App Store and Google Play screenshot dimensions'
  },
  {
    slug: 'aso-checklist',
    type: 'tool',
    title: 'ASO Checklist: Pre-Launch Optimization Guide',
    description: 'Interactive checklist for App Store Optimization before launch'
  },
  {
    slug: 'screenshot-templates',
    type: 'landing',
    title: 'Free Screenshot Templates for App Store',
    description: 'Downloadable screenshot templates for various app categories'
  },
  {
    slug: 'compare/storemaven',
    type: 'comparison',
    title: 'LocalizeShots vs StoreMaven: Comparison 2026',
    description: 'Compare LocalizeShots with StoreMaven for screenshot creation'
  },
  {
    slug: 'compare/appfollow',
    type: 'comparison',
    title: 'LocalizeShots vs AppFollow: Feature Comparison',
    description: 'Compare LocalizeShots with AppFollow for ASO tools'
  },
  {
    slug: 'industries/fitness-apps',
    type: 'landing',
    title: 'Screenshot Generator for Fitness Apps',
    description: 'Specialized screenshot solutions for fitness and health apps'
  },
  {
    slug: 'industries/gaming',
    type: 'landing',
    title: 'Screenshot Generator for Mobile Games',
    description: 'Game-specific screenshot templates and strategies'
  },
  {
    slug: 'tools/headline-generator',
    type: 'tool',
    title: 'Free AI Headline Generator for App Screenshots',
    description: 'Generate compelling headlines for your App Store screenshots'
  },
  {
    slug: 'tools/metadata-analyzer',
    type: 'tool',
    title: 'App Store Metadata Analyzer',
    description: 'Analyze your app metadata for ASO optimization opportunities'
  },
  {
    slug: 'tools/icon-generator',
    type: 'tool',
    title: 'AI App Icon Generator',
    description: 'Create professional app icons with AI'
  }
];

// State management
const STATE_FILE = path.join(__dirname, 'state.json');

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  } catch {
    return {
      blogIndex: 0,
      pageIndex: 0,
      generatedBlogs: [],
      generatedPages: [],
      lastRun: null
    };
  }
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// OpenAI API call
async function generateWithAI(prompt, maxTokens = 4000) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CONFIG.openaiApiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert content writer for LocalizeShots, an App Store Screenshot Generator & ASO Tool.
Write engaging, SEO-optimized content that helps app developers improve their App Store presence.
Always include practical advice, examples, and subtle mentions of LocalizeShots where relevant.
Use markdown formatting with proper headers (##, ###), tables, and bullet points.
Keep the tone professional but accessible.`
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: maxTokens,
      temperature: 0.7
    })
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message);
  }
  return data.choices[0].message.content;
}

// Generate blog article
async function generateBlogArticle(topic) {
  const today = new Date().toISOString().split('T')[0];

  const prompt = `Write a comprehensive blog article for LocalizeShots blog.

Title: ${topic.title}
Keywords to target: ${topic.keywords.join(', ')}
Topic outline: ${topic.outline}

Requirements:
1. Start with an engaging introduction (2-3 paragraphs)
2. Use ## for main sections, ### for subsections
3. Include at least 2 tables with useful data
4. Add practical examples and actionable tips
5. Include internal links to LocalizeShots:
   - [LocalizeShots](/) or [LocalizeShots](/features) for main product
   - [Try LocalizeShots free](/register) for CTAs
   - Link to relevant pages like /tools/size-calculator, /blog/other-articles
6. End with a conclusion and CTA
7. Article should be 1500-2000 words
8. Make it genuinely useful, not just promotional

DO NOT include the frontmatter - just the article content starting with # heading.`;

  const content = await generateWithAI(prompt);

  const mdxContent = `export const frontmatter = {
  title: "${topic.title}",
  description: "${topic.outline}",
  date: "${today}",
  author: "LocalizeShots Team",
  slug: "${topic.slug}",
  image: "/blog/${topic.slug}.png",
  tags: ${JSON.stringify(topic.keywords)}
};

${content}
`;

  return mdxContent;
}

// Generate page content
async function generatePage(topic) {
  const prompt = `Create a React component page for LocalizeShots website.

Page type: ${topic.type}
Title: ${topic.title}
Description: ${topic.description}
URL slug: /${topic.slug}

Requirements:
1. Use React functional component with TypeScript
2. Include SEOHead component for meta tags
3. Use inline styles (no CSS imports) matching the site's design:
   - colors.bg = '#FAFAF8'
   - colors.accent = '#FF6B4A'
   - colors.text = '#1A1A1A'
4. Make it mobile-responsive
5. Include relevant content for the page type
6. Add CTAs linking to /register
7. If it's a comparison page, create a fair comparison table
8. If it's a tool page, make it interactive if possible

Return ONLY the TypeScript React code, no explanation.`;

  const content = await generateWithAI(prompt, 6000);
  return content;
}

// Update blog index
function updateBlogIndex(slug, title) {
  const indexPath = path.join(CONFIG.projectRoot, CONFIG.blogDir, 'index.ts');
  let indexContent = fs.readFileSync(indexPath, 'utf-8');

  // Convert slug to camelCase for variable name
  const varName = slug.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  const componentName = varName.charAt(0).toUpperCase() + varName.slice(1);

  // Add import
  const importStatement = `import ${componentName}, {
  frontmatter as ${varName}Meta,
} from './${slug}.mdx';`;

  // Find last import and add new one
  const lastImportIndex = indexContent.lastIndexOf("} from './");
  const insertPosition = indexContent.indexOf('\n', lastImportIndex) + 1;
  indexContent = indexContent.slice(0, insertPosition) + '\n' + importStatement + indexContent.slice(insertPosition);

  // Add to blogPosts array
  const arrayEntry = `  {
    frontmatter: ${varName}Meta,
    Component: ${componentName},
  },`;

  indexContent = indexContent.replace(
    /(\];\s*\/\/ Get all posts)/,
    `${arrayEntry}\n$1`
  );

  fs.writeFileSync(indexPath, indexContent);
}

// Update sitemap
function updateSitemap(url, date) {
  const sitemapPath = path.join(CONFIG.projectRoot, CONFIG.sitemapPath);
  let sitemap = fs.readFileSync(sitemapPath, 'utf-8');

  const newEntry = `  <url>
    <loc>https://localizeshots.com${url}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;

  // Insert before </urlset>
  sitemap = sitemap.replace('</urlset>', `${newEntry}\n</urlset>`);

  fs.writeFileSync(sitemapPath, sitemap);
}

// Git operations
function gitCommitAndPush(message) {
  const cwd = CONFIG.projectRoot;
  try {
    execSync('git add -A', { cwd, stdio: 'pipe' });
    execSync(`git commit -m "${message}\n\nCo-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"`, { cwd, stdio: 'pipe' });
    execSync('git push origin main', { cwd, stdio: 'pipe' });
    return true;
  } catch (error) {
    console.error('Git error:', error.message);
    return false;
  }
}

// Deploy to Coolify
async function deployToCoolify() {
  try {
    const response = await fetch('http://46.225.26.104:8000/api/v1/deploy?uuid=agk8kwowcc48kkwkcsk844wo', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 2|hjAbdUPchFI55QuEEHIpxJinD2xqtO59gOSPJIvB8736c446'
      }
    });
    const data = await response.json();
    return data.deployments?.[0]?.deployment_uuid || null;
  } catch (error) {
    console.error('Deploy error:', error.message);
    return null;
  }
}

// Generate report
function generateReport(results) {
  const date = new Date().toISOString();
  const reportDir = CONFIG.reportPath;

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const reportFile = path.join(reportDir, `${date.split('T')[0]}.md`);

  let reportContent = '';

  // Check if file exists, append or create
  if (fs.existsSync(reportFile)) {
    reportContent = fs.readFileSync(reportFile, 'utf-8') + '\n---\n\n';
  } else {
    reportContent = `# Content Generation Report - ${date.split('T')[0]}\n\n`;
  }

  reportContent += `## Run at ${date}\n\n`;

  if (results.blog) {
    reportContent += `### Blog Article\n`;
    reportContent += `- **Title:** ${results.blog.title}\n`;
    reportContent += `- **Slug:** ${results.blog.slug}\n`;
    reportContent += `- **URL:** https://localizeshots.com/blog/${results.blog.slug}\n`;
    reportContent += `- **Status:** ${results.blog.success ? '✅ Published' : '❌ Failed'}\n`;
    if (results.blog.error) {
      reportContent += `- **Error:** ${results.blog.error}\n`;
    }
    reportContent += '\n';
  }

  if (results.page) {
    reportContent += `### Page\n`;
    reportContent += `- **Title:** ${results.page.title}\n`;
    reportContent += `- **Type:** ${results.page.type}\n`;
    reportContent += `- **URL:** https://localizeshots.com/${results.page.slug}\n`;
    reportContent += `- **Status:** ${results.page.success ? '✅ Published' : '❌ Failed'}\n`;
    if (results.page.error) {
      reportContent += `- **Error:** ${results.page.error}\n`;
    }
    reportContent += '\n';
  }

  if (results.deployment) {
    reportContent += `### Deployment\n`;
    reportContent += `- **UUID:** ${results.deployment}\n`;
    reportContent += `- **Status:** Triggered\n\n`;
  }

  fs.writeFileSync(reportFile, reportContent);
  console.log(`Report saved to: ${reportFile}`);
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const typeArg = args.find(a => a.startsWith('--type='));
  const type = typeArg ? typeArg.split('=')[1] : 'blog';

  console.log(`\n🚀 LocalizeShots Content Generator`);
  console.log(`📅 ${new Date().toISOString()}`);
  console.log(`📝 Type: ${type}\n`);

  const state = loadState();
  const results = {};

  // Generate blog article
  if (type === 'blog' || type === 'both') {
    const topicIndex = state.blogIndex % BLOG_TOPICS.length;
    const topic = BLOG_TOPICS[topicIndex];

    console.log(`📰 Generating blog: ${topic.title}`);

    try {
      const content = await generateBlogArticle(topic);
      const filePath = path.join(CONFIG.projectRoot, CONFIG.blogDir, `${topic.slug}.mdx`);

      fs.writeFileSync(filePath, content);
      updateBlogIndex(topic.slug, topic.title);
      updateSitemap(`/blog/${topic.slug}`, new Date().toISOString().split('T')[0]);

      results.blog = { ...topic, success: true };
      state.blogIndex = topicIndex + 1;
      state.generatedBlogs.push({ slug: topic.slug, date: new Date().toISOString() });

      console.log(`✅ Blog generated: ${topic.slug}`);
    } catch (error) {
      results.blog = { ...topic, success: false, error: error.message };
      console.error(`❌ Blog generation failed: ${error.message}`);
    }
  }

  // Generate page (only for morning run or when type=page)
  if (type === 'page' || type === 'both') {
    const topicIndex = state.pageIndex % PAGE_TOPICS.length;
    const topic = PAGE_TOPICS[topicIndex];

    console.log(`📄 Generating page: ${topic.title}`);

    try {
      const content = await generatePage(topic);

      // Determine file path based on slug
      let filePath;
      if (topic.slug.includes('/')) {
        const parts = topic.slug.split('/');
        const dir = path.join(CONFIG.projectRoot, CONFIG.pagesDir, ...parts.slice(0, -1));
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        filePath = path.join(dir, `${parts[parts.length - 1]}.tsx`);
      } else {
        filePath = path.join(CONFIG.projectRoot, CONFIG.pagesDir, `${topic.slug}.tsx`);
      }

      fs.writeFileSync(filePath, content);
      updateSitemap(`/${topic.slug}`, new Date().toISOString().split('T')[0]);

      results.page = { ...topic, success: true };
      state.pageIndex = topicIndex + 1;
      state.generatedPages.push({ slug: topic.slug, date: new Date().toISOString() });

      console.log(`✅ Page generated: ${topic.slug}`);
    } catch (error) {
      results.page = { ...topic, success: false, error: error.message };
      console.error(`❌ Page generation failed: ${error.message}`);
    }
  }

  // Commit and push
  if (results.blog?.success || results.page?.success) {
    const items = [];
    if (results.blog?.success) items.push(`blog: ${results.blog.title}`);
    if (results.page?.success) items.push(`page: ${results.page.title}`);

    const commitMessage = `Auto-publish content: ${items.join(', ')}`;

    console.log(`\n📦 Committing changes...`);
    if (gitCommitAndPush(commitMessage)) {
      console.log(`✅ Committed and pushed`);

      console.log(`🚀 Deploying to Coolify...`);
      results.deployment = await deployToCoolify();
      if (results.deployment) {
        console.log(`✅ Deployment triggered: ${results.deployment}`);
      }
    }
  }

  // Save state and report
  state.lastRun = new Date().toISOString();
  saveState(state);
  generateReport(results);

  console.log(`\n✨ Done!\n`);
}

main().catch(console.error);
