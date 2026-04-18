/**
 * ArchetypeComparison Component
 * Side-by-side comparison of two archetypes
 */
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Archetype, ArchetypeComparison as ComparisonData, useArchetypeStore } from '@/stores/archetypeStore';

interface ArchetypeComparisonProps {
  archetype1?: Archetype | null;
  archetype2?: Archetype | null;
  onClose?: () => void;
}

export const ArchetypeComparison: React.FC<ArchetypeComparisonProps> = ({
  archetype1: propArchetype1,
  archetype2: propArchetype2,
  onClose,
}) => {
  const { compareArchetypes, comparisonArchetypes } = useArchetypeStore();
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const archetype1 = propArchetype1 || comparisonArchetypes[0];
  const archetype2 = propArchetype2 || comparisonArchetypes[1];

  useEffect(() => {
    if (archetype1 && archetype2) {
      loadComparison();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [archetype1, archetype2]);

  const loadComparison = async () => {
    if (!archetype1 || !archetype2) return;
    
    setIsLoading(true);
    const data = await compareArchetypes(archetype1.archetype, archetype2.archetype);
    setComparison(data);
    setIsLoading(false);
  };

  if (!archetype1 || !archetype2) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Select two archetypes to compare
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Archetype Comparison
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Comparing archetypes...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Archetype Names */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">
                {archetype1.name}
              </h3>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100">
                {archetype2.name}
              </h3>
            </div>
          </div>

          {/* Similarities */}
          {comparison?.similarities && comparison.similarities.length > 0 && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Similarities
              </h4>
              <ul className="space-y-2">
                {comparison.similarities.map((similarity, index) => (
                  <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{similarity}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Differences */}
          {comparison?.differences && comparison.differences.length > 0 && (
            <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Key Differences
              </h4>
              <ul className="space-y-2">
                {comparison.differences.map((difference, index) => (
                  <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{difference}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Detailed Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                    Aspect
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-blue-700 dark:text-blue-300">
                    {archetype1.name}
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-purple-700 dark:text-purple-300">
                    {archetype2.name}
                  </th>
                </tr>
              </thead>
              <tbody>
                <ComparisonRow
                  label="Primary Motivator"
                  value1={archetype1.primary_motivator}
                  value2={archetype2.primary_motivator}
                />
                <ComparisonRow
                  label="Primary Fear"
                  value1={archetype1.primary_fear}
                  value2={archetype2.primary_fear}
                />
                <ComparisonRow
                  label="Evolution Path"
                  value1={archetype1.evolution_path}
                  value2={archetype2.evolution_path}
                />
                <ComparisonRow
                  label="Risk Tolerance"
                  value1={archetype1.typical_risk_tolerance}
                  value2={archetype2.typical_risk_tolerance}
                />
                <ComparisonRow
                  label="Decision Speed"
                  value1={archetype1.decision_speed}
                  value2={archetype2.decision_speed}
                />
                <ComparisonRow
                  label="Companion Style"
                  value1={archetype1.companion_traits?.personality || 'N/A'}
                  value2={archetype2.companion_traits?.personality || 'N/A'}
                />
              </tbody>
            </table>
          </div>

          {/* Route Preferences Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <RoutePreferences archetype={archetype1} color="blue" />
            <RoutePreferences archetype={archetype2} color="purple" />
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Comparison Row Component
const ComparisonRow: React.FC<{
  label: string;
  value1: string;
  value2: string;
}> = ({ label, value1, value2 }) => {
  const isSame = value1.toLowerCase() === value2.toLowerCase();
  
  return (
    <tr className="border-b border-gray-100 dark:border-gray-800">
      <td className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
        {label}
      </td>
      <td className={`py-3 px-4 ${isSame ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
        {value1}
      </td>
      <td className={`py-3 px-4 ${isSame ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
        {value2}
      </td>
    </tr>
  );
};

// Route Preferences Component
const RoutePreferences: React.FC<{
  archetype: Archetype;
  color: 'blue' | 'purple';
}> = ({ archetype, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Route Preferences
      </h4>
      <div className="space-y-2">
        {Object.entries(archetype.route_weights || {}).map(([route, weight]) => (
          <div key={route}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600 dark:text-gray-400 capitalize">
                {route.replace('_', ' ')}
              </span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {Math.round(weight * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`${colorClasses[color]} h-2 rounded-full transition-all`}
                style={{ width: `${weight * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArchetypeComparison;
