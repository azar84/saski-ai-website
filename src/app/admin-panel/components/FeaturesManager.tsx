'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Star,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Users,
  Settings,
  Languages,
  BookOpen,
  Zap,
  Shield,
  Clock,
  Globe,
  Code,
  Award,
  TrendingUp,
  Heart,
  Sparkles,
  Play,
  ArrowRight,
  Download,
  ExternalLink,
  Mail,
  Phone,
  Video,
  Calendar,
  Gift,
  Rocket
} from 'lucide-react';
import { Button, Input } from '@/components/ui';

// Available icons for features
const availableIcons = [
  { name: 'MessageSquare', icon: MessageSquare, label: 'Message Square' },
  { name: 'Users', icon: Users, label: 'Users' },
  { name: 'Settings', icon: Settings, label: 'Settings' },
  { name: 'Languages', icon: Languages, label: 'Languages' },
  { name: 'BookOpen', icon: BookOpen, label: 'Book Open' },
  { name: 'Zap', icon: Zap, label: 'Lightning' },
  { name: 'Shield', icon: Shield, label: 'Shield' },
  { name: 'Clock', icon: Clock, label: 'Clock' },
  { name: 'Globe', icon: Globe, label: 'Globe' },
  { name: 'Code', icon: Code, label: 'Code' },
  { name: 'Award', icon: Award, label: 'Award' },
  { name: 'TrendingUp', icon: TrendingUp, label: 'Trending Up' },
  { name: 'Heart', icon: Heart, label: 'Heart' },
  { name: 'Sparkles', icon: Sparkles, label: 'Sparkles' },
  { name: 'Play', icon: Play, label: 'Play' },
  { name: 'ArrowRight', icon: ArrowRight, label: 'Arrow Right' },
  { name: 'Download', icon: Download, label: 'Download' },
  { name: 'ExternalLink', icon: ExternalLink, label: 'External Link' },
  { name: 'Mail', icon: Mail, label: 'Mail' },
  { name: 'Phone', icon: Phone, label: 'Phone' },
  { name: 'Video', icon: Video, label: 'Video' },
  { name: 'Calendar', icon: Calendar, label: 'Calendar' },
  { name: 'Gift', icon: Gift, label: 'Gift' },
  { name: 'Rocket', icon: Rocket, label: 'Rocket' }
];

interface GlobalFeature {
  id: number;
  title: string;
  description: string;
  iconName: string;
  category: 'integration' | 'ai' | 'automation' | 'analytics' | 'security' | 'support';
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

const categoryColors = {
  integration: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  ai: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  automation: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  analytics: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  security: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
  support: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
};

const FeaturesManager: React.FC = () => {
  const [features, setFeatures] = useState<GlobalFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingFeature, setEditingFeature] = useState<GlobalFeature | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    iconName: string;
    category: 'integration' | 'ai' | 'automation' | 'analytics' | 'security' | 'support';
    sortOrder: number;
    isVisible: boolean;
  }>({
    title: '',
    description: '',
    iconName: 'MessageSquare',
    category: 'integration',
    sortOrder: 0,
    isVisible: true
  });

  const getIconComponent = (iconName: string) => {
    const iconData = availableIcons.find(icon => icon.name === iconName);
    return iconData ? iconData.icon : MessageSquare;
  };

  const fetchFeatures = async () => {
    try {
      const response = await fetch('/api/admin/features');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setFeatures(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch features');
        }
      } else {
        throw new Error('Failed to fetch features');
      }
    } catch (error) {
      console.error('Error fetching features:', error);
      setMessage({ type: 'error', text: 'Failed to load features' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = '/api/admin/features';
      const method = editingFeature ? 'PUT' : 'POST';
      const body = editingFeature 
        ? { ...formData, id: editingFeature.id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage({ 
          type: 'success', 
          text: editingFeature ? 'Feature updated successfully!' : 'Feature created successfully!' 
        });
        await fetchFeatures();
        resetForm();
      } else {
        throw new Error(result.message || 'Failed to save feature');
      }
    } catch (error) {
      console.error('Error saving feature:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to save feature' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this feature?')) return;

    try {
      const response = await fetch('/api/admin/features', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage({ type: 'success', text: 'Feature deleted successfully!' });
        await fetchFeatures();
      } else {
        throw new Error(result.message || 'Failed to delete feature');
      }
    } catch (error) {
      console.error('Error deleting feature:', error);
      setMessage({ type: 'error', text: 'Failed to delete feature' });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      iconName: 'MessageSquare',
      category: 'integration',
      sortOrder: 0,
      isVisible: true
    });
    setEditingFeature(null);
    setShowCreateForm(false);
  };

  const startEdit = (feature: GlobalFeature) => {
    setFormData({
      title: feature.title,
      description: feature.description,
      iconName: feature.iconName,
      category: feature.category,
      sortOrder: feature.sortOrder,
      isVisible: feature.isVisible
    });
    setEditingFeature(feature);
    setShowCreateForm(true);
  };

  // Auto-hide messages after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5243E9]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Features Manager</h2>
          <p className="text-gray-600 mt-1">Manage website features and capabilities</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Feature
        </Button>
      </div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center gap-2 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {editingFeature ? 'Edit Feature' : 'Create New Feature'}
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
                  Feature Title *
                </label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Multi-Channel Support"
                  required
                  className="h-12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    const value = e.target.value as 'integration' | 'ai' | 'automation' | 'analytics' | 'security' | 'support';
                    setFormData({ ...formData, category: value });
                  }}
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="integration">Integration</option>
                  <option value="ai">AI</option>
                  <option value="automation">Automation</option>
                  <option value="analytics">Analytics</option>
                  <option value="security">Security</option>
                  <option value="support">Support</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the feature and its benefits..."
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon
                </label>
                <select
                  value={formData.iconName}
                  onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {availableIcons.map((icon) => (
                    <option key={icon.name} value={icon.name}>
                      {icon.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort Order
                </label>
                <Input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="h-12"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isVisible"
                checked={formData.isVisible}
                onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isVisible" className="text-sm font-medium text-gray-700">
                Visible (Show on website)
              </label>
            </div>

            <div className="flex space-x-4">
              <Button
                type="submit"
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {saving ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saving ? 'Saving...' : (editingFeature ? 'Update Feature' : 'Create Feature')}
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
        </div>
      )}

      {/* Features List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => {
          const IconComponent = getIconComponent(feature.iconName);
          return (
            <div
              key={feature.id}
              className={`border-2 rounded-xl p-6 transition-all duration-200 ${
                feature.isVisible
                  ? 'border-gray-200 bg-white hover:shadow-lg'
                  : 'border-gray-100 bg-gray-50 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="inline-flex px-3 py-1 text-xs border rounded-full font-medium">
                  <span className={categoryColors[feature.category]}>
                    {feature.category}
                  </span>
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEdit(feature)}
                    className="p-1 text-gray-600 hover:text-gray-700"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(feature.id)}
                    className="p-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <IconComponent className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900">{feature.title}</h4>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">{feature.description}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Order: {feature.sortOrder}</span>
                <span className={feature.isVisible ? 'text-green-600' : 'text-red-600'}>
                  {feature.isVisible ? 'Visible' : 'Hidden'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {features.length === 0 && (
        <div className="text-center py-12">
          <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No features yet</h3>
          <p className="text-gray-500">Create your first feature to get started.</p>
        </div>
      )}
    </div>
  );
};

export default FeaturesManager;
