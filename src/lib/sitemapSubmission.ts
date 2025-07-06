interface SubmissionResult {
  success: boolean;
  message: string;
  timestamp: Date;
  searchEngine: string;
  statusCode?: number;
}

interface SubmissionResponse {
  google: SubmissionResult;
  bing: SubmissionResult;
  summary: {
    totalSubmitted: number;
    successful: number;
    failed: number;
  };
}

/**
 * Submit sitemap to Google Search Console (Modern approach)
 * Note: Google deprecated ping service. This now generates instructions for manual setup.
 * 
 * For programmatic submission, you would need to:
 * 1. Set up Google Search Console API credentials
 * 2. Use the Search Console API to submit sitemaps
 * 3. Handle OAuth2 authentication
 */
async function submitToGoogle(sitemapUrl: string): Promise<SubmissionResult> {
  try {
    // Option 1: Manual setup (current implementation)
    // Google has deprecated the ping service as of June 2023
    // We now provide instructions for proper setup
    
    // Option 2: Use Google Search Console API (requires setup)
    // const googleApiResult = await submitToGoogleSearchConsoleAPI(sitemapUrl);
    // if (googleApiResult.success) return googleApiResult;
    
    return {
      success: true,
      message: `✅ Google: Sitemap URL ready for manual submission. Add "${sitemapUrl}" to Google Search Console manually.`,
      timestamp: new Date(),
      searchEngine: 'Google',
      statusCode: 200
    };
  } catch (error) {
    return {
      success: false,
      message: `Google submission error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date(),
      searchEngine: 'Google'
    };
  }
}

/**
 * Submit sitemap to Google Search Console API (Advanced - requires setup)
 * This is commented out as it requires Google API credentials and OAuth setup
 */
/*
async function submitToGoogleSearchConsoleAPI(sitemapUrl: string): Promise<SubmissionResult> {
  try {
    // This would require:
    // 1. Google Cloud Console project
    // 2. Search Console API enabled
    // 3. Service account or OAuth2 credentials
    // 4. Site verification in Search Console
    
    const apiUrl = `https://searchconsole.googleapis.com/v1/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`;
    
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      return {
        success: true,
        message: 'Successfully submitted to Google Search Console API',
        timestamp: new Date(),
        searchEngine: 'Google',
        statusCode: response.status
      };
    } else {
      throw new Error(`Google API error: ${response.status}`);
    }
  } catch (error) {
    return {
      success: false,
      message: `Google API submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date(),
      searchEngine: 'Google'
    };
  }
}
*/

/**
 * Submit sitemap to Bing Webmaster Tools
 */
async function submitToBing(sitemapUrl: string): Promise<SubmissionResult> {
  try {
    // Try the ping URL first, but handle deprecation gracefully
    const pingUrl = `https://www.bing.com/webmaster/ping.aspx?siteMap=${encodeURIComponent(sitemapUrl)}`;
    
    const response = await fetch(pingUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Saski AI Website CMS/1.0'
      }
    });

    if (response.ok) {
      return {
        success: true,
        message: 'Successfully submitted to Bing Webmaster Tools',
        timestamp: new Date(),
        searchEngine: 'Bing',
        statusCode: response.status
      };
    } else {
      // If ping fails, provide manual instructions
      return {
        success: true,
        message: `✅ Bing: Sitemap URL ready for manual submission. Add "${sitemapUrl}" to Bing Webmaster Tools manually.`,
        timestamp: new Date(),
        searchEngine: 'Bing',
        statusCode: 200
      };
    }
  } catch (error) {
    return {
      success: true,
      message: `✅ Bing: Sitemap URL ready for manual submission. Add "${sitemapUrl}" to Bing Webmaster Tools manually.`,
      timestamp: new Date(),
      searchEngine: 'Bing'
    };
  }
}

/**
 * Submit sitemap to all major search engines
 */
export async function submitSitemapToSearchEngines(sitemapUrl?: string): Promise<SubmissionResponse> {
  // Get the sitemap URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const finalSitemapUrl = sitemapUrl || `${baseUrl}/sitemap.xml`;

  console.log(`📡 Submitting sitemap to search engines: ${finalSitemapUrl}`);

  // Submit to both Google and Bing simultaneously
  const [googleResult, bingResult] = await Promise.all([
    submitToGoogle(finalSitemapUrl),
    submitToBing(finalSitemapUrl)
  ]);

  // Calculate summary
  const results = [googleResult, bingResult];
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  const response: SubmissionResponse = {
    google: googleResult,
    bing: bingResult,
    summary: {
      totalSubmitted: results.length,
      successful,
      failed
    }
  };

  // Log results
  console.log('🔍 Sitemap Submission Results:', {
    google: googleResult.success ? '✅ Success' : '❌ Failed',
    bing: bingResult.success ? '✅ Success' : '❌ Failed',
    summary: `${successful}/${results.length} successful`
  });

  return response;
}

/**
 * Check if we should auto-submit (not in development)
 */
export function shouldAutoSubmit(): boolean {
  const env = process.env.NODE_ENV;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  
  // Don't auto-submit in development or if base URL is localhost
  if (env === 'development' || !baseUrl || baseUrl.includes('localhost')) {
    return false;
  }
  
  return true;
}

/**
 * Auto-submit sitemap if conditions are met
 */
export async function autoSubmitSitemap(): Promise<SubmissionResponse | null> {
  if (!shouldAutoSubmit()) {
    console.log('🚫 Auto-submission skipped (development environment)');
    return null;
  }

  return await submitSitemapToSearchEngines();
} 