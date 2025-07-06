import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const userAgent = request.headers.get('user-agent') || '';
    const acceptHeader = request.headers.get('accept') || '';
    
    // Check if this is a search engine crawler or API request
    const isSearchEngineCrawler = userAgent.includes('Googlebot') || 
                                 userAgent.includes('bingbot') || 
                                 userAgent.includes('Baiduspider') || 
                                 userAgent.includes('YandexBot') || 
                                 userAgent.includes('facebookexternalhit') || 
                                 userAgent.includes('Twitterbot') || 
                                 userAgent.includes('LinkedInBot') || 
                                 userAgent.includes('crawler') || 
                                 userAgent.includes('spider') ||
                                 userAgent.includes('Google-') ||  // Google API requests
                                 userAgent.includes('APIs-Google') ||  // Google APIs
                                 acceptHeader.includes('application/xml') ||
                                 acceptHeader.includes('text/xml');

    // Check if this is a browser request (not a search engine crawler or API)
    const isBrowserRequest = !isSearchEngineCrawler && 
                           userAgent.includes('Mozilla') && 
                           (acceptHeader.includes('text/html') || 
                            acceptHeader.includes('text/*') || 
                            acceptHeader.includes('*/*'));

    // Generate FAQ categories sitemap content
    const sitemapContent = await generateFaqCategoriesSitemap();

    // For browser requests, serve as HTML
    if (isBrowserRequest) {
      const htmlContent = await transformFaqCategoriesToHTML(sitemapContent);
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
    console.error('Error serving FAQ categories sitemap:', error);
    
    // Return empty sitemap in case of error
    const errorSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- No FAQ categories available -->
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

async function generateFaqCategoriesSitemap(): Promise<string> {
  // Fetch all active FAQ categories
  const faqCategories = await prisma.fAQCategory.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      updatedAt: true,
      isActive: true,
      _count: {
        select: {
          faqs: { where: { isActive: true } }
        }
      }
    },
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' }
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

  // Generate FAQ category entries
  const categoryEntries = faqCategories.map((category) => {
    const categorySlug = createSlug(category.name);
    const url = `${baseUrl}/faq/${categorySlug}`;
    
    return {
      url,
      lastModified: new Date(category.updatedAt).toISOString(),
      changeFreq: 'weekly',
      priority: 0.7,
      title: `FAQ: ${category.name}`,
      faqCount: category._count.faqs
    };
  });

  // Note: Main FAQ page (/faq) is handled as a regular page, not included here

  // Generate XML sitemap
  const urls = categoryEntries.map((entry) => {
    return `  <!-- ${entry.title} (${entry.faqCount} FAQ${entry.faqCount !== 1 ? 's' : ''}) -->
  <url>
    <loc>${escapeXML(entry.url)}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFreq}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`;
  }).join('\n\n');

  const lastUpdate = categoryEntries.length > 0 ? 
    new Date(Math.max(...categoryEntries.map(entry => new Date(entry.lastModified).getTime()))).toISOString() : 
    'N/A';

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<!--
  FAQ Categories Sitemap for Saski AI Website
  Generated dynamically on: ${new Date().toISOString()}
  Total URLs: ${categoryEntries.length}
  
  This sitemap contains only FAQ category pages (main FAQ page is handled separately).
  Categories: ${faqCategories.length}
  Total FAQs across all categories: ${faqCategories.reduce((sum, cat) => sum + cat._count.faqs, 0)}
  Last database update: ${lastUpdate}
-->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
                           http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

${urls}

</urlset>`;
}

async function transformFaqCategoriesToHTML(xmlContent: string): Promise<string> {
  // Get FAQ categories for HTML display
  const faqCategories = await prisma.fAQCategory.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      updatedAt: true,
      isActive: true,
      _count: {
        select: {
          faqs: { where: { isActive: true } }
        }
      }
    },
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' }
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

  let urlRows = '';
  
  // Only include category pages (main FAQ page is handled separately)
  // Add category pages
  urlRows += faqCategories.map(category => {
    const categorySlug = createSlug(category.name);
    const url = `${baseUrl}/faq/${categorySlug}`;
    const lastmod = new Date(category.updatedAt).toISOString().split('T')[0] + ' ' + 
                   new Date(category.updatedAt).toISOString().split('T')[1].substring(0, 8) + ' +00:00';
    
    return `
      <tr>
        <td class="url">
          <a href="${url}">${url}</a>
        </td>
        <td class="category">${category.name}</td>
        <td class="count">${category._count.faqs} FAQ${category._count.faqs !== 1 ? 's' : ''}</td>
        <td class="lastmod">${lastmod}</td>
      </tr>`;
  }).join('');

  const totalEntries = faqCategories.length; // Only category pages

  return `<!DOCTYPE html>
<html>
<head>
  <title>FAQ Categories Sitemap</title>
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
      max-width: 300px;
    }
    .category {
      font-weight: 500;
    }
    .count {
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .lastmod {
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <h1>FAQ Categories Sitemap</h1>
  
  <div class="description">
    <p>Generated by <strong>Saski AI</strong>, this sitemap contains FAQ category pages.</p>
    <p>You can find more information about XML sitemaps on <a href="https://sitemaps.org" target="_blank">sitemaps.org</a>.</p>
    <p>This sitemap contains ${totalEntries} URL(s) including ${faqCategories.length} categor${faqCategories.length === 1 ? 'y' : 'ies'} with ${faqCategories.reduce((sum, cat) => sum + cat._count.faqs, 0)} total FAQ(s).</p>
  </div>
  
  <table>
    <thead>
      <tr>
        <th>URL</th>
        <th>Category</th>
        <th>FAQ Count</th>
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