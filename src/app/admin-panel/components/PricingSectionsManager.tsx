'use client';

import { useState, useEffect } from 'react';
import { useAdminApi } from '@/hooks/useApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Layout,
  Grid,
  List,
  Eye,
  EyeOff,
  Users,
  Star,
  ArrowUpDown,
  Check,
  Settings,
  DollarSign,
  Crown,
  ChevronUp,
  ChevronDown,
  Package,
  CheckCircle2
} from 'lucide-react';
import type { 
  PricingSection, 
  PricingSectionPlan, 
  PlanDB,
  PricingSectionLayout 
} from '@/types';

interface PricingSectionsManagerProps {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

const layoutOptions: { value: PricingSectionLayout; label: string; description: string; icon: any }[] = [
  { 
    value: 'standard', 
    label: 'Standard', 
    description: 'Traditional 3-column layout',
    icon: Grid
  },
  { 
    value: 'comparison', 
    label: 'Comparison', 
    description: 'Feature comparison table',
    icon: List
  },
  { 
    value: 'cards', 
    label: 'Cards', 
    description: 'Card-based layout with shadows',
    icon: Grid
  },
  { 
    value: 'grid', 
    label: 'Grid', 
    description: 'Grid layout for many plans',
    icon: Grid
  },
  { 
    value: 'list', 
    label: 'List', 
    description: 'Vertical list layout',
    icon: List
  },
  { 
    value: 'slider', 
    label: 'Slider', 
    description: 'Carousel/slider layout',
    icon: ArrowUpDown
  }
];

export default function PricingSectionsManager({ onSuccess, onError }: PricingSectionsManagerProps) {
  const { get, post, put, delete: del } = useAdminApi();
  const [loading, setLoading] = useState(false);
  
  const [pricingSections, setPricingSections] = useState<PricingSection[]>([]);
  const [availablePlans, setAvailablePlans] = useState<PlanDB[]>([]);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  
  const [newSection, setNewSection] = useState({
    name: '',
    heading: '',
    subheading: '',
    layoutType: 'standard' as PricingSectionLayout,
    isActive: true
  });
  
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const [editSectionData, setEditSectionData] = useState<any>(null);
  
  const showSuccess = (message: string) => {
    onSuccess?.(message);
  };

  const showError = (message: string) => {
    onError?.(message);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [sectionsData, plansData] = await Promise.all([
        get('/api/admin/pricing-sections'),
        get('/api/admin/plans')
      ]);
      
      setPricingSections((sectionsData as PricingSection[]) || []);
      setAvailablePlans(((plansData as PlanDB[]) || []).filter(plan => plan.isActive));
    } catch (error) {
      console.error('Failed to load pricing sections data:', error);
      showError('Failed to load pricing sections data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSection = async () => {
    if (!newSection.name.trim() || !newSection.heading.trim()) {
      showError('Name and heading are required');
      return;
    }

    try {
      setLoading(true);
      const createdSection = await post('/api/admin/pricing-sections', newSection) as PricingSection;
      setPricingSections([...pricingSections, createdSection]);
      setNewSection({
        name: '',
        heading: '',
        subheading: '',
        layoutType: 'standard',
        isActive: true
      });
      showSuccess(`Pricing section "${createdSection.name}" created successfully!`);
    } catch (error) {
      console.error('Failed to create pricing section:', error);
      showError('Failed to create pricing section');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSection = (section: PricingSection) => {
    setEditingSection(section.id);
    setEditSectionData({
      name: section.name,
      heading: section.heading,
      subheading: section.subheading || '',
      layoutType: section.layoutType,
      isActive: section.isActive
    });
  };

  const handleUpdateSection = async () => {
    if (!editingSection || !editSectionData) return;

    try {
      setLoading(true);
      const updatedSection = await put('/api/admin/pricing-sections', {
        id: editingSection,
        ...editSectionData
      }) as PricingSection;

      setPricingSections(pricingSections.map(section => 
        section.id === editingSection ? updatedSection : section
      ));

      setEditingSection(null);
      setEditSectionData(null);
      showSuccess(`Pricing section "${editSectionData.name}" updated successfully!`);
    } catch (error) {
      console.error('Failed to update pricing section:', error);
      showError('Failed to update pricing section');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
    setEditSectionData(null);
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (!confirm('Are you sure you want to delete this pricing section?')) return;

    try {
      setLoading(true);
      await del(`/api/admin/pricing-sections?id=${sectionId}`);
      setPricingSections(pricingSections.filter(section => section.id !== sectionId));
      showSuccess('Pricing section deleted successfully');
    } catch (error) {
      console.error('Failed to delete pricing section:', error);
      showError('Failed to delete pricing section');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlanToSection = async (sectionId: number, planId: string) => {
    try {
      setLoading(true);
      const newSectionPlan = await post('/api/admin/pricing-section-plans', {
        pricingSectionId: sectionId,
        planId,
        sortOrder: 0,
        isVisible: true
      }) as PricingSectionPlan;

      // Update the local state
      setPricingSections(pricingSections.map(section => 
        section.id === sectionId 
          ? { ...section, sectionPlans: [...section.sectionPlans, newSectionPlan] }
          : section
      ));

      showSuccess('Plan added to pricing section successfully');
    } catch (error) {
      console.error('Failed to add plan to section:', error);
      showError('Failed to add plan to pricing section');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePlanFromSection = async (sectionPlanId: number, sectionId: number) => {
    try {
      setLoading(true);
      await del(`/api/admin/pricing-section-plans?id=${sectionPlanId}`);

      // Update the local state
      setPricingSections(pricingSections.map(section => 
        section.id === sectionId 
          ? { 
              ...section, 
              sectionPlans: section.sectionPlans.filter(sp => sp.id !== sectionPlanId) 
            }
          : section
      ));

      showSuccess('Plan removed from pricing section successfully');
    } catch (error) {
      console.error('Failed to remove plan from section:', error);
      showError('Failed to remove plan from pricing section');
    } finally {
      setLoading(false);
    }
  };

  const getAvailablePlansForSection = (sectionId: number) => {
    const section = pricingSections.find(s => s.id === sectionId);
    if (!section) return availablePlans;

    const usedPlanIds = section.sectionPlans.map(sp => sp.planId);
    return availablePlans.filter(plan => !usedPlanIds.includes(plan.id));
  };

  const getLayoutIcon = (layoutType: string) => {
    const layout = layoutOptions.find(l => l.value === layoutType);
    return layout ? layout.icon : Grid;
  };

  const formatPlanPrice = (plan: PlanDB) => {
    if (!plan.pricing || plan.pricing.length === 0) return 'Custom';
    
    // Get the first pricing (usually monthly)
    const pricing = plan.pricing[0];
    const price = pricing.priceCents / 100;
    return `$${price}${price === Math.floor(price) ? '' : '.00'}`;
  };

  const getPlanFeatureCount = (plan: PlanDB) => {
    let count = 0;
    if (plan.features) count += plan.features.length;
    if (plan.basicFeatures) count += plan.basicFeatures.length;
    if (plan.featureLimits) count += plan.featureLimits.length;
    return count;
  };

  if (loading && pricingSections.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pricing sections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create New Pricing Section */}
      <Card className="p-8 border-2 border-pink-100 bg-gradient-to-br from-white to-pink-50 shadow-xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Create New Pricing Section</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input
            placeholder="Internal Name (e.g., 'Home Page Pricing')"
            value={newSection.name}
            onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
          />
          <Input
            placeholder="Display Heading (e.g., 'Choose Your Plan')"
            value={newSection.heading}
            onChange={(e) => setNewSection({ ...newSection, heading: e.target.value })}
          />
        </div>

        <div className="mb-4">
          <Input
            placeholder="Subheading (optional)"
            value={newSection.subheading}
            onChange={(e) => setNewSection({ ...newSection, subheading: e.target.value })}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Layout Type</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {layoutOptions.map((layout) => {
              const IconComponent = layout.icon;
              const isSelected = newSection.layoutType === layout.value;
              return (
                <button
                  key={layout.value}
                  onClick={() => setNewSection({ ...newSection, layoutType: layout.value })}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-pink-500 bg-pink-50 text-pink-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <IconComponent className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">{layout.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{layout.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleCreateSection}
            disabled={loading || !newSection.name.trim() || !newSection.heading.trim()}
            className="bg-gradient-to-r from-pink-600 to-purple-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Pricing Section
          </Button>
        </div>
      </Card>

      {/* Existing Pricing Sections */}
      <div className="grid grid-cols-1 gap-6">
        {pricingSections.map((section) => {
          const isExpanded = expandedSection === section.id;
          const isEditing = editingSection === section.id;
          const LayoutIcon = getLayoutIcon(section.layoutType);
          const availablePlansForSection = getAvailablePlansForSection(section.id);
          
          return (
            <Card key={section.id} className="border-2 border-gray-100 hover:border-pink-200 transition-colors">
              {/* Section Header */}
              <div className="p-6 bg-gradient-to-r from-gray-50 to-pink-50 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-pink-100 rounded-xl">
                      <LayoutIcon className="w-6 h-6 text-pink-600" />
                    </div>
                    <div>
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            value={editSectionData?.name || ''}
                            onChange={(e) => setEditSectionData({ ...editSectionData, name: e.target.value })}
                            placeholder="Section name"
                            className="font-semibold"
                          />
                          <Input
                            value={editSectionData?.heading || ''}
                            onChange={(e) => setEditSectionData({ ...editSectionData, heading: e.target.value })}
                            placeholder="Display heading"
                          />
                          <Input
                            value={editSectionData?.subheading || ''}
                            onChange={(e) => setEditSectionData({ ...editSectionData, subheading: e.target.value })}
                            placeholder="Subheading (optional)"
                          />
                        </div>
                      ) : (
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{section.name}</h3>
                          <p className="text-gray-600 font-medium">"{section.heading}"</p>
                          {section.subheading && (
                            <p className="text-sm text-gray-500">"{section.subheading}"</p>
                          )}
                          <div className="flex items-center space-x-3 mt-2">
                            <Badge variant={section.isActive ? 'default' : 'secondary'}>
                              {section.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {section.layoutType}
                            </Badge>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700">
                              {section.sectionPlans.length} plans
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isEditing ? (
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleUpdateSection}
                          size="sm"
                          className="bg-green-600 text-white hover:bg-green-700"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          size="sm"
                          variant="outline"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                          size="sm"
                          className={`${isExpanded ? 'bg-pink-600 text-white' : 'bg-white border-pink-300 text-pink-700 hover:bg-pink-50'}`}
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-2" />
                              Hide Plans
                            </>
                          ) : (
                            <>
                              <Package className="w-4 h-4 mr-2" />
                              Manage Plans
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleEditSection(section)}
                          size="sm"
                          variant="outline"
                          className="hover:bg-blue-50 text-blue-700"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteSection(section.id)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50 border-red-200"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Plan Management Section */}
              {isExpanded && (
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-gray-900 flex items-center">
                      <Settings className="w-5 h-5 mr-2 text-pink-600" />
                      Plan Management
                    </h4>
                    <div className="text-sm text-gray-500">
                      {section.sectionPlans.length} of {availablePlans.length} plans selected
                    </div>
                  </div>

                  {/* Available Plans Grid */}
                  {availablePlansForSection.length > 0 && (
                    <div>
                      <h5 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                        <Plus className="w-4 h-4 mr-2 text-green-600" />
                        Available Plans to Add ({availablePlansForSection.length})
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {availablePlansForSection.map((plan) => (
                          <Card
                            key={plan.id}
                            className="p-4 hover:shadow-md border-2 border-dashed border-gray-200 hover:border-green-300 transition-all cursor-pointer bg-gradient-to-br from-white to-green-50/30"
                            onClick={() => handleAddPlanToSection(section.id, plan.id)}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h6 className="font-semibold text-gray-900">{plan.name}</h6>
                                  {plan.isPopular && (
                                    <Crown className="w-4 h-4 text-yellow-500 fill-current" />
                                  )}
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <DollarSign className="w-3 h-3" />
                                  <span className="font-medium">{formatPlanPrice(plan)}</span>
                                  <span>•</span>
                                  <span>{getPlanFeatureCount(plan)} features</span>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                className="bg-green-600 text-white hover:bg-green-700 ml-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddPlanToSection(section.id, plan.id);
                                }}
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add
                              </Button>
                            </div>
                            {plan.description && (
                              <p className="text-xs text-gray-500 line-clamp-2">{plan.description}</p>
                            )}
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                              <Badge variant={plan.isActive ? 'default' : 'secondary'} className="text-xs">
                                {plan.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                              <div className="text-xs text-gray-400">
                                Position: {plan.position}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Current Plans in Section */}
                  <div>
                    <h5 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-2 text-blue-600" />
                      Plans in This Section ({section.sectionPlans.length})
                    </h5>
                    
                    {section.sectionPlans.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {section.sectionPlans.map((sectionPlan) => (
                          <Card
                            key={sectionPlan.id}
                            className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h6 className="font-semibold text-gray-900">{sectionPlan.plan.name}</h6>
                                  {sectionPlan.plan.isPopular && (
                                    <Crown className="w-4 h-4 text-yellow-500 fill-current" />
                                  )}
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <DollarSign className="w-3 h-3" />
                                  <span className="font-medium">{formatPlanPrice(sectionPlan.plan)}</span>
                                  <span>•</span>
                                  <span>{getPlanFeatureCount(sectionPlan.plan)} features</span>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:bg-red-50 border-red-200 ml-2"
                                onClick={() => handleRemovePlanFromSection(sectionPlan.id, section.id)}
                              >
                                <X className="w-3 h-3 mr-1" />
                                Remove
                              </Button>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Badge variant={sectionPlan.isVisible ? 'default' : 'secondary'} className="text-xs">
                                  {sectionPlan.isVisible ? 'Visible' : 'Hidden'}
                                </Badge>
                                {sectionPlan.plan.isPopular && (
                                  <Badge className="text-xs bg-yellow-100 text-yellow-800">Popular</Badge>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                Order: {sectionPlan.sortOrder}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="p-8 text-center border-2 border-dashed border-gray-200 bg-gray-50">
                        <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <h6 className="font-semibold text-gray-700 mb-1">No Plans Added Yet</h6>
                        <p className="text-sm text-gray-500 mb-4">
                          Add plans from the available list above to populate this pricing section
                        </p>
                        {availablePlansForSection.length > 0 && (
                          <Button
                            size="sm"
                            onClick={() => handleAddPlanToSection(section.id, availablePlansForSection[0].id)}
                            className="bg-pink-600 text-white hover:bg-pink-700"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add First Plan
                          </Button>
                        )}
                      </Card>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {pricingSections.length === 0 && !loading && (
        <Card className="p-12 text-center">
          <Layout className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pricing Sections Yet</h3>
          <p className="text-gray-600 mb-6">Create your first pricing section to get started organizing your pricing displays.</p>
        </Card>
      )}
    </div>
  );
}