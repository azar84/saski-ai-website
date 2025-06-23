'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  GripVertical,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Save,
  X,
  Layout,
  Zap,
  Image,
  MessageSquare,
  DollarSign,
  HelpCircle,
  MousePointer,
  Settings,
  Copy,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button, Input } from '@/components/ui';

// Section type icons mapping
const sectionIcons = {
  hero: Layout,
  features: Zap,
  media: Image,
  testimonials: MessageSquare,
  pricing: DollarSign,
  faq: HelpCircle,
  cta: MousePointer,
  custom: Settings
};

// Section type labels
const sectionLabels = {
  hero: 'Hero Section',
  features: 'Features',
  media: 'Media',
  testimonials: 'Testimonials',
  pricing: 'Pricing',
  faq: 'FAQ',
  cta: 'Call to Action',
  custom: 'Custom'
};

interface PageSection {
  id: number;
  pageId: number;
  sectionType: string;
  title?: string;
  subtitle?: string;
  content?: string;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  page: {
    id: number;
    slug: string;
    title: string;
  };
}

interface Page {
  id: number;
  slug: string;
  title: string;
}

interface SortableItemProps {
  id: number;
  section: PageSection;
  onEdit: (section: PageSection) => void;
  onDelete: (section: PageSection) => void;
  onToggleVisibility: (section: PageSection) => void;
  onDuplicate: (section: PageSection) => void;
}

// Sortable section item component
const SortableItem: React.FC<SortableItemProps> = ({
  id,
  section,
  onEdit,
  onDelete,
  onToggleVisibility,
  onDuplicate
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const IconComponent = sectionIcons[section.sectionType as keyof typeof sectionIcons] || Settings;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg border-2 transition-all duration-200 ${
        isDragging 
          ? 'border-blue-400 shadow-lg scale-105 opacity-90' 
          : section.isVisible 
            ? 'border-gray-200 hover:border-gray-300' 
            : 'border-gray-100 bg-gray-50 opacity-60'
      }`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600"
            >
              <GripVertical className="w-5 h-5" />
            </div>

            {/* Section Icon & Info */}
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                section.isVisible ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
              }`}>
                <IconComponent className="w-5 h-5" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900">
                    {section.title || sectionLabels[section.sectionType as keyof typeof sectionLabels]}
                  </h4>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {section.sectionType}
                  </span>
                </div>
                {section.subtitle && (
                  <p className="text-sm text-gray-500 mt-1">{section.subtitle}</p>
                )}
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                  <span>Order: {section.sortOrder}</span>
                  <span>•</span>
                  <span>ID: {section.id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onToggleVisibility(section)}
              className="p-2 text-gray-500 hover:text-gray-700"
              title={section.isVisible ? 'Hide section' : 'Show section'}
            >
              {section.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDuplicate(section)}
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Duplicate section"
            >
              <Copy className="w-4 h-4" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(section)}
              className="p-2 text-blue-600 hover:text-blue-700"
              title="Edit section"
            >
              <Edit className="w-4 h-4" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(section)}
              className="p-2 text-red-600 hover:text-red-700"
              title="Delete section"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PageBuilderProps {
  selectedPageId?: number;
}

