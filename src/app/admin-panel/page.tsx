'use client';

import { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Star, 
  Users, 
  BarChart3, 
  Settings,
  Menu,
  X,
  Globe,
  Image,
  Layers,
  Play,
  MousePointer,
  Home,
  FolderOpen
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import HeroManager from './components/HeroManager';
import HeroSectionsManager from './components/HeroSectionsManager';
import FeaturesManager from './components/FeaturesManager';
import FeatureGroupsManager from './components/FeatureGroupsManager';
import SiteSettingsManager from './components/SiteSettingsManager';
import PagesManager from './components/PagesManager';
import HeaderManager from './components/HeaderManager';
import CTAManager from './components/CTAManager';
import HomeHeroManager from './components/HomeHeroManager';
import PageBuilder from './components/PageBuilder';
import MediaSectionsManager from './components/MediaSectionsManager';
import DesignSystemManager from './components/DesignSystemManager';
import MediaLibraryManager from './components/MediaLibraryManager';

type Section = 'dashboard' | 'pages' | 'page-builder' | 'home-hero' | 'hero-sections' | 'features' | 'feature-groups' | 'media-sections' | 'media-library' | 'testimonials' | 'faqs' | 'users' | 'analytics' | 'site-settings' | 'header-config' | 'cta-manager' | 'design-system';

const navigation = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-600' },
  { id: 'pages', name: 'Pages', icon: FileText, color: 'text-green-600' },
  { id: 'page-builder', name: 'Page Builder', icon: Layers, color: 'text-violet-600' },
  { id: 'header-config', name: 'Header Config', icon: Menu, color: 'text-orange-600' },
  { id: 'cta-manager', name: 'CTA Buttons', icon: MousePointer, color: 'text-teal-600' },
  { id: 'home-hero', name: 'Home Page Hero', icon: Home, color: 'text-rose-600' },
  { id: 'hero-sections', name: 'Hero Sections', icon: Image, color: 'text-purple-600' },
  { id: 'features', name: 'Features', icon: Star, color: 'text-amber-600' },
  { id: 'feature-groups', name: 'Feature Groups', icon: Layers, color: 'text-emerald-600' },
  { id: 'media-sections', name: 'Media Sections', icon: Play, color: 'text-red-600' },
  { id: 'media-library', name: 'Media Library', icon: FolderOpen, color: 'text-blue-600' },
  { id: 'testimonials', name: 'Testimonials', icon: Users, color: 'text-indigo-600' },
  { id: 'faqs', name: 'FAQs', icon: Layers, color: 'text-cyan-600' },
  { id: 'users', name: 'Users', icon: Users, color: 'text-pink-600' },
  { id: 'analytics', name: 'Analytics', icon: BarChart3, color: 'text-emerald-600' },
  { id: 'design-system', name: 'Design System', icon: Layers, color: 'text-blue-600' },
  { id: 'site-settings', name: 'Site Settings', icon: Settings, color: 'text-gray-600' },
];

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case 'pages':
        return <PagesManager />;
      case 'page-builder':
        return <PageBuilder />;
      case 'header-config':
        return <HeaderManager />;
      case 'cta-manager':
        return <CTAManager />;
      case 'home-hero':
        return <HomeHeroManager />;
      case 'hero-sections':
        return <HeroSectionsManager />;
      case 'features':
        return <FeaturesManager />;
      case 'feature-groups':
        return <FeatureGroupsManager />;
      case 'site-settings':
        return <SiteSettingsManager />;
      case 'design-system':
        return <DesignSystemManager />;
      case 'media-sections':
        return <MediaSectionsManager />;
      case 'media-library':
        return (
          <div className="h-full">
            <MediaLibraryManager onClose={() => setActiveSection('dashboard')} />
          </div>
        );
      case 'testimonials':
        return (
          <div className="p-8">
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Testimonials</h2>
              <p className="text-gray-600">Testimonials management coming soon...</p>
            </div>
          </div>
        );
      case 'faqs':
        return (
          <div className="p-8">
            <div className="text-center py-12">
              <Layers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">FAQs</h2>
              <p className="text-gray-600">FAQ management coming soon...</p>
            </div>
          </div>
        );
      case 'users':
        return (
          <div className="p-8">
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Users</h2>
              <p className="text-gray-600">User management coming soon...</p>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="p-8">
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h2>
              <p className="text-gray-600">Analytics dashboard coming soon...</p>
            </div>
          </div>
        );
      case 'dashboard':
      default:
        return (
          <div className="p-8 space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-[#5243E9] to-[#7C3AED] rounded-xl p-8 text-white">
              <h1 className="text-3xl font-bold mb-2">Welcome to Saski AI Admin</h1>
              <p className="text-[#E2E8F0]">Manage your website content, pages, and settings from this central dashboard.</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Pages</p>
                    <p className="text-2xl font-bold text-gray-900">8</p>
                  </div>
                  <div className="p-3 bg-[#10B981]/10 rounded-lg">
                    <FileText className="w-6 h-6 text-[#10B981]" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className="text-sm text-[#10B981] font-medium">+12% from last month</span>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Hero Sections</p>
                    <p className="text-2xl font-bold text-gray-900">15</p>
                  </div>
                  <div className="p-3 bg-[#5243E9]/10 rounded-lg">
                    <Image className="w-6 h-6 text-[#5243E9]" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className="text-sm text-[#5243E9] font-medium">+8% from last month</span>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Features</p>
                    <p className="text-2xl font-bold text-gray-900">42</p>
                  </div>
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <Star className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className="text-sm text-amber-600 font-medium">+24% from last month</span>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Media Library</p>
                    <p className="text-2xl font-bold text-gray-900">156</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FolderOpen className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className="text-sm text-blue-600 font-medium">+18% from last month</span>
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  onClick={() => setActiveSection('pages')}
                  className="bg-green-600 hover:bg-green-700 text-white h-12 flex items-center justify-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Manage Pages</span>
                </Button>
                <Button
                  onClick={() => setActiveSection('hero-sections')}
                  className="bg-purple-600 hover:bg-purple-700 text-white h-12 flex items-center justify-center space-x-2"
                >
                  <Image className="w-4 h-4" />
                  <span>Edit Heroes</span>
                </Button>
                <Button
                  onClick={() => setActiveSection('media-library')}
                  className="bg-blue-600 hover:bg-blue-700 text-white h-12 flex items-center justify-center space-x-2"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Media Library</span>
                </Button>
                <Button
                  onClick={() => setActiveSection('site-settings')}
                  className="bg-gray-600 hover:bg-gray-700 text-white h-12 flex items-center justify-center space-x-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>Site Settings</span>
                </Button>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileText className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">New page "About Us" created</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FolderOpen className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">5 new images uploaded to media library</p>
                    <p className="text-xs text-gray-500">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Image className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Hero section updated on homepage</p>
                    <p className="text-xs text-gray-500">6 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Star className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">New feature "AI Integration" added</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#5243E9] to-[#7C3AED] rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Saski AI</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id as Section);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-[#5243E9] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`mr-3 w-5 h-5 ${activeSection === item.id ? 'text-white' : item.color}`} />
                  {item.name}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 lg:hidden">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-[#5243E9] to-[#7C3AED] rounded-md flex items-center justify-center">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">Saski AI</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 h-screen overflow-auto">
          {renderContent()}
        </main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

 
