'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  GripVertical, 
  AlertCircle,
  CheckCircle,
  Shield,
  Clock,
  Code,
  Globe,
  Zap,
  Star,
  Award,
  Users,
  TrendingUp,
  Heart,
  Sparkles,
  Play,
  ArrowRight,
  Download,
  ExternalLink,
  Mail,
  Phone,
  MessageSquare,
  Video,
  Calendar,
  BookOpen,
  Gift,
  Rocket
} from 'lucide-react';
import { Button, Input } from '@/components/ui';

// Available icons for trust indicators and CTA buttons
const availableIcons = [
  { name: 'Shield', icon: Shield, label: 'Shield' },
  { name: 'Clock', icon: Clock, label: 'Clock' },
  { name: 'Code', icon: Code, label: 'Code' },
  { name: 'Globe', icon: Globe, label: 'Globe' },
  { name: 'Zap', icon: Zap, label: 'Lightning' },
  { name: 'Star', icon: Star, label: 'Star' },
  { name: 'Award', icon: Award, label: 'Award' },
  { name: 'Users', icon: Users, label: 'Users' },
  { name: 'TrendingUp', icon: TrendingUp, label: 'Trending Up' },
  { name: 'Heart', icon: Heart, label: 'Heart' },
  { name: 'Sparkles', icon: Sparkles, label: 'Sparkles' },
  { name: 'Play', icon: Play, label: 'Play' },
  { name: 'ArrowRight', icon: ArrowRight, label: 'Arrow Right' },
  { name: 'Download', icon: Download, label: 'Download' },
  { name: 'ExternalLink', icon: ExternalLink, label: 'External Link' },
  { name: 'Mail', icon: Mail, label: 'Mail' },
  { name: 'Phone', icon: Phone, label: 'Phone' },
  { name: 'MessageSquare', icon: MessageSquare, label: 'Message' },
  { name: 'Video', icon: Video, label: 'Video' },
  { name: 'Calendar', icon: Calendar, label: 'Calendar' },
  { name: 'BookOpen', icon: BookOpen, label: 'Book' },
  { name: 'Gift', icon: Gift, label: 'Gift' },
  { name: 'Rocket', icon: Rocket, label: 'Rocket' }
];

interface TrustIndicator {
  id?: number;
  iconName: string;
  text: string;
  sortOrder: number;
  isVisible: boolean;
}

interface HomeHeroData {
  id?: number;
  heading: string;
  subheading: string;
  primaryCtaText: string;
  primaryCtaUrl: string;
  primaryCtaIcon: string;
  primaryCtaEnabled: boolean;
  secondaryCtaText: string;
  secondaryCtaUrl: string;
  secondaryCtaIcon: string;
  secondaryCtaEnabled: boolean;
  isActive: boolean;
  trustIndicators: TrustIndicator[];
}

