'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  GripVertical,
  Settings,
  Eye,
  Copy,
  Check,
  Palette,
  Zap,
  Send,
  Calculator,
  Puzzle,
  Target,
  Grid3X3,
  Shield
  } from 'lucide-react';
  import FormFieldTypes, { FormFieldType } from '@/components/form-builder/FormFieldTypes';
  import IconPicker from '@/components/ui/IconPicker';
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
import { useDesignSystem } from '@/hooks/useDesignSystem';

interface FormField {
  id?: number;
  fieldType: string;
  fieldName: string;
  label: string;
  placeholder?: string;
  helpText?: string;
  isRequired: boolean;
  fieldWidth: string;
  fieldOptions?: any;
  sortOrder: number;
}

interface Form {
  id?: number;
  name: string;
  title: string;
  subheading?: string;
  successMessage: string;
  errorMessage: string;
  fields: FormField[];
  
  // CTA Customization
  ctaText?: string;
  ctaIcon?: string;
  ctaStyle?: string;
  ctaSize?: string;
  ctaWidth?: string;
  ctaLoadingText?: string;
  
  // Enhanced CTA Colors
  ctaBackgroundColor?: string;
  ctaTextColor?: string;
  ctaBorderColor?: string;
  ctaHoverBackgroundColor?: string;
  ctaHoverTextColor?: string;
  
  // Submission Actions
  redirectUrl?: string;
  emailNotification?: boolean;
  emailRecipients?: string;
  webhookUrl?: string;
  
  // Captcha Settings
  enableCaptcha?: boolean;
  captchaType?: string;
  captchaDifficulty?: string;
}

