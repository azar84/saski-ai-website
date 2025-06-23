'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  Plus, Edit2, Trash2, Save, X, ExternalLink, Eye, EyeOff,
  ArrowRight, Play, CheckCircle, Sparkles, MessageSquare, Zap, Mail, Star, Users, Globe, Shield, TrendingUp, 
  Layers, Award, Clock, Send, User, Code, Timer, CheckCircle2, Heart, Download, Phone, Video, Calendar, BookOpen, Gift, Rocket
} from 'lucide-react';

interface CTA {
  id: number;
  text: string;
  url: string;
  icon?: string;
  style: 'primary' | 'secondary' | 'outline' | 'ghost';
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

export default function CTAManager() {
  const [ctas, setCtas] = useState<CTA[]>([]);
  const [headerCtas, setHeaderCtas] = useState<HeaderCTA[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCta, setEditingCta] = useState<CTA | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    text: '',
    url: '',
    icon: '',
    style: 'primary' as const,
    target: '_self' as const,
    isActive: true
  });

  const availableIcons = [
    { name: '', label: 'No Icon', component: null },
    { name: 'ArrowRight', label: 'Arrow Right', component: ArrowRight },
    { name: 'Play', label: 'Play', component: Play },
    { name: 'ExternalLink', label: 'External Link', component: ExternalLink },
    { name: 'Download', label: 'Download', component: Download },
    { name: 'Mail', label: 'Mail', component: Mail },
    { name: 'Phone', label: 'Phone', component: Phone },
    { name: 'MessageSquare', label: 'Message', component: MessageSquare },
    { name: 'Video', label: 'Video', component: Video },
    { name: 'Calendar', label: 'Calendar', component: Calendar },
    { name: 'BookOpen', label: 'Book', component: BookOpen },
    { name: 'Gift', label: 'Gift', component: Gift },
    { name: 'Rocket', label: 'Rocket', component: Rocket },
    { name: 'Shield', label: 'Shield', component: Shield },
    { name: 'Award', label: 'Award', component: Award },
    { name: 'Star', label: 'Star', component: Star },
    { name: 'Clock', label: 'Clock', component: Clock },
    { name: 'Code', label: 'Code', component: Code },
    { name: 'Zap', label: 'Zap', component: Zap },
    { name: 'Sparkles', label: 'Sparkles', component: Sparkles },
    { name: 'TrendingUp', label: 'Trending Up', component: TrendingUp },
    { name: 'Users', label: 'Users', component: Users },
    { name: 'Heart', label: 'Heart', component: Heart },
    { name: 'Globe', label: 'Globe', component: Globe },
    { name: 'Send', label: 'Send', component: Send },
    { name: 'User', label: 'User', component: User },
    { name: 'CheckCircle', label: 'Check Circle', component: CheckCircle },
    { name: 'CheckCircle2', label: 'Check Circle 2', component: CheckCircle2 }
  ];

  const getIconComponent = (iconName: string) => {
    const iconData = availableIcons.find(icon => icon.name === iconName);
    return iconData?.component || null;
  };

  const fetchCtas = async () => {
    try {
      const response = await fetch('/api/admin/cta-buttons');
      if (response.ok) {
        const data = await response.json();
        setCtas(data);
      }
    } catch (error) {
      console.error('Error fetching CTAs:', error);
    }
  };

  const fetchHeaderConfig = async () => {
    try {
      const response = await fetch('/api/admin/header-config');
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setHeaderCtas(data[0].headerCtas || []);
        }
      }
    } catch (error) {
      console.error('Error fetching header config:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchCtas(), fetchHeaderConfig()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = '/api/admin/cta-buttons';
      const method = editingCta ? 'PUT' : 'POST';
      const body = editingCta 
        ? { ...formData, id: editingCta.id }
        : formData;

      console.log('Submitting CTA:', { method, body });

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const result = await response.json();
      console.log('API Response:', result);

      if (response.ok) {
        console.log('CTA saved successfully');
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
          action: 'toggleCtaVisibility',
          headerCtaId,
          isVisible: !currentVisibility
        })
      });

      if (response.ok) {
        await fetchHeaderConfig();
      }
    } catch (error) {
      console.error('Error toggling CTA visibility:', error);
    }
  };

  const addToHeader = async (ctaId: number) => {
    try {
      const response = await fetch('/api/admin/header-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addCta',
          ctaId
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
          action: 'removeCta',
          headerCtaId
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
      style: 'primary' as const,
      target: '_self' as const,
      isActive: true
    });
    setEditingCta(null);
    setShowCreateForm(false);
  };

  const startEdit = (cta: CTA) => {
    setFormData({
      text: cta.text,
      url: cta.url,
      icon: cta.icon || '',
      style: cta.style as 'primary' | 'secondary' | 'outline' | 'ghost',
      target: cta.target as '_self' | '_blank',
      isActive: cta.isActive
    });
    setEditingCta(cta);
    setShowCreateForm(true);
  };

  const getStyleColor = (style: string) => {
    switch (style) {
      case 'primary': return 'bg-blue-100 text-blue-800';
      case 'secondary': return 'bg-gray-100 text-gray-800';
      case 'outline': return 'bg-purple-100 text-purple-800';
      case 'ghost': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isCtaInHeader = (ctaId: number) => {
    return headerCtas.some(hc => hc.ctaId === ctaId);
  };

  if (loading) {
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
          onClick={() => setShowCreateForm(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create CTA Button
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card className="p-6 border-2 border-blue-200 bg-blue-50/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {editingCta ? 'Edit CTA Button' : 'Create New CTA Button'}
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
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com or #section"
                  required
                  className="h-12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button Style
                </label>
                <select
                  value={formData.style}
                  onChange={(e) => setFormData({ ...formData, style: e.target.value as any })}
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="primary">Primary (Filled)</option>
                  <option value="secondary">Secondary (Gray)</option>
                  <option value="outline">Outline</option>
                  <option value="ghost">Ghost (Subtle)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link Target
                </label>
                <select
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value as any })}
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
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {availableIcons.map((icon) => (
                    <option key={icon.name} value={icon.name}>
                      {icon.label}
                    </option>
                  ))}
                </select>
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
                {editingCta ? 'Update CTA' : 'Create CTA'}
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
        
        {headerCtas.length === 0 ? (
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
                  {headerCta.cta.icon && (() => {
                    const IconComponent = getIconComponent(headerCta.cta.icon);
                    return IconComponent ? <IconComponent className="w-4 h-4 text-blue-600" /> : null;
                  })()}
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
        
        {ctas.length === 0 ? (
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
                      <Edit2 className="w-4 h-4" />
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
                  {cta.icon && (() => {
                    const IconComponent = getIconComponent(cta.icon);
                    return IconComponent ? <IconComponent className="w-4 h-4 text-gray-600" /> : null;
                  })()}
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