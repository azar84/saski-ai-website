'use client';

import { useState, useEffect } from 'react';
import { useAdminApi } from '@/hooks/useApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import IconPicker, { iconLibrary } from '@/components/ui/IconPicker';
import {
  Users,
  Database,
  ArrowUpDown,
  Globe,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Zap,
  Phone,
  HardDrive,
  Settings,
  Check,
  Eye,
  DollarSign,
  CheckCircle,
  ArrowRight
  } from 'lucide-react';

const IconDisplay = ({ iconName, iconUrl, className = "w-5 h-5 text-gray-600" }: { 
  iconName: string; 
  iconUrl?: string; 
  className?: string;
}) => {
  // If iconUrl is provided, use the PNG image
  if (iconUrl) {
    return <img src={iconUrl} alt={iconName} className={`${className} object-contain`} />;
  }
  
  // Find the icon in the library
  const iconData = iconLibrary.find(icon => icon.name === iconName);
  if (iconData) {
    const IconComponent = iconData.component;
    return <IconComponent className={className} />;
  }
  
  // Fallback to Settings icon
  return <Settings className={className} />;
};

const getIcon = (iconName: string, iconUrl?: string) => {
  return <IconDisplay iconName={iconName} iconUrl={iconUrl} />;
};

export default function ConfigurablePricingManager() {
  const { get, post, put, delete: del } = useAdminApi();
  const [activeTab, setActiveTab] = useState('plans');
  const [loading, setLoading] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [plans, setPlans] = useState<any[]>([]);
  const [planFeatureTypes, setPlanFeatureTypes] = useState<any[]>([]);
  const [planLimits, setPlanLimits] = useState<any[]>([]);
  const [billingCycles, setBillingCycles] = useState<any[]>([]);
  const [planPricing, setPlanPricing] = useState<any[]>([]);
  const [basicFeatures, setBasicFeatures] = useState<any[]>([]);
  const [planBasicFeatures, setPlanBasicFeatures] = useState<any[]>([]);

  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    isActive: true,
    isPopular: false,
    position: 0,
    basicFeatures: [] as string[]
  });

  const [newPlanPricing, setNewPlanPricing] = useState<{[key: string]: {priceCents: number, stripePriceId: string}}>({});

  const [newFeatureType, setNewFeatureType] = useState({
    name: '',
    unit: '',
    description: '',
    icon: 'Settings',
    iconUrl: '',
    isActive: true,
    sortOrder: 0
  });

  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>('');
  
  const [editingFeatureType, setEditingFeatureType] = useState<string | null>(null);
  const [editFeatureTypeData, setEditFeatureTypeData] = useState<any>(null);
  const [editIconFile, setEditIconFile] = useState<File | null>(null);
  const [editIconPreview, setEditIconPreview] = useState<string>('');

  const [newBasicFeature, setNewBasicFeature] = useState({
    name: '',
    description: '',
    isActive: true,
    sortOrder: 0
  });

  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [editPlanData, setEditPlanData] = useState<any>(null);
  const [editPlanPricing, setEditPlanPricing] = useState<{[key: string]: {priceCents: number, stripePriceId: string}}>({});
  const [selectedBillingCycle, setSelectedBillingCycle] = useState('');

  // Toast notification functions
  const showSuccess = (message: string) => {
    setToast({ message, type: 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  const showError = (message: string) => {
    setToast({ message, type: 'error' });
    setTimeout(() => setToast(null), 5000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [plansData, featureTypesData, limitsData, cyclesData, pricingData, basicFeaturesData, planBasicFeaturesData] = await Promise.all([
        get('/api/admin/plans'),
        get('/api/admin/plan-feature-types'),
        get('/api/admin/plan-feature-limits'),
        get('/api/admin/billing-cycles'),
        get('/api/admin/plan-pricing'),
        get('/api/admin/basic-features').catch(() => []),
        get('/api/admin/plan-basic-features').catch(() => [])
      ]);
      
      setPlans((plansData as any[]) || []);
      setPlanFeatureTypes((featureTypesData as any[]) || []);
      setPlanLimits((limitsData as any[]) || []);
      setBillingCycles((cyclesData as any[]) || []);
      setPlanPricing((pricingData as any[]) || []);
      setBasicFeatures((basicFeaturesData as any[]) || []);
      setPlanBasicFeatures((planBasicFeaturesData as any[]) || []);

      if (cyclesData && Array.isArray(cyclesData) && cyclesData.length > 0) {
        setSelectedBillingCycle(cyclesData.find((c: any) => c.isDefault)?.id || cyclesData[0].id);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getPlanLimit = (planId: string, featureTypeId: string) => {
    return planLimits.find(l => l.planId === planId && l.featureTypeId === featureTypeId);
  };

  const getPlanPricing = (planId: string, billingCycleId: string) => {
    return planPricing.find(p => p.planId === planId && p.billingCycleId === billingCycleId);
  };

  const formatPrice = (priceCents: number) => {
    return `$${(priceCents / 100).toFixed(2)}`;
  };

  const handleCreatePlan = async () => {
    try {
      setLoading(true);
      const createdPlan = await post('/api/admin/plans', newPlan) as any;
      
      for (const cycle of billingCycles) {
        const pricingData = newPlanPricing[cycle.id];
        if (pricingData && (pricingData.priceCents > 0 || pricingData.stripePriceId)) {
          await post('/api/admin/plan-pricing', {
            planId: createdPlan.id,
            billingCycleId: cycle.id,
            priceCents: pricingData.priceCents || 0,
            stripePriceId: pricingData.stripePriceId || ''
          });
        }
      }
      
      // Assign basic features to the plan
      if (newPlan.basicFeatures && newPlan.basicFeatures.length > 0) {
        for (const featureId of newPlan.basicFeatures) {
          await post('/api/admin/plan-basic-features', {
            planId: createdPlan.id,
            basicFeatureId: featureId
          });
        }
      }
      
      setPlans([...plans, createdPlan]);
      setNewPlan({ name: '', description: '', isActive: true, isPopular: false, position: 0, basicFeatures: [] });
      setNewPlanPricing({});
      await loadData();
      showSuccess(`Plan "${createdPlan.name}" created successfully!`);
    } catch (error) {
      console.error('Failed to create plan:', error);
      showError('Failed to create plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPlan = (plan: any) => {
    setEditingPlan(plan.id);
    setEditPlanData({
      name: plan.name,
      description: plan.description,
      isActive: plan.isActive,
      isPopular: plan.isPopular,
      position: plan.position
    });
    
    const pricingData: {[key: string]: {priceCents: number, stripePriceId: string}} = {};
    billingCycles.forEach(cycle => {
      const pricing = getPlanPricing(plan.id, cycle.id);
      pricingData[cycle.id] = {
        priceCents: pricing?.priceCents || 0,
        stripePriceId: pricing?.stripePriceId || ''
      };
    });
    setEditPlanPricing(pricingData);
  };

  const handleUpdatePlan = async () => {
    if (!editingPlan || !editPlanData) return;
    
    try {
      setLoading(true);
      
      await put('/api/admin/plans', {
        id: editingPlan,
        ...editPlanData
      });
      
      for (const cycle of billingCycles) {
        const existingPricing = getPlanPricing(editingPlan, cycle.id);
        const newPricingData = {
          planId: editingPlan,
          billingCycleId: cycle.id,
          priceCents: editPlanPricing[cycle.id]?.priceCents || 0,
          stripePriceId: editPlanPricing[cycle.id]?.stripePriceId || ''
        };
        
        if (existingPricing) {
          await put('/api/admin/plan-pricing', {
            id: existingPricing.id,
            ...newPricingData
          });
        } else {
          await post('/api/admin/plan-pricing', newPricingData);
        }
      }
      
      setEditingPlan(null);
      setEditPlanData(null);
      setEditPlanPricing({});
      await loadData();
      showSuccess(`Plan "${editPlanData.name}" updated successfully!`);
    } catch (error) {
      console.error('Failed to update plan:', error);
      showError('Failed to update plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingPlan(null);
    setEditPlanData(null);
    setEditPlanPricing({});
  };

  const handleIconFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setIconPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadIconFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'feature-icon');
    
    const response = await fetch('/api/admin/media-library', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload icon');
    }
    
    const result = await response.json();
    return result.data.publicUrl;
  };

  const handleCreateFeatureType = async () => {
    try {
      let iconUrl = '';
      
      // Upload icon file if provided
      if (iconFile) {
        iconUrl = await uploadIconFile(iconFile);
      }
      
      const featureTypeData = {
        ...newFeatureType,
        iconUrl: iconUrl || newFeatureType.iconUrl
      };
      
      const createdType = await post('/api/admin/plan-feature-types', featureTypeData);
      setPlanFeatureTypes([...planFeatureTypes, createdType]);
      setNewFeatureType({ name: '', unit: '', description: '', icon: 'Settings', iconUrl: '', isActive: true, sortOrder: 0 });
      setIconFile(null);
      setIconPreview('');
      showSuccess(`Feature type "${createdType.name}" created successfully!`);
    } catch (error) {
      console.error('Failed to create feature type:', error);
      showError('Failed to create feature type. Please try again.');
    }
  };

  const handleUpdateLimit = async (planId: string, featureTypeId: string, value: number, isUnlimited: boolean) => {
    try {
      const existingLimit = getPlanLimit(planId, featureTypeId);
      const featureType = planFeatureTypes.find(ft => ft.id === featureTypeId);
      const plan = plans.find(p => p.id === planId);
      
      if (existingLimit) {
        const updatedLimit = await put('/api/admin/plan-feature-limits', {
          id: existingLimit.id,
          value: isUnlimited ? '' : value.toString(),
          isUnlimited
        });
        
        setPlanLimits(planLimits.map(l => 
          l.id === existingLimit.id ? updatedLimit : l
        ));
      } else {
        const newLimit = await post('/api/admin/plan-feature-limits', {
          planId,
          featureTypeId,
          value: isUnlimited ? '' : value.toString(),
          isUnlimited
        });
        
        setPlanLimits([...planLimits, newLimit]);
      }
      
      const limitText = isUnlimited ? 'unlimited' : value.toString();
      showSuccess(`${featureType?.name || 'Feature'} limit for ${plan?.name || 'plan'} set to ${limitText}`);
    } catch (error) {
      console.error('Failed to update limit:', error);
      showError('Failed to update feature limit. Please try again.');
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    
    try {
      await del(`/api/admin/plans?id=${planId}`);
      setPlans(plans.filter(p => p.id !== planId));
    } catch (error) {
      console.error('Failed to delete plan:', error);
    }
  };

  const handleEditFeatureType = (featureType: any) => {
    setEditingFeatureType(featureType.id);
    setEditFeatureTypeData({
      name: featureType.name,
      unit: featureType.unit,
      description: featureType.description,
      icon: featureType.icon,
      iconUrl: featureType.iconUrl,
      isActive: featureType.isActive,
      sortOrder: featureType.sortOrder
    });
    setEditIconPreview(featureType.iconUrl || '');
  };

  const handleEditIconFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setEditIconFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditIconPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateFeatureType = async () => {
    if (!editingFeatureType || !editFeatureTypeData) return;
    
    try {
      let iconUrl = editFeatureTypeData.iconUrl;
      
      // Upload new icon file if provided
      if (editIconFile) {
        iconUrl = await uploadIconFile(editIconFile);
      }
      
      const updatedData = {
        id: editingFeatureType,
        ...editFeatureTypeData,
        iconUrl
      };
      
      await put('/api/admin/plan-feature-types', updatedData);
      
      // Update local state
      setPlanFeatureTypes(planFeatureTypes.map(ft => 
        ft.id === editingFeatureType ? { ...ft, ...updatedData } : ft
      ));
      
      // Reset edit state
      setEditingFeatureType(null);
      setEditFeatureTypeData(null);
      setEditIconFile(null);
      setEditIconPreview('');
      showSuccess(`Feature type "${editFeatureTypeData.name}" updated successfully!`);
    } catch (error) {
      console.error('Failed to update feature type:', error);
      showError('Failed to update feature type. Please try again.');
    }
  };

  const handleCancelEditFeatureType = () => {
    setEditingFeatureType(null);
    setEditFeatureTypeData(null);
    setEditIconFile(null);
    setEditIconPreview('');
  };

  const handleDeleteFeatureType = async (featureTypeId: string) => {
    if (!confirm('Are you sure you want to delete this feature type?')) return;
    
    try {
      await del(`/api/admin/plan-feature-types?id=${featureTypeId}`);
      setPlanFeatureTypes(planFeatureTypes.filter(ft => ft.id !== featureTypeId));
    } catch (error) {
      console.error('Failed to delete feature type:', error);
    }
  };

  // Basic Features Management
  const handleCreateBasicFeature = async () => {
    try {
      const createdFeature = await post('/api/admin/basic-features', newBasicFeature);
      setBasicFeatures([...basicFeatures, createdFeature]);
      setNewBasicFeature({ name: '', description: '', isActive: true, sortOrder: 0 });
      showSuccess(`Basic feature "${createdFeature.name}" created successfully!`);
    } catch (error) {
      console.error('Failed to create basic feature:', error);
      showError('Failed to create basic feature. Please try again.');
    }
  };

  const handleDeleteBasicFeature = async (featureId: string) => {
    if (!confirm('Are you sure you want to delete this basic feature?')) return;
    
    try {
      await del(`/api/admin/basic-features?id=${featureId}`);
      setBasicFeatures(basicFeatures.filter(f => f.id !== featureId));
    } catch (error) {
      console.error('Failed to delete basic feature:', error);
    }
  };

  const handleToggleBasicFeature = async (planId: string, featureId: string, isEnabled: boolean) => {
    try {
      const existing = planBasicFeatures.find(pbf => pbf.planId === planId && pbf.basicFeatureId === featureId);
      
      if (isEnabled && !existing) {
        const newAssignment = await post('/api/admin/plan-basic-features', {
          planId,
          basicFeatureId: featureId
        });
        setPlanBasicFeatures([...planBasicFeatures, newAssignment]);
      } else if (!isEnabled && existing) {
        await del(`/api/admin/plan-basic-features?id=${existing.id}`);
        setPlanBasicFeatures(planBasicFeatures.filter(pbf => pbf.id !== existing.id));
      }
    } catch (error) {
      console.error('Failed to toggle basic feature:', error);
    }
  };

  const isPlanBasicFeatureEnabled = (planId: string, featureId: string) => {
    return planBasicFeatures.some(pbf => pbf.planId === planId && pbf.basicFeatureId === featureId);
  };

  const getEnabledBasicFeatures = (planId: string) => {
    return basicFeatures.filter(feature => 
      isPlanBasicFeatureEnabled(planId, feature.id)
    ).sort((a, b) => a.sortOrder - b.sortOrder);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pricing configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-3">
            {toast.type === 'success' ? (
              <div className="flex-shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            ) : (
              <div className="flex-shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            <p className="font-medium">{toast.message}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="relative rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-white shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <DollarSign className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Pricing Manager</h1>
                <p className="text-purple-100 text-lg">Configure plans, features, and pricing with ease</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center space-x-3">
                  <Users className="w-6 h-6 text-purple-200" />
                  <div>
                    <p className="text-sm text-purple-100">Active Plans</p>
                    <p className="text-2xl font-bold">{plans.filter(p => p.isActive).length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center space-x-3">
                  <Database className="w-6 h-6 text-purple-200" />
                  <div>
                    <p className="text-sm text-purple-100">Feature Types</p>
                    <p className="text-2xl font-bold">{planFeatureTypes.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center space-x-3">
                  <ArrowUpDown className="w-6 h-6 text-purple-200" />
                  <div>
                    <p className="text-sm text-purple-100">Billing Cycles</p>
                    <p className="text-2xl font-bold">{billingCycles.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2">
          <nav className="flex space-x-2">
            {[
              { id: 'plans', label: 'Plans', icon: Users, color: 'bg-blue-500' },
              { id: 'feature-pool', label: 'Feature Pool', icon: Database, color: 'bg-emerald-500' },
              { id: 'basic-features', label: 'Basic Features', icon: CheckCircle, color: 'bg-green-500' },
              { id: 'plan-limits', label: 'Plan Limits', icon: ArrowUpDown, color: 'bg-purple-500' },
              { id: 'preview', label: 'Preview', icon: Globe, color: 'bg-orange-500' },
              { id: 'comparison', label: 'Comparison', icon: Eye, color: 'bg-indigo-500' },
            ].map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-300 ${
                    isActive
                      ? `${tab.color} text-white shadow-lg transform scale-105`
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {activeTab === 'plans' && (
          <div className="space-y-6">
            <Card className="p-8 border-2 border-purple-100 bg-gradient-to-br from-white to-purple-50 shadow-xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Create New Plan</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Plan Name"
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                />
                <Input
                  placeholder="Description"
                  value={newPlan.description}
                  onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                />
              </div>

              {basicFeatures.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                    Basic Features
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                    {basicFeatures.map((feature) => (
                      <label key={feature.id} className="flex items-center space-x-3 p-2 hover:bg-green-100 rounded-lg cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={newPlan.basicFeatures?.includes(feature.id) || false}
                          onChange={(e) => {
                            const currentFeatures = newPlan.basicFeatures || [];
                            if (e.target.checked) {
                              setNewPlan({ 
                                ...newPlan, 
                                basicFeatures: [...currentFeatures, feature.id] 
                              });
                            } else {
                              setNewPlan({ 
                                ...newPlan, 
                                basicFeatures: currentFeatures.filter(id => id !== feature.id) 
                              });
                            }
                          }}
                          className="w-4 h-4 text-green-600 rounded focus:ring-green-600"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-900">{feature.name}</span>
                          {feature.description && (
                            <p className="text-xs text-gray-600">{feature.description}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4 text-gray-900">Pricing for Billing Cycles</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {billingCycles.map((cycle) => (
                    <div key={cycle.id} className="border-2 border-gray-200 rounded-xl p-4 bg-white/50">
                      <h5 className="font-semibold mb-3 text-gray-900">{cycle.label}</h5>
                      <div className="space-y-3">
                        <Input
                          placeholder="Price (in cents)"
                          type="number"
                          value={newPlanPricing[cycle.id]?.priceCents || 0}
                          onChange={(e) => setNewPlanPricing({
                            ...newPlanPricing,
                            [cycle.id]: {
                              ...newPlanPricing[cycle.id],
                              priceCents: parseInt(e.target.value) || 0
                            }
                          })}
                        />
                        <Input
                          placeholder="Stripe Price ID"
                          value={newPlanPricing[cycle.id]?.stripePriceId || ''}
                          onChange={(e) => setNewPlanPricing({
                            ...newPlanPricing,
                            [cycle.id]: {
                              ...newPlanPricing[cycle.id],
                              stripePriceId: e.target.value
                            }
                          })}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newPlan.isActive}
                      onChange={(e) => setNewPlan({ ...newPlan, isActive: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
                    />
                    <span className="text-gray-900 font-medium">Active</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newPlan.isPopular}
                      onChange={(e) => setNewPlan({ ...newPlan, isPopular: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
                    />
                    <span className="text-gray-900 font-medium">Popular</span>
                  </label>
                </div>
                <Button 
                  onClick={handleCreatePlan} 
                  disabled={!newPlan.name || loading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Plan
                </Button>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card key={plan.id} className="p-6 hover:shadow-xl transition-all duration-300 bg-white border border-gray-200">
                  {editingPlan === plan.id ? (
                    <div className="space-y-4">
                      <Input
                        placeholder="Plan Name"
                        value={editPlanData?.name || ''}
                        onChange={(e) => setEditPlanData({...editPlanData, name: e.target.value})}
                      />
                      <Input
                        placeholder="Description"
                        value={editPlanData?.description || ''}
                        onChange={(e) => setEditPlanData({...editPlanData, description: e.target.value})}
                      />
                      
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm text-gray-900">Pricing:</h5>
                        {billingCycles.map((cycle) => (
                          <div key={cycle.id} className="border rounded p-3 bg-gray-50">
                            <label className="text-xs text-gray-600 font-medium">{cycle.label}</label>
                            <div className="flex space-x-2 mt-1">
                              <Input
                                placeholder="Price (cents)"
                                type="number"
                                value={editPlanPricing[cycle.id]?.priceCents || 0}
                                onChange={(e) => setEditPlanPricing({
                                  ...editPlanPricing,
                                  [cycle.id]: {
                                    ...editPlanPricing[cycle.id],
                                    priceCents: parseInt(e.target.value) || 0
                                  }
                                })}
                                className="text-sm"
                              />
                              <Input
                                placeholder="Stripe ID"
                                value={editPlanPricing[cycle.id]?.stripePriceId || ''}
                                onChange={(e) => setEditPlanPricing({
                                  ...editPlanPricing,
                                  [cycle.id]: {
                                    ...editPlanPricing[cycle.id],
                                    stripePriceId: e.target.value
                                  }
                                })}
                                className="text-sm"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={editPlanData?.isActive || false}
                            onChange={(e) => setEditPlanData({...editPlanData, isActive: e.target.checked})}
                            className="mr-2 w-4 h-4 text-purple-600"
                          />
                          Active
                        </label>
                        <label className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={editPlanData?.isPopular || false}
                            onChange={(e) => setEditPlanData({...editPlanData, isPopular: e.target.checked})}
                            className="mr-2 w-4 h-4 text-purple-600"
                          />
                          Popular
                        </label>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          onClick={handleUpdatePlan} 
                          disabled={loading}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button 
                          onClick={handleCancelEdit}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
                        <div className="flex space-x-2">
                          {plan.isPopular && (
                            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 py-1 text-xs rounded-full">
                              Popular
                            </Badge>
                          )}
                          <Badge className={plan.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                            {plan.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{plan.description}</p>
                      
                      <div className="space-y-2 mb-6">
                        <h5 className="font-semibold text-sm text-gray-900">Pricing:</h5>
                        {billingCycles.map((cycle) => {
                          const pricing = getPlanPricing(plan.id, cycle.id);
                          return (
                            <div key={cycle.id} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                              <span className="text-gray-600">{cycle.label}:</span>
                              <span className="font-semibold text-gray-900">
                                {pricing ? formatPrice(pricing.priceCents) : 'Not set'}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => handleEditPlan(plan)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex-1"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          onClick={() => handleDeletePlan(plan.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'feature-pool' && (
          <div className="space-y-6">
            <Card className="p-8 border-2 border-emerald-100 bg-gradient-to-br from-white to-emerald-50 shadow-xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Create New Feature Type</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Feature Name"
                  value={newFeatureType.name}
                  onChange={(e) => setNewFeatureType({ ...newFeatureType, name: e.target.value })}
                />
                <Input
                  placeholder="Unit (e.g., 'per month')"
                  value={newFeatureType.unit}
                  onChange={(e) => setNewFeatureType({ ...newFeatureType, unit: e.target.value })}
                />
                <IconPicker
                  value={newFeatureType.icon}
                  onChange={(iconName) => setNewFeatureType({ ...newFeatureType, icon: iconName })}
                  placeholder="Select an icon for this feature"
                  label="Library Icon"
                  showLabel={true}
                />
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom PNG Icon (Optional)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                    onChange={handleIconFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                  {iconPreview && (
                    <div className="flex items-center space-x-2">
                      <img src={iconPreview} alt="Icon preview" className="w-8 h-8 object-contain border border-gray-200 rounded" />
                      <span className="text-sm text-gray-600">Preview</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Upload a PNG, JPG, or SVG icon. If provided, this will override the selected Lucide icon.
                </p>
              </div>
              
              <div className="mt-4">
                <Input
                  placeholder="Description"
                  value={newFeatureType.description}
                  onChange={(e) => setNewFeatureType({ ...newFeatureType, description: e.target.value })}
                />
              </div>
              
              <div className="flex justify-end mt-6">
                <Button 
                  onClick={handleCreateFeatureType} 
                  disabled={!newFeatureType.name}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Feature Type
                </Button>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {planFeatureTypes
                .filter(ft => ft.isActive)
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((featureType) => (
                  <Card key={featureType.id} className="p-6 hover:shadow-xl transition-all duration-300 bg-white border border-gray-200">
                    {editingFeatureType === featureType.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            placeholder="Feature Name"
                            value={editFeatureTypeData?.name || ''}
                            onChange={(e) => setEditFeatureTypeData({...editFeatureTypeData, name: e.target.value})}
                          />
                          <Input
                            placeholder="Unit"
                            value={editFeatureTypeData?.unit || ''}
                            onChange={(e) => setEditFeatureTypeData({...editFeatureTypeData, unit: e.target.value})}
                          />
                        </div>
                        
                        <Input
                          placeholder="Description"
                          value={editFeatureTypeData?.description || ''}
                          onChange={(e) => setEditFeatureTypeData({...editFeatureTypeData, description: e.target.value})}
                        />
                        
                        <div className="space-y-4">
                          <IconPicker
                            value={editFeatureTypeData?.icon || 'Settings'}
                            onChange={(iconName) => setEditFeatureTypeData({...editFeatureTypeData, icon: iconName})}
                            placeholder="Select an icon for this feature"
                            label="Library Icon"
                            showLabel={true}
                          />
                          
                          <div className="flex items-center space-x-2">
                            <label className="flex items-center text-sm">
                              <input
                                type="checkbox"
                                checked={editFeatureTypeData?.isActive || false}
                                onChange={(e) => setEditFeatureTypeData({...editFeatureTypeData, isActive: e.target.checked})}
                                className="mr-2 w-4 h-4 text-emerald-600"
                              />
                              Active
                            </label>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Custom Icon (Optional)
                          </label>
                          <div className="flex items-center space-x-4">
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                              onChange={handleEditIconFileChange}
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-emerald-50 file:text-emerald-700"
                            />
                            {editIconPreview && (
                              <img src={editIconPreview} alt="Icon preview" className="w-6 h-6 object-contain border border-gray-200 rounded" />
                            )}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            onClick={handleUpdateFeatureType} 
                            disabled={!editFeatureTypeData?.name}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm flex-1"
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button 
                            onClick={handleCancelEditFeatureType}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            {getIcon(featureType.icon, featureType.iconUrl)}
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">{featureType.name}</h4>
                              <p className="text-sm text-gray-600">{featureType.unit}</p>
                            </div>
                          </div>
                          <Badge className={featureType.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                            {featureType.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{featureType.description}</p>
                        
                        <div className="flex space-x-2">
                          <Button 
                            onClick={() => handleEditFeatureType(featureType)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex-1"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            onClick={() => handleDeleteFeatureType(featureType.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </Card>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'basic-features' && (
          <div className="space-y-6">
            <Card className="p-8 border-2 border-green-100 bg-gradient-to-br from-white to-green-50 shadow-xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Create New Basic Feature</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Feature Name"
                  value={newBasicFeature.name}
                  onChange={(e) => setNewBasicFeature({ ...newBasicFeature, name: e.target.value })}
                />
                <Input
                  placeholder="Description"
                  value={newBasicFeature.description}
                  onChange={(e) => setNewBasicFeature({ ...newBasicFeature, description: e.target.value })}
                />
              </div>
              
              <div className="flex justify-end mt-6">
                <Button 
                  onClick={handleCreateBasicFeature} 
                  disabled={!newBasicFeature.name}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Basic Feature
                </Button>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {basicFeatures
                .filter(bf => bf.isActive)
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((feature) => (
                  <Card key={feature.id} className="p-6 hover:shadow-xl transition-all duration-300 bg-white border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{feature.name}</h4>
                        </div>
                      </div>
                      <Badge className={feature.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {feature.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                    
                    <div className="mb-4">
                      <h5 className="text-sm font-semibold text-gray-900 mb-2">Assigned to Plans:</h5>
                      <div className="flex flex-wrap gap-2">
                        {plans.filter(plan => isPlanBasicFeatureEnabled(plan.id, feature.id)).map(plan => (
                          <Badge key={plan.id} className="bg-blue-100 text-blue-800 text-xs">
                            {plan.name}
                          </Badge>
                        ))}
                        {plans.filter(plan => isPlanBasicFeatureEnabled(plan.id, feature.id)).length === 0 && (
                          <span className="text-sm text-gray-500">Not assigned to any plans</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="text-sm font-semibold text-gray-900">Quick Assign:</h5>
                      <div className="flex flex-wrap gap-2">
                        {plans.filter(p => p.isActive).map(plan => (
                          <label key={plan.id} className="flex items-center space-x-2 text-sm">
                            <input
                              type="checkbox"
                              checked={isPlanBasicFeatureEnabled(plan.id, feature.id)}
                              onChange={(e) => handleToggleBasicFeature(plan.id, feature.id, e.target.checked)}
                              className="w-4 h-4 text-green-600 rounded focus:ring-green-600"
                            />
                            <span className="text-gray-700">{plan.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 mt-4">
                      <Button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex-1">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        onClick={() => handleDeleteBasicFeature(feature.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'plan-limits' && (
          <div className="space-y-6">
            <Card className="p-8 shadow-xl bg-white border border-gray-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg">
                  <ArrowUpDown className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Plan Feature Limits</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Feature
                      </th>
                      {plans.filter(p => p.isActive).map((plan) => (
                        <th key={plan.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {plan.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {planFeatureTypes.filter(ft => ft.isActive).map((featureType) => (
                      <tr key={featureType.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            {getIcon(featureType.icon, featureType.iconUrl)}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{featureType.name}</div>
                              <div className="text-sm text-gray-600">{featureType.unit}</div>
                            </div>
                          </div>
                        </td>
                        {plans.filter(p => p.isActive).map((plan) => {
                          const limit = getPlanLimit(plan.id, featureType.id);
                          return (
                            <td key={plan.id} className="px-6 py-4 whitespace-nowrap">
                              <LimitEditor
                                limit={limit}
                                onUpdate={(value, isUnlimited) => 
                                  handleUpdateLimit(plan.id, featureType.id, value, isUnlimited)
                                }
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="space-y-6">
            <Card className="p-8 shadow-xl bg-white border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Pricing Preview</h3>
                </div>
                
                <div className="flex space-x-2">
                  {billingCycles.map((cycle) => (
                    <button
                      key={cycle.id}
                      onClick={() => setSelectedBillingCycle(cycle.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedBillingCycle === cycle.id
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cycle.label}
                    </button>
                  ))}
                </div>
              </div>
              

              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.filter(p => p.isActive).map((plan) => {
                  const pricing = getPlanPricing(plan.id, selectedBillingCycle);
                  return (
                    <div
                      key={plan.id}
                      className={`relative p-6 rounded-xl border-2 transition-all ${
                        plan.isPopular
                          ? 'border-purple-600 bg-gradient-to-br from-purple-50 to-blue-50 shadow-lg'
                          : 'border-gray-200 bg-white hover:border-purple-300'
                      }`}
                    >
                      {plan.isPopular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            Most Popular
                          </span>
                        </div>
                      )}
                      
                      <div className="text-center mb-6">
                        <h4 className="text-xl font-bold text-purple-600 mb-2">{plan.name}</h4>
                        
                        <div className="mb-4">
                          <span className="text-4xl font-bold text-gray-900">
                            {pricing ? formatPrice(pricing.priceCents) : '$0.00'}
                          </span>
                          <span className="text-gray-600 ml-1">
                            /{billingCycles.find(c => c.id === selectedBillingCycle)?.label.replace('ly', '')}
                          </span>
                        </div>
                        
                        <Button 
                          className={`w-full py-3 rounded-lg font-medium transition-all duration-300 mb-6 ${
                            plan.isPopular 
                              ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                              : 'bg-purple-600 hover:bg-purple-700 text-white'
                          }`}
                        >
                          <span className="mr-2">UPGRADE PLAN</span>
                          <span className="text-lg">✨</span>
                        </Button>
                      </div>

                      {/* Feature Limits Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        {planFeatureTypes
                          .filter(ft => ft.isActive)
                          .slice(0, 4)
                          .map((featureType) => {
                            const limit = getPlanLimit(plan.id, featureType.id);
                            const limitValue = limit?.isUnlimited ? '∞' : (limit?.value || '0');
                            

                            
                            return (
                              <div key={featureType.id} className="bg-gray-50 rounded-lg p-3 text-center">
                                <div className="flex items-center justify-center mb-1">
                                  {getIcon(featureType.icon, featureType.iconUrl)}
                                  <span className="ml-1 text-sm font-medium text-gray-700">{featureType.name}</span>
                                </div>
                                <div className="text-xl font-bold text-gray-900">{limitValue}</div>
                              </div>
                            );
                          })}
                      </div>

                      {/* Basic Features List */}
                      <div className="space-y-2">
                        {getEnabledBasicFeatures(plan.id).map((feature) => (
                          <div key={feature.id} className="flex items-center space-x-2">
                            <Check className="w-4 h-4 text-purple-600" />
                            <span className="text-sm text-gray-700">{feature.name}</span>
                          </div>
                        ))}
                        {getEnabledBasicFeatures(plan.id).length === 0 && (
                          <div className="text-sm text-gray-500 italic">
                            No basic features assigned to this plan
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'comparison' && (
          <div className="space-y-6">
            <Card className="p-8 shadow-xl bg-white border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Plan Comparison</h3>
                </div>
                
                <div className="flex space-x-2">
                  {billingCycles.map((cycle) => (
                    <button
                      key={cycle.id}
                      onClick={() => setSelectedBillingCycle(cycle.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedBillingCycle === cycle.id
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cycle.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="overflow-x-auto p-4">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-4 px-6 font-semibold text-gray-900 bg-gray-50 rounded-tl-lg">
                        Features
                      </th>
                      {plans.filter(p => p.isActive).map((plan) => (
                        <th key={plan.id} className="text-center py-4 px-6 font-semibold text-gray-900 bg-gray-50 relative">
                          {plan.isPopular && (
                            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                                Most Popular
                              </span>
                            </div>
                          )}
                          <div className="mt-2">
                            <div className="text-lg font-bold text-indigo-600">{plan.name}</div>
                            <div className="text-2xl font-bold text-gray-900 mt-1">
                              {(() => {
                                const pricing = getPlanPricing(plan.id, selectedBillingCycle);
                                return pricing ? formatPrice(pricing.priceCents) : '$0.00';
                              })()}
                            </div>
                            <div className="text-sm text-gray-600">
                              /{billingCycles.find(c => c.id === selectedBillingCycle)?.label.replace('ly', '')}
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {/* Feature Limits Section */}
                    <tr className="bg-gray-50">
                      <td colSpan={plans.filter(p => p.isActive).length + 1} className="px-6 py-3 text-sm font-semibold text-gray-900 uppercase tracking-wider">
                        Feature Limits
                      </td>
                    </tr>
                    {planFeatureTypes.filter(ft => ft.isActive).map((featureType) => (
                      <tr key={featureType.id} className="hover:bg-gray-50 transition-colors">
                                                 <td className="px-6 py-4 font-medium text-gray-900">
                           <div className="flex items-center space-x-3">
                             {getIcon(featureType.icon, featureType.iconUrl)}
                             <div>
                               <div className="font-semibold">{featureType.name}</div>
                               {featureType.description && (
                                 <div className="text-sm text-gray-600">{featureType.description}</div>
                               )}
                             </div>
                           </div>
                         </td>
                        {plans.filter(p => p.isActive).map((plan) => {
                          const limit = getPlanLimit(plan.id, featureType.id);
                          const limitValue = limit?.isUnlimited ? '∞' : (limit?.value || '0');
                          
                          return (
                            <td key={plan.id} className="px-6 py-4 text-center">
                              <div className="text-lg font-bold text-gray-900">
                                {limitValue}
                              </div>
                              {featureType.unit && (
                                <div className="text-xs text-gray-500">{featureType.unit}</div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    
                    {/* Basic Features Section */}
                    {basicFeatures.filter(bf => bf.isActive).length > 0 && (
                      <>
                        <tr className="bg-gray-50">
                          <td colSpan={plans.filter(p => p.isActive).length + 1} className="px-6 py-3 text-sm font-semibold text-gray-900 uppercase tracking-wider">
                            Basic Features
                          </td>
                        </tr>
                        {basicFeatures
                          .filter(bf => bf.isActive)
                          .sort((a, b) => a.sortOrder - b.sortOrder)
                          .map((feature) => (
                            <tr key={feature.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 font-medium text-gray-900">
                                <div className="flex items-center space-x-3">
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                  <div>
                                    <div className="font-semibold">{feature.name}</div>
                                    {feature.description && (
                                      <div className="text-sm text-gray-600">{feature.description}</div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              {plans.filter(p => p.isActive).map((plan) => {
                                const isEnabled = isPlanBasicFeatureEnabled(plan.id, feature.id);
                                
                                return (
                                  <td key={plan.id} className="px-6 py-4 text-center">
                                    {isEnabled ? (
                                      <Check className="w-6 h-6 text-green-600 mx-auto" />
                                    ) : (
                                      <X className="w-6 h-6 text-gray-300 mx-auto" />
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* CTA Row */}
              <div className="mt-8 border-t pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="hidden md:block"></div>
                  {plans.filter(p => p.isActive).map((plan) => (
                    <div key={plan.id} className="text-center">
                      <Button 
                        className={`w-full py-3 rounded-lg font-medium transition-all duration-300 ${
                          plan.isPopular 
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        <span className="mr-2">Choose {plan.name}</span>
                        {plan.isPopular && <span className="text-lg">⭐</span>}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function LimitEditor({ limit, onUpdate }: { 
  limit: any; 
  onUpdate: (value: number, isUnlimited: boolean) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(limit?.value || '0');
  const [isUnlimited, setIsUnlimited] = useState(limit?.isUnlimited || false);

  const handleSave = () => {
    onUpdate(parseInt(value) || 0, isUnlimited);
    setEditing(false);
  };

  const handleCancel = () => {
    setValue(limit?.value || '0');
    setIsUnlimited(limit?.isUnlimited || false);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isUnlimited}
            onChange={(e) => setIsUnlimited(e.target.checked)}
            className="w-4 h-4 text-purple-600"
          />
          <span className="text-xs text-gray-600">Unlimited</span>
        </div>
        {!isUnlimited && (
          <Input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="text-sm"
            placeholder="0"
          />
        )}
        <div className="flex space-x-1">
          <Button 
            onClick={handleSave}
            className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
          >
            <Check className="w-3 h-3" />
          </Button>
          <Button 
            onClick={handleCancel}
            className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="text-left p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors w-full border border-gray-200 hover:border-purple-300"
    >
      <div className="text-sm font-medium text-gray-900">
        {limit?.isUnlimited ? '∞ Unlimited' : (limit?.value || 'Not set')}
      </div>
      <div className="text-xs text-gray-600">Click to edit</div>
    </button>
  );
}
