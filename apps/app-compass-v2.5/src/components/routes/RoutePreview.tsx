/**
 * RoutePreview Component
 * Preview route configuration before creation
 */
import React from 'react';
import { motion } from 'framer-motion';
import { RouteConfig } from '@/stores/routeBuilderStore';

interface RoutePreviewProps {
  config: RouteConfig;
  onEdit?: () => void;
  onConfirm?: () => void;
  className?: string;
}

export const RoutePreview: React.FC<RoutePreviewProps> = ({
  config,
  onEdit,
  onConfirm,
  className = '',
}) => {
  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      employment: '💼',
      entrepreneurship: '🚀',
      education: '🎓',
      immigration: '🌍',
      investment: '💰',
    };
    return icons[category] || '🎯';
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      employment: 'blue',
      entrepreneurship: 'purple',
      education: 'green',
      immigration: 'orange',
      investment: 'yellow',
    };
    return colors[category] || 'gray';
  };

  const color = getCategoryColor(config.category);

  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-6">
        <div className="text-6xl mb-3">{getCategoryIcon(config.category)}</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Your Route Preview
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Review your journey configuration
        </p>
      </div>

      <div className="space-y-4">
        {/* Category */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
            Category
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white capitalize">
            {config.category}
          </div>
        </div>

        {/* Target Outcome */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
            Goal
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {config.target_outcome}
          </div>
        </div>

        {/* Target Location */}
        {config.target_location && (
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              Location
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {config.target_location}
            </div>
          </div>
        )}

        {/* Timeline & Risk */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              Timeline
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {config.timeline_months} months
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              Risk Level
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white capitalize">
              {config.risk_tolerance || 'Medium'}
            </div>
          </div>
        </div>

        {/* Budget Range */}
        {config.budget_range && (
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              Budget Range
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              ${config.budget_range}
            </div>
          </div>
        )}

        {/* What to Expect */}
        <div className={`p-4 bg-${color}-50 dark:bg-${color}-900/20 rounded-lg`}>
          <h4 className={`text-sm font-semibold text-${color}-900 dark:text-${color}-100 mb-2`}>
            What Happens Next:
          </h4>
          <ul className={`text-sm text-${color}-700 dark:text-${color}-300 space-y-1`}>
            <li>• AI generates personalized milestones for your journey</li>
            <li>• Each milestone includes actionable tasks</li>
            <li>• Your companion provides guidance along the way</li>
            <li>• Track progress and earn achievements</li>
          </ul>
        </div>
      </div>

      {/* Actions */}
      {(onEdit || onConfirm) && (
        <div className="flex gap-3 mt-6">
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Edit Details
            </button>
          )}
          {onConfirm && (
            <button
              onClick={onConfirm}
              className={`flex-1 px-6 py-3 bg-gradient-to-r from-${color}-500 to-${color}-600 hover:from-${color}-600 hover:to-${color}-700 text-white rounded-lg font-medium transition-colors`}
            >
              Confirm & Create
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default RoutePreview;
