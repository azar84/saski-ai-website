import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const userAgent = request.headers.get('user-agent') || '';
    const acceptHeader = request.headers.get('accept') || '';
    
    // Check if this is a browser request (not a search engine crawler)
    const isBrowserRequest = userAgent.includes('Mozilla') && 
                           (acceptHeader.includes('text/html') || 
                            acceptHeader.includes('text/*') || 
                            acceptHeader.includes('*/*'));

    // Generate pages sitemap content
    const sitemapContent = await generatePagesSitemap();

    // For browser requests, serve as HTML
    if (isBrowserRequest) {
      const htmlContent = await transformPagesToHTML(sitemapContent);
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
    console.error('Error serving pages sitemap:', error);
    
    // Return minimal sitemap in case of error
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const errorSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/home</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
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

async function generatePagesSitemap(): Promise<string> {
  // Fetch all pages from database
  const pages = await prisma.page.findMany({
    select: {
      slug: true,
      title: true,
      updatedAt: true,
      showInHeader: true,
      showInFooter: true,
    },
    orderBy: {
      sortOrder: 'asc'
    }
  });

  // Get site settings for base URL
  const siteSettings = await prisma.siteSettings.findFirst();
  const baseUrl = siteSettings?.baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // Generate page entries
  const pageEntries = pages.map((page, index) => {
    const url = `${baseUrl}/${page.slug}`;
    const priority = page.slug === 'home' ? 1.0 : page.showInHeader ? 0.8 : 0.6;
    const changefreq = page.slug === 'home' ? 'daily' : page.showInHeader ? 'weekly' : 'monthly';
    const pageTitle = page.title || (page.slug === 'home' ? 'Homepage' : `Page ${index + 1}`);

    return {
      url,
      lastModified: new Date(page.updatedAt).toISOString(),
      changeFreq: changefreq,
      priority,
      title: pageTitle
    };
  });

  // Generate XML sitemap
  const urls = pageEntries.map((entry) => {
    return `  <!-- ${entry.title} -->
  <url>
    <loc>${escapeXML(entry.url)}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFreq}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`;
  }).join('\n\n');

  const lastUpdate = pageEntries.length > 0 ? 
    new Date(Math.max(...pageEntries.map(entry => new Date(entry.lastModified).getTime()))).toISOString() : 
    'N/A';

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<!--
  Pages Sitemap for Saski AI Website
  Generated dynamically on: ${new Date().toISOString()}
  Total URLs: ${pageEntries.length}
  
  This sitemap contains all website pages.
  Last database update: ${lastUpdate}
-->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
                           http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

${urls}

</urlset>`;
}

async function transformPagesToHTML(xmlContent: string): Promise<string> {
  // Get pages for HTML display
  const pages = await prisma.page.findMany({
    select: {
      slug: true,
      title: true,
      updatedAt: true,
      showInHeader: true,
      showInFooter: true,
    },
    orderBy: [
      { showInHeader: 'desc' },
      { sortOrder: 'asc' }
    ]
  });

  const siteSettings = await prisma.siteSettings.findFirst();
  const baseUrl = siteSettings?.baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const urlRows = pages.map(page => {
    const url = `${baseUrl}/${page.slug}`;
    const lastmod = new Date(page.updatedAt).toISOString().split('T')[0] + ' ' + 
                   new Date(page.updatedAt).toISOString().split('T')[1].substring(0, 8) + ' +00:00';
    
    return `
      <tr>
        <td class="url">
          <a href="${url}">${url}</a>
        </td>
        <td class="lastmod">${lastmod}</td>
      </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <title>Pages Sitemap</title>
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
    }
    .lastmod {
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <h1>Pages Sitemap</h1>
  
  <div class="description">
    <p>Generated by <strong>Saski AI</strong>, this sitemap contains all website pages.</p>
    <p>You can find more information about XML sitemaps on <a href="https://sitemaps.org" target="_blank">sitemaps.org</a>.</p>
    <p>This sitemap contains ${pages.length} page(s).</p>
  </div>
  
  <table>
    <thead>
      <tr>
        <th>URL</th>
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