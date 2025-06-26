'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Check, Settings, CheckCircle, X } from 'lucide-react';
import { useDesignSystem } from '@/hooks/useDesignSystem';
import { iconLibrary } from '@/components/ui/IconPicker';

interface BillingCycle {
  id: string;
  label: string;
  multiplier: number;
  isDefault: boolean;
}

interface PlanPricing {
  id: string;
  planId: string;
  billingCycleId: string;
  priceCents: number;
  stripePriceId?: string;
  billingCycle: BillingCycle;
}

interface FeatureType {
  id: string;
  name: string;
  unit: string;
  description: string;
  icon: string;
  iconUrl?: string;
  dataType: string;
  sortOrder: number;
  isActive: boolean;
}

interface PlanFeatureLimit {
  id: string;
  planId: string;
  featureTypeId: string;
  value: string;
  isUnlimited: boolean;
  plan: {
    id: string;
    name: string;
    description: string;
  };
  featureType: FeatureType;
}

interface BasicFeature {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

interface PlanBasicFeature {
  id: string;
  planId: string;
  basicFeatureId: string;
  plan: {
    id: string;
    name: string;
    description: string;
  };
  basicFeature: BasicFeature;
}

interface Plan {
  id: string;
  name: string;
  description?: string;
  position: number;
  isActive: boolean;
  isPopular: boolean;
  pricing: PlanPricing[];
  featureLimits?: PlanFeatureLimit[];
  basicFeatures?: PlanBasicFeature[];
}

interface PricingSectionPlan {
  id: number;
  pricingSectionId: number;
  planId: string;
  sortOrder: number;
  isVisible: boolean;
  plan: Plan;
}

interface PricingSection {
  id: number;
  name: string;
  heading: string;
  subheading?: string;
  layoutType: string;
  isActive: boolean;
  sectionPlans: PricingSectionPlan[];
}

interface ConfigurablePricingSectionProps {
  heading?: string;
  subheading?: string;
  pricingSectionId?: number;
  layoutType?: string;
  className?: string;
}

// IconDisplay component exactly like admin panel
const IconDisplay = ({ iconName, iconUrl, className = "w-4 h-4" }: { 
  iconName: string; 
  iconUrl?: string; 
  className?: string;
}) => {
  if (iconUrl) {
    return <img src={iconUrl} alt={iconName} className={`${className} object-contain`} />;
  }
  
  const iconData = iconLibrary.find(icon => icon.name === iconName);
  if (iconData) {
    const IconComponent = iconData.component;
    return <IconComponent className={className} />;
  }
  
  return <Settings className={className} />;
};

export default function ConfigurablePricingSection({
  heading,
  subheading,
  pricingSectionId,
  layoutType = 'standard',
  className = ''
}: ConfigurablePricingSectionProps) {
  // State variables exactly like admin panel
  const [pricingSection, setPricingSection] = useState<PricingSection | null>(null);
  const [billingCycles, setBillingCycles] = useState<BillingCycle[]>([]);
  const [selectedBillingCycleId, setSelectedBillingCycleId] = useState<string>('');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planFeatureTypes, setPlanFeatureTypes] = useState<FeatureType[]>([]);
  const [planLimits, setPlanLimits] = useState<PlanFeatureLimit[]>([]);
  const [planBasicFeatures, setPlanBasicFeatures] = useState<PlanBasicFeature[]>([]);
  const [basicFeatures, setBasicFeatures] = useState<BasicFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { designSystem } = useDesignSystem();

  // Helper functions exactly like admin panel
  const getPlanLimit = (planId: string, featureTypeId: string) => {
    return planLimits.find(l => l.planId === planId && l.featureTypeId === featureTypeId);
  };

  const getPlanPricing = (planId: string, billingCycleId: string) => {
    const plan = plans.find(p => p.id === planId);
    return plan?.pricing.find(p => p.billingCycleId === billingCycleId);
  };

