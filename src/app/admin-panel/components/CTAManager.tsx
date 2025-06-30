'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import UniversalIconPicker from '@/components/ui/UniversalIconPicker';
import { renderIcon } from '@/lib/iconUtils';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Copy,
  ExternalLink,
  Target,
  MousePointer,
  Smartphone,
  Monitor,
  Tablet,
  Eye,
  EyeOff
} from 'lucide-react';

interface CTA {
  id: number;
  text: string;
  url: string;
  icon?: string;
  style: 'primary' | 'secondary' | 'accent' | 'ghost' | 'destructive' | 'success' | 'info' | 'outline' | 'muted';
  target: '_self' | '_blank';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface HeaderCTA {
  id: number;
  headerConfigId: number;
  ctaId: number;
  sortOrder: number;
  isVisible: boolean;
  cta: CTA;
}

interface CTAFormData {
    text: string;
    url: string;
    icon: string;
    style: 'primary' | 'secondary' | 'accent' | 'ghost' | 'destructive' | 'success' | 'info' | 'outline' | 'muted';
    target: '_self' | '_blank';
    isActive: boolean;
}

export default function CTAManager() {
  const [ctas, setCtas] = useState<CTA[]>([]);
  const [headerCtas, setHeaderCtas] = useState<HeaderCTA[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CTAFormData>({
    text: '',
    url: '',
    icon: '',
    style: 'primary',
    target: '_self',
    isActive: true
  });

  const fetchCtas = async () => {
    try {
      const response = await fetch('/api/admin/cta-buttons');
      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setCtas(result.data);
        } else {
          console.error('Invalid CTA data structure:', result);
          setCtas([]);
        }
      } else {
        console.error('Failed to fetch CTAs:', response.status);
        setCtas([]);
      }
    } catch (error) {
      console.error('Error fetching CTAs:', error);
      setCtas([]);
    }
  };

