'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Upload, Image, Globe, Save, RotateCcw, X } from 'lucide-react';

interface SiteSettings {
  id?: number;
  logoUrl: string | null;
  faviconUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export default function SiteSettingsManager() {
  const [settings, setSettings] = useState<SiteSettings>({
    logoUrl: null,
    faviconUrl: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  
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
      
      if (result.success) {
        setSettings(result.data);
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
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const result = await response.json();

      if (result.success) {
        setSettings(result.data);
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to save settings' });
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
          <p className="text-gray-600 mt-2">Manage your website's logo and favicon</p>
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
  );
} 
