import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const userAgent = request.headers.get('user-agent') || '';
    const acceptHeader = request.headers.get('accept') || '';
    
    // Check if this is a search engine crawler
    const isSearchEngineCrawler = userAgent.includes('Googlebot') || 
                                 userAgent.includes('bingbot') || 
                                 userAgent.includes('Baiduspider') || 
                                 userAgent.includes('YandexBot') || 
                                 userAgent.includes('facebookexternalhit') || 
                                 userAgent.includes('Twitterbot') || 
                                 userAgent.includes('LinkedInBot') || 
                                 userAgent.includes('crawler') || 
                                 userAgent.includes('spider') ||
                                 acceptHeader.includes('application/xml') ||
                                 acceptHeader.includes('text/xml');

    // Check if this is a browser request (not a search engine crawler)
    const isBrowserRequest = !isSearchEngineCrawler && 
                           userAgent.includes('Mozilla') && 
                           (acceptHeader.includes('text/html') || 
                            acceptHeader.includes('text/*') || 
                            acceptHeader.includes('*/*'));

    // Generate FAQ questions sitemap content
    const sitemapContent = await generateFaqQuestionsSitemap();

    // For browser requests, serve as HTML
    if (isBrowserRequest) {
      const htmlContent = await transformFaqQuestionsToHTML(sitemapContent);
      return new NextResponse(htmlContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
        }
      });
    }

    // For search engines, serve as XML
    return new NextResponse(sitemapContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
      }
    });

  } catch (error) {
    console.error('Error serving FAQ questions sitemap:', error);
    
    // Return empty sitemap in case of error
    const errorSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- No FAQ questions available -->
</urlset>`;

    return new NextResponse(errorSitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=300'
      }
    });
  }
}

async function generateFaqQuestionsSitemap(): Promise<string> {
  // Fetch all active FAQs with their categories
  const faqs = await prisma.fAQ.findMany({
    select: {
      id: true,
      question: true,
      answer: true,
      updatedAt: true,
      isActive: true,
      category: {
        select: {
          id: true,
          name: true,
          isActive: true
        }
      }
    },
    where: { 
      isActive: true,
      category: {
        isActive: true
      }
    },
    orderBy: [
      { category: { sortOrder: 'asc' } },
      { sortOrder: 'asc' }
    ]
  });

  // Get site settings for base URL
  const siteSettings = await prisma.siteSettings.findFirst();
  const baseUrl = siteSettings?.baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // Helper function to create URL-friendly slugs
  const createSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .replace(/-+/g, '-')      // Replace multiple hyphens with single
      .trim()
      .substring(0, 100);       // Limit length
  };

  // Generate FAQ question entries
  const faqEntries = faqs.map((faq) => {
    const categorySlug = faq.category ? createSlug(faq.category.name) : 'uncategorized';
    const questionSlug = createSlug(faq.question);
    const url = `${baseUrl}/faq/${categorySlug}/${questionSlug}`;
    
    return {
      url,
      lastModified: new Date(faq.updatedAt).toISOString(),
      changeFreq: 'monthly',
      priority: 0.5,
      title: faq.question,
      category: faq.category?.name || 'Uncategorized',
      answerLength: faq.answer.length
    };
  });

  // Generate XML sitemap
  const urls = faqEntries.map((entry) => {
    return `  <!-- ${entry.category}: ${entry.title.substring(0, 60)}${entry.title.length > 60 ? '...' : ''} -->
  <url>
    <loc>${escapeXML(entry.url)}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFreq}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`;
  }).join('\n\n');

  const lastUpdate = faqEntries.length > 0 ? 
    new Date(Math.max(...faqEntries.map(entry => new Date(entry.lastModified).getTime()))).toISOString() : 
    'N/A';

  // Group FAQs by category for stats
  const categoryStats = faqEntries.reduce((acc, faq) => {
    acc[faq.category] = (acc[faq.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<!--
  FAQ Questions Sitemap for Saski AI Website
  Generated dynamically on: ${new Date().toISOString()}
  Total URLs: ${faqEntries.length}
  
  This sitemap contains individual FAQ question pages.
  Distribution by category:
${Object.entries(categoryStats).map(([cat, count]) => `  - ${cat}: ${count} FAQ${count !== 1 ? 's' : ''}`).join('\n')}
  
  Last database update: ${lastUpdate}
-->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
                           http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

${urls}

</urlset>`;
}

