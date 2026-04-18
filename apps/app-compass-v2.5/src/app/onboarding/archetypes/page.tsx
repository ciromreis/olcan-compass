/**
 * Archetype Discovery Page
 * Main page for discovering and selecting professional archetypes
 */
'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useArchetypeStore, Archetype } from '@/stores/archetypeStore';
import { ArchetypeCard } from '@/components/archetypes/ArchetypeCard';
import { ArchetypeComparison } from '@/components/archetypes/ArchetypeComparison';

type ViewMode = 'grid' | 'comparison' | 'recommendation';

export default function ArchetypesPage() {
  const router = useRouter();
  const {
    archetypes,
    selectedArchetype,
    recommendation,
    isLoading,
    error,
    currentLanguage,
    fetchArchetypes,
    selectArchetype,
    getRecommendation,
    setComparisonArchetype,
    setLanguage,
  } = useArchetypeStore();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchArchetypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectArchetype = (archetype: Archetype) => {
    selectArchetype(archetype);
  };

  const handleCompareArchetype = (archetype: Archetype) => {
    // Add to comparison
    const currentComparison = useArchetypeStore.getState().comparisonArchetypes;
    if (!currentComparison[0]) {
      setComparisonArchetype(0, archetype);
    } else if (!currentComparison[1]) {
      setComparisonArchetype(1, archetype);
      setViewMode('comparison');
    } else {
      // Replace first one
      setComparisonArchetype(0, archetype);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedArchetype) {
      // Navigate to next step (companion initialization)
      router.push('/onboarding/companion');
    }
  };

  const handleGetRecommendation = async () => {
    await getRecommendation();
    setViewMode('recommendation');
  };

  const filteredArchetypes = archetypes.filter((archetype) =>
    archetype.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    archetype.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    archetype.content_themes?.some(theme => 
      theme.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Discover Your Professional Archetype
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Your archetype shapes your journey, companion personality, and personalized guidance.
            Choose the one that resonates with your professional aspirations.
          </p>
        </motion.div>

        {/* Controls */}
        <div className="mb-8 space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search archetypes..."
                  aria-label="Search archetypes"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Language Selector */}
            <select
              value={currentLanguage}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'pt' | 'es')}
              className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="pt">Português</option>
              <option value="es">Español</option>
            </select>

            {/* Get Recommendation */}
            <button
              onClick={handleGetRecommendation}
              disabled={isLoading}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Get Recommendation
            </button>
          </div>

          {/* View Mode Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              All Archetypes
            </button>
            <button
              onClick={() => setViewMode('comparison')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'comparison'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Compare
            </button>
            {recommendation && (
              <button
                onClick={() => setViewMode('recommendation')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'recommendation'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Recommendation
              </button>
            )}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="ml-auto px-4 py-2 rounded-lg font-medium bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Loading archetypes...</p>
          </div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          {!isLoading && (
            <>
              {/* Grid View */}
              {viewMode === 'grid' && (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredArchetypes.map((archetype) => (
                      <ArchetypeCard
                        key={archetype.archetype}
                        archetype={archetype}
                        isSelected={selectedArchetype?.archetype === archetype.archetype}
                        onSelect={handleSelectArchetype}
                        onCompare={handleCompareArchetype}
                        showDetails={showDetails}
                      />
                    ))}
                  </div>

                  {filteredArchetypes.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400">
                        No archetypes found matching your search.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Comparison View */}
              {viewMode === 'comparison' && (
                <motion.div
                  key="comparison"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ArchetypeComparison onClose={() => setViewMode('grid')} />
                </motion.div>
              )}

              {/* Recommendation View */}
              {viewMode === 'recommendation' && recommendation && (
                <motion.div
                  key="recommendation"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Your Recommended Archetype
                  </h2>
                  
                  <div className="mb-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-4xl">🎯</div>
                      <div>
                        <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          {archetypes.find(a => a.archetype === recommendation.recommended_archetype)?.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Confidence: {Math.round(recommendation.confidence_score * 100)}%
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {recommendation.reasoning}
                    </p>

                    {recommendation.alternative_archetypes && recommendation.alternative_archetypes.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Alternative Archetypes:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {recommendation.alternative_archetypes.map((alt) => (
                            <span
                              key={alt}
                              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                            >
                              {archetypes.find(a => a.archetype === alt)?.name || alt}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      const recommended = archetypes.find(a => a.archetype === recommendation.recommended_archetype);
                      if (recommended) {
                        handleSelectArchetype(recommended);
                        setViewMode('grid');
                      }
                    }}
                    className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Select This Archetype
                  </button>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>

        {/* Selection Confirmation */}
        {selectedArchetype && (
          <motion.div
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-lg"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-2xl">✓</div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Selected Archetype</p>
                  <p className="font-bold text-gray-900 dark:text-white">{selectedArchetype.name}</p>
                </div>
              </div>
              <button
                onClick={handleConfirmSelection}
                className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                Continue to Companion
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