  const fetchHeaderConfig = async () => {
    try {
      const response = await fetch('/api/admin/header-config');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setHeaderCtas(data[0].headerCTAs || []);
        } else {
          setHeaderCtas([]);
        }
      } else {
        console.error('Failed to fetch header config:', response.status);
        setHeaderCtas([]);
      }
    } catch (error) {
      console.error('Error fetching header config:', error);
      setHeaderCtas([]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchCtas(), fetchHeaderConfig()]);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = '/api/admin/cta-buttons';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId 
        ? { ...formData, id: editingId }
        : formData;

      // Debug info only in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Submitting CTA:', { method, body });
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const result = await response.json();
      
      // Debug info only in development
      if (process.env.NODE_ENV === 'development') {
        console.log('API Response:', result);
      }

      if (response.ok) {
        // Debug info only in development
        if (process.env.NODE_ENV === 'development') {
          console.log('CTA saved successfully');
        }
        await fetchCtas();
        await fetchHeaderConfig();
        resetForm();
      } else {
        console.error('Failed to save CTA:', result);
        alert(`Failed to save CTA: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving CTA:', error);
      alert('Network error occurred while saving CTA');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this CTA button?')) return;

    try {
      const response = await fetch('/api/admin/cta-buttons', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (response.ok) {
        await fetchCtas();
        await fetchHeaderConfig();
      }
    } catch (error) {
      console.error('Error deleting CTA:', error);
    }
  };

  const toggleHeaderVisibility = async (headerCtaId: number, currentVisibility: boolean) => {
    try {
      const response = await fetch('/api/admin/header-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headerCTAs: headerCtas.map(hcta => 
            hcta.id === headerCtaId 
              ? { ...hcta, isVisible: !currentVisibility }
              : hcta
          )
        })
      });

      if (response.ok) {
        await fetchHeaderConfig();
      }
    } catch (error) {
      console.error('Error toggling header visibility:', error);
    }
  };

  const addToHeader = async (ctaId: number) => {
    try {
      const newHeaderCta = {
        headerConfigId: 1, // Assuming first header config
        ctaId: ctaId,
        sortOrder: headerCtas.length + 1,
        isVisible: true
      };

      const response = await fetch('/api/admin/header-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headerCTAs: [...headerCtas, newHeaderCta]
        })
      });

      if (response.ok) {
        await fetchHeaderConfig();
      }
    } catch (error) {
      console.error('Error adding CTA to header:', error);
    }
  };

  const removeFromHeader = async (headerCtaId: number) => {
    try {
      const response = await fetch('/api/admin/header-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headerCTAs: headerCtas.filter(hcta => hcta.id !== headerCtaId)
        })
      });

      if (response.ok) {
        await fetchHeaderConfig();
      }
    } catch (error) {
      console.error('Error removing CTA from header:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      text: '',
      url: '',
      icon: '',
      style: 'primary',
      target: '_self',
      isActive: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (cta: CTA) => {
    setFormData({
      text: cta.text,
      url: cta.url,
      icon: cta.icon || '',
      style: cta.style,
      target: cta.target,
      isActive: cta.isActive
    });
    setEditingId(cta.id);
    setShowForm(true);
  };

  const getStyleColor = (style: string) => {
    const colors: { [key: string]: string } = {
      primary: 'bg-blue-100 text-blue-800',
      secondary: 'bg-gray-100 text-gray-800',
      accent: 'bg-purple-100 text-purple-800',
      ghost: 'bg-gray-100 text-gray-600',
      destructive: 'bg-red-100 text-red-800',
      success: 'bg-green-100 text-green-800',
      info: 'bg-blue-100 text-blue-800',
      outline: 'bg-white text-gray-800 border border-gray-300',
      muted: 'bg-gray-100 text-gray-500'
    };
    return colors[style] || colors.primary;
  };

  const isCtaInHeader = (ctaId: number) => {
    return headerCtas.some(headerCta => headerCta.ctaId === ctaId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">CTA Button Manager</h2>
          <p className="text-gray-600 mt-2">Manage call-to-action buttons for your website header</p>
        </div>
        <Button
          onClick={() => {
            setEditingId(null);
            setFormData({
              text: '',
              url: '',
              icon: '',
              style: 'primary',
              target: '_self',
              isActive: true
            });
            setShowForm(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create CTA Button
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card className="p-6 border-2 border-blue-200 bg-blue-50/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {editingId ? 'Edit CTA Button' : 'Create New CTA Button'}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button Text *
                </label>
                <Input
                  type="text"
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="e.g., Get Started, Sign Up, Learn More"
                  required
                  className="h-12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL *
                </label>
                <Input
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com, /page, or #section"
                  required
                  className="h-12"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter a full URL, relative path, or anchor link (e.g., #pricing, #contact)
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Button Style
                </label>
                
                {/* Style Preview Grid */}
                <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-600 mb-3">Click a style to select it:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { value: 'primary', label: 'Primary', description: 'Main action' },
                      { value: 'secondary', label: 'Secondary', description: 'Supporting action' },
                      { value: 'accent', label: 'Accent', description: 'Special offers' },
                      { value: 'ghost', label: 'Ghost', description: 'Minimal action' },
                      { value: 'destructive', label: 'Destructive', description: 'Delete/Remove' },
                      { value: 'success', label: 'Success', description: 'Save/Confirm' },
                      { value: 'info', label: 'Info', description: 'Help/More info' },
                      { value: 'outline', label: 'Outline', description: 'Styled secondary' },
                      { value: 'muted', label: 'Muted', description: 'Disabled/Inactive' }
                    ].map((styleOption) => (
                      <div
                        key={styleOption.value}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          formData.style === styleOption.value
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                        }`}
                        onClick={() => setFormData({ ...formData, style: styleOption.value as any })}
                      >
                        <div className="text-center space-y-2">
                          <Button
                            variant={styleOption.value as any}
                            size="sm"
                            className="w-full pointer-events-none"
                            disabled={styleOption.value === 'muted'}
                          >
                            {formData.text || 'Sample Text'}
                          </Button>
                          <div>
                            <p className="text-xs font-semibold text-gray-900">{styleOption.label}</p>
                            <p className="text-xs text-gray-600">{styleOption.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fallback select for accessibility */}
                <select
                  value={formData.style}
                  onChange={(e) => {
                    const value = e.target.value as 'primary' | 'secondary' | 'accent' | 'ghost' | 'destructive' | 'success' | 'info' | 'outline' | 'muted';
                    setFormData({ ...formData, style: value });
                  }}
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent sr-only"
                  aria-label="Button style selector"
                >
                  <option value="primary">Primary - Main Action (Brand)</option>
                  <option value="secondary">Secondary - Supporting Action</option>
                  <option value="accent">Accent - Limited Offers/Highlights</option>
                  <option value="ghost">Ghost - Minimal Action</option>
                  <option value="destructive">Destructive - Delete/Remove</option>
                  <option value="success">Success - Confirmations/Save</option>
                  <option value="info">Info - Help/More Info</option>
                  <option value="outline">Outline - Styled Secondary</option>
                  <option value="muted">Muted - Disabled/Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link Target
                </label>
                <select
                  value={formData.target}
                  onChange={(e) => {
                    const value = e.target.value as '_self' | '_blank';
                    setFormData({ ...formData, target: value });
                  }}
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="_self">Same Tab</option>
                  <option value="_blank">New Tab</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon
                </label>
                <UniversalIconPicker
                  value={formData.icon}
                  onChange={(iconName) => setFormData({ ...formData, icon: iconName })}
                  placeholder="Select an icon"
                  className="w-full"
                />
              </div>
            </div>

            {/* Live Preview Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Live Preview</h4>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                  {/* Light background preview */}
                  <div className="flex-1 p-4 bg-white rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 mb-2 text-center">On Light Background</p>
                    <div className="flex justify-center">
                      <Button
                        variant={formData.style as any}
                        size="md"
                        className="pointer-events-none"
                        disabled={formData.style === 'muted'}
                        leftIcon={formData.icon ? renderIcon(formData.icon, { className: 'w-4 h-4' }) : undefined}
                      >
                        {formData.text || 'Button Text'}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Dark background preview */}
                  <div className="flex-1 p-4 bg-gray-900 rounded-lg border border-gray-700">
                    <p className="text-xs text-gray-400 mb-2 text-center">On Dark Background</p>
                    <div className="flex justify-center">
                      <Button
                        variant={formData.style as any}
                        size="md"
                        className="pointer-events-none"
                        disabled={formData.style === 'muted'}
                        leftIcon={formData.icon ? renderIcon(formData.icon, { className: 'w-4 h-4' }) : undefined}
                      >
                        {formData.text || 'Button Text'}
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Preview details */}
                <div className="text-center space-y-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Text:</span> {formData.text || 'Button Text'} |{' '}
                    <span className="font-medium">Style:</span> {formData.style} |{' '}
                    <span className="font-medium">Target:</span> {formData.target === '_blank' ? 'New Tab' : 'Same Tab'}
                  </p>
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">URL:</span> {formData.url || 'No URL set'} |{' '}
                    <span className="font-medium">Icon:</span> {formData.icon || 'None'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active (Available for use)
              </label>
            </div>

            <div className="flex space-x-4">
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingId ? 'Update CTA' : 'Create CTA'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Header CTAs Section */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <ExternalLink className="w-5 h-5 mr-2 text-blue-600" />
          CTAs Currently in Header
        </h3>
        
        {!Array.isArray(headerCtas) || headerCtas.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No CTA buttons in header yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {headerCtas.map((headerCta) => (
              <div
                key={headerCta.id}
                className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge className={getStyleColor(headerCta.cta.style)}>
                    {headerCta.cta.style}
                  </Badge>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleHeaderVisibility(headerCta.id, headerCta.isVisible)}
                      className="p-1"
                    >
                      {headerCta.isVisible ? (
                        <Eye className="w-4 h-4 text-green-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFromHeader(headerCta.id)}
                      className="p-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  {headerCta.cta.icon && renderIcon(headerCta.cta.icon, { className: 'w-4 h-4 text-blue-600' })}
                  <h4 className="font-semibold text-gray-900">{headerCta.cta.text}</h4>
                </div>
                <p className="text-sm text-gray-600 truncate">{headerCta.cta.url}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Order: {headerCta.sortOrder} | {headerCta.isVisible ? 'Visible' : 'Hidden'}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* All CTAs Section */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">All CTA Buttons</h3>
        
        {!Array.isArray(ctas) || ctas.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No CTA buttons created yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ctas.map((cta) => (
              <div
                key={cta.id}
                className={`border-2 rounded-xl p-6 transition-all duration-200 ${
                  cta.isActive
                    ? 'border-gray-200 bg-white hover:shadow-lg'
                    : 'border-gray-100 bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Badge className={getStyleColor(cta.style)}>
                    {cta.style}
                  </Badge>
                  <div className="flex space-x-1">
                    {!isCtaInHeader(cta.id) && cta.isActive && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => addToHeader(cta.id)}
                        className="p-1 text-blue-600 hover:text-blue-700"
                        title="Add to Header"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEdit(cta)}
                      className="p-1 text-gray-600 hover:text-gray-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(cta.id)}
                      className="p-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  {cta.icon && renderIcon(cta.icon, { className: 'w-4 h-4 text-gray-600' })}
                  <h4 className="font-semibold text-gray-900">{cta.text}</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3 break-all">{cta.url}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Target: {cta.target}</span>
                  <span className={cta.isActive ? 'text-green-600' : 'text-red-600'}>
                    {cta.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                {isCtaInHeader(cta.id) && (
                  <div className="mt-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full text-center">
                    In Header
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
} 
