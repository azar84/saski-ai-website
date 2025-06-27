'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Upload, Image, Globe, Save, RotateCcw, X, Mail, Settings, Send, Shield, User, Server } from 'lucide-react';

interface SiteSettings {
  id?: number;
  logoUrl: string | null;
  faviconUrl: string | null;
  
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
  
  createdAt?: string;
  updatedAt?: string;
}

export default function SiteSettingsManager() {
  const [settings, setSettings] = useState<SiteSettings>({
    logoUrl: null,
    faviconUrl: null,
    smtpEnabled: false,
    smtpPort: 587,
    smtpSecure: true,
    emailBrandingEnabled: true,
    emailLoggingEnabled: true,
    emailRateLimitPerHour: 100,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'email'>('general');
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [emailTestResult, setEmailTestResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
    suggestion?: string;
    details?: any;
  } | null>(null);
  
  const logoFileRef = useRef<HTMLInputElement>(null);
  const faviconFileRef = useRef<HTMLInputElement>(null);

  // Fetch current settings
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/site-settings');
      const result = await response.json();
      
      if (response.ok) {
        setSettings(result);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to load settings' });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: 'logoUrl' | 'faviconUrl', value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value || null
    }));
  };

  const handleFileUpload = async (file: File, type: 'logo' | 'favicon') => {
    if (type === 'logo') {
      setUploadingLogo(true);
    } else {
      setUploadingFavicon(true);
    }

    try {
      // Create a simple file URL for demo purposes
      // In a real app, you'd upload to a cloud service like AWS S3, Cloudinary, etc.
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        
        // For demo, we'll use the data URL directly
        // In production, you'd upload the file and get back a URL
        const field = type === 'logo' ? 'logoUrl' : 'faviconUrl';
        
        setSettings(prev => ({
          ...prev,
          [field]: dataUrl
        }));

        setMessage({ 
          type: 'success', 
          text: `${type === 'logo' ? 'Logo' : 'Favicon'} uploaded successfully! Don't forget to save.` 
        });
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload failed:', error);
      setMessage({ type: 'error', text: 'Upload failed. Please try again.' });
    } finally {
      if (type === 'logo') {
        setUploadingLogo(false);
      } else {
        setUploadingFavicon(false);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, type: 'logo' | 'favicon') => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file, type);
    } else {
      setMessage({ type: 'error', text: 'Please upload a valid image file.' });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, type);
    }
  };

  const removeImage = (type: 'logo' | 'favicon') => {
    const field = type === 'logo' ? 'logoUrl' : 'faviconUrl';
    setSettings(prev => ({
      ...prev,
      [field]: null
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const result = await response.json();

      if (response.ok) {
        setSettings(result);
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save settings' });
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchSettings();
    setMessage(null);
  };

  const handleEmailSettingChange = (field: keyof SiteSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      setMessage({ type: 'error', text: 'Please enter a test email address' });
      return;
    }

    setTestingEmail(true);
    setMessage(null);
    setEmailTestResult(null);

    try {
      const response = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testEmail }),
      });

      const result = await response.json();

      if (response.ok) {
        setEmailTestResult({
          success: true,
          message: result.message
        });
        setMessage({ type: 'success', text: result.message });
      } else {
        setEmailTestResult({
          success: false,
          error: result.error,
          suggestion: result.suggestion,
          details: result.details
        });
        setMessage({ type: 'error', text: result.error || 'Failed to send test email' });
      }
    } catch (error) {
      console.error('Failed to test email:', error);
      setEmailTestResult({
        success: false,
        error: 'Failed to test email configuration'
      });
      setMessage({ type: 'error', text: 'Failed to test email configuration' });
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
        {/* Logo Settings */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Image className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Website Logo</h3>
              <p className="text-gray-600 text-sm">Upload or set URL for your website logo</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo URL
              </label>
              <Input
                type="url"
                placeholder="https://example.com/logo.png"
                value={settings.logoUrl || ''}
                onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                className="h-12"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter a direct URL to your logo image (PNG, JPG, SVG)
              </p>
            </div>

            {/* Logo Preview */}
            {settings.logoUrl && (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">Preview:</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeImage('logo')}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-center bg-gray-50 rounded p-4">
                  <img
                    src={settings.logoUrl}
                    alt="Logo Preview"
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
              onDrop={(e) => handleDrop(e, 'logo')}
              onClick={() => logoFileRef.current?.click()}
            >
              <input
                ref={logoFileRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e, 'logo')}
                className="hidden"
              />
              {uploadingLogo ? (
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

        {/* Favicon Settings */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Globe className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Favicon</h3>
              <p className="text-gray-600 text-sm">Set the small icon that appears in browser tabs</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Favicon URL
              </label>
              <Input
                type="url"
                placeholder="https://example.com/favicon.ico"
                value={settings.faviconUrl || ''}
                onChange={(e) => handleInputChange('faviconUrl', e.target.value)}
                className="h-12"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter a direct URL to your favicon (.ico, .png 16x16 or 32x32)
              </p>
            </div>

            {/* Favicon Preview */}
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
                    alt="Favicon Preview"
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
                  <p className="text-xs text-gray-500">ICO, PNG 16x16 or 32x32</p>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>

          {/* Usage Instructions */}
          <Card className="p-6 bg-blue-50 border-blue-200">
            <h4 className="text-lg font-semibold text-blue-900 mb-3">Usage Instructions</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <p>• <strong>Logo:</strong> Will be displayed in the website header and other prominent locations</p>
              <p>• <strong>Favicon:</strong> Small icon that appears in browser tabs and bookmarks</p>
              <p>• <strong>Upload:</strong> Click the upload area or drag and drop files directly</p>
              <p>• <strong>Recommended sizes:</strong> Logo: 200x60px or similar aspect ratio, Favicon: 32x32px</p>
              <p>• <strong>Formats:</strong> PNG with transparency recommended for logo, ICO or PNG for favicon</p>
              <p>• <strong>Note:</strong> Uploaded files are stored as data URLs for demo purposes. In production, use a proper file storage service.</p>
            </div>
          </Card>
        </div>
      )}

      {/* Email Settings Tab */}
      {activeTab === 'email' && (
        <div className="space-y-8">
          {/* SMTP Configuration */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <Server className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">SMTP Configuration</h3>
                <p className="text-gray-600 text-sm">Configure your email server settings</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Enable SMTP */}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username/Email
                    </label>
                    <Input
                      type="email"
                      placeholder="your-email@gmail.com"
                      value={settings.smtpUsername || ''}
                      onChange={(e) => handleEmailSettingChange('smtpUsername', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={settings.smtpPassword || ''}
                      onChange={(e) => handleEmailSettingChange('smtpPassword', e.target.value)}
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
                      Use TLS/SSL Encryption
                    </label>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Email Sender Configuration */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Email Sender Configuration</h3>
                <p className="text-gray-600 text-sm">Configure how emails appear to recipients</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Email Address
                </label>
                <Input
                  type="email"
                  placeholder="noreply@yoursite.com"
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
                  placeholder="Your Company Name"
                  value={settings.smtpFromName || ''}
                  onChange={(e) => handleEmailSettingChange('smtpFromName', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reply-To Email
                </label>
                <Input
                  type="email"
                  placeholder="support@yoursite.com"
                  value={settings.smtpReplyTo || ''}
                  onChange={(e) => handleEmailSettingChange('smtpReplyTo', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notification Email
                </label>
                <Input
                  type="email"
                  placeholder="admin@yoursite.com"
                  value={settings.adminNotificationEmail || ''}
                  onChange={(e) => handleEmailSettingChange('adminNotificationEmail', e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Email Templates */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Email Templates</h3>
                <p className="text-gray-600 text-sm">Customize email appearance and content</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Signature
                </label>
                <textarea
                  rows={3}
                  placeholder="Best regards,&#10;Your Company Team"
                  value={settings.emailSignature || ''}
                  onChange={(e) => handleEmailSettingChange('emailSignature', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Footer Text
                </label>
                <textarea
                  rows={2}
                  placeholder="© 2024 Your Company. All rights reserved."
                  value={settings.emailFooterText || ''}
                  onChange={(e) => handleEmailSettingChange('emailFooterText', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="emailBrandingEnabled"
                  checked={settings.emailBrandingEnabled || false}
                  onChange={(e) => handleEmailSettingChange('emailBrandingEnabled', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="emailBrandingEnabled" className="text-sm font-medium text-gray-700">
                  Include signature and footer in all emails
                </label>
              </div>
            </div>
          </Card>

          {/* Email Settings */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Shield className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Email Settings</h3>
                <p className="text-gray-600 text-sm">Configure email logging and rate limiting</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="emailLoggingEnabled"
                  checked={settings.emailLoggingEnabled || false}
                  onChange={(e) => handleEmailSettingChange('emailLoggingEnabled', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="emailLoggingEnabled" className="text-sm font-medium text-gray-700">
                  Enable email sending logs
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Rate Limit (per hour)
                </label>
                <Input
                  type="number"
                  placeholder="100"
                  value={settings.emailRateLimitPerHour || ''}
                  onChange={(e) => handleEmailSettingChange('emailRateLimitPerHour', parseInt(e.target.value) || null)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum number of emails that can be sent per hour
                </p>
              </div>
            </div>
          </Card>

          {/* Test Email */}
          <Card className="p-6 bg-green-50 border-green-200">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <Send className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-green-900">Test Email Configuration</h3>
                <p className="text-green-700 text-sm">Send a test email to verify your settings</p>
              </div>
            </div>

            <div className="flex items-end space-x-4">
              <div className="flex-1">
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
                disabled={testingEmail || !settings.smtpEnabled}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {testingEmail ? 'Sending...' : 'Send Test Email'}
              </Button>
            </div>

            {!settings.smtpEnabled && (
              <p className="text-sm text-green-600 mt-2">
                Please enable SMTP and configure your settings before testing.
              </p>
            )}

            {/* Detailed Error Information */}
            {emailTestResult && !emailTestResult.success && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="text-sm font-semibold text-red-800 mb-2">❌ Email Test Failed</h4>
                <p className="text-sm text-red-700 mb-3">{emailTestResult.error}</p>
                
                {emailTestResult.suggestion && (
                  <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded">
                    <h5 className="text-sm font-semibold text-red-800 mb-1">💡 Suggestion:</h5>
                    <p className="text-xs text-red-700">{emailTestResult.suggestion}</p>
                  </div>
                )}

                {emailTestResult.details && (
                  <details className="mt-3">
                    <summary className="text-xs text-red-600 cursor-pointer hover:text-red-800">
                      Show Technical Details
                    </summary>
                    <pre className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded overflow-auto">
                      {JSON.stringify(emailTestResult.details, null, 2)}
                    </pre>
                  </details>
                )}

                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <h5 className="text-sm font-semibold text-yellow-800 mb-2">Common Solutions:</h5>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    <li>• <strong>Gmail:</strong> Use your Gmail address as "From Email" and create an App Password</li>
                    <li>• <strong>Domain Issues:</strong> Use your actual email address, not a custom domain</li>
                    <li>• <strong>SendGrid/Mailgun:</strong> Verify your domain in their dashboard first</li>
                    <li>• <strong>Port Issues:</strong> Try 587 (TLS), 465 (SSL), or 25 (no encryption)</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Success Information */}
            {emailTestResult && emailTestResult.success && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="text-sm font-semibold text-green-800 mb-2">✅ Email Test Successful!</h4>
                <p className="text-sm text-green-700 mb-3">
                  Your email configuration is working correctly. Form submissions will now automatically send email notifications.
                </p>
                
                {(emailTestResult as any).deliverabilityTips && (
                  <div className="mt-3 p-3 bg-green-100 border border-green-200 rounded">
                    <h5 className="text-sm font-semibold text-green-800 mb-2">📊 Deliverability Report:</h5>
                    <ul className="text-xs text-green-700 space-y-1">
                      {((emailTestResult as any).deliverabilityTips as string[]).map((tip: string, index: number) => (
                        <li key={index}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {(emailTestResult as any).domainCheck?.suggestions && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                    <h5 className="text-sm font-semibold text-blue-800 mb-2">🔍 Domain Analysis:</h5>
                    <ul className="text-xs text-blue-700 space-y-1">
                      {((emailTestResult as any).domainCheck.suggestions as string[]).map((suggestion: string, index: number) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
} 
