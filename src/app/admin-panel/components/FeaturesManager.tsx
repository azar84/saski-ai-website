'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Plus, Edit, Trash2, Save, X, Star } from 'lucide-react';

interface Feature {
  id: number;
  title: string;
  description: string;
  category: 'integration' | 'ai' | 'automation' | 'analytics' | 'security' | 'support';
  benefits: string[];
}

const categoryColors = {
  integration: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  ai: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  automation: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  analytics: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  security: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
  support: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
};

export default function FeaturesManager() {
  const [features, setFeatures] = useState<Feature[]>([
    {
      id: 1,
      title: "Multi-Channel Support",
      description: "Deploy across WhatsApp, Facebook, Instagram, web chat, and more with a single platform",
      category: "integration",
      benefits: ["Unified dashboard", "Cross-platform analytics", "Seamless handoffs"]
    },
    {
      id: 2,
      title: "Advanced AI Understanding",
      description: "Natural language processing that understands context, intent, and sentiment",
      category: "ai",
      benefits: ["Smart routing", "Emotion detection", "Learning algorithms"]
    },
    {
      id: 3,
      title: "Automation Workflows",
      description: "Create sophisticated conversation flows with visual builder tools",
      category: "automation",
      benefits: ["Visual flow builder", "Conditional logic", "Custom integrations"]
    }
  ]);

  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const emptyFeature: Feature = {
    id: 0,
    title: "",
    description: "",
    category: "integration",
    benefits: [""]
  };

  const handleEdit = (feature: Feature) => {
    setEditingFeature({ ...feature });
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    setEditingFeature({ ...emptyFeature, id: Date.now() });
    setIsAddingNew(true);
  };

  const handleSave = () => {
    if (!editingFeature) return;

    if (isAddingNew) {
      setFeatures([...features, editingFeature]);
    } else {
      setFeatures(features.map(f => f.id === editingFeature.id ? editingFeature : f));
    }

    setEditingFeature(null);
    setIsAddingNew(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this feature?')) {
      setFeatures(features.filter(f => f.id !== id));
    }
  };

  const handleCancel = () => {
    setEditingFeature(null);
    setIsAddingNew(false);
  };

  const updateBenefit = (index: number, value: string) => {
    if (!editingFeature) return;
    const newBenefits = [...editingFeature.benefits];
    newBenefits[index] = value;
    setEditingFeature({ ...editingFeature, benefits: newBenefits });
  };

  const addBenefit = () => {
    if (!editingFeature) return;
    setEditingFeature({
      ...editingFeature,
      benefits: [...editingFeature.benefits, ""]
    });
  };

  const removeBenefit = (index: number) => {
    if (!editingFeature) return;
    const newBenefits = editingFeature.benefits.filter((_, i) => i !== index);
    setEditingFeature({ ...editingFeature, benefits: newBenefits });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Features Management</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Manage website features and capabilities</p>
        </div>
        <Button 
          onClick={handleAddNew} 
          disabled={editingFeature !== null}
          className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Feature
        </Button>
      </div>

      {/* Edit Form */}
      {editingFeature && (
        <Card className="p-8 border-2 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                {isAddingNew ? <Plus className="w-4 h-4 text-amber-600" /> : <Edit className="w-4 h-4 text-amber-600" />}
              </div>
              {isAddingNew ? 'Add New Feature' : 'Edit Feature'}
            </h3>
            <div className="flex gap-3">
              <Button 
                onClick={handleSave} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCancel}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Feature Title
                </label>
                <Input
                  value={editingFeature.title}
                  onChange={(e) => setEditingFeature({ ...editingFeature, title: e.target.value })}
                  placeholder="Enter feature title"
                  className="w-full h-12 px-4 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-amber-500 dark:focus:border-amber-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Description
                </label>
                <textarea
                  value={editingFeature.description}
                  onChange={(e) => setEditingFeature({ ...editingFeature, description: e.target.value })}
                  placeholder="Enter feature description"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:border-amber-500 dark:focus:border-amber-400 transition-colors"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Category
                </label>
                <select
                  value={editingFeature.category}
                  onChange={(e) => setEditingFeature({ 
                    ...editingFeature, 
                    category: e.target.value as Feature['category']
                  })}
                  className="w-full h-12 px-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-amber-500 dark:focus:border-amber-400 transition-colors"
                >
                  <option value="integration">Integration</option>
                  <option value="ai">AI</option>
                  <option value="automation">Automation</option>
                  <option value="analytics">Analytics</option>
                  <option value="security">Security</option>
                  <option value="support">Support</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                  Benefits
                </label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={addBenefit}
                  className="border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-3">
                {editingFeature.benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-3">
                    <Input
                      value={benefit}
                      onChange={(e) => updateBenefit(index, e.target.value)}
                      placeholder="Enter benefit"
                      className="flex-1 h-10 px-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-amber-500 dark:focus:border-amber-400 transition-colors"
                    />
                    {editingFeature.benefits.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeBenefit(index)}
                        className="border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Features List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Card key={feature.id} className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <Badge className={`${categoryColors[feature.category]} font-medium px-3 py-1 text-xs border`}>
                {feature.category}
              </Badge>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(feature)}
                  disabled={editingFeature !== null}
                  className="border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(feature.id)}
                  disabled={editingFeature !== null}
                  className="border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
              {feature.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 leading-relaxed">
              {feature.description}
            </p>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Benefits
              </h4>
              <ul className="space-y-2">
                {feature.benefits.map((benefit, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>

      {features.length === 0 && (
        <Card className="p-16 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Star className="w-10 h-10 text-gray-400" />
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            <p className="text-xl font-semibold mb-2">No features yet</p>
            <p className="text-sm">Add your first feature to get started</p>
          </div>
        </Card>
      )}
    </div>
  );
}
