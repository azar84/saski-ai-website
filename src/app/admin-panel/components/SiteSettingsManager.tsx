'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import MediaSelector from '@/components/ui/MediaSelector';
import { useDesignSystem } from '@/hooks/useDesignSystem';
import { 
  Save, 
  RotateCcw, 
  Upload, 
  X, 
  Image, 
  Settings, 
  Phone, 
  Mail, 
  Send, 
  Shield,
  Globe,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube
} from 'lucide-react';

interface MediaItem {
  id: number;
  filename: string;
  title?: string;
  description?: string;
  alt?: string;
  fileType: 'image' | 'video' | 'audio' | 'document' | 'other';
  mimeType: string;
  fileSize: number;
  publicUrl: string;
  thumbnailUrl?: string;
}

interface SiteSettings {
  id?: number;
  logoUrl: string | null;
  logoLightUrl: string | null;
  logoDarkUrl: string | null;
  faviconUrl: string | null;
  faviconLightUrl: string | null;
  faviconDarkUrl: string | null;
  
  // Email Configuration
  smtpEnabled?: boolean;
  smtpHost?: string | null;
  smtpPort?: number | null;
  smtpSecure?: boolean;
  smtpUsername?: string | null;
  smtpPassword?: string | null;
  smtpFromEmail?: string | null;
  smtpFromName?: string | null;
  smtpReplyTo?: string | null;
  
  // Email Templates Configuration
  emailSignature?: string | null;
  emailFooterText?: string | null;
  emailBrandingEnabled?: boolean;
  
  // Email Notification Settings
  adminNotificationEmail?: string | null;
  emailLoggingEnabled?: boolean;
  emailRateLimitPerHour?: number | null;
  
  // Company Contact Information
  companyPhone?: string | null;
  companyEmail?: string | null;
  companyAddress?: string | null;
  
  // Social Media Links
  socialFacebook?: string | null;
  socialTwitter?: string | null;
  socialLinkedin?: string | null;
  socialInstagram?: string | null;
  socialYoutube?: string | null;
  
  // Footer Configuration
  footerNewsletterFormId?: number | null;
  footerCopyrightMessage?: string | null;
  footerMenuIds?: string | null;
  footerShowContactInfo?: boolean;
  footerShowSocialLinks?: boolean;
  footerCompanyName?: string | null;
  footerCompanyDescription?: string | null;
  footerBackgroundColor?: string | null;
  footerTextColor?: string | null;
  
  // Base URL
  baseUrl?: string | null;
  
  createdAt?: string;
  updatedAt?: string;
}

// Utility function to determine if a color is light or dark
const isLightColor = (hexColor: string): boolean => {
  // Remove the # if present
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance using the relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return true if light (luminance > 0.5)
  return luminance > 0.5;
};

