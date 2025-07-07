'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, Edit, Trash2, Save, X, Code, Eye, EyeOff } from 'lucide-react';

interface ScriptSection {
  id: number;
  name: string;
  description?: string;
  scriptType: string;
  scriptContent: string;
  placement: string;
  isActive: boolean;
  loadAsync: boolean;
  loadDefer: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

interface ScriptSectionFormData {
  name: string;
  description: string;
  scriptType: string;
  scriptContent: string;
  placement: string;
  isActive: boolean;
  loadAsync: boolean;
  loadDefer: boolean;
  priority: number;
}

const initialFormData: ScriptSectionFormData = {
  name: '',
  description: '',
  scriptType: 'javascript',
  scriptContent: '',
  placement: 'footer',
  isActive: true,
  loadAsync: false,
  loadDefer: false,
  priority: 0
};

export default function ScriptSectionManager() {
  const [scriptSections, setScriptSections] = useState<ScriptSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ScriptSectionFormData>(initialFormData);
  const [showForm, setShowForm] = useState(false);
  const [previewScript, setPreviewScript] = useState<number | null>(null);

  const scriptTypes = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'google-analytics', label: 'Google Analytics' },
    { value: 'google-tag-manager', label: 'Google Tag Manager' },
    { value: 'custom', label: 'Custom' }
  ];

  const placements = [
    { value: 'header', label: 'Header' },
    { value: 'footer', label: 'Footer' },
    { value: 'body-start', label: 'Body Start' },
    { value: 'body-end', label: 'Body End' }
  ];

  useEffect(() => {
    fetchScriptSections();
  }, []);

  const fetchScriptSections = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/script-sections');
      const result = await response.json();
      
      if (result.success) {
        setScriptSections(result.data);
      } else {
        setError(result.error || 'Failed to fetch script sections');
      }
    } catch (err) {
      setError('Failed to fetch script sections');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = '/api/admin/script-sections';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { ...formData, id: editingId } : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (result.success) {
        await fetchScriptSections();
        resetForm();
        setError(null);
      } else {
        setError(result.error || 'Failed to save script section');
      }
    } catch (err) {
      setError('Failed to save script section');
    }
  };

  const handleEdit = (script: ScriptSection) => {
    setFormData({
      name: script.name,
      description: script.description || '',
      scriptType: script.scriptType,
      scriptContent: script.scriptContent,
      placement: script.placement,
      isActive: script.isActive,
      loadAsync: script.loadAsync,
      loadDefer: script.loadDefer,
      priority: script.priority
    });
    setEditingId(script.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this script section?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/script-sections?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        await fetchScriptSections();
        setError(null);
      } else {
        setError(result.error || 'Failed to delete script section');
      }
    } catch (err) {
      setError('Failed to delete script section');
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setShowForm(false);
  };

  const getScriptTypeColor = (type: string) => {
    switch (type) {
      case 'google-analytics': return 'bg-blue-100 text-blue-800';
      case 'google-tag-manager': return 'bg-green-100 text-green-800';
      case 'javascript': return 'bg-purple-100 text-purple-800';
      case 'custom': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlacementColor = (placement: string) => {
    switch (placement) {
      case 'header': return 'bg-red-100 text-red-800';
      case 'footer': return 'bg-blue-100 text-blue-800';
      case 'body-start': return 'bg-green-100 text-green-800';
      case 'body-end': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading script sections...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Script Sections</h2>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Script Section
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? 'Edit Script Section' : 'Add New Script Section'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Script Type</label>
                  <select
                    value={formData.scriptType}
                    onChange={(e) => setFormData({ ...formData, scriptType: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {scriptTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Optional description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Script Content</label>
                <textarea
                  value={formData.scriptContent}
                  onChange={(e) => setFormData({ ...formData, scriptContent: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  rows={8}
                  placeholder="Enter your script content here..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Placement</label>
                  <select
                    value={formData.placement}
                    onChange={(e) => setFormData({ ...formData, placement: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {placements.map(placement => (
                      <option key={placement.value} value={placement.value}>
                        {placement.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Active</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.loadAsync}
                    onChange={(e) => setFormData({ ...formData, loadAsync: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Load Async</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.loadDefer}
                    onChange={(e) => setFormData({ ...formData, loadDefer: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Load Defer</span>
                </label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {editingId ? 'Update' : 'Create'} Script Section
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {scriptSections.map((script) => (
          <Card key={script.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    {script.name}
                  </h3>
                  {script.description && (
                    <p className="text-gray-600 mt-1">{script.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getScriptTypeColor(script.scriptType)}>
                    {script.scriptType}
                  </Badge>
                  <Badge className={getPlacementColor(script.placement)}>
                    {script.placement}
                  </Badge>
                  {script.isActive ? (
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">Inactive</Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                  <span className="font-medium">Priority:</span> {script.priority}
                </div>
                <div>
                  <span className="font-medium">Async:</span> {script.loadAsync ? 'Yes' : 'No'}
                </div>
                <div>
                  <span className="font-medium">Defer:</span> {script.loadDefer ? 'Yes' : 'No'}
                </div>
              </div>

              {previewScript === script.id && (
                <div className="mb-4">
                  <div className="bg-gray-50 border rounded-md p-4">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-x-auto">
                      {script.scriptContent}
                    </pre>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewScript(previewScript === script.id ? null : script.id)}
                  className="flex items-center gap-2"
                >
                  {previewScript === script.id ? (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Hide Script
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      View Script
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(script)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(script.id)}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {scriptSections.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No script sections found. Create your first script section to get started.
        </div>
      )}
    </div>
  );
} 