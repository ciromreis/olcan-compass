/**
 * ArchetypeCard Component
 * Displays an archetype with its key information
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Archetype } from '@/stores/archetypeStore';

interface ArchetypeCardProps {
  archetype: Archetype;
  isSelected?: boolean;
  onSelect?: (archetype: Archetype) => void;
  onCompare?: (archetype: Archetype) => void;
  showDetails?: boolean;
  className?: string;
}

export const ArchetypeCard: React.FC<ArchetypeCardProps> = ({
  archetype,
  isSelected = false,
  onSelect,
  onCompare,
  showDetails = false,
  className = '',
}) => {
  const handleClick = () => {
    if (onSelect) {
      onSelect(archetype);
    }
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCompare) {
      onCompare(archetype);
    }
  };

  return (
    <motion.div
      className={`
        relative rounded-xl border-2 p-6 cursor-pointer transition-all
        ${isSelected 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
        }
        ${className}
      `}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-4 right-4">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}

      {/* Archetype Name */}
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {archetype.name}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
        {archetype.description}
      </p>

      {/* Key Traits */}
      <div className="space-y-2 mb-4">
        <div className="flex items-start">
          <span className="text-xs font-semibold text-green-600 dark:text-green-400 mr-2">
            ✓ Motivator:
          </span>
          <span className="text-xs text-gray-700 dark:text-gray-300">
            {archetype.primary_motivator}
          </span>
        </div>
        
        {showDetails && (
          <>
            <div className="flex items-start">
              <span className="text-xs font-semibold text-red-600 dark:text-red-400 mr-2">
                ✗ Fear:
              </span>
              <span className="text-xs text-gray-700 dark:text-gray-300">
                {archetype.primary_fear}
              </span>
            </div>
            
            <div className="flex items-start">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 mr-2">
                → Path:
              </span>
              <span className="text-xs text-gray-700 dark:text-gray-300">
                {archetype.evolution_path}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Companion Theme */}
      {showDetails && archetype.companion_traits && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Companion Style
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getCompanionEmoji(archetype.companion_traits.visual_theme)}</span>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {archetype.companion_traits.personality}
            </span>
          </div>
        </div>
      )}

      {/* Tags */}
      {archetype.content_themes && archetype.content_themes.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {archetype.content_themes.slice(0, 3).map((theme, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
            >
              {theme}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        {onSelect && (
          <button
            className={`
              flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${isSelected
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }
            `}
          >
            {isSelected ? 'Selected' : 'Select'}
          </button>
        )}
        
        {onCompare && (
          <button
            onClick={handleCompare}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Compare
          </button>
        )}
      </div>
    </motion.div>
  );
};

// Helper function to get companion emoji
function getCompanionEmoji(theme: string): string {
  const emojiMap: Record<string, string> = {
    phoenix: '🔥',
    owl: '🦉',
    lion: '🦁',
    eagle: '🦅',
    wolf: '🐺',
    dragon: '🐉',
    turtle: '🐢',
    butterfly: '🦋',
    tree: '🌳',
    compass: '🧭',
    star: '⭐',
    crystal: '💎',
  };
  
  return emojiMap[theme.toLowerCase()] || '✨';
}

export default ArchetypeCard;