const HomeHeroManager: React.FC = () => {
  const [heroData, setHeroData] = useState<HomeHeroData>({
    heading: 'Automate Conversations, Capture Leads, Serve Customers — All Without Code',
    subheading: 'Deploy intelligent assistants to SMS, WhatsApp, and your website in minutes. Transform customer support while you focus on growth.',
    primaryCtaText: 'Try Live Demo',
    primaryCtaUrl: '#demo',
    primaryCtaIcon: 'Play',
    primaryCtaEnabled: true,
    secondaryCtaText: 'Join Waitlist',
    secondaryCtaUrl: '#waitlist',
    secondaryCtaIcon: 'Users',
    secondaryCtaEnabled: true,
    isActive: true,
    trustIndicators: [
      { iconName: 'Shield', text: '99.9% Uptime', sortOrder: 0, isVisible: true },
      { iconName: 'Clock', text: '24/7 Support', sortOrder: 1, isVisible: true },
      { iconName: 'Code', text: 'No Code Required', sortOrder: 2, isVisible: true }
    ]
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Fetch hero data on component mount
  useEffect(() => {
    fetchHeroData();
  }, []);

  const fetchHeroData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/home-hero');
      if (response.ok) {
        const data = await response.json();
        setHeroData(data);
      }
    } catch (error) {
      console.error('Error fetching hero data:', error);
      setMessage({ type: 'error', text: 'Failed to load hero data' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/home-hero', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(heroData)
      });

      if (response.ok) {
        const updatedData = await response.json();
        setHeroData(updatedData);
        setMessage({ type: 'success', text: 'Hero section updated successfully!' });
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Error saving hero data:', error);
      setMessage({ type: 'error', text: 'Failed to save hero section' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchHeroData();
    setMessage(null);
  };

  const addTrustIndicator = () => {
    const newIndicator: TrustIndicator = {
      iconName: 'Star',
      text: 'New Feature',
      sortOrder: heroData.trustIndicators.length,
      isVisible: true
    };
    setHeroData(prev => ({
      ...prev,
      trustIndicators: [...prev.trustIndicators, newIndicator]
    }));
  };

  const removeTrustIndicator = (index: number) => {
    setHeroData(prev => ({
      ...prev,
      trustIndicators: prev.trustIndicators.filter((_, i) => i !== index)
    }));
  };

  const updateTrustIndicator = (index: number, field: keyof TrustIndicator, value: any) => {
    setHeroData(prev => ({
      ...prev,
      trustIndicators: prev.trustIndicators.map((indicator, i) => 
        i === index ? { ...indicator, [field]: value } : indicator
      )
    }));
  };

  const getIconComponent = (iconName: string) => {
    const iconData = availableIcons.find(icon => icon.name === iconName);
    return iconData ? iconData.icon : Shield;
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
          <h2 className="text-3xl font-bold text-gray-900">Home Page Hero</h2>
          <p className="text-gray-600 mt-1">Manage your homepage hero section content and CTAs</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setPreviewMode(!previewMode)}
            variant="outline"
            className="flex items-center gap-2"
          >
            {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {previewMode ? 'Edit Mode' : 'Preview'}
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#5243E9] hover:bg-[#4338CA]"
          >
            {saving ? (
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
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

      {previewMode ? (
        /* Preview Mode */
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {heroData.heading}
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              {heroData.subheading}
            </p>
            <div className="flex flex-wrap gap-4 mb-8">
              {heroData.primaryCtaEnabled && (
                <Button className="bg-[#5243E9] hover:bg-[#4338CA] flex items-center gap-2">
                  {(() => {
                    const IconComponent = getIconComponent(heroData.primaryCtaIcon);
                    return <IconComponent className="w-4 h-4" />;
                  })()}
                  {heroData.primaryCtaText}
                </Button>
              )}
              {heroData.secondaryCtaEnabled && (
                <Button variant="outline" className="flex items-center gap-2">
                  {(() => {
                    const IconComponent = getIconComponent(heroData.secondaryCtaIcon);
                    return <IconComponent className="w-4 h-4" />;
                  })()}
                  {heroData.secondaryCtaText}
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-6">
              {heroData.trustIndicators.filter(indicator => indicator.isVisible).map((indicator, index) => {
                const IconComponent = getIconComponent(indicator.iconName);
                return (
                  <div key={index} className="flex items-center gap-2 text-gray-600">
                    <IconComponent className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">{indicator.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Main Content */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Main Content</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heading
                  </label>
                  <textarea
                    value={heroData.heading}
                    onChange={(e) => setHeroData(prev => ({ ...prev, heading: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5243E9] focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Enter main heading..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subheading
                  </label>
                  <textarea
                    value={heroData.subheading}
                    onChange={(e) => setHeroData(prev => ({ ...prev, subheading: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5243E9] focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Enter subheading..."
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="heroActive"
                    checked={heroData.isActive}
                    onChange={(e) => setHeroData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 text-[#5243E9] border-gray-300 rounded focus:ring-[#5243E9]"
                  />
                  <label htmlFor="heroActive" className="text-sm font-medium text-gray-700">
                    Hero section is active
                  </label>
                </div>
              </div>
            </div>

            {/* Call-to-Action Buttons */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Call-to-Action Buttons</h3>
              
              <div className="space-y-6">
                {/* Primary CTA */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      id="primaryCtaEnabled"
                      checked={heroData.primaryCtaEnabled}
                      onChange={(e) => setHeroData(prev => ({ ...prev, primaryCtaEnabled: e.target.checked }))}
                      className="w-4 h-4 text-[#5243E9] border-gray-300 rounded focus:ring-[#5243E9]"
                    />
                    <label htmlFor="primaryCtaEnabled" className="font-medium text-gray-900">
                      Primary CTA Button
                    </label>
                  </div>
                  
                  {heroData.primaryCtaEnabled && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Button Icon
                        </label>
                        <select
                          value={heroData.primaryCtaIcon}
                          onChange={(e) => setHeroData(prev => ({ ...prev, primaryCtaIcon: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5243E9] focus:border-transparent"
                        >
                          {availableIcons.map(icon => (
                            <option key={icon.name} value={icon.name}>
                              {icon.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <Input
                        label="Button Text"
                        value={heroData.primaryCtaText}
                        onChange={(e) => setHeroData(prev => ({ ...prev, primaryCtaText: e.target.value }))}
                        placeholder="Try Live Demo"
                      />
                      <Input
                        label="Button URL"
                        value={heroData.primaryCtaUrl}
                        onChange={(e) => setHeroData(prev => ({ ...prev, primaryCtaUrl: e.target.value }))}
                        placeholder="#demo"
                      />
                    </div>
                  )}
                </div>

                {/* Secondary CTA */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      id="secondaryCtaEnabled"
                      checked={heroData.secondaryCtaEnabled}
                      onChange={(e) => setHeroData(prev => ({ ...prev, secondaryCtaEnabled: e.target.checked }))}
                      className="w-4 h-4 text-[#5243E9] border-gray-300 rounded focus:ring-[#5243E9]"
                    />
                    <label htmlFor="secondaryCtaEnabled" className="font-medium text-gray-900">
                      Secondary CTA Button
                    </label>
                  </div>
                  
                  {heroData.secondaryCtaEnabled && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Button Icon
                        </label>
                        <select
                          value={heroData.secondaryCtaIcon}
                          onChange={(e) => setHeroData(prev => ({ ...prev, secondaryCtaIcon: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5243E9] focus:border-transparent"
                        >
                          {availableIcons.map(icon => (
                            <option key={icon.name} value={icon.name}>
                              {icon.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <Input
                        label="Button Text"
                        value={heroData.secondaryCtaText}
                        onChange={(e) => setHeroData(prev => ({ ...prev, secondaryCtaText: e.target.value }))}
                        placeholder="Join Waitlist"
                      />
                      <Input
                        label="Button URL"
                        value={heroData.secondaryCtaUrl}
                        onChange={(e) => setHeroData(prev => ({ ...prev, secondaryCtaUrl: e.target.value }))}
                        placeholder="#waitlist"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Trust Indicators</h3>
                <Button
                  onClick={addTrustIndicator}
                  size="sm"
                  className="flex items-center gap-2 bg-[#5243E9] hover:bg-[#4338CA]"
                >
                  <Plus className="w-4 h-4" />
                  Add Indicator
                </Button>
              </div>

              <div className="space-y-4">
                {heroData.trustIndicators.map((indicator, index) => {
                  const IconComponent = getIconComponent(indicator.iconName);
                  return (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <input
                          type="checkbox"
                          checked={indicator.isVisible}
                          onChange={(e) => updateTrustIndicator(index, 'isVisible', e.target.checked)}
                          className="w-4 h-4 text-[#5243E9] border-gray-300 rounded focus:ring-[#5243E9]"
                        />
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <IconComponent className="w-4 h-4" />
                          <span>Indicator {index + 1}</span>
                        </div>
                        <Button
                          onClick={() => removeTrustIndicator(index)}
                          size="sm"
                          variant="outline"
                          className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Icon
                          </label>
                          <select
                            value={indicator.iconName}
                            onChange={(e) => updateTrustIndicator(index, 'iconName', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5243E9] focus:border-transparent"
                          >
                            {availableIcons.map(icon => (
                              <option key={icon.name} value={icon.name}>
                                {icon.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Text
                          </label>
                          <input
                            type="text"
                            value={indicator.text}
                            onChange={(e) => updateTrustIndicator(index, 'text', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5243E9] focus:border-transparent"
                            placeholder="99.9% Uptime"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

                {heroData.trustIndicators.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No trust indicators added yet.</p>
                    <p className="text-sm">Click "Add Indicator" to get started.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeHeroManager; 