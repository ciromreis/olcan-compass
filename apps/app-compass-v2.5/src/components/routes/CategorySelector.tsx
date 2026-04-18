/**
 * CategorySelector Component
 * Select route category with visual cards
 */
import React from 'react';
import { motion } from 'framer-motion';

export type RouteCategory = 'employment' | 'entrepreneurship' | 'education' | 'immigration' | 'investment';

interface CategoryOption {
  id: RouteCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
}

interface CategorySelectorProps {
  selectedCategory: RouteCategory | null;
  onSelect: (category: RouteCategory) => void;
  className?: string;
}

const categories: CategoryOption[] = [
  {
    id: 'employment',
    name: 'Employment',
    description: 'Find your dream job or advance your career',
    icon: '💼',
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    id: 'entrepreneurship',
    name: 'Entrepreneurship',
    description: 'Start and grow your own business',
    icon: '🚀',
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600',
  },
  {
    id: 'education',
    name: 'Education',
    description: 'Pursue degrees, certifications, or skills',
    icon: '🎓',
    color: 'green',
    gradient: 'from-green-500 to-green-600',
  },
  {
    id: 'immigration',
    name: 'Immigration',
    description: 'Navigate visa and relocation processes',
    icon: '🌍',
    color: 'orange',
    gradient: 'from-slate-500 to-slate-600',
  },
  {
    id: 'investment',
    name: 'Investment',
    description: 'Build wealth through strategic investments',
    icon: '💰',
    color: 'yellow',
    gradient: 'from-slate-500 to-slate-600',
  },
];

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onSelect,
  className = '',
}) => {
  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Choose Your Journey Type
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <motion.button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className={`
              relative p-6 rounded-xl text-left transition-all
              ${selectedCategory === category.id
                ? `bg-gradient-to-br ${category.gradient} text-white shadow-lg`
                : 'bg-white dark:bg-gray-800 hover:shadow-md border-2 border-gray-200 dark:border-gray-700'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Selection Indicator */}
            {selectedCategory === category.id && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}

            {/* Icon */}
            <div className="text-4xl mb-3">{category.icon}</div>

            {/* Name */}
            <h4 className={`
              text-lg font-bold mb-2
              ${selectedCategory === category.id
                ? 'text-white'
                : 'text-gray-900 dark:text-white'
              }
            `}>
              {category.name}
            </h4>

            {/* Description */}
            <p className={`
              text-sm
              ${selectedCategory === category.id
                ? 'text-white/90'
                : 'text-gray-600 dark:text-gray-400'
              }
            `}>
              {category.description}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default CategorySelector;