  const formatPrice = (priceCents: number) => {
    const dollars = priceCents / 100;
    return dollars === Math.floor(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`;
  };

  const isPlanBasicFeatureEnabled = (planId: string, featureId: string) => {
    return planBasicFeatures.some(pbf => 
      pbf.planId === planId && pbf.basicFeatureId === featureId
    );
  };

  const calculateSavings = (cycle: BillingCycle) => {
    if (cycle.multiplier <= 1) return 0;
    
    // Calculate savings based on actual price differences
    // Get the first plan to calculate savings (using Starter as reference)
    const referencePlan = plans[0]; // Use first plan as reference
    if (!referencePlan) return 0;
    
    // Get monthly pricing for reference plan
    const monthlyBillingCycle = billingCycles.find(c => c.multiplier === 1);
    if (!monthlyBillingCycle) return 0;
    
    const monthlyPricing = getPlanPricing(referencePlan.id, monthlyBillingCycle.id);
    const yearlyPricing = getPlanPricing(referencePlan.id, cycle.id);
    
    if (!monthlyPricing || !yearlyPricing) return 0;
    
    // Calculate: (monthly * 12 - yearly) / (monthly * 12) * 100
    const monthlyTotal = monthlyPricing.priceCents * 12;
    const yearlyCost = yearlyPricing.priceCents;
    const savings = ((monthlyTotal - yearlyCost) / monthlyTotal) * 100;
    
    return Math.round(savings);
  };

  // Load data exactly like admin panel approach
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [cyclesRes, sectionsRes, featureTypesRes, limitsRes, basicFeaturesRes, planBasicFeaturesRes] = await Promise.all([
          fetch('/api/admin/billing-cycles'),
          fetch('/api/admin/pricing-sections'),
          fetch('/api/admin/plan-feature-types'),
          fetch('/api/admin/plan-feature-limits'),
          fetch('/api/admin/basic-features'),
          fetch('/api/admin/plan-basic-features')
        ]);

        const cycles = await cyclesRes.json();
        const sections = await sectionsRes.json();
        const featureTypes = await featureTypesRes.json();
        const limits = await limitsRes.json();
        const basicFeaturesData = await basicFeaturesRes.json();
        const planBasicFeaturesData = await planBasicFeaturesRes.json();
        
        // Set data exactly like admin panel
        setBillingCycles(cycles || []);
        setPlanFeatureTypes(featureTypes || []);
        setPlanLimits(limits || []);
        setBasicFeatures(basicFeaturesData || []);
        setPlanBasicFeatures(planBasicFeaturesData || []);
        
        // Set default billing cycle
        const defaultCycle = cycles?.find((c: BillingCycle) => c.isDefault) || cycles?.[0];
        if (defaultCycle) {
          setSelectedBillingCycleId(defaultCycle.id);
        }

        // Find and set pricing section with plans
        if (pricingSectionId) {
          const section = sections?.find((s: PricingSection) => s.id === pricingSectionId);
          if (section) {
            setPricingSection(section);
            // Extract plans from section
            const sectionPlans = section.sectionPlans
              ?.filter((sp: PricingSectionPlan) => sp.isVisible && sp.plan.isActive)
              ?.sort((a: PricingSectionPlan, b: PricingSectionPlan) => a.sortOrder - b.sortOrder)
              ?.map((sp: PricingSectionPlan) => sp.plan) || [];
            setPlans(sectionPlans);
          } else {
            setError('Pricing section not found');
          }
        } else {
          setError('No pricing section ID provided');
        }
      } catch (err) {
        console.error('Error loading pricing data:', err);
        setError('Failed to load pricing data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [pricingSectionId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-lg" style={{ color: designSystem?.textSecondary || '#6B7280' }}>
          Loading pricing data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  if (!pricingSection || plans.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-lg" style={{ color: designSystem?.textSecondary || '#6B7280' }}>
          No pricing plans available
        </div>
      </div>
    );
  }

  return (
    <section className={`py-20 ${className}`} style={{ backgroundColor: designSystem?.backgroundSecondary || '#F6F8FC' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: designSystem?.textPrimary || '#111827' }}>
            {heading || pricingSection.heading || 'Pricing Plans'}
          </h2>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: designSystem?.textSecondary || '#6B7280' }}>
            {subheading || pricingSection.subheading || 'Choose a plan below and unlock all the features of Saski AI'}
          </p>
        </div>

        {/* Billing Toggle */}
        {billingCycles.length > 1 && (
          <div className="flex justify-center mb-16">
            <div className="p-2 rounded-xl border shadow-sm" style={{ 
              backgroundColor: designSystem?.backgroundPrimary || '#FFFFFF',
              borderColor: designSystem?.grayMedium || '#6B7280'
            }}>
              {billingCycles.map((cycle) => {
                const savings = calculateSavings(cycle);
                return (
                  <button
                    key={cycle.id}
                    onClick={() => setSelectedBillingCycleId(cycle.id)}
                    className={`px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-200 relative ${
                      selectedBillingCycleId === cycle.id ? 'shadow-md' : 'hover:bg-opacity-50'
                    }`}
                    style={{
                      backgroundColor: selectedBillingCycleId === cycle.id 
                        ? designSystem?.primaryColor || '#6366F1'
                        : 'transparent',
                      color: selectedBillingCycleId === cycle.id 
                        ? '#FFFFFF'
                        : designSystem?.textPrimary || '#111827'
                    }}
                  >
                    PAY {cycle.label.toUpperCase()}
                    {savings > 0 && selectedBillingCycleId !== cycle.id && (
                      <span className="absolute -top-2 -right-2 text-white text-xs px-2 py-1 rounded-full font-bold"
                            style={{ backgroundColor: designSystem?.accentColor || '#8B5CF6' }}>
                        Save {savings}%
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto mb-16">
          {plans.map((plan) => {
            const pricing = getPlanPricing(plan.id, selectedBillingCycleId);
            const isPopular = plan.isPopular;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 transition-all duration-300 hover:shadow-2xl ${
                  isPopular ? 'scale-105 shadow-2xl' : 'hover:scale-105'
                }`}
                style={{
                  backgroundColor: designSystem?.backgroundSecondary || '#F6F8FC',
                  borderColor: isPopular ? designSystem?.primaryColor || '#6366F1' : designSystem?.grayLight || '#E5E7EB',
                  boxShadow: isPopular 
                    ? `0 25px 50px -12px rgba(99, 102, 241, 0.25)` 
                    : '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg" style={{ background: `linear-gradient(to right, ${designSystem?.accentColor || '#8B5CF6'}, ${designSystem?.primaryColor || '#6366F1'})` }}>
                      ⭐ Most Popular
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-3" style={{ color: designSystem?.primaryColor || '#6366F1' }}>
                      {plan.name} Package
                    </h3>
                    
                    {pricing ? (
                      <div className="mb-6">
                        <div className="flex items-baseline justify-center mb-2">
                          <span className="text-5xl font-bold" style={{ color: designSystem?.textPrimary || '#111827' }}>
                            {formatPrice(pricing.priceCents)}
                          </span>
                          <span className="ml-2 text-lg" style={{ color: designSystem?.textSecondary || '#6B7280' }}>
                            /{billingCycles.find(c => c.id === selectedBillingCycleId)?.label || 'Month'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-6">
                        <span className="text-3xl font-bold" style={{ color: designSystem?.textSecondary || '#6B7280' }}>
                          Custom Pricing
                        </span>
                      </div>
                    )}

                    <button 
                      className="w-full py-4 px-6 rounded-xl font-bold text-white text-sm tracking-wide transition-all duration-200 hover:scale-105 shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${designSystem?.primaryColor || '#6366F1'} 0%, ${designSystem?.accentColor || '#8B5CF6'} 100%)`,
                        boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)'
                      }}
                    >
                      SELECT PLAN ✨
                    </button>
                  </div>

                  {/* Feature Icons Grid - Dynamic from Database */}
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {planFeatureTypes.filter(ft => ft.isActive).slice(0, 4).map((featureType) => {
                      const limit = getPlanLimit(plan.id, featureType.id);
                      const limitValue = limit?.isUnlimited ? '∞' : (limit?.value || '0');
                      
                      return (
                        <div key={featureType.id} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm min-h-[80px] flex items-center">
                          <div className="flex items-center space-x-2 w-full">
                            <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: designSystem?.primaryColor + '20' || '#6366F120' }}>
                              <IconDisplay iconName={featureType.icon} iconUrl={featureType.iconUrl} className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-medium uppercase tracking-wide truncate" style={{ color: designSystem?.textSecondary || '#6B7280' }}>{featureType.name}</div>
                              <div className="text-xl font-bold" style={{ color: designSystem?.textPrimary || '#111827' }}>
                                {limitValue}{featureType.unit && featureType.dataType === 'number' ? featureType.unit : ''}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Basic Features List - Dynamic from Database */}
                  <div className="space-y-3">
                    {basicFeatures.filter(bf => bf.isActive && isPlanBasicFeatureEnabled(plan.id, bf.id)).slice(0, 6).map((feature) => (
                      <div key={feature.id} className="flex items-center">
                        <div className="w-5 h-5 rounded-full mr-3 flex items-center justify-center" style={{ backgroundColor: designSystem?.secondaryColor + '40' || '#8B5CF640' }}>
                          <Check className="w-3 h-3" style={{ color: designSystem?.primaryColor || '#6366F1' }} />
                        </div>
                        <span className="text-sm font-medium leading-tight" style={{ color: designSystem?.textPrimary || '#111827' }}>
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison Table - Admin Panel Design */}
        <Card className="overflow-hidden mt-32">
          <div className="overflow-x-auto">
            <table className="w-full mt-8">
              <thead>
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 bg-gray-50 rounded-tl-lg">
                    Features
                  </th>
                  {plans.map((plan) => {
                    const pricing = getPlanPricing(plan.id, selectedBillingCycleId);
                    const isPopular = plan.isPopular;
                    
                    return (
                      <th key={plan.id} className="text-center py-6 px-6 font-semibold text-gray-900 bg-gray-50 relative">
                        {isPopular && (
                          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                              Most Popular
                            </span>
                          </div>
                        )}
                        <div className="mt-2">
                          <div className="text-lg font-bold text-indigo-600">{plan.name}</div>
                          <div className="text-2xl font-bold text-gray-900 mt-1">
                            {pricing ? formatPrice(pricing.priceCents) : '$0.00'}
                          </div>
                          <div className="text-sm text-gray-600">
                            /{billingCycles.find(c => c.id === selectedBillingCycleId)?.label.replace('ly', '') || 'month'}
                          </div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* Feature Limits Section */}
                <tr className="bg-gray-50">
                  <td colSpan={plans.length + 1} className="px-6 py-3 text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Feature Limits
                  </td>
                </tr>
                
                {/* Dynamic Feature Types from Database */}
                {planFeatureTypes.filter(ft => ft.isActive).map((featureType) => (
                  <tr key={featureType.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div className="flex items-center space-x-3">
                        <IconDisplay iconName={featureType.icon} iconUrl={featureType.iconUrl} className="w-5 h-5 text-gray-600" />
                        <div>
                          <div className="font-semibold">{featureType.name}</div>
                          {featureType.description && (
                            <div className="text-sm text-gray-600">{featureType.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    {plans.map((plan) => {
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
                      <td colSpan={plans.length + 1} className="px-6 py-3 text-sm font-semibold text-gray-900 uppercase tracking-wider">
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
                              <CheckCircle className="w-5 h-5" style={{ color: designSystem?.primaryColor || '#6366F1' }} />
                              <div>
                                <div className="font-semibold">{feature.name}</div>
                                {feature.description && (
                                  <div className="text-sm text-gray-600">{feature.description}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          {plans.map((plan) => {
                            const isEnabled = isPlanBasicFeatureEnabled(plan.id, feature.id);
                            
                            return (
                              <td key={plan.id} className="px-6 py-4 text-center">
                                {isEnabled ? (
                                  <Check className="w-6 h-6 mx-auto" style={{ color: designSystem?.primaryColor || '#6366F1' }} />
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
              {plans.map((plan) => (
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
    </section>
  );
} 