const PageBuilder: React.FC<PageBuilderProps> = ({ selectedPageId }) => {
  const [pages, setPages] = useState<Page[]>([]);
  const [sections, setSections] = useState<PageSection[]>([]);
  const [currentPageId, setCurrentPageId] = useState<number | null>(selectedPageId || null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [editingSection, setEditingSection] = useState<PageSection | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    sectionType: 'hero' as const,
    title: '',
    subtitle: '',
    content: '',
    isVisible: true
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    if (currentPageId) {
      fetchSections();
    }
  }, [currentPageId]);

  const fetchPages = async () => {
    try {
      const response = await fetch('/api/admin/pages');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setPages(result.data);
          // If no page selected and pages exist, select the first one
          if (!currentPageId && result.data.length > 0) {
            setCurrentPageId(result.data[0].id);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
      setMessage({ type: 'error', text: 'Failed to load pages' });
    }
  };

  const fetchSections = async () => {
    if (!currentPageId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/page-sections?pageId=${currentPageId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setSections(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      setMessage({ type: 'error', text: 'Failed to load sections' });
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = sections.findIndex((section) => section.id === active.id);
      const newIndex = sections.findIndex((section) => section.id === over?.id);

      const newSections = arrayMove(sections, oldIndex, newIndex);
      setSections(newSections);

      // Update sort orders in the database
      try {
        const sectionIds = newSections.map(section => section.id);
        const response = await fetch('/api/admin/page-sections', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'reorder',
            pageId: currentPageId,
            sectionIds
          })
        });

        if (!response.ok) {
          throw new Error('Failed to reorder sections');
        }

        setMessage({ type: 'success', text: 'Sections reordered successfully!' });
      } catch (error) {
        console.error('Error reordering sections:', error);
        setMessage({ type: 'error', text: 'Failed to reorder sections' });
        // Revert the change
        fetchSections();
      }
    }
  };

  const handleAddSection = async () => {
    if (!currentPageId) return;

    setSaving(true);
    try {
      const response = await fetch('/api/admin/page-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: currentPageId,
          ...formData
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setMessage({ type: 'success', text: 'Section added successfully!' });
        await fetchSections();
        resetForm();
      } else {
        throw new Error(result.message || 'Failed to add section');
      }
    } catch (error) {
      console.error('Error adding section:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to add section' });
    } finally {
      setSaving(false);
    }
  };

  const handleEditSection = async () => {
    if (!editingSection) return;

    setSaving(true);
    try {
      const response = await fetch('/api/admin/page-sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingSection.id,
          ...formData
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setMessage({ type: 'success', text: 'Section updated successfully!' });
        await fetchSections();
        resetForm();
      } else {
        throw new Error(result.message || 'Failed to update section');
      }
    } catch (error) {
      console.error('Error updating section:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to update section' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async (section: PageSection) => {
    if (!confirm(`Are you sure you want to delete the "${section.title || sectionLabels[section.sectionType as keyof typeof sectionLabels]}" section?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/page-sections', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: section.id })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setMessage({ type: 'success', text: 'Section deleted successfully!' });
        await fetchSections();
      } else {
        throw new Error(result.message || 'Failed to delete section');
      }
    } catch (error) {
      console.error('Error deleting section:', error);
      setMessage({ type: 'error', text: 'Failed to delete section' });
    }
  };

  const handleToggleVisibility = async (section: PageSection) => {
    try {
      const response = await fetch('/api/admin/page-sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: section.id,
          isVisible: !section.isVisible
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setMessage({ type: 'success', text: `Section ${!section.isVisible ? 'shown' : 'hidden'} successfully!` });
        await fetchSections();
      } else {
        throw new Error(result.message || 'Failed to toggle section visibility');
      }
    } catch (error) {
      console.error('Error toggling section visibility:', error);
      setMessage({ type: 'error', text: 'Failed to toggle section visibility' });
    }
  };

  const handleDuplicateSection = async (section: PageSection) => {
    try {
      const response = await fetch('/api/admin/page-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: section.pageId,
          sectionType: section.sectionType,
          title: section.title ? `${section.title} (Copy)` : undefined,
          subtitle: section.subtitle,
          content: section.content,
          isVisible: section.isVisible
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setMessage({ type: 'success', text: 'Section duplicated successfully!' });
        await fetchSections();
      } else {
        throw new Error(result.message || 'Failed to duplicate section');
      }
    } catch (error) {
      console.error('Error duplicating section:', error);
      setMessage({ type: 'error', text: 'Failed to duplicate section' });
    }
  };

  const startEdit = (section: PageSection) => {
    setEditingSection(section);
    setFormData({
      sectionType: section.sectionType as any,
      title: section.title || '',
      subtitle: section.subtitle || '',
      content: section.content || '',
      isVisible: section.isVisible
    });
    setShowAddSection(true);
  };

  const resetForm = () => {
    setFormData({
      sectionType: 'hero',
      title: '',
      subtitle: '',
      content: '',
      isVisible: true
    });
    setEditingSection(null);
    setShowAddSection(false);
  };

  const currentPage = pages.find(page => page.id === currentPageId);

  // Auto-hide messages after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Page Builder</h2>
          <p className="text-gray-600 mt-1">Design your pages with drag-and-drop sections</p>
        </div>
        <Button
          onClick={() => setShowAddSection(true)}
          disabled={!currentPageId}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>
      </div>

      {/* Page Selector */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Page to Edit</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {pages.map((page) => (
            <button
              key={page.id}
              onClick={() => setCurrentPageId(page.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                currentPageId === page.id
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 bg-white hover:border-gray-300 text-gray-900'
              }`}
            >
              <h4 className="font-medium">{page.title}</h4>
              <p className="text-sm text-gray-500 mt-1">/{page.slug}</p>
            </button>
          ))}
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

      {/* Page Sections */}
      {currentPageId && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Page Sections - {currentPage?.title}
            </h3>
            <div className="text-sm text-gray-500">
              {sections.length} section{sections.length !== 1 ? 's' : ''}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : sections.length === 0 ? (
            <div className="text-center py-12">
              <Layout className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sections yet</h3>
              <p className="text-gray-500 mb-6">Start building your page by adding sections.</p>
              <Button
                onClick={() => setShowAddSection(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Section
              </Button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {sections.map((section) => (
                    <SortableItem
                      key={section.id}
                      id={section.id}
                      section={section}
                      onEdit={startEdit}
                      onDelete={handleDeleteSection}
                      onToggleVisibility={handleToggleVisibility}
                      onDuplicate={handleDuplicateSection}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}

      {/* Add/Edit Section Modal */}
      {showAddSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingSection ? 'Edit Section' : 'Add New Section'}
                </h2>
                <Button
                  onClick={resetForm}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Section Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Section Type *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(sectionLabels).map(([type, label]) => {
                    const IconComponent = sectionIcons[type as keyof typeof sectionIcons];
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, sectionType: type as any })}
                        className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${
                          formData.sectionType === type
                            ? 'border-blue-500 bg-blue-50 text-blue-900'
                            : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <IconComponent className="w-6 h-6 mx-auto mb-2" />
                        <div className="text-sm font-medium">{label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Title
                </label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter section title (optional)"
                  className="w-full"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Subtitle
                </label>
                <Input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Enter section subtitle (optional)"
                  className="w-full"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Content (JSON)
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter section configuration as JSON (optional)"
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Advanced: JSON configuration for section-specific settings
                </p>
              </div>

              {/* Visibility */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isVisible"
                  checked={formData.isVisible}
                  onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isVisible" className="text-sm font-medium text-gray-700">
                  Section is visible
                </label>
              </div>

              {/* Actions */}
              <div className="flex space-x-4 pt-4 border-t border-gray-200">
                <Button
                  onClick={editingSection ? handleEditSection : handleAddSection}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {saving ? (
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {saving ? 'Saving...' : (editingSection ? 'Update Section' : 'Add Section')}
                </Button>
                <Button
                  onClick={resetForm}
                  variant="outline"
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageBuilder;