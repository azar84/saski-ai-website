'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Palette, 
  Type, 
  Ruler, 
  Settings, 
  Save,
  RotateCcw,
  Download,
  Upload,
  Eye,
  EyeOff,
  Copy,
  Check,
  Zap,
  Monitor,
  Sun,
  Moon
} from 'lucide-react';

interface DesignSystem {
  id?: number;
  // Brand Colors
  primaryColor: string;
  primaryColorLight: string;
  primaryColorDark: string;
  secondaryColor: string;
  accentColor: string;
  // Semantic Colors
  successColor: string;
  warningColor: string;
  errorColor: string;
  infoColor: string;
  // Neutral Colors
  grayLight: string;
  grayMedium: string;
  grayDark: string;
  // Background Colors
  backgroundPrimary: string;
  backgroundSecondary: string;
  backgroundDark: string;
  // Text Colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  // Typography
  fontFamily: string;
  fontFamilyMono: string;
  fontSizeBase: string;
  lineHeightBase: string;
  fontWeightNormal: string;
  fontWeightMedium: string;
  fontWeightBold: string;
  // Spacing Scale
  spacingXs: string;
  spacingSm: string;
  spacingMd: string;
  spacingLg: string;
  spacingXl: string;
  spacing2xl: string;
  // Border Radius
  borderRadiusSm: string;
  borderRadiusMd: string;
  borderRadiusLg: string;
  borderRadiusXl: string;
  borderRadiusFull: string;
  // Shadows
  shadowSm: string;
  shadowMd: string;
  shadowLg: string;
  shadowXl: string;
  // Animation Durations
  animationFast: string;
  animationNormal: string;
  animationSlow: string;
  // Breakpoints
  breakpointSm: string;
  breakpointMd: string;
  breakpointLg: string;
  breakpointXl: string;
  breakpoint2xl: string;
  // Theme Mode
  themeMode: 'light' | 'dark' | 'auto';
  // Custom Variables
  customVariables?: string;
  // Meta
  isActive: boolean;
}

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  description?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange, description }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <div
          className="w-12 h-12 border-2 border-gray-300 rounded-lg shadow-sm cursor-pointer relative overflow-hidden"
          style={{ backgroundColor: value }}
          title={`${label}: ${value}`}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <div className="flex-1">
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="font-mono text-sm"
            placeholder="#000000"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="px-3"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </Button>
      </div>
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
    </div>
  );
};

const DesignSystemManager: React.FC = () => {
  const [designSystem, setDesignSystem] = useState<DesignSystem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'spacing' | 'effects' | 'breakpoints' | 'preview'>('colors');
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    fetchDesignSystem();
  }, []);

  const fetchDesignSystem = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/design-system');
      const result = await response.json();

      if (result.success) {
        setDesignSystem(result.data);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to load design system' });
      }
    } catch (error) {
      console.error('Failed to fetch design system:', error);
      setMessage({ type: 'error', text: 'Failed to load design system' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!designSystem) return;

    try {
      setSaving(true);
      setMessage(null);

      console.log('Saving design system data:', designSystem);

      const response = await fetch('/api/admin/design-system', {
        method: designSystem.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(designSystem),
      });

      const result = await response.json();

      if (result.success) {
        setDesignSystem(result.data);
        setMessage({ type: 'success', text: 'Design system saved successfully!' });
        
        // Apply design system to document root for preview
        applyDesignSystemToRoot(result.data);
      } else {
        console.error('Design system save failed:', result);
        if (result.detailedErrors) {
          console.error('Detailed validation errors:', result.detailedErrors);
        }
        let errorMessage = result.message || 'Failed to save design system';
        if (result.detailedErrors && result.detailedErrors.length > 0) {
          errorMessage += '. Check console for details.';
        }
        setMessage({ type: 'error', text: errorMessage });
      }
    } catch (error) {
      console.error('Failed to save design system:', error);
      setMessage({ type: 'error', text: 'Failed to save design system' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const response = await fetch('/api/admin/design-system', {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setDesignSystem(result.data);
        setMessage({ type: 'success', text: 'Design system reset to defaults!' });
        
        // Apply design system to document root
        applyDesignSystemToRoot(result.data);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to reset design system' });
      }
    } catch (error) {
      console.error('Failed to reset design system:', error);
      setMessage({ type: 'error', text: 'Failed to reset design system' });
    } finally {
      setSaving(false);
    }
  };

  const applyDesignSystemToRoot = (ds: DesignSystem) => {
    const root = document.documentElement;
    
    // Apply CSS custom properties to the root element
    root.style.setProperty('--color-primary', ds.primaryColor);
    root.style.setProperty('--color-primary-light', ds.primaryColorLight);
    root.style.setProperty('--color-primary-dark', ds.primaryColorDark);
    root.style.setProperty('--color-secondary', ds.secondaryColor);
    root.style.setProperty('--color-accent', ds.accentColor);
    
    root.style.setProperty('--color-success', ds.successColor);
    root.style.setProperty('--color-warning', ds.warningColor);
    root.style.setProperty('--color-error', ds.errorColor);
    root.style.setProperty('--color-info', ds.infoColor);
    
    root.style.setProperty('--color-gray-light', ds.grayLight);
    root.style.setProperty('--color-gray-medium', ds.grayMedium);
    root.style.setProperty('--color-gray-dark', ds.grayDark);
    
    root.style.setProperty('--color-bg-primary', ds.backgroundPrimary);
    root.style.setProperty('--color-bg-secondary', ds.backgroundSecondary);
    root.style.setProperty('--color-bg-dark', ds.backgroundDark);
    
    root.style.setProperty('--color-text-primary', ds.textPrimary);
    root.style.setProperty('--color-text-secondary', ds.textSecondary);
    root.style.setProperty('--color-text-muted', ds.textMuted);
    
    root.style.setProperty('--font-family-sans', ds.fontFamily);
    root.style.setProperty('--font-family-mono', ds.fontFamilyMono);
    root.style.setProperty('--font-size-base', ds.fontSizeBase);
    root.style.setProperty('--line-height-base', ds.lineHeightBase);
    
    root.style.setProperty('--spacing-xs', ds.spacingXs);
    root.style.setProperty('--spacing-sm', ds.spacingSm);
    root.style.setProperty('--spacing-md', ds.spacingMd);
    root.style.setProperty('--spacing-lg', ds.spacingLg);
    root.style.setProperty('--spacing-xl', ds.spacingXl);
    root.style.setProperty('--spacing-2xl', ds.spacing2xl);
    
    root.style.setProperty('--border-radius-sm', ds.borderRadiusSm);
    root.style.setProperty('--border-radius-md', ds.borderRadiusMd);
    root.style.setProperty('--border-radius-lg', ds.borderRadiusLg);
    root.style.setProperty('--border-radius-xl', ds.borderRadiusXl);
    root.style.setProperty('--border-radius-full', ds.borderRadiusFull);
    
    root.style.setProperty('--shadow-sm', ds.shadowSm);
    root.style.setProperty('--shadow-md', ds.shadowMd);
    root.style.setProperty('--shadow-lg', ds.shadowLg);
    root.style.setProperty('--shadow-xl', ds.shadowXl);
    
    root.style.setProperty('--animation-fast', ds.animationFast);
    root.style.setProperty('--animation-normal', ds.animationNormal);
    root.style.setProperty('--animation-slow', ds.animationSlow);
  };

  const updateDesignSystem = (field: keyof DesignSystem, value: string | boolean) => {
    if (!designSystem) return;
    
    setDesignSystem(prev => ({
      ...prev!,
      [field]: value
    }));
  };

  const exportDesignSystem = () => {
    if (!designSystem) return;
    
    const dataStr = JSON.stringify(designSystem, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'design-system.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!designSystem) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Design System Not Found</h2>
          <p className="text-gray-600 mb-6">Unable to load the design system settings.</p>
          <Button onClick={fetchDesignSystem}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'colors', name: 'Colors', icon: Palette },
    { id: 'typography', name: 'Typography', icon: Type },
    { id: 'spacing', name: 'Spacing & Layout', icon: Ruler },
    { id: 'effects', name: 'Effects & Animations', icon: Zap },
    { id: 'breakpoints', name: 'Breakpoints', icon: Monitor },
    { id: 'preview', name: 'Live Preview', icon: Eye },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Design System</h1>
          <p className="text-gray-600 mt-2">Manage your website's visual identity and design tokens</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={exportDesignSystem}
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
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

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {activeTab === 'colors' && (
          <div className="space-y-8">
            {/* Brand Colors */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Brand Colors
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ColorPicker
                  label="Primary Color"
                  value={designSystem.primaryColor}
                  onChange={(value) => updateDesignSystem('primaryColor', value)}
                  description="Main brand color used for primary actions"
                />
                <ColorPicker
                  label="Primary Light"
                  value={designSystem.primaryColorLight}
                  onChange={(value) => updateDesignSystem('primaryColorLight', value)}
                  description="Lighter variant for hover states"
                />
                <ColorPicker
                  label="Primary Dark"
                  value={designSystem.primaryColorDark}
                  onChange={(value) => updateDesignSystem('primaryColorDark', value)}
                  description="Darker variant for active states"
                />
                <ColorPicker
                  label="Secondary Color"
                  value={designSystem.secondaryColor}
                  onChange={(value) => updateDesignSystem('secondaryColor', value)}
                  description="Secondary brand color"
                />
                <ColorPicker
                  label="Accent Color"
                  value={designSystem.accentColor}
                  onChange={(value) => updateDesignSystem('accentColor', value)}
                  description="Accent color for highlights"
                />
              </div>
            </Card>

            {/* Semantic Colors */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Semantic Colors
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ColorPicker
                  label="Success"
                  value={designSystem.successColor}
                  onChange={(value) => updateDesignSystem('successColor', value)}
                  description="Success states and positive actions"
                />
                <ColorPicker
                  label="Warning"
                  value={designSystem.warningColor}
                  onChange={(value) => updateDesignSystem('warningColor', value)}
                  description="Warning states and caution"
                />
                <ColorPicker
                  label="Error"
                  value={designSystem.errorColor}
                  onChange={(value) => updateDesignSystem('errorColor', value)}
                  description="Error states and destructive actions"
                />
                <ColorPicker
                  label="Info"
                  value={designSystem.infoColor}
                  onChange={(value) => updateDesignSystem('infoColor', value)}
                  description="Informational messages"
                />
              </div>
            </Card>

            {/* Neutral Colors */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Neutral & Background Colors
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ColorPicker
                  label="Light Gray"
                  value={designSystem.grayLight}
                  onChange={(value) => updateDesignSystem('grayLight', value)}
                  description="Light gray for backgrounds"
                />
                <ColorPicker
                  label="Medium Gray"
                  value={designSystem.grayMedium}
                  onChange={(value) => updateDesignSystem('grayMedium', value)}
                  description="Medium gray for borders"
                />
                <ColorPicker
                  label="Dark Gray"
                  value={designSystem.grayDark}
                  onChange={(value) => updateDesignSystem('grayDark', value)}
                  description="Dark gray for text"
                />
                <ColorPicker
                  label="Primary Background"
                  value={designSystem.backgroundPrimary}
                  onChange={(value) => updateDesignSystem('backgroundPrimary', value)}
                  description="Main page background"
                />
                <ColorPicker
                  label="Secondary Background"
                  value={designSystem.backgroundSecondary}
                  onChange={(value) => updateDesignSystem('backgroundSecondary', value)}
                  description="Card and section backgrounds"
                />
                <ColorPicker
                  label="Dark Background"
                  value={designSystem.backgroundDark}
                  onChange={(value) => updateDesignSystem('backgroundDark', value)}
                  description="Dark theme background"
                />
              </div>
            </Card>

            {/* Text Colors */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Text Colors
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ColorPicker
                  label="Primary Text"
                  value={designSystem.textPrimary}
                  onChange={(value) => updateDesignSystem('textPrimary', value)}
                  description="Main text color"
                />
                <ColorPicker
                  label="Secondary Text"
                  value={designSystem.textSecondary}
                  onChange={(value) => updateDesignSystem('textSecondary', value)}
                  description="Secondary text color"
                />
                <ColorPicker
                  label="Muted Text"
                  value={designSystem.textMuted}
                  onChange={(value) => updateDesignSystem('textMuted', value)}
                  description="Muted text for captions"
                />
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'typography' && (
          <div className="space-y-8">
            {/* Font Families */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Type className="w-5 h-5 mr-2" />
                Font Families
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Font Family
                  </label>
                  <Input
                    value={designSystem.fontFamily}
                    onChange={(e) => updateDesignSystem('fontFamily', e.target.value)}
                    placeholder="Manrope, Inter, system-ui"
                    className="font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">Used for headings and body text</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monospace Font Family
                  </label>
                  <Input
                    value={designSystem.fontFamilyMono}
                    onChange={(e) => updateDesignSystem('fontFamilyMono', e.target.value)}
                    placeholder="ui-monospace, SF Mono, Monaco"
                    className="font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">Used for code and technical content</p>
                </div>
              </div>
            </Card>

            {/* Font Sizes & Weights */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Font Sizes & Weights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Font Size
                  </label>
                  <Input
                    value={designSystem.fontSizeBase}
                    onChange={(e) => updateDesignSystem('fontSizeBase', e.target.value)}
                    placeholder="16px"
                    className="font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">Base font size for body text</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Line Height
                  </label>
                  <Input
                    value={designSystem.lineHeightBase}
                    onChange={(e) => updateDesignSystem('lineHeightBase', e.target.value)}
                    placeholder="1.5"
                    className="font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">Line height ratio for readability</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Normal Weight
                  </label>
                  <Input
                    value={designSystem.fontWeightNormal}
                    onChange={(e) => updateDesignSystem('fontWeightNormal', e.target.value)}
                    placeholder="400"
                    className="font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">Regular text weight</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medium Weight
                  </label>
                  <Input
                    value={designSystem.fontWeightMedium}
                    onChange={(e) => updateDesignSystem('fontWeightMedium', e.target.value)}
                    placeholder="500"
                    className="font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">Semi-bold text weight</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bold Weight
                  </label>
                  <Input
                    value={designSystem.fontWeightBold}
                    onChange={(e) => updateDesignSystem('fontWeightBold', e.target.value)}
                    placeholder="700"
                    className="font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">Bold text weight</p>
                </div>
              </div>
            </Card>

            {/* Typography Preview */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Typography Preview
              </h3>
              <div className="space-y-4" style={{ fontFamily: designSystem.fontFamily }}>
                <div>
                  <h1 className="text-4xl font-bold" style={{ color: designSystem.textPrimary }}>
                    Heading 1 - Large Title
                  </h1>
                </div>
                <div>
                  <h2 className="text-3xl font-semibold" style={{ color: designSystem.textPrimary }}>
                    Heading 2 - Section Title
                  </h2>
                </div>
                <div>
                  <h3 className="text-2xl font-medium" style={{ color: designSystem.textPrimary }}>
                    Heading 3 - Subsection
                  </h3>
                </div>
                <div>
                  <p className="text-lg" style={{ 
                    color: designSystem.textPrimary,
                    fontSize: designSystem.fontSizeBase,
                    lineHeight: designSystem.lineHeightBase 
                  }}>
                    Body text - This is how your regular paragraph text will appear on the website. 
                    It should be comfortable to read and have good contrast against the background.
                  </p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: designSystem.textSecondary }}>
                    Secondary text - Used for captions, metadata, and supporting information.
                  </p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: designSystem.textMuted }}>
                    Muted text - Used for less important information and subtle details.
                  </p>
                </div>
                <div>
                  <code 
                    className="px-2 py-1 bg-gray-100 rounded text-sm"
                    style={{ fontFamily: designSystem.fontFamilyMono }}
                  >
                    Monospace text - for code snippets
                  </code>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'spacing' && (
          <div className="space-y-8">
            {/* Spacing Scale */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Ruler className="w-5 h-5 mr-2" />
                Spacing Scale
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Extra Small (XS)
                  </label>
                  <Input
                    value={designSystem.spacingXs}
                    onChange={(e) => updateDesignSystem('spacingXs', e.target.value)}
                    placeholder="4px"
                    className="font-mono"
                  />
                  <div className="mt-2 h-2 bg-blue-200 rounded" style={{ width: designSystem.spacingXs }}></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Small (SM)
                  </label>
                  <Input
                    value={designSystem.spacingSm}
                    onChange={(e) => updateDesignSystem('spacingSm', e.target.value)}
                    placeholder="8px"
                    className="font-mono"
                  />
                  <div className="mt-2 h-2 bg-blue-200 rounded" style={{ width: designSystem.spacingSm }}></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medium (MD)
                  </label>
                  <Input
                    value={designSystem.spacingMd}
                    onChange={(e) => updateDesignSystem('spacingMd', e.target.value)}
                    placeholder="16px"
                    className="font-mono"
                  />
                  <div className="mt-2 h-2 bg-blue-200 rounded" style={{ width: designSystem.spacingMd }}></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Large (LG)
                  </label>
                  <Input
                    value={designSystem.spacingLg}
                    onChange={(e) => updateDesignSystem('spacingLg', e.target.value)}
                    placeholder="24px"
                    className="font-mono"
                  />
                  <div className="mt-2 h-2 bg-blue-200 rounded" style={{ width: designSystem.spacingLg }}></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Extra Large (XL)
                  </label>
                  <Input
                    value={designSystem.spacingXl}
                    onChange={(e) => updateDesignSystem('spacingXl', e.target.value)}
                    placeholder="32px"
                    className="font-mono"
                  />
                  <div className="mt-2 h-2 bg-blue-200 rounded" style={{ width: designSystem.spacingXl }}></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    2X Large (2XL)
                  </label>
                  <Input
                    value={designSystem.spacing2xl}
                    onChange={(e) => updateDesignSystem('spacing2xl', e.target.value)}
                    placeholder="48px"
                    className="font-mono"
                  />
                  <div className="mt-2 h-2 bg-blue-200 rounded" style={{ width: designSystem.spacing2xl }}></div>
                </div>
              </div>
            </Card>

            {/* Border Radius */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Border Radius
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Small Radius
                  </label>
                  <Input
                    value={designSystem.borderRadiusSm}
                    onChange={(e) => updateDesignSystem('borderRadiusSm', e.target.value)}
                    placeholder="4px"
                    className="font-mono"
                  />
                  <div 
                    className="mt-2 w-16 h-16 bg-blue-200" 
                    style={{ borderRadius: designSystem.borderRadiusSm }}
                  ></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medium Radius
                  </label>
                  <Input
                    value={designSystem.borderRadiusMd}
                    onChange={(e) => updateDesignSystem('borderRadiusMd', e.target.value)}
                    placeholder="8px"
                    className="font-mono"
                  />
                  <div 
                    className="mt-2 w-16 h-16 bg-blue-200" 
                    style={{ borderRadius: designSystem.borderRadiusMd }}
                  ></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Large Radius
                  </label>
                  <Input
                    value={designSystem.borderRadiusLg}
                    onChange={(e) => updateDesignSystem('borderRadiusLg', e.target.value)}
                    placeholder="12px"
                    className="font-mono"
                  />
                  <div 
                    className="mt-2 w-16 h-16 bg-blue-200" 
                    style={{ borderRadius: designSystem.borderRadiusLg }}
                  ></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Extra Large Radius
                  </label>
                  <Input
                    value={designSystem.borderRadiusXl}
                    onChange={(e) => updateDesignSystem('borderRadiusXl', e.target.value)}
                    placeholder="16px"
                    className="font-mono"
                  />
                  <div 
                    className="mt-2 w-16 h-16 bg-blue-200" 
                    style={{ borderRadius: designSystem.borderRadiusXl }}
                  ></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Radius (Pills)
                  </label>
                  <Input
                    value={designSystem.borderRadiusFull}
                    onChange={(e) => updateDesignSystem('borderRadiusFull', e.target.value)}
                    placeholder="9999px"
                    className="font-mono"
                  />
                  <div 
                    className="mt-2 w-24 h-16 bg-blue-200" 
                    style={{ borderRadius: designSystem.borderRadiusFull }}
                  ></div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'effects' && (
          <div className="space-y-8">
            {/* Shadows */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Box Shadows
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Small Shadow
                  </label>
                  <Input
                    value={designSystem.shadowSm}
                    onChange={(e) => updateDesignSystem('shadowSm', e.target.value)}
                    placeholder="0 1px 2px 0 rgb(0 0 0 / 0.05)"
                    className="font-mono text-sm"
                  />
                  <div 
                    className="mt-2 w-24 h-16 bg-white rounded-lg" 
                    style={{ boxShadow: designSystem.shadowSm }}
                  ></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medium Shadow
                  </label>
                  <Input
                    value={designSystem.shadowMd}
                    onChange={(e) => updateDesignSystem('shadowMd', e.target.value)}
                    placeholder="0 4px 6px -1px rgb(0 0 0 / 0.1)"
                    className="font-mono text-sm"
                  />
                  <div 
                    className="mt-2 w-24 h-16 bg-white rounded-lg" 
                    style={{ boxShadow: designSystem.shadowMd }}
                  ></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Large Shadow
                  </label>
                  <Input
                    value={designSystem.shadowLg}
                    onChange={(e) => updateDesignSystem('shadowLg', e.target.value)}
                    placeholder="0 10px 15px -3px rgb(0 0 0 / 0.1)"
                    className="font-mono text-sm"
                  />
                  <div 
                    className="mt-2 w-24 h-16 bg-white rounded-lg" 
                    style={{ boxShadow: designSystem.shadowLg }}
                  ></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Extra Large Shadow
                  </label>
                  <Input
                    value={designSystem.shadowXl}
                    onChange={(e) => updateDesignSystem('shadowXl', e.target.value)}
                    placeholder="0 20px 25px -5px rgb(0 0 0 / 0.1)"
                    className="font-mono text-sm"
                  />
                  <div 
                    className="mt-2 w-24 h-16 bg-white rounded-lg" 
                    style={{ boxShadow: designSystem.shadowXl }}
                  ></div>
                </div>
              </div>
            </Card>

            {/* Animation Durations */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Animation Durations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fast Animation
                  </label>
                  <Input
                    value={designSystem.animationFast}
                    onChange={(e) => updateDesignSystem('animationFast', e.target.value)}
                    placeholder="150ms"
                    className="font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">Quick interactions and micro-animations</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Normal Animation
                  </label>
                  <Input
                    value={designSystem.animationNormal}
                    onChange={(e) => updateDesignSystem('animationNormal', e.target.value)}
                    placeholder="300ms"
                    className="font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">Standard transitions and state changes</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slow Animation
                  </label>
                  <Input
                    value={designSystem.animationSlow}
                    onChange={(e) => updateDesignSystem('animationSlow', e.target.value)}
                    placeholder="500ms"
                    className="font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">Complex animations and page transitions</p>
                </div>
              </div>
            </Card>

            {/* Theme Mode */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Theme Mode
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  {(['light', 'dark', 'auto'] as const).map((mode) => (
                    <label key={mode} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="themeMode"
                        value={mode}
                        checked={designSystem.themeMode === mode}
                        onChange={(e) => updateDesignSystem('themeMode', e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="flex items-center space-x-2">
                        {mode === 'light' && <Sun className="w-4 h-4" />}
                        {mode === 'dark' && <Moon className="w-4 h-4" />}
                        {mode === 'auto' && <Monitor className="w-4 h-4" />}
                        <span className="capitalize">{mode}</span>
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  Choose the default theme mode for your website. Auto mode will respect user's system preference.
                </p>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'breakpoints' && (
          <div className="space-y-8">
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Monitor className="w-5 h-5 mr-2" />
                Responsive Breakpoints
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Small (SM)
                  </label>
                  <Input
                    value={designSystem.breakpointSm}
                    onChange={(e) => updateDesignSystem('breakpointSm', e.target.value)}
                    placeholder="640px"
                    className="font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">Mobile landscape and small tablets</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medium (MD)
                  </label>
                  <Input
                    value={designSystem.breakpointMd}
                    onChange={(e) => updateDesignSystem('breakpointMd', e.target.value)}
                    placeholder="768px"
                    className="font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">Tablets</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Large (LG)
                  </label>
                  <Input
                    value={designSystem.breakpointLg}
                    onChange={(e) => updateDesignSystem('breakpointLg', e.target.value)}
                    placeholder="1024px"
                    className="font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">Small laptops</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Extra Large (XL)
                  </label>
                  <Input
                    value={designSystem.breakpointXl}
                    onChange={(e) => updateDesignSystem('breakpointXl', e.target.value)}
                    placeholder="1280px"
                    className="font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">Laptops and desktops</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    2X Large (2XL)
                  </label>
                  <Input
                    value={designSystem.breakpoint2xl}
                    onChange={(e) => updateDesignSystem('breakpoint2xl', e.target.value)}
                    placeholder="1536px"
                    className="font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">Large desktops and monitors</p>
                </div>
              </div>

              {/* Breakpoint Visualization */}
              <div className="mt-8">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Breakpoint Visualization</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 text-sm text-gray-600">Mobile</div>
                    <div className="flex-1 h-4 bg-red-200 rounded" style={{ maxWidth: '320px' }}></div>
                    <div className="text-sm text-gray-600">0px - {designSystem.breakpointSm}</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 text-sm text-gray-600">SM</div>
                    <div className="flex-1 h-4 bg-orange-200 rounded" style={{ maxWidth: '400px' }}></div>
                    <div className="text-sm text-gray-600">{designSystem.breakpointSm} - {designSystem.breakpointMd}</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 text-sm text-gray-600">MD</div>
                    <div className="flex-1 h-4 bg-yellow-200 rounded" style={{ maxWidth: '500px' }}></div>
                    <div className="text-sm text-gray-600">{designSystem.breakpointMd} - {designSystem.breakpointLg}</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 text-sm text-gray-600">LG</div>
                    <div className="flex-1 h-4 bg-green-200 rounded" style={{ maxWidth: '600px' }}></div>
                    <div className="text-sm text-gray-600">{designSystem.breakpointLg} - {designSystem.breakpointXl}</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 text-sm text-gray-600">XL</div>
                    <div className="flex-1 h-4 bg-blue-200 rounded" style={{ maxWidth: '700px' }}></div>
                    <div className="text-sm text-gray-600">{designSystem.breakpointXl} - {designSystem.breakpoint2xl}</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 text-sm text-gray-600">2XL</div>
                    <div className="flex-1 h-4 bg-purple-200 rounded" style={{ maxWidth: '800px' }}></div>
                    <div className="text-sm text-gray-600">{designSystem.breakpoint2xl}+</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="space-y-8">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Live Preview
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Preview Mode:</span>
                  <button
                    onClick={() => setPreviewMode(previewMode === 'light' ? 'dark' : 'light')}
                    className="flex items-center space-x-2 px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50"
                  >
                    {previewMode === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    <span className="capitalize">{previewMode}</span>
                  </button>
                </div>
              </div>

              {/* Component Preview */}
              <div 
                className="p-8 rounded-lg border"
                style={{
                  backgroundColor: previewMode === 'light' ? designSystem.backgroundPrimary : designSystem.backgroundDark,
                  color: previewMode === 'light' ? designSystem.textPrimary : designSystem.backgroundPrimary,
                  fontFamily: designSystem.fontFamily
                }}
              >
                <div className="space-y-6">
                  {/* Header */}
                  <div>
                    <h1 className="text-3xl font-bold mb-2" style={{ color: designSystem.primaryColor }}>
                      Design System Preview
                    </h1>
                    <p className="text-lg" style={{ color: designSystem.textSecondary }}>
                      See how your design tokens look in practice
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center space-x-4">
                    <button
                      className="px-6 py-3 rounded-lg font-medium transition-colors"
                      style={{
                        backgroundColor: designSystem.primaryColor,
                        color: '#FFFFFF',
                        borderRadius: designSystem.borderRadiusMd,
                        boxShadow: designSystem.shadowMd
                      }}
                    >
                      Primary Button
                    </button>
                    <button
                      className="px-6 py-3 rounded-lg font-medium border transition-colors"
                      style={{
                        borderColor: designSystem.primaryColor,
                        color: designSystem.primaryColor,
                        borderRadius: designSystem.borderRadiusMd
                      }}
                    >
                      Secondary Button
                    </button>
                  </div>

                  {/* Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div
                      className="p-6 rounded-lg"
                      style={{
                        backgroundColor: previewMode === 'light' ? designSystem.backgroundSecondary : designSystem.grayDark,
                        borderRadius: designSystem.borderRadiusLg,
                        boxShadow: designSystem.shadowSm
                      }}
                    >
                      <h3 className="text-xl font-semibold mb-2">Card Title</h3>
                      <p style={{ color: designSystem.textSecondary }}>
                        This is a sample card showing how your design system applies to content containers.
                      </p>
                      <div className="mt-4 flex items-center space-x-2">
                        <span
                          className="px-3 py-1 text-sm rounded-full"
                          style={{
                            backgroundColor: designSystem.successColor,
                            color: '#FFFFFF',
                            borderRadius: designSystem.borderRadiusFull
                          }}
                        >
                          Success
                        </span>
                        <span
                          className="px-3 py-1 text-sm rounded-full"
                          style={{
                            backgroundColor: designSystem.warningColor,
                            color: '#FFFFFF',
                            borderRadius: designSystem.borderRadiusFull
                          }}
                        >
                          Warning
                        </span>
                      </div>
                    </div>

                    <div
                      className="p-6 rounded-lg"
                      style={{
                        backgroundColor: previewMode === 'light' ? designSystem.backgroundSecondary : designSystem.grayDark,
                        borderRadius: designSystem.borderRadiusLg,
                        boxShadow: designSystem.shadowSm
                      }}
                    >
                      <h3 className="text-xl font-semibold mb-2">Typography Scale</h3>
                      <div className="space-y-2">
                        <p className="text-2xl font-bold">Large heading</p>
                        <p className="text-lg font-medium">Medium heading</p>
                        <p style={{ fontSize: designSystem.fontSizeBase }}>Body text</p>
                        <p className="text-sm" style={{ color: designSystem.textMuted }}>
                          Small text
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Color Palette */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Color Palette</h3>
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                      {[
                        { name: 'Primary', color: designSystem.primaryColor },
                        { name: 'Secondary', color: designSystem.secondaryColor },
                        { name: 'Accent', color: designSystem.accentColor },
                        { name: 'Success', color: designSystem.successColor },
                        { name: 'Warning', color: designSystem.warningColor },
                        { name: 'Error', color: designSystem.errorColor },
                        { name: 'Info', color: designSystem.infoColor },
                        { name: 'Gray', color: designSystem.grayMedium },
                      ].map((item) => (
                        <div key={item.name} className="text-center">
                          <div
                            className="w-full h-16 rounded-lg mb-2"
                            style={{
                              backgroundColor: item.color,
                              borderRadius: designSystem.borderRadiusMd
                            }}
                          ></div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs font-mono" style={{ color: designSystem.textMuted }}>
                            {item.color}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignSystemManager; 