async function transformFaqQuestionsToHTML(xmlContent: string): Promise<string> {
  // Get FAQs for HTML display
  const faqs = await prisma.fAQ.findMany({
    select: {
      id: true,
      question: true,
      answer: true,
      updatedAt: true,
      isActive: true,
      category: {
        select: {
          id: true,
          name: true,
          isActive: true
        }
      }
    },
    where: { 
      isActive: true,
      category: {
        isActive: true
      }
    },
    orderBy: [
      { category: { sortOrder: 'asc' } },
      { sortOrder: 'asc' }
    ]
  });

  const siteSettings = await prisma.siteSettings.findFirst();
  const baseUrl = siteSettings?.baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // Helper function to create URL-friendly slugs
  const createSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 100);
  };

  const urlRows = faqs.map(faq => {
    const categorySlug = faq.category ? createSlug(faq.category.name) : 'uncategorized';
    const questionSlug = createSlug(faq.question);
    const url = `${baseUrl}/faq/${categorySlug}/${questionSlug}`;
    const lastmod = new Date(faq.updatedAt).toISOString().split('T')[0] + ' ' + 
                   new Date(faq.updatedAt).toISOString().split('T')[1].substring(0, 8) + ' +00:00';
    
    return `
      <tr>
        <td class="url">
          <a href="${url}">${url}</a>
        </td>
        <td class="question">${faq.question}</td>
        <td class="category">${faq.category?.name || 'Uncategorized'}</td>
        <td class="length">${faq.answer.length} chars</td>
        <td class="lastmod">${lastmod}</td>
      </tr>`;
  }).join('');

  // Group FAQs by category for stats
  const categoryStats = faqs.reduce((acc, faq) => {
    const categoryName = faq.category?.name || 'Uncategorized';
    acc[categoryName] = (acc[categoryName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return `<!DOCTYPE html>
<html>
<head>
  <title>FAQ Questions Sitemap</title>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body {
      font-family: Verdana, Geneva, sans-serif;
      font-size: 13px;
      margin: 20px;
      background-color: #fff;
      color: #333;
    }
    h1 {
      font-size: 24px;
      margin: 0 0 15px 0;
      color: #333;
    }
    .description {
      margin-bottom: 20px;
      line-height: 1.5;
    }
    .description p {
      margin: 8px 0;
    }
    .stats {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 5px;
      margin: 15px 0;
    }
    .stats h3 {
      margin: 0 0 10px 0;
      color: #333;
    }
    .stats ul {
      margin: 0;
      padding: 0 0 0 20px;
    }
    a {
      color: #1e8cbe;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin-top: 20px;
    }
    th, td {
      text-align: left;
      padding: 8px 12px;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f0f0f0;
      font-weight: bold;
    }
    tr:hover {
      background-color: #f5f5f5;
    }
    .url {
      word-break: break-all;
      max-width: 200px;
      font-size: 11px;
    }
    .question {
      font-weight: 500;
      max-width: 250px;
    }
    .category {
      background-color: #e3f2fd;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 11px;
      white-space: nowrap;
    }
    .length {
      text-align: center;
      font-size: 11px;
      color: #666;
    }
    .lastmod {
      white-space: nowrap;
      font-size: 11px;
    }
  </style>
</head>
<body>
  <h1>FAQ Questions Sitemap</h1>
  
  <div class="description">
    <p>Generated by <strong>Saski AI</strong>, this sitemap contains individual FAQ question pages.</p>
    <p>You can find more information about XML sitemaps on <a href="https://sitemaps.org" target="_blank">sitemaps.org</a>.</p>
    <p>This sitemap contains ${faqs.length} individual FAQ question(s).</p>
  </div>

  <div class="stats">
    <h3>Distribution by Category:</h3>
    <ul>
      ${Object.entries(categoryStats).map(([cat, count]) => 
        `<li><strong>${cat}:</strong> ${count} FAQ${count !== 1 ? 's' : ''}</li>`
      ).join('')}
    </ul>
  </div>
  
  <table>
    <thead>
      <tr>
        <th>URL</th>
        <th>Question</th>
        <th>Category</th>
        <th>Answer Length</th>
        <th>Last Modified</th>
      </tr>
    </thead>
    <tbody>${urlRows}
    </tbody>
  </table>
</body>
</html>`;
}

function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
} 