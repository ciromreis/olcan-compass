/**
 * RouteBuilderForm Component
 * Form for configuring route details
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RouteConfig, RouteCategory } from '@/stores/routeBuilderStore';

interface RouteBuilderFormProps {
  category: RouteCategory;
  initialConfig?: Partial<RouteConfig>;
  onSubmit: (config: RouteConfig) => void;
  onBack?: () => void;
  isSubmitting?: boolean;
  className?: string;
}

export const RouteBuilderForm: React.FC<RouteBuilderFormProps> = ({
  category,
  initialConfig,
  onSubmit,
  onBack,
  isSubmitting = false,
  className = '',
}) => {
  const [config, setConfig] = useState<Partial<RouteConfig>>({
    category,
    target_outcome: initialConfig?.target_outcome || '',
    target_location: initialConfig?.target_location || '',
    timeline_months: initialConfig?.timeline_months || 12,
    budget_range: initialConfig?.budget_range || '',
    risk_tolerance: initialConfig?.risk_tolerance || 'medium',
    preferences: initialConfig?.preferences || {},
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!config.target_outcome || !config.timeline_months) {
      return;
    }

    onSubmit(config as RouteConfig);
  };

  const updateConfig = (updates: Partial<RouteConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const getCategorySpecificFields = () => {
    switch (category) {
      case 'employment':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Job Title *
              </label>
              <input
                type="text"
                value={config.target_outcome}
                onChange={(e) => updateConfig({ target_outcome: e.target.value })}
                placeholder="e.g., Senior Software Engineer"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Location
              </label>
              <input
                type="text"
                value={config.target_location}
                onChange={(e) => updateConfig({ target_location: e.target.value })}
                placeholder="e.g., San Francisco, CA or Remote"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </>
        );

      case 'entrepreneurship':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Business Goal *
              </label>
              <input
                type="text"
                value={config.target_outcome}
                onChange={(e) => updateConfig({ target_outcome: e.target.value })}
                placeholder="e.g., Launch SaaS product with 1000 users"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Initial Budget Range
              </label>
              <select
                value={config.budget_range}
                onChange={(e) => updateConfig({ budget_range: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select budget range</option>
                <option value="0-10k">$0 - $10,000</option>
                <option value="10k-50k">$10,000 - $50,000</option>
                <option value="50k-100k">$50,000 - $100,000</option>
                <option value="100k+">$100,000+</option>
              </select>
            </div>
          </>
        );

      case 'education':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Educational Goal *
              </label>
              <input
                type="text"
                value={config.target_outcome}
                onChange={(e) => updateConfig({ target_outcome: e.target.value })}
                placeholder="e.g., Master's in Computer Science"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preferred Institution/Location
              </label>
              <input
                type="text"
                value={config.target_location}
                onChange={(e) => updateConfig({ target_location: e.target.value })}
                placeholder="e.g., Stanford University or Online"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </>
        );

      case 'immigration':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Immigration Goal *
              </label>
              <input
                type="text"
                value={config.target_outcome}
                onChange={(e) => updateConfig({ target_outcome: e.target.value })}
                placeholder="e.g., H1B Visa to USA"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Country *
              </label>
              <input
                type="text"
                value={config.target_location}
                onChange={(e) => updateConfig({ target_location: e.target.value })}
                placeholder="e.g., United States"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                required
              />
            </div>
          </>
        );

      case 'investment':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Investment Goal *
              </label>
              <input
                type="text"
                value={config.target_outcome}
                onChange={(e) => updateConfig({ target_outcome: e.target.value })}
                placeholder="e.g., Build $100k portfolio"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Investment Capital Range
              </label>
              <select
                value={config.budget_range}
                onChange={(e) => updateConfig({ budget_range: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                <option value="">Select capital range</option>
                <option value="0-10k">$0 - $10,000</option>
                <option value="10k-50k">$10,000 - $50,000</option>
                <option value="50k-100k">$50,000 - $100,000</option>
                <option value="100k-500k">$100,000 - $500,000</option>
                <option value="500k+">$500,000+</option>
              </select>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Category-specific fields */}
      {getCategorySpecificFields()}

      {/* Timeline */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Timeline (months) *
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="3"
            max="60"
            step="3"
            value={config.timeline_months}
            onChange={(e) => updateConfig({ timeline_months: parseInt(e.target.value) })}
            className="flex-1"
          />
          <span className="text-lg font-bold text-gray-900 dark:text-white w-20 text-right">
            {config.timeline_months} mo
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>3 months</span>
          <span>5 years</span>
        </div>
      </div>

      {/* Risk Tolerance */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Risk Tolerance
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['low', 'medium', 'high'] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => updateConfig({ risk_tolerance: level })}
              className={`
                px-4 py-3 rounded-lg font-medium transition-all
                ${config.risk_tolerance === level
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }
              `}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start gap-2">
          <span className="text-lg">💡</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Personalized Route
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Based on your archetype and preferences, we'll create a customized journey with milestones and tasks tailored to your goals.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Back
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || !config.target_outcome || !config.timeline_months}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              Creating Route...
            </>
          ) : (
            <>
              🚀 Create My Route
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default RouteBuilderForm;
