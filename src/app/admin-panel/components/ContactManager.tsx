'use client';

import { useState } from 'react';
import { Mail, Grid } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import ContactSectionsManager from './ContactSectionsManager';
import ContactFieldsManager from './ContactFieldsManager';

type ContactTab = 'forms' | 'fields';

const tabs = [
  {
    id: 'forms' as ContactTab,
    name: 'Contact Forms',
    icon: Mail,
    description: 'Create and manage contact forms with custom messages'
  },
  {
    id: 'fields' as ContactTab,
    name: 'Form Fields',
    icon: Grid,
    description: 'Build dynamic form fields with validation and options'
  }
];

export default function ContactManager() {
  const [activeTab, setActiveTab] = useState<ContactTab>('forms');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Forms Management</h1>
        <p className="text-gray-600">
          Build and manage dynamic contact forms with custom fields and validation
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon
                  className={`mr-2 h-5 w-5 transition-colors ${
                    isActive
                      ? 'text-green-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Description */}
      <div className="bg-green-50 rounded-lg p-4">
        <p className="text-green-800 text-sm">
          {tabs.find(tab => tab.id === activeTab)?.description}
        </p>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'forms' && <ContactSectionsManager />}
        {activeTab === 'fields' && <ContactFieldsManager />}
      </div>
    </div>
  );
} 