// Sortable Field Item Component
function SortableFieldItem({ 
  field, 
  index, 
  onEdit, 
  onDelete 
}: { 
  field: FormField; 
  index: number; 
  onEdit: (index: number) => void; 
  onDelete: (index: number) => void; 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `field-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 border rounded-lg bg-white ${
        isDragging ? 'shadow-lg ring-2 ring-blue-500' : 'hover:shadow-sm'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-xs font-medium text-blue-600">
            {field.fieldType.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <div className="font-medium text-gray-900">{field.label}</div>
          <div className="text-sm text-gray-500">{field.fieldName}</div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {field.isRequired && (
          <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded">Required</span>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(index)}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(index)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Add ColorPicker component for design system colors
interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  designSystemColors?: Array<{ name: string; value: string; description?: string }>;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange, designSystemColors }) => {
  const [showPalette, setShowPalette] = useState(false);
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
        {designSystemColors && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPalette(!showPalette)}
            className="px-3"
          >
            <Palette size={16} />
          </Button>
        )}
      </div>
      
      {/* Design System Color Palette */}
      {showPalette && designSystemColors && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
          <p className="text-xs font-medium text-gray-600 mb-2">Design System Colors</p>
          <div className="grid grid-cols-4 gap-2">
            {designSystemColors.map((color, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  onChange(color.value);
                  setShowPalette(false);
                }}
                className="group flex flex-col items-center p-2 rounded-lg hover:bg-white transition-colors"
                title={color.description || color.name}
              >
                <div
                  className="w-8 h-8 rounded-full border-2 border-gray-200 group-hover:border-gray-300 transition-colors"
                  style={{ backgroundColor: color.value }}
                />
                <span className="text-xs mt-1 text-gray-600 truncate max-w-full">
                  {color.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Add Button Style Preview component
interface ButtonStylePreviewProps {
  style: string;
  size: string;
  text: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  icon?: string;
}

const ButtonStylePreview: React.FC<ButtonStylePreviewProps> = ({
  style,
  size,
  text,
  backgroundColor,
  textColor,
  borderColor,
  icon
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small': return 'px-3 py-1.5 text-sm';
      case 'medium': return 'px-4 py-2 text-base';
      case 'large': return 'px-6 py-3 text-lg';
      default: return 'px-4 py-2 text-base';
    }
  };

  const getStyleClasses = () => {
    switch (style) {
      case 'primary':
        return 'font-semibold rounded-lg transition-all';
      case 'secondary':
        return 'font-medium rounded-lg border-2 transition-all';
      case 'outline':
        return 'font-medium rounded-lg border-2 bg-transparent transition-all';
      case 'ghost':
        return 'font-medium rounded-lg bg-transparent hover:bg-gray-100 transition-all';
      default:
        return 'font-medium rounded-lg transition-all';
    }
  };

  const getDefaultColors = () => {
    switch (style) {
      case 'primary':
        return {
          backgroundColor: backgroundColor || '#5243E9',
          color: textColor || '#FFFFFF',
          borderColor: 'transparent'
        };
      case 'secondary':
        return {
          backgroundColor: backgroundColor || '#6B7280',
          color: textColor || '#FFFFFF',
          borderColor: borderColor || '#6B7280'
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: textColor || '#5243E9',
          borderColor: borderColor || '#5243E9'
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: textColor || '#374151',
          borderColor: 'transparent'
        };
      default:
        return {
          backgroundColor: backgroundColor || '#5243E9',
          color: textColor || '#FFFFFF',
          borderColor: 'transparent'
        };
    }
  };

  const colors = getDefaultColors();

  // Get icon component dynamically
  const getIconComponent = () => {
    if (!icon) return null;
    
    try {
      // Import the icon from lucide-react dynamically
      const iconComponents = require('lucide-react');
      const IconComponent = iconComponents[icon];
      return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
    } catch {
      return null;
    }
  };

  return (
    <button
      type="button"
      className={`${getSizeClasses()} ${getStyleClasses()} pointer-events-none flex items-center justify-center gap-2`}
      style={{
        backgroundColor: colors.backgroundColor,
        color: colors.color,
        borderColor: colors.borderColor
      }}
    >
      {getIconComponent()}
      <span>{text || 'Preview'}</span>
    </button>
  );
};

export default function FormBuilder() {
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showFieldEditor, setShowFieldEditor] = useState(false);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Form>({
    name: '',
    title: '',
    subheading: '',
    successMessage: 'Thank you! Your message has been sent successfully.',
    errorMessage: 'Sorry, there was an error. Please try again.',
    fields: [],
    ctaText: 'Send Message',
    ctaIcon: 'send',
    ctaStyle: 'primary',
    ctaSize: 'large',
    ctaWidth: 'auto',
    ctaLoadingText: 'Sending...',
    enableCaptcha: true,
    captchaType: 'math',
    captchaDifficulty: 'medium'
  });
  const [fieldData, setFieldData] = useState<FormField>({
    fieldType: 'text',
    fieldName: '',
    label: '',
    placeholder: '',
    helpText: '',
    isRequired: false,
    fieldWidth: 'full',
    fieldOptions: null,
    sortOrder: 0
  });
  const [fieldOptions, setFieldOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState('');
  const [termsContent, setTermsContent] = useState('');

  // Design System Integration
  const { designSystem } = useDesignSystem();

  // Get design system colors for color picker
  const getDesignSystemColors = () => {
    if (!designSystem) return [];
    
    return [
      { name: 'Primary', value: designSystem.primaryColor, description: 'Main brand color' },
      { name: 'Primary Light', value: designSystem.primaryColorLight, description: 'Light primary variant' },
      { name: 'Primary Dark', value: designSystem.primaryColorDark, description: 'Dark primary variant' },
      { name: 'Secondary', value: designSystem.secondaryColor, description: 'Secondary brand color' },
      { name: 'Accent', value: designSystem.accentColor, description: 'Accent color' },
      { name: 'Success', value: designSystem.successColor, description: 'Success state color' },
      { name: 'Warning', value: designSystem.warningColor, description: 'Warning state color' },
      { name: 'Error', value: designSystem.errorColor, description: 'Error state color' },
      { name: 'Info', value: designSystem.infoColor, description: 'Info state color' },
      { name: 'Gray Dark', value: designSystem.grayDark, description: 'Dark gray' },
      { name: 'Gray Medium', value: designSystem.grayMedium, description: 'Medium gray' },
      { name: 'Text Primary', value: designSystem.textPrimary, description: 'Primary text color' },
      { name: 'Text Secondary', value: designSystem.textSecondary, description: 'Secondary text color' }
    ];
  };

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await fetch('/api/admin/forms');
      if (response.ok) {
        const data = await response.json();
        setForms(data);
      }
    } catch (error) {
      console.error('Error fetching forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldSelect = (fieldType: FormFieldType) => {
    const currentForm = selectedForm || formData;
    setFieldData({
      fieldType: fieldType.type,
      fieldName: fieldType.defaultFieldName,
      label: fieldType.defaultLabel,
      placeholder: fieldType.defaultPlaceholder,
      helpText: '',
      isRequired: false,
      fieldWidth: fieldType.defaultWidth,
      fieldOptions: fieldType.supportsOptions ? [] : null,
      sortOrder: currentForm?.fields.length || 0
    });
    
    // Initialize field options based on field type
    if (fieldType.type === 'select' || fieldType.type === 'radio') {
      setFieldOptions([]); // Start with empty options, user will add them
    } else if (fieldType.type === 'terms') {
      setTermsContent(''); // Start with empty terms content
    } else {
      setFieldOptions([]);
      setTermsContent('');
    }
    
    setShowFieldEditor(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const currentForm = selectedForm || formData;
    if (!currentForm) return;

    const activeIndex = parseInt(active.id.toString().replace('field-', ''));
    const overIndex = parseInt(over.id.toString().replace('field-', ''));

    const newFields = arrayMove(currentForm.fields, activeIndex, overIndex);
    
    // Update sortOrder for all fields
    const updatedFields = newFields.map((field, index) => ({
      ...field,
      sortOrder: index
    }));

    if (selectedForm) {
      setSelectedForm({
        ...selectedForm,
        fields: updatedFields
      });
    } else {
      setFormData({
        ...formData,
        fields: updatedFields
      });
    }
  };

  const handleAddField = async () => {
    // During form creation, use formData; during editing, use selectedForm
    const currentForm = selectedForm || formData;
    
    if (!currentForm) return;

    // Prepare field options based on field type
    let processedOptions = null;
    if (fieldData.fieldType === 'select' || fieldData.fieldType === 'radio') {
      processedOptions = fieldOptions.length > 0 ? fieldOptions : null;
    } else if (fieldData.fieldType === 'terms') {
      processedOptions = termsContent;
    }

    const newField = { 
      ...fieldData, 
      fieldOptions: processedOptions,
      sortOrder: currentForm.fields.length 
    };
    const updatedFields = [...(currentForm.fields || []), newField];
    
    if (selectedForm) {
      // Auto-save for existing forms
      try {
        const response = await fetch('/api/admin/forms', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: selectedForm.id,
            ...selectedForm,
            fields: updatedFields
          }),
        });

        if (response.ok) {
          setSelectedForm({ ...selectedForm, fields: updatedFields });
          await fetchForms(); // Refresh the forms list
        } else {
          alert('Failed to save new field');
          return;
        }
      } catch (error) {
        console.error('Error saving field:', error);
        alert('Failed to save new field');
        return;
      }
    } else {
      // Creating new form
      setFormData({
        ...formData,
        fields: updatedFields
      });
    }
    
    setShowFieldEditor(false);
    resetFieldEditor();
  };

  const handleEditField = (index: number) => {
    // During form creation, use formData; during editing, use selectedForm
    const currentForm = selectedForm || formData;
    
    if (!currentForm) return;
    
    const field = currentForm.fields[index];
    setFieldData(field);
    
    // Load existing options based on field type
    if (field.fieldType === 'select' || field.fieldType === 'radio') {
      setFieldOptions(Array.isArray(field.fieldOptions) ? field.fieldOptions : []);
    } else if (field.fieldType === 'terms') {
      setTermsContent(field.fieldOptions || '');
    } else {
      setFieldOptions([]);
      setTermsContent('');
    }
    
    setEditingFieldIndex(index);
    setShowFieldEditor(true);
  };

  const handleUpdateField = async () => {
    // During form creation, use formData; during editing, use selectedForm
    const currentForm = selectedForm || formData;
    
    if (!currentForm || editingFieldIndex === null) return;

    // Prepare field options based on field type
    let processedOptions = null;
    if (fieldData.fieldType === 'select' || fieldData.fieldType === 'radio') {
      processedOptions = fieldOptions.length > 0 ? fieldOptions : null;
    } else if (fieldData.fieldType === 'terms') {
      processedOptions = termsContent;
    }

    const updatedField = { 
      ...fieldData, 
      fieldOptions: processedOptions,
      sortOrder: editingFieldIndex 
    };

    const updatedFields = [...currentForm.fields];
    updatedFields[editingFieldIndex] = updatedField;
    
    if (selectedForm) {
      // Auto-save for existing forms
      try {
        const response = await fetch('/api/admin/forms', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: selectedForm.id,
            ...selectedForm,
            fields: updatedFields
          }),
        });

        if (response.ok) {
          setSelectedForm({ ...selectedForm, fields: updatedFields });
          await fetchForms(); // Refresh the forms list
        } else {
          alert('Failed to save field updates');
          return;
        }
      } catch (error) {
        console.error('Error saving field:', error);
        alert('Failed to save field updates');
        return;
      }
    } else {
      // Creating new form
      setFormData({
        ...formData,
        fields: updatedFields
      });
    }
    
    setShowFieldEditor(false);
    setEditingFieldIndex(null);
    resetFieldEditor();
  };

  const resetFieldEditor = () => {
    setFieldData({
      fieldType: 'text',
      fieldName: '',
      label: '',
      placeholder: '',
      helpText: '',
      isRequired: false,
      fieldWidth: 'full',
      fieldOptions: null,
      sortOrder: 0
    });
    setFieldOptions([]);
    setNewOption('');
    setTermsContent('');
  };

  const handleDeleteField = (index: number) => {
    // During form creation, use formData; during editing, use selectedForm
    const currentForm = selectedForm || formData;
    
    if (!currentForm) return;

    const updatedFields = currentForm.fields.filter((_, i) => i !== index);
    // Update sortOrder for remaining fields
    const reorderedFields = updatedFields.map((field, i) => ({
      ...field,
      sortOrder: i
    }));
    
    if (selectedForm) {
      // Editing existing form
      setSelectedForm({
        ...selectedForm,
        fields: reorderedFields
      });
    } else {
      // Creating new form
      setFormData({
        ...formData,
        fields: reorderedFields
      });
    }
  };

  const handleSaveForm = async () => {
    // Use selectedForm for editing, formData for creating
    const formToSave = selectedForm || formData;
    
    if (!formToSave) return;

    try {
      const url = formToSave.id ? '/api/admin/forms' : '/api/admin/forms';
      const method = formToSave.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formToSave),
      });

      if (response.ok) {
        await fetchForms();
        setShowCreateForm(false);
        setSelectedForm(null);
        // Reset formData for next creation
        setFormData({
          name: '',
          title: '',
          subheading: '',
          successMessage: 'Thank you! Your message has been sent successfully.',
          errorMessage: 'Sorry, there was an error. Please try again.',
          fields: []
        });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save form');
      }
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Failed to save form');
    }
  };

  const handleDeleteForm = async (id: number) => {
    if (!confirm('Are you sure you want to delete this form?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/forms?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchForms();
        if (selectedForm?.id === id) {
          setSelectedForm(null);
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete form');
      }
    } catch (error) {
      console.error('Error deleting form:', error);
      alert('Failed to delete form');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFieldInputChange = (field: string, value: any) => {
    setFieldData(prev => ({ ...prev, [field]: value }));
  };

  const addOption = () => {
    if (newOption.trim()) {
      setFieldOptions(prev => [...prev, newOption.trim()]);
      setNewOption('');
    }
  };

  const removeOption = (index: number) => {
    setFieldOptions(prev => prev.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    setFieldOptions(prev => prev.map((option, i) => i === index ? value : option));
  };

  // Render sortable fields list
  const renderSortableFields = (fields: FormField[], isEditing: boolean = false) => {
    if (!fields || fields.length === 0) return null;

    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Form Fields ({fields.length})</h3>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <GripVertical className="h-4 w-4" />
            Drag to reorder
          </div>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={fields.map((_, index) => `field-${index}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {fields.map((field, index) => (
                <SortableFieldItem
                  key={`field-${index}`}
                  field={field}
                  index={index}
                  onEdit={handleEditField}
                  onDelete={handleDeleteField}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </Card>
    );
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Form Builder</h1>
          <p className="text-gray-600">Create and manage custom forms with predefined field types</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Form
        </Button>
      </div>

      {/* Forms List */}
      {!showCreateForm && !selectedForm && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <Card key={form.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{form.title}</h3>
                  <p className="text-sm text-gray-500">{form.name}</p>
                  {form.subheading && (
                    <p className="text-sm text-gray-600 mt-1">{form.subheading}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedForm(form)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteForm(form.id!)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {form.fields.length} field{form.fields.length !== 1 ? 's' : ''}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Form Editor */}
      {showCreateForm && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Create New Form</h2>
            <Button variant="outline" onClick={() => setShowCreateForm(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>

          {/* Form Details */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Form Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Internal Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Contact Form, Lead Capture"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Title
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Get In Touch"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subheading (Optional)
                </label>
                <Input
                  value={formData.subheading}
                  onChange={(e) => handleInputChange('subheading', e.target.value)}
                  placeholder="e.g., We'd love to hear from you"
                />
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Success Message
                </label>
                <Input
                  value={formData.successMessage}
                  onChange={(e) => handleInputChange('successMessage', e.target.value)}
                  placeholder="Message shown after successful submission"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Error Message
                </label>
                <Input
                  value={formData.errorMessage}
                  onChange={(e) => handleInputChange('errorMessage', e.target.value)}
                  placeholder="Message shown when submission fails"
                />
              </div>
            </div>
          </Card>

          {/* Field Types */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Add Form Fields</h3>
            <FormFieldTypes onFieldSelect={handleFieldSelect} />
          </Card>

          {/* Fields List with Drag and Drop */}
          {renderSortableFields(formData.fields)}

          {/* Enhanced CTA Configuration */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-blue-600" />
              Submit Button (CTA) Configuration
            </h3>
            
            {/* Basic CTA Settings */}
            <div className="space-y-6">
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Button Text
                   </label>
                   <Input
                     value={formData.ctaText || 'Send Message'}
                     onChange={(e) => setFormData({...formData, ctaText: e.target.value})}
                     placeholder="e.g., Send Message, Submit, Get Started"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Button Icon
                   </label>
                   <IconPicker
                     value={formData.ctaIcon || ''}
                     onChange={(iconName) => setFormData({...formData, ctaIcon: iconName})}
                     placeholder="Select an icon (optional)"
                     showLabel={false}
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Loading Text
                   </label>
                   <Input
                     value={formData.ctaLoadingText || 'Sending...'}
                     onChange={(e) => setFormData({...formData, ctaLoadingText: e.target.value})}
                     placeholder="e.g., Sending..., Processing..."
                   />
                 </div>
               </div>

              {/* Button Style Selection with Previews */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Button Style
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'primary', label: 'Primary', description: 'Filled button with gradient' },
                    { value: 'secondary', label: 'Secondary', description: 'Solid color button' },
                    { value: 'outline', label: 'Outline', description: 'Transparent with border' },
                    { value: 'ghost', label: 'Ghost', description: 'Minimal styling' }
                  ].map((style) => (
                    <div
                      key={style.value}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.ctaStyle === style.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setFormData({...formData, ctaStyle: style.value})}
                    >
                      <div className="text-center space-y-2">
                                                 <ButtonStylePreview
                           style={style.value}
                           size={formData.ctaSize || 'medium'}
                           text="Preview"
                           backgroundColor={formData.ctaBackgroundColor}
                           textColor={formData.ctaTextColor}
                           borderColor={formData.ctaBorderColor}
                           icon={formData.ctaIcon}
                         />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{style.label}</p>
                          <p className="text-xs text-gray-500">{style.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Button Size and Width */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Button Size
                  </label>
                  <select
                    value={formData.ctaSize || 'large'}
                    onChange={(e) => setFormData({...formData, ctaSize: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Button Width
                  </label>
                  <select
                    value={formData.ctaWidth || 'auto'}
                    onChange={(e) => setFormData({...formData, ctaWidth: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="auto">Auto Width</option>
                    <option value="fixed">Fixed Width (256px)</option>
                    <option value="full">Full Width</option>
                  </select>
                </div>
              </div>

              {/* CTA Color Customization */}
              <div className="border-t pt-6">
                <h4 className="text-base font-medium text-gray-900 mb-4">Color Customization</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <ColorPicker
                    label="Background Color"
                    value={formData.ctaBackgroundColor || (designSystem?.primaryColor || '#5243E9')}
                    onChange={(color) => setFormData({...formData, ctaBackgroundColor: color})}
                    designSystemColors={getDesignSystemColors()}
                  />
                  <ColorPicker
                    label="Text Color"
                    value={formData.ctaTextColor || '#FFFFFF'}
                    onChange={(color) => setFormData({...formData, ctaTextColor: color})}
                    designSystemColors={getDesignSystemColors()}
                  />
                  <ColorPicker
                    label="Border Color"
                    value={formData.ctaBorderColor || (designSystem?.primaryColor || '#5243E9')}
                    onChange={(color) => setFormData({...formData, ctaBorderColor: color})}
                    designSystemColors={getDesignSystemColors()}
                  />
                </div>
                
                {/* Hover Colors */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Hover States</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ColorPicker
                      label="Hover Background"
                      value={formData.ctaHoverBackgroundColor || (designSystem?.primaryColorDark || '#4338CA')}
                      onChange={(color) => setFormData({...formData, ctaHoverBackgroundColor: color})}
                      designSystemColors={getDesignSystemColors()}
                    />
                    <ColorPicker
                      label="Hover Text Color"
                      value={formData.ctaHoverTextColor || '#FFFFFF'}
                      onChange={(color) => setFormData({...formData, ctaHoverTextColor: color})}
                      designSystemColors={getDesignSystemColors()}
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview */}
              <div className="border-t pt-6">
                <h4 className="text-base font-medium text-gray-900 mb-3">Live Preview</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-center">
                                         <ButtonStylePreview
                       style={formData.ctaStyle || 'primary'}
                       size={formData.ctaSize || 'large'}
                       text={formData.ctaText || 'Send Message'}
                       backgroundColor={formData.ctaBackgroundColor}
                       textColor={formData.ctaTextColor}
                       borderColor={formData.ctaBorderColor}
                       icon={formData.ctaIcon}
                     />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Submission Actions Configuration */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Send className="w-5 h-5 mr-2 text-green-600" />
              Submission Actions
            </h3>
            
            <div className="space-y-6">
              {/* Redirect After Submission */}
              <div>
                <label className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={!!formData.redirectUrl}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({...formData, redirectUrl: ''});
                      } else {
                        const { redirectUrl, ...rest } = formData;
                        setFormData(rest);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Redirect after successful submission
                  </span>
                </label>
                {formData.redirectUrl !== undefined && (
                  <Input
                    value={formData.redirectUrl}
                    onChange={(e) => setFormData({...formData, redirectUrl: e.target.value})}
                    placeholder="https://example.com/thank-you or /thank-you"
                    className="mt-2"
                  />
                )}
              </div>

              {/* Email Notifications */}
              <div>
                <label className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={formData.emailNotification || false}
                    onChange={(e) => setFormData({...formData, emailNotification: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Send email notifications
                  </span>
                </label>
                {formData.emailNotification && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Recipients (comma-separated)
                    </label>
                    <Input
                      value={formData.emailRecipients || ''}
                      onChange={(e) => setFormData({...formData, emailRecipients: e.target.value})}
                      placeholder="admin@example.com, sales@example.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter email addresses separated by commas
                    </p>
                  </div>
                )}
              </div>

              {/* Webhook Integration */}
              <div>
                <label className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={!!formData.webhookUrl}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({...formData, webhookUrl: ''});
                      } else {
                        const { webhookUrl, ...rest } = formData;
                        setFormData(rest);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Send data to webhook URL
                  </span>
                </label>
                {formData.webhookUrl !== undefined && (
                  <div className="mt-2">
                    <Input
                      value={formData.webhookUrl}
                      onChange={(e) => setFormData({...formData, webhookUrl: e.target.value})}
                      placeholder="https://api.example.com/webhook"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Form data will be sent as JSON POST request
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Field Types */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Add Form Fields</h3>
            <FormFieldTypes onFieldSelect={handleFieldSelect} />
          </Card>

          {/* Fields List with Drag and Drop */}
          {renderSortableFields(formData.fields)}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSaveForm} disabled={!formData.name || !formData.title}>
              <Save className="h-4 w-4 mr-2" />
              Save Form
            </Button>
          </div>
        </div>
      )}

      {/* Form Editor - Edit Existing Form */}
      {selectedForm && !showCreateForm && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Edit Form: {selectedForm.title}</h2>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setSelectedForm(null)}>
                <X className="h-4 w-4 mr-2" />
                Back to Forms
              </Button>
              <Button onClick={handleSaveForm}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>

          {/* Form Details */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Form Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Internal Name
                </label>
                <Input
                  value={selectedForm.name}
                  onChange={(e) => setSelectedForm({...selectedForm, name: e.target.value})}
                  placeholder="e.g., Contact Form, Lead Capture"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Title
                </label>
                <Input
                  value={selectedForm.title}
                  onChange={(e) => setSelectedForm({...selectedForm, title: e.target.value})}
                  placeholder="e.g., Get In Touch"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subheading (Optional)
                </label>
                <Input
                  value={selectedForm.subheading || ''}
                  onChange={(e) => setSelectedForm({...selectedForm, subheading: e.target.value})}
                  placeholder="e.g., We'd love to hear from you"
                />
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Success Message
                </label>
                <Input
                  value={selectedForm.successMessage}
                  onChange={(e) => setSelectedForm({...selectedForm, successMessage: e.target.value})}
                  placeholder="Message shown after successful submission"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Error Message
                </label>
                <Input
                  value={selectedForm.errorMessage}
                  onChange={(e) => setSelectedForm({...selectedForm, errorMessage: e.target.value})}
                  placeholder="Message shown when submission fails"
                />
              </div>
            </div>
          </Card>

          {/* Enhanced CTA Configuration */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-blue-600" />
              Submit Button (CTA) Configuration
            </h3>
            
            {/* Basic CTA Settings */}
            <div className="space-y-6">
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Button Text
                 </label>
                 <Input
                   value={selectedForm.ctaText || 'Send Message'}
                   onChange={(e) => setSelectedForm({...selectedForm, ctaText: e.target.value})}
                   placeholder="e.g., Send Message, Submit, Get Started"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Button Icon
                 </label>
                 <IconPicker
                   value={selectedForm.ctaIcon || ''}
                   onChange={(iconName) => setSelectedForm({...selectedForm, ctaIcon: iconName})}
                   placeholder="Select an icon (optional)"
                   showLabel={false}
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Loading Text
                 </label>
                 <Input
                   value={selectedForm.ctaLoadingText || 'Sending...'}
                   onChange={(e) => setSelectedForm({...selectedForm, ctaLoadingText: e.target.value})}
                   placeholder="e.g., Sending..., Processing..."
                 />
               </div>
             </div>

              {/* Button Style Selection with Previews */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Button Style
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'primary', label: 'Primary', description: 'Filled button with gradient' },
                    { value: 'secondary', label: 'Secondary', description: 'Solid color button' },
                    { value: 'outline', label: 'Outline', description: 'Transparent with border' },
                    { value: 'ghost', label: 'Ghost', description: 'Minimal styling' }
                  ].map((style) => (
                    <div
                      key={style.value}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedForm.ctaStyle === style.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedForm({...selectedForm, ctaStyle: style.value})}
                    >
                      <div className="text-center space-y-2">
                                                 <ButtonStylePreview
                           style={style.value}
                           size={selectedForm.ctaSize || 'medium'}
                           text="Preview"
                           backgroundColor={selectedForm.ctaBackgroundColor}
                           textColor={selectedForm.ctaTextColor}
                           borderColor={selectedForm.ctaBorderColor}
                           icon={selectedForm.ctaIcon}
                         />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{style.label}</p>
                          <p className="text-xs text-gray-500">{style.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Button Size and Width */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Button Size
                  </label>
                  <select
                    value={selectedForm.ctaSize || 'large'}
                    onChange={(e) => setSelectedForm({...selectedForm, ctaSize: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Button Width
                  </label>
                  <select
                    value={selectedForm.ctaWidth || 'auto'}
                    onChange={(e) => setSelectedForm({...selectedForm, ctaWidth: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="auto">Auto Width</option>
                    <option value="fixed">Fixed Width (256px)</option>
                    <option value="full">Full Width</option>
                  </select>
                </div>
              </div>

              {/* CTA Color Customization */}
              <div className="border-t pt-6">
                <h4 className="text-base font-medium text-gray-900 mb-4">Color Customization</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <ColorPicker
                    label="Background Color"
                    value={selectedForm.ctaBackgroundColor || (designSystem?.primaryColor || '#5243E9')}
                    onChange={(color) => setSelectedForm({...selectedForm, ctaBackgroundColor: color})}
                    designSystemColors={getDesignSystemColors()}
                  />
                  <ColorPicker
                    label="Text Color"
                    value={selectedForm.ctaTextColor || '#FFFFFF'}
                    onChange={(color) => setSelectedForm({...selectedForm, ctaTextColor: color})}
                    designSystemColors={getDesignSystemColors()}
                  />
                  <ColorPicker
                    label="Border Color"
                    value={selectedForm.ctaBorderColor || (designSystem?.primaryColor || '#5243E9')}
                    onChange={(color) => setSelectedForm({...selectedForm, ctaBorderColor: color})}
                    designSystemColors={getDesignSystemColors()}
                  />
                </div>
                
                {/* Hover Colors */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Hover States</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ColorPicker
                      label="Hover Background"
                      value={selectedForm.ctaHoverBackgroundColor || (designSystem?.primaryColorDark || '#4338CA')}
                      onChange={(color) => setSelectedForm({...selectedForm, ctaHoverBackgroundColor: color})}
                      designSystemColors={getDesignSystemColors()}
                    />
                    <ColorPicker
                      label="Hover Text Color"
                      value={selectedForm.ctaHoverTextColor || '#FFFFFF'}
                      onChange={(color) => setSelectedForm({...selectedForm, ctaHoverTextColor: color})}
                      designSystemColors={getDesignSystemColors()}
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview */}
              <div className="border-t pt-6">
                <h4 className="text-base font-medium text-gray-900 mb-3">Live Preview</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-center">
                                         <ButtonStylePreview
                       style={selectedForm.ctaStyle || 'primary'}
                       size={selectedForm.ctaSize || 'large'}
                       text={selectedForm.ctaText || 'Send Message'}
                       backgroundColor={selectedForm.ctaBackgroundColor}
                       textColor={selectedForm.ctaTextColor}
                       borderColor={selectedForm.ctaBorderColor}
                       icon={selectedForm.ctaIcon}
                     />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Submission Actions Configuration */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Send className="w-5 h-5 mr-2 text-green-600" />
              Submission Actions
            </h3>
            
            <div className="space-y-6">
              {/* Redirect After Submission */}
              <div>
                <label className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={!!selectedForm.redirectUrl}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedForm({...selectedForm, redirectUrl: ''});
                      } else {
                        const { redirectUrl, ...rest } = selectedForm;
                        setSelectedForm(rest);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Redirect after successful submission
                  </span>
                </label>
                {selectedForm.redirectUrl !== undefined && (
                  <Input
                    value={selectedForm.redirectUrl}
                    onChange={(e) => setSelectedForm({...selectedForm, redirectUrl: e.target.value})}
                    placeholder="https://example.com/thank-you or /thank-you"
                    className="mt-2"
                  />
                )}
              </div>

              {/* Email Notifications */}
              <div>
                <label className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={selectedForm.emailNotification || false}
                    onChange={(e) => setSelectedForm({...selectedForm, emailNotification: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Send email notifications
                  </span>
                </label>
                {selectedForm.emailNotification && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Recipients (comma-separated)
                    </label>
                    <Input
                      value={selectedForm.emailRecipients || ''}
                      onChange={(e) => setSelectedForm({...selectedForm, emailRecipients: e.target.value})}
                      placeholder="admin@example.com, sales@example.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter email addresses separated by commas
                    </p>
                  </div>
                )}
              </div>

              {/* Webhook Integration */}
              <div>
                <label className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={!!selectedForm.webhookUrl}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedForm({...selectedForm, webhookUrl: ''});
                      } else {
                        const { webhookUrl, ...rest } = selectedForm;
                        setSelectedForm(rest);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Send data to webhook URL
                  </span>
                </label>
                {selectedForm.webhookUrl !== undefined && (
                  <div className="mt-2">
                    <Input
                      value={selectedForm.webhookUrl}
                      onChange={(e) => setSelectedForm({...selectedForm, webhookUrl: e.target.value})}
                      placeholder="https://api.example.com/webhook"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Form data will be sent as JSON POST request
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Captcha Configuration */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-purple-600" />
              Captcha Security
            </h3>
            
            <div className="space-y-6">
              {/* Enable Captcha */}
              <div>
                <label className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={selectedForm.enableCaptcha || false}
                    onChange={(e) => setSelectedForm({...selectedForm, enableCaptcha: e.target.checked})}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Enable captcha verification
                  </span>
                </label>
                <p className="text-xs text-gray-500 ml-6">
                  Protect your form from spam and automated submissions
                </p>
              </div>

              {/* Captcha Configuration Options */}
              {selectedForm.enableCaptcha && (
                <div className="space-y-4 pl-6 border-l-2 border-purple-100">
                  {/* Captcha Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Captcha Type
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { value: 'math', label: 'Math Problem', description: 'Simple arithmetic', icon: 'Calculator' },
                        { value: 'puzzle', label: 'Word Puzzle', description: 'Unscramble letters', icon: 'Puzzle' },
                        { value: 'drag', label: 'Drag & Drop', description: 'Interactive challenge', icon: 'Target' },
                        { value: 'image', label: 'Pattern Match', description: 'Visual recognition', icon: 'Grid3X3' }
                      ].map((type) => (
                        <div
                          key={type.value}
                          className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
                            selectedForm.captchaType === type.value
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedForm({...selectedForm, captchaType: type.value})}
                        >
                          <div className="text-2xl mb-1 flex justify-center">
                            {type.icon === 'Calculator' && <Calculator className="w-6 h-6 text-purple-600" />}
                            {type.icon === 'Puzzle' && <Puzzle className="w-6 h-6 text-purple-600" />}
                            {type.icon === 'Target' && <Target className="w-6 h-6 text-purple-600" />}
                            {type.icon === 'Grid3X3' && <Grid3X3 className="w-6 h-6 text-purple-600" />}
                          </div>
                          <p className="text-sm font-medium text-gray-900">{type.label}</p>
                          <p className="text-xs text-gray-500">{type.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Level
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'easy', label: 'Easy', description: 'Basic challenges', color: 'green' },
                        { value: 'medium', label: 'Medium', description: 'Moderate difficulty', color: 'yellow' },
                        { value: 'hard', label: 'Hard', description: 'Complex challenges', color: 'red' }
                      ].map((level) => (
                        <div
                          key={level.value}
                          className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
                            selectedForm.captchaDifficulty === level.value
                              ? `border-${level.color}-500 bg-${level.color}-50`
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedForm({...selectedForm, captchaDifficulty: level.value})}
                        >
                          <p className="text-sm font-medium text-gray-900">{level.label}</p>
                          <p className="text-xs text-gray-500">{level.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Captcha Preview/Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Current Configuration</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Type:</strong> {selectedForm.captchaType || 'math'} captcha</p>
                      <p><strong>Difficulty:</strong> {selectedForm.captchaDifficulty || 'medium'}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        The captcha will appear after form fields and must be completed before submission.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Field Types */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Add Form Fields</h3>
            <FormFieldTypes onFieldSelect={handleFieldSelect} />
          </Card>

          {/* Fields List with Drag and Drop */}
          {renderSortableFields(selectedForm.fields, true)}
        </div>
      )}

      {/* Field Editor Modal */}
      {showFieldEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">Configure Field</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Field Label
                  </label>
                  <Input
                    value={fieldData.label}
                    onChange={(e) => handleFieldInputChange('label', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Field Name
                  </label>
                  <Input
                    value={fieldData.fieldName}
                    onChange={(e) => handleFieldInputChange('fieldName', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Placeholder
                </label>
                <Input
                  value={fieldData.placeholder}
                  onChange={(e) => handleFieldInputChange('placeholder', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Help Text
                </label>
                <Input
                  value={fieldData.helpText}
                  onChange={(e) => handleFieldInputChange('helpText', e.target.value)}
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="required"
                  checked={fieldData.isRequired}
                  onChange={(e) => handleFieldInputChange('isRequired', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="required" className="text-sm font-medium text-gray-700">
                  Required field
                </label>
              </div>

              {/* Options Management for Select and Radio Fields */}
              {(fieldData.fieldType === 'select' || fieldData.fieldType === 'radio') && (
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options
                  </label>
                  
                  {/* Add New Option */}
                  <div className="flex gap-2 mb-3">
                    <Input
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      placeholder="Enter option text"
                      onKeyPress={(e) => e.key === 'Enter' && addOption()}
                    />
                    <Button onClick={addOption} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Options List */}
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {fieldOptions.map((option, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Input
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeOption(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  {fieldOptions.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No options added yet</p>
                  )}
                </div>
              )}

              {/* Terms Content for Terms Field */}
              {fieldData.fieldType === 'terms' && (
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Terms & Conditions Content
                  </label>
                  <textarea
                    value={termsContent}
                    onChange={(e) => setTermsContent(e.target.value)}
                    placeholder="Enter the full terms and conditions text that will be displayed in the modal..."
                    rows={6}
                    className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This content will be displayed in a modal when users click "Read Terms"
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setShowFieldEditor(false)}>
                Cancel
              </Button>
              <Button onClick={editingFieldIndex !== null ? handleUpdateField : handleAddField}>
                {editingFieldIndex !== null ? 'Update' : 'Add'} Field
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 