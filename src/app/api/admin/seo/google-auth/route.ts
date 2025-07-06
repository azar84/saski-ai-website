import { NextRequest, NextResponse } from 'next/server';
import { googleSearchConsole } from '@/lib/googleSearchConsole';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const action = searchParams.get('action');

    if (action === 'authorize') {
      // Generate authorization URL
      const authUrl = googleSearchConsole.getAuthorizationUrl();
      
      return NextResponse.json({
        success: true,
        message: 'Google OAuth2 authorization URL generated',
        authUrl,
        instructions: [
          '1. Click the authUrl to authorize access',
          '2. You will be redirected back with an authorization code',
          '3. Use that code to complete the setup'
        ]
      });
    }

    if (action === 'callback' && code) {
      // Exchange authorization code for access token
      const result = await googleSearchConsole.exchangeCodeForToken(code);
      
      if (result.success) {
        return NextResponse.json({
          success: true,
          message: 'Google OAuth2 setup completed successfully!',
          details: {
            accessToken: result.tokens.access_token ? '***' : undefined,
            refreshToken: result.tokens.refresh_token ? '***' : undefined,
            expiresIn: result.tokens.expires_in
          }
        });
      } else {
        return NextResponse.json({
          success: false,
          message: 'Failed to complete OAuth2 setup',
          error: result.error
        }, { status: 400 });
      }
    }

    // Default: return setup instructions
    return NextResponse.json({
      success: true,
      message: 'Google Search Console API Setup',
      instructions: [
        'To set up Google Search Console API:',
        '1. Call /api/admin/seo/google-auth?action=authorize to get auth URL',
        '2. Authorize the application',
        '3. Call /api/admin/seo/google-auth?action=callback&code=YOUR_CODE to complete setup'
      ],
      actions: {
        authorize: '/api/admin/seo/google-auth?action=authorize',
        callback: '/api/admin/seo/google-auth?action=callback&code=YOUR_CODE'
      }
    });

  } catch (error) {
    console.error('❌ Google OAuth2 error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Google OAuth2 setup failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, sitemapUrl, siteUrl } = body;

    if (action === 'submit-sitemap') {
      // Submit sitemap using the API
      const result = await googleSearchConsole.submitSitemap(sitemapUrl, siteUrl);
      
      return NextResponse.json({
        success: result.success,
        message: result.message,
        details: result.details
      });
    }

    if (action === 'list-sites') {
      // List sites in Search Console
      const sites = await googleSearchConsole.listSites();
      
      return NextResponse.json({
        success: true,
        message: 'Sites retrieved successfully',
        sites
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Invalid action. Use: submit-sitemap, list-sites'
    }, { status: 400 });

  } catch (error) {
    console.error('❌ Google Search Console API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Google Search Console API request failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 