export default function SiteSettingsManager() {
  const { designSystem } = useDesignSystem();
  const [settings, setSettings] = useState<SiteSettings>({
    logoUrl: null,
    logoLightUrl: null,
    logoDarkUrl: null,
    faviconUrl: null,
    faviconLightUrl: null,
    faviconDarkUrl: null,
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'email'>('general');
  
  // File upload states
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingLogoLight, setUploadingLogoLight] = useState(false);
  const [uploadingLogoDark, setUploadingLogoDark] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingFaviconLight, setUploadingFaviconLight] = useState(false);
  const [uploadingFaviconDark, setUploadingFaviconDark] = useState(false);
  
  // Email test states
  const [testEmail, setTestEmail] = useState('');
  const [testingEmail, setTestingEmail] = useState(false);
  const [emailTestResult, setEmailTestResult] = useState<any>(null);
  
  // File input refs
  const logoFileRef = useRef<HTMLInputElement>(null);
  const logoLightFileRef = useRef<HTMLInputElement>(null);
  const logoDarkFileRef = useRef<HTMLInputElement>(null);
  const faviconFileRef = useRef<HTMLInputElement>(null);
  const faviconLightFileRef = useRef<HTMLInputElement>(null);
  const faviconDarkFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/site-settings');
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.data || {
          logoUrl: null,
          logoLightUrl: null,
          logoDarkUrl: null,
          faviconUrl: null,
          faviconLightUrl: null,
          faviconDarkUrl: null,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof SiteSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleMediaSelect = (field: keyof SiteSettings, media: MediaItem | MediaItem[] | null) => {
    if (media && !Array.isArray(media)) {
      setSettings(prev => ({ ...prev, [field]: media.publicUrl }));
      setMessage({ type: 'success', text: 'Media selected successfully!' });
    } else if (media === null) {
      setSettings(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleFileUpload = async (file: File, type: 'logo' | 'logoLight' | 'logoDark' | 'favicon' | 'faviconLight' | 'faviconDark') => {
    const setUploading = {
      logo: setUploadingLogo,
      logoLight: setUploadingLogoLight,
      logoDark: setUploadingLogoDark,
      favicon: setUploadingFavicon,
      faviconLight: setUploadingFaviconLight,
      faviconDark: setUploadingFaviconDark,
    }[type];

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'media');

      const response = await fetch('/api/admin/media-library', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        const fieldMap = {
          logo: 'logoUrl',
          logoLight: 'logoLightUrl',
          logoDark: 'logoDarkUrl',
          favicon: 'faviconUrl',
          faviconLight: 'faviconLightUrl',
          faviconDark: 'faviconDarkUrl',
        } as const;
        
        handleInputChange(fieldMap[type], result.data.publicUrl);
        setMessage({ type: 'success', text: 'Image uploaded successfully!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Upload failed' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: 'Upload failed. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, type: 'logo' | 'logoLight' | 'logoDark' | 'favicon' | 'faviconLight' | 'faviconDark') => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0], type);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'logoLight' | 'logoDark' | 'favicon' | 'faviconLight' | 'faviconDark') => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0], type);
    }
  };

  const removeImage = (type: 'logo' | 'logoLight' | 'logoDark' | 'favicon' | 'faviconLight' | 'faviconDark') => {
    const fieldMap = {
      logo: 'logoUrl',
      logoLight: 'logoLightUrl',
      logoDark: 'logoDarkUrl',
      favicon: 'faviconUrl',
      faviconLight: 'faviconLightUrl',
      faviconDark: 'faviconDarkUrl',
    } as const;
    
    handleInputChange(fieldMap[type], '');
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      
      const response = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        setSettings(result.data);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save settings' });
      }
    } catch (error) {
      console.error('Save error:', error);
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchSettings();
    setMessage(null);
  };

  const handleEmailSettingChange = (field: keyof SiteSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleTestEmail = async () => {
    if (!testEmail) return;
    
    try {
      setTestingEmail(true);
      setEmailTestResult(null);
      
      const response = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          testEmail,
          settings 
        }),
      });

      const result = await response.json();
      setEmailTestResult(result);
      
    } catch (error) {
      console.error('Test email error:', error);
      setEmailTestResult({
        success: false,
        error: 'Failed to send test email. Please check your connection.',
      });
    } finally {
      setTestingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Site Settings</h1>
          <p className="text-gray-600 mt-2">Manage your website configuration and email settings</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={saving}
            className="flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </Button>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'general'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>General Settings</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'contact'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>Contact Information</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('email')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'email'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>Email Settings</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <div className="space-y-8">
          {/* Settings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Base URL Settings */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Globe className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Base URL</h3>
                  <p className="text-gray-600 text-sm">The absolute base URL for server-side API calls (e.g., https://mysite.com)</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base URL
                  </label>
                  <Input
                    type="url"
                    placeholder="https://mysite.com"
                    value={settings.baseUrl || ''}
                    onChange={(e) => handleInputChange('baseUrl', e.target.value)}
                    className="h-12"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Used for server-side API calls. Leave blank to use environment default.
                  </p>
                </div>
              </div>
            </Card>

            {/* Light Logo Settings */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Image className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Light Logo</h3>
                  <p className="text-gray-600 text-sm">Logo for dark backgrounds</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Light Logo URL
                  </label>
                  <Input
                    type="url"
                    placeholder="https://example.com/logo-light.png"
                    value={settings.logoLightUrl || ''}
                    onChange={(e) => handleInputChange('logoLightUrl', e.target.value)}
                    className="h-12"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Light version for dark backgrounds
                  </p>
                </div>

                {/* Media Selector */}
                <div>
                  <MediaSelector
                    value={settings.logoLightUrl ? {
                      id: 0,
                      filename: 'Selected Logo',
                      fileType: 'image' as const,
                      mimeType: 'image/*',
                      fileSize: 0,
                      publicUrl: settings.logoLightUrl
                    } : null}
                    onChange={(media) => handleMediaSelect('logoLightUrl', media)}
                    acceptedTypes={['image/*']}
                    label="Or select from media library"
                    placeholder="Choose from uploaded images..."
                    className="mb-4"
                  />
                </div>

                {/* Light Logo Preview */}
                {settings.logoLightUrl && (
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">Preview on dark:</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeImage('logoLight')}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-center bg-gray-800 rounded p-4">
                      <img
                        src={settings.logoLightUrl}
                        alt="Light Logo Preview"
                        className="max-h-16 max-w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* File Upload Area */}
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'logoLight')}
                  onClick={() => logoLightFileRef.current?.click()}
                >
                  <input
                    ref={logoLightFileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, 'logoLight')}
                    className="hidden"
                  />
                  {uploadingLogoLight ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Uploading...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, SVG up to 2MB</p>
                    </>
                  )}
                </div>
              </div>
            </Card>

            {/* Dark Logo Settings */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Image className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Dark Logo</h3>
                  <p className="text-gray-600 text-sm">Logo for light backgrounds</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dark Logo URL
                  </label>
                  <Input
                    type="url"
                    placeholder="https://example.com/logo-dark.png"
                    value={settings.logoDarkUrl || ''}
                    onChange={(e) => handleInputChange('logoDarkUrl', e.target.value)}
                    className="h-12"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Dark version for light backgrounds
                  </p>
                </div>

                {/* Media Selector */}
                <div>
                  <MediaSelector
                    value={settings.logoDarkUrl ? {
                      id: 0,
                      filename: 'Selected Logo',
                      fileType: 'image' as const,
                      mimeType: 'image/*',
                      fileSize: 0,
                      publicUrl: settings.logoDarkUrl
                    } : null}
                    onChange={(media) => handleMediaSelect('logoDarkUrl', media)}
                    acceptedTypes={['image/*']}
                    label="Or select from media library"
                    placeholder="Choose from uploaded images..."
                    className="mb-4"
                  />
                </div>

                {/* Dark Logo Preview */}
                {settings.logoDarkUrl && (
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">Preview on light:</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeImage('logoDark')}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-center bg-white border rounded p-4">
                      <img
                        src={settings.logoDarkUrl}
                        alt="Dark Logo Preview"
                        className="max-h-16 max-w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* File Upload Area */}
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'logoDark')}
                  onClick={() => logoDarkFileRef.current?.click()}
                >
                  <input
                    ref={logoDarkFileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, 'logoDark')}
                    className="hidden"
                  />
                  {uploadingLogoDark ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Uploading...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, SVG up to 2MB</p>
                    </>
                  )}
                </div>
              </div>
            </Card>

          </div>

          {/* Favicon Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Light Favicon Settings */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Globe className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Light Favicon</h3>
                  <p className="text-gray-600 text-sm">Favicon for dark themes</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Light Favicon URL
                  </label>
                  <Input
                    type="url"
                    placeholder="https://example.com/favicon-light.ico"
                    value={settings.faviconLightUrl || ''}
                    onChange={(e) => handleInputChange('faviconLightUrl', e.target.value)}
                    className="h-12"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Light favicon for dark browser themes (16x16 or 32x32)
                  </p>
                </div>

                {/* Media Selector */}
                <div>
                  <MediaSelector
                    value={settings.faviconLightUrl ? {
                      id: 0,
                      filename: 'Selected Favicon',
                      fileType: 'image' as const,
                      mimeType: 'image/*',
                      fileSize: 0,
                      publicUrl: settings.faviconLightUrl
                    } : null}
                    onChange={(media) => handleMediaSelect('faviconLightUrl', media)}
                    acceptedTypes={['image/*']}
                    label="Or select from media library"
                    placeholder="Choose from uploaded images..."
                    className="mb-4"
                  />
                </div>

                {/* Light Favicon Preview */}
                {settings.faviconLightUrl && (
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">Preview on dark:</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeImage('faviconLight')}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-center bg-gray-800 rounded p-4">
                      <img
                        src={settings.faviconLightUrl}
                        alt="Light Favicon Preview"
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* File Upload Area */}
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'faviconLight')}
                  onClick={() => faviconLightFileRef.current?.click()}
                >
                  <input
                    ref={faviconLightFileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, 'faviconLight')}
                    className="hidden"
                  />
                  {uploadingFaviconLight ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Uploading...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">ICO, PNG up to 1MB</p>
                    </>
                  )}
                </div>
              </div>
            </Card>

            {/* Dark Favicon Settings */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Globe className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Dark Favicon</h3>
                  <p className="text-gray-600 text-sm">Favicon for light themes</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dark Favicon URL
                  </label>
                  <Input
                    type="url"
                    placeholder="https://example.com/favicon-dark.ico"
                    value={settings.faviconDarkUrl || ''}
                    onChange={(e) => handleInputChange('faviconDarkUrl', e.target.value)}
                    className="h-12"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Dark favicon for light browser themes (16x16 or 32x32)
                  </p>
                </div>

                {/* Media Selector */}
                <div>
                  <MediaSelector
                    value={settings.faviconDarkUrl ? {
                      id: 0,
                      filename: 'Selected Favicon',
                      fileType: 'image' as const,
                      mimeType: 'image/*',
                      fileSize: 0,
                      publicUrl: settings.faviconDarkUrl
                    } : null}
                    onChange={(media) => handleMediaSelect('faviconDarkUrl', media)}
                    acceptedTypes={['image/*']}
                    label="Or select from media library"
                    placeholder="Choose from uploaded images..."
                    className="mb-4"
                  />
                </div>

                {/* Dark Favicon Preview */}
                {settings.faviconDarkUrl && (
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">Preview on light:</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeImage('faviconDark')}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-center bg-white border rounded p-4">
                      <img
                        src={settings.faviconDarkUrl}
                        alt="Dark Favicon Preview"
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* File Upload Area */}
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'faviconDark')}
                  onClick={() => faviconDarkFileRef.current?.click()}
                >
                  <input
                    ref={faviconDarkFileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, 'faviconDark')}
                    className="hidden"
                  />
                  {uploadingFaviconDark ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
                      <span className="ml-2 text-gray-600">Uploading...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">ICO, PNG up to 1MB</p>
                    </>
                  )}
                </div>
              </div>
            </Card>

            {/* Legacy Favicon Settings */}
            <Card className="p-6 lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Globe className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Legacy Favicon</h3>
                  <p className="text-gray-600 text-sm">Fallback favicon for older browsers</p>
                </div>
              </div>

              <div className="max-w-md space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Legacy Favicon URL
                  </label>
                  <Input
                    type="url"
                    placeholder="https://example.com/favicon.ico"
                    value={settings.faviconUrl || ''}
                    onChange={(e) => handleInputChange('faviconUrl', e.target.value)}
                    className="h-12"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Used when light/dark favicons are not supported (16x16 or 32x32)
                  </p>
                </div>

                {/* Media Selector */}
                <div>
                  <MediaSelector
                    value={settings.faviconUrl ? {
                      id: 0,
                      filename: 'Selected Favicon',
                      fileType: 'image' as const,
                      mimeType: 'image/*',
                      fileSize: 0,
                      publicUrl: settings.faviconUrl
                    } : null}
                    onChange={(media) => handleMediaSelect('faviconUrl', media)}
                    acceptedTypes={['image/*']}
                    label="Or select from media library"
                    placeholder="Choose from uploaded images..."
                    className="mb-4"
                  />
                </div>

                {/* Legacy Favicon Preview */}
                {settings.faviconUrl && (
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">Preview:</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeImage('favicon')}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-center bg-gray-50 rounded p-4">
                      <img
                        src={settings.faviconUrl}
                        alt="Legacy Favicon Preview"
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* File Upload Area */}
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'favicon')}
                  onClick={() => faviconFileRef.current?.click()}
                >
                  <input
                    ref={faviconFileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, 'favicon')}
                    className="hidden"
                  />
                  {uploadingFavicon ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      <span className="ml-2 text-gray-600">Uploading...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">ICO, PNG up to 1MB</p>
                    </>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Contact Information Tab */}
      {activeTab === 'contact' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Company Information */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Globe className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Company Information</h3>
                  <p className="text-gray-600 text-sm">Basic company contact details</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Phone
                  </label>
                  <Input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={settings.companyPhone || ''}
                    onChange={(e) => handleEmailSettingChange('companyPhone', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Email
                  </label>
                  <Input
                    type="email"
                    placeholder="contact@company.com"
                    value={settings.companyEmail || ''}
                    onChange={(e) => handleEmailSettingChange('companyEmail', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Address
                  </label>
                  <textarea
                    rows={3}
                    placeholder="123 Business St, City, State 12345"
                    value={settings.companyAddress || ''}
                    onChange={(e) => handleEmailSettingChange('companyAddress', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </Card>

            {/* Social Media Links */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Facebook className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Social Media</h3>
                  <p className="text-gray-600 text-sm">Social media profile links</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Facebook className="w-4 h-4 inline mr-2" />
                    Facebook
                  </label>
                  <Input
                    type="url"
                    placeholder="https://facebook.com/yourcompany"
                    value={settings.socialFacebook || ''}
                    onChange={(e) => handleEmailSettingChange('socialFacebook', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Twitter className="w-4 h-4 inline mr-2" />
                    Twitter
                  </label>
                  <Input
                    type="url"
                    placeholder="https://twitter.com/yourcompany"
                    value={settings.socialTwitter || ''}
                    onChange={(e) => handleEmailSettingChange('socialTwitter', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Linkedin className="w-4 h-4 inline mr-2" />
                    LinkedIn
                  </label>
                  <Input
                    type="url"
                    placeholder="https://linkedin.com/company/yourcompany"
                    value={settings.socialLinkedin || ''}
                    onChange={(e) => handleEmailSettingChange('socialLinkedin', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Instagram className="w-4 h-4 inline mr-2" />
                    Instagram
                  </label>
                  <Input
                    type="url"
                    placeholder="https://instagram.com/yourcompany"
                    value={settings.socialInstagram || ''}
                    onChange={(e) => handleEmailSettingChange('socialInstagram', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Youtube className="w-4 h-4 inline mr-2" />
                    YouTube
                  </label>
                  <Input
                    type="url"
                    placeholder="https://youtube.com/yourcompany"
                    value={settings.socialYoutube || ''}
                    onChange={(e) => handleEmailSettingChange('socialYoutube', e.target.value)}
                  />
                </div>
              </div>
            </Card>
          </div>
          

        </div>
      )}



      {/* Email Settings Tab */}
      {activeTab === 'email' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* SMTP Configuration */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">SMTP Configuration</h3>
                  <p className="text-gray-600 text-sm">Configure email sending settings</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="smtpEnabled"
                    checked={settings.smtpEnabled || false}
                    onChange={(e) => handleEmailSettingChange('smtpEnabled', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="smtpEnabled" className="text-sm font-medium text-gray-700">
                    Enable SMTP Email Sending
                  </label>
                </div>

                {settings.smtpEnabled && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Host
                      </label>
                      <Input
                        type="text"
                        placeholder="smtp.gmail.com"
                        value={settings.smtpHost || ''}
                        onChange={(e) => handleEmailSettingChange('smtpHost', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Port
                      </label>
                      <Input
                        type="number"
                        placeholder="587"
                        value={settings.smtpPort || ''}
                        onChange={(e) => handleEmailSettingChange('smtpPort', parseInt(e.target.value) || null)}
                      />
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="smtpSecure"
                        checked={settings.smtpSecure || false}
                        onChange={(e) => handleEmailSettingChange('smtpSecure', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="smtpSecure" className="text-sm font-medium text-gray-700">
                        Use SSL/TLS
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Username
                      </label>
                      <Input
                        type="text"
                        placeholder="your-email@gmail.com"
                        value={settings.smtpUsername || ''}
                        onChange={(e) => handleEmailSettingChange('smtpUsername', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Password
                      </label>
                      <Input
                        type="password"
                        placeholder="your-app-password"
                        value={settings.smtpPassword || ''}
                        onChange={(e) => handleEmailSettingChange('smtpPassword', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Email
                      </label>
                      <Input
                        type="email"
                        placeholder="noreply@yourcompany.com"
                        value={settings.smtpFromEmail || ''}
                        onChange={(e) => handleEmailSettingChange('smtpFromEmail', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Name
                      </label>
                      <Input
                        type="text"
                        placeholder="Your Company"
                        value={settings.smtpFromName || ''}
                        onChange={(e) => handleEmailSettingChange('smtpFromName', e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Test Email */}
            <Card className="p-6 bg-green-50 border-green-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Send className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-green-900">Test Email</h3>
                  <p className="text-green-700 text-sm">Send a test email to verify settings</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">
                    Test Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="test@example.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="border-green-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <Button
                  onClick={handleTestEmail}
                  disabled={testingEmail || !settings.smtpEnabled || !testEmail}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {testingEmail ? 'Sending...' : 'Send Test Email'}
                </Button>

                {!settings.smtpEnabled && (
                  <p className="text-sm text-green-600">
                    Please enable SMTP and configure your settings before testing.
                  </p>
                )}

                {/* Test Results */}
                {emailTestResult && (
                  <div className={`mt-4 p-4 rounded-lg ${
                    emailTestResult.success 
                      ? 'bg-green-100 border border-green-200' 
                      : 'bg-red-100 border border-red-200'
                  }`}>
                    <h4 className={`text-sm font-semibold mb-2 ${
                      emailTestResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {emailTestResult.success ? '✅ Email Test Successful!' : '❌ Email Test Failed'}
                    </h4>
                    <p className={`text-sm ${
                      emailTestResult.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {emailTestResult.success 
                        ? 'Your email configuration is working correctly!'
                        : emailTestResult.error || 'Unknown error occurred'
                      }
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
} 
