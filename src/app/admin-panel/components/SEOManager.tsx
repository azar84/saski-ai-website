'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Search, 
  FileText, 
  Globe, 
  Settings, 
  Download, 
  RefreshCw,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Copy,
  Eye,
  Calendar,
  Zap,
  Link,
  Hash,
  BarChart3
} from 'lucide-react';

interface Page {
  id: number;
  slug: string;
  title: string;
  metaTitle?: string;
  metaDesc?: string;
  sortOrder: number;
  showInHeader: boolean;
  showInFooter: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SiteSettings {
  baseUrl?: string;
  footerCompanyName?: string;
}

interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

interface FAQPageInfo {
  type: 'faq-category' | 'faq-question';
  url: string;
  title: string;
  updatedAt: string;
}

interface SEOAuditResult {
  page?: Page;
  faqPage?: FAQPageInfo;
  url: string;
  issues: string[];
  warnings: string[];
  suggestions: string[];
  score: number;
  metaTagsStatus: {
    title: boolean;
    description: boolean;
    canonical: boolean;
    robots: boolean;
    ogTitle: boolean;
    twitterCard: boolean;
  };
  liveSEOCheck?: {
    isValid: boolean;
    missing: string[];
    issues: string[];
    warnings: string[];
  };
}

export default function SEOManager() {
  const [activeTab, setActiveTab] = useState<'sitemap' | 'robots' | 'audit' | 'settings'>('sitemap');
  const [pages, setPages] = useState<Page[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  // Sitemap state
  const [sitemapEntries, setSitemapEntries] = useState<SitemapEntry[]>([]);
  const [sitemapContent, setSitemapContent] = useState<string>('');
  
  // Robots.txt state
  const [robotsContent, setRobotsContent] = useState<string>('');
  
  // SEO Audit state
  const [auditResults, setAuditResults] = useState<SEOAuditResult[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch pages
      const pagesResponse = await fetch('/api/admin/pages');
      const pagesResult = await pagesResponse.json();
      
      if (pagesResult.success) {
        setPages(pagesResult.data);
      }

      // Fetch site settings
      const settingsResponse = await fetch('/api/admin/site-settings');
      const settingsResult = await settingsResponse.json();
      
      if (settingsResult.success) {
        setSiteSettings(settingsResult.data);
      }

      // Fetch current sitemap if exists
      await fetchCurrentSitemap();
      
      // Fetch current robots.txt if exists  
      await fetchCurrentRobots();
      
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setMessage({ type: 'error', text: 'Failed to load SEO data' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentSitemap = async () => {
    try {
      const response = await fetch('/sitemap.xml');
      if (response.ok) {
        const content = await response.text();
        setSitemapContent(content);
      }
    } catch (error) {
      console.log('No existing sitemap found');
    }
  };

  const fetchCurrentRobots = async () => {
    try {
      const response = await fetch('/robots.txt');
      if (response.ok) {
        const content = await response.text();
        setRobotsContent(content);
      } else {
        // Set default robots.txt content
        setRobotsContent(generateDefaultRobots());
      }
    } catch (error) {
      setRobotsContent(generateDefaultRobots());
    }
  };

  const generateDefaultRobots = () => {
    const baseUrl = siteSettings.baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
    return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Disallow admin areas
Disallow: /admin-panel/
Disallow: /api/admin/
Disallow: /_next/
Disallow: /uploads/temp/

# Allow public uploads
Allow: /uploads/media/`;
  };

  const generateSitemap = async () => {
    try {
      setGenerating(true);
      setMessage(null);

      const response = await fetch('/api/admin/seo/generate-sitemap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        setSitemapContent(result.sitemap);
        setSitemapEntries(result.entries);
        setMessage({ type: 'success', text: 'Sitemap generated successfully!' });
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to generate sitemap' });
      }
    } catch (error) {
      console.error('Failed to generate sitemap:', error);
      setMessage({ type: 'error', text: 'Failed to generate sitemap' });
    } finally {
      setGenerating(false);
    }
  };

  const saveRobotsTxt = async () => {
    try {
      setGenerating(true);
      setMessage(null);

      const response = await fetch('/api/admin/seo/robots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: robotsContent }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Robots.txt saved successfully!' });
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to save robots.txt' });
      }
    } catch (error) {
      console.error('Failed to save robots.txt:', error);
      setMessage({ type: 'error', text: 'Failed to save robots.txt' });
    } finally {
      setGenerating(false);
    }
  };

  const [checkLivePages, setCheckLivePages] = useState(false);

  const runSEOAudit = async () => {
    try {
      setAuditLoading(true);
      setMessage(null);

      const response = await fetch('/api/admin/seo/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ checkLivePages }),
      });

      const result = await response.json();

      if (result.success) {
        setAuditResults(result.results);
        setMessage({ 
          type: 'success', 
          text: `SEO audit completed! Found ${result.summary.totalPages} pages (${result.summary.regularPages} regular, ${result.summary.faqPages} FAQ).` 
        });
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to run SEO audit' });
      }
    } catch (error) {
      console.error('Failed to run SEO audit:', error);
      setMessage({ type: 'error', text: 'Failed to run SEO audit' });
    } finally {
      setAuditLoading(false);
    }
  };

  const downloadSitemap = () => {
    const blob = new Blob([sitemapContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setMessage({ type: 'success', text: `${type} copied to clipboard!` });
  };

  const submitSitemapToSearchEngines = async () => {
    try {
      setSubmitting(true);
      setMessage(null);

      const response = await fetch('/api/admin/seo/submit-sitemap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `✅ ${result.message} - Google: ${result.data.google.success ? '✅' : '❌'}, Bing: ${result.data.bing.success ? '✅' : '❌'}` 
        });
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to submit sitemap' });
      }
    } catch (error) {
      console.error('Failed to submit sitemap:', error);
      setMessage({ type: 'error', text: 'Failed to submit sitemap to search engines' });
    } finally {
      setSubmitting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SEO Manager</h1>
        <p className="text-gray-600">
          Manage your website's SEO settings, generate sitemaps, and audit page performance.
        </p>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800' :
          message.type === 'error' ? 'bg-red-50 text-red-800' :
          'bg-blue-50 text-blue-800'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
            {message.type === 'error' && <XCircle className="w-5 h-5 mr-2" />}
            {message.type === 'info' && <AlertTriangle className="w-5 h-5 mr-2" />}
            {message.text}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'sitemap', label: 'Sitemap', icon: FileText },
          { id: 'robots', label: 'Robots.txt', icon: Settings },
          { id: 'audit', label: 'SEO Audit', icon: BarChart3 },
          { id: 'settings', label: 'SEO Settings', icon: Globe },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sitemap Tab */}
      {activeTab === 'sitemap' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">XML Sitemap</h2>
              <p className="text-gray-600 mt-1">Generate and manage your website's sitemap.</p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={generateSitemap}
                disabled={generating}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Sitemap
                  </>
                )}
              </Button>
              {sitemapContent && (
                <>
                  <Button
                    onClick={downloadSitemap}
                    variant="outline"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    onClick={submitSitemapToSearchEngines}
                    disabled={submitting}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4 mr-2" />
                        Submit to Search Engines
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Sitemap Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-2xl font-semibold text-gray-900">{pages.length}</p>
                  <p className="text-sm text-gray-600">Total Pages</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center">
                <Globe className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-semibold text-gray-900">
                    {pages.filter(p => p.showInHeader || p.showInFooter).length}
                  </p>
                  <p className="text-sm text-gray-600">Indexed Pages</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-2xl font-semibold text-gray-900">
                    {sitemapContent ? new Date().toLocaleDateString() : 'Never'}
                  </p>
                  <p className="text-sm text-gray-600">Last Generated</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center">
                <ExternalLink className="w-8 h-8 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 break-all">
                    {siteSettings.baseUrl || 'Not Set'}
                  </p>
                  <p className="text-sm text-gray-600">Base URL</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Pages List */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pages in Sitemap</h3>
            <div className="space-y-4">
              {pages.map((page) => (
                <div key={page.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium text-gray-900">{page.title}</h4>
                      <span className="text-sm text-gray-500">/{page.slug === 'home' ? '' : page.slug}</span>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <span>Priority: {page.slug === 'home' ? '1.0' : '0.8'}</span>
                      <span>Updated: {new Date(page.updatedAt).toLocaleDateString()}</span>
                      {page.metaTitle && (
                        <span className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                          Meta Title
                        </span>
                      )}
                      {page.metaDesc && (
                        <span className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                          Meta Description
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => window.open(`/${page.slug === 'home' ? '' : page.slug}`, '_blank')}
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Sitemap Preview */}
          {sitemapContent && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Sitemap Preview</h3>
                <Button
                  onClick={() => copyToClipboard(sitemapContent, 'Sitemap')}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{sitemapContent}</code>
              </pre>
            </Card>
          )}
        </div>
      )}

      {/* Robots.txt Tab */}
      {activeTab === 'robots' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Robots.txt</h2>
              <p className="text-gray-600 mt-1">Control how search engines crawl your website.</p>
            </div>
            <Button
              onClick={saveRobotsTxt}
              disabled={generating}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Save Robots.txt
                </>
              )}
            </Button>
          </div>

          <Card className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Robots.txt Content
              </label>
              <textarea
                value={robotsContent}
                onChange={(e) => setRobotsContent(e.target.value)}
                rows={15}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="Enter robots.txt content..."
              />
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                This will be served at <code className="bg-gray-200 px-2 py-1 rounded">/robots.txt</code>
              </p>
              <Button
                onClick={() => setRobotsContent(generateDefaultRobots())}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset to Default
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* SEO Audit Tab */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">SEO Audit</h2>
              <p className="text-gray-600 mt-1">Analyze your pages for SEO best practices.</p>
            </div>
            <Button
              onClick={runSEOAudit}
              disabled={auditLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {auditLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Running Audit...
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Run SEO Audit
                </>
              )}
            </Button>
          </div>

          {/* Live Check Option */}
          <Card className="p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Audit Options</h3>
                <p className="text-sm text-gray-600">Configure how the SEO audit should run</p>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={checkLivePages}
                  onChange={(e) => setCheckLivePages(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Check live pages for meta tags</span>
              </label>
            </div>
          </Card>

          {auditResults.length > 0 && (
            <div className="space-y-4">
              {auditResults.filter(result => result.metaTagsStatus).map((result, index) => {
                const pageTitle = result.page?.title || result.faqPage?.title || 'Unknown Page';
                const pageUrl = result.page?.slug 
                  ? `/${result.page?.slug === 'home' ? '' : result.page?.slug}`
                  : result.url.replace(typeof window !== 'undefined' ? (window.location.origin || '') : '', '');
                const pageType = result.page ? 'Page' : result.faqPage?.type === 'faq-category' ? 'FAQ Category' : 'FAQ Question';
                
                return (
                  <Card key={result.page?.id || `faq-${index}`} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">{pageTitle}</h3>
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            {pageType}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{pageUrl}</p>
                        {result.liveSEOCheck && (
                          <p className="text-xs text-gray-500 mt-1">
                            Live check: {result.liveSEOCheck.isValid ? '✅ Valid' : '❌ Issues found'}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(result.score)} ${getScoreColor(result.score)}`}>
                          {result.score}/100
                        </div>
                        {/* Meta Tags Status */}
                        <div className="mt-2 flex gap-1">
                          {Object.entries(result.metaTagsStatus).map(([tag, status]) => (
                            <span 
                              key={tag}
                              className={`w-2 h-2 rounded-full ${status ? 'bg-green-500' : 'bg-red-500'}`}
                              title={`${tag}: ${status ? 'Present' : 'Missing'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {result.issues.length > 0 && (
                      <div>
                        <h4 className="font-medium text-red-600 mb-2 flex items-center">
                          <XCircle className="w-4 h-4 mr-1" />
                          Issues ({result.issues.length})
                        </h4>
                        <ul className="text-sm text-red-700 space-y-1">
                          {result.issues.map((issue, idx) => (
                            <li key={idx}>• {issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.warnings.length > 0 && (
                      <div>
                        <h4 className="font-medium text-yellow-600 mb-2 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Warnings ({result.warnings.length})
                        </h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          {result.warnings.map((warning, idx) => (
                            <li key={idx}>• {warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.suggestions.length > 0 && (
                      <div>
                        <h4 className="font-medium text-blue-600 mb-2 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Suggestions ({result.suggestions.length})
                        </h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          {result.suggestions.map((suggestion, idx) => (
                            <li key={idx}>• {suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SEO Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">SEO Settings</h2>
            <p className="text-gray-600 mt-1">Configure global SEO settings for your website.</p>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => window.open('/sitemap.xml', '_blank')}
                variant="outline"
                className="justify-start h-auto p-4"
              >
                <div className="text-left">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    <span className="font-medium">View Live Sitemap</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Check your current sitemap.xml</p>
                </div>
              </Button>

              <Button
                onClick={() => window.open('/robots.txt', '_blank')}
                variant="outline"
                className="justify-start h-auto p-4"
              >
                <div className="text-left">
                  <div className="flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-green-600" />
                    <span className="font-medium">View Live Robots.txt</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Check your current robots.txt</p>
                </div>
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Tips</h3>
            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Optimize Page Titles</p>
                  <p>Keep titles under 60 characters and include your target keywords.</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Write Compelling Meta Descriptions</p>
                  <p>Keep descriptions between 150-160 characters and make them actionable.</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Update Your Sitemap Regularly</p>
                  <p>Regenerate your sitemap when you add or modify pages.</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Monitor SEO Performance</p>
                  <p>Run regular SEO audits to identify and fix issues.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
} 