/**
 * Companion Customization
 * Customize companion appearance and accessories
 */

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Palette, Sparkles, Crown, Star } from 'lucide-react'
import { GlassCard, GlassButton } from '@/components/ui'

export interface CustomizationOption {
  id: string
  name: string
  category: 'color' | 'accessory' | 'effect' | 'badge'
  preview: string
  unlocked: boolean
  price?: {
    currency: number
    premium?: boolean
  }
  requirement?: {
    level?: number
    achievement?: string
  }
}

interface CompanionCustomizationProps {
  companionId: string
  currentCustomization: {
    color?: string
    accessories: string[]
    effects: string[]
    badge?: string
  }
  availableOptions: CustomizationOption[]
  onApply: (customization: any) => void
  onPurchase?: (optionId: string) => void
}

export const CompanionCustomization: React.FC<CompanionCustomizationProps> = ({
  companionId,
  currentCustomization,
  availableOptions,
  onApply,
  onPurchase
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'color' | 'accessory' | 'effect' | 'badge'>('color')
  const [previewCustomization, setPreviewCustomization] = useState(currentCustomization)

  const categories = [
    { id: 'color' as const, name: 'Colors', icon: <Palette className="w-5 h-5" /> },
    { id: 'accessory' as const, name: 'Accessories', icon: <Crown className="w-5 h-5" /> },
    { id: 'effect' as const, name: 'Effects', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'badge' as const, name: 'Badges', icon: <Star className="w-5 h-5" /> }
  ]

  const filteredOptions = availableOptions.filter(opt => opt.category === selectedCategory)

  const handleSelectOption = (option: CustomizationOption) => {
    if (!option.unlocked) return

    const newCustomization = { ...previewCustomization }

    if (option.category === 'color') {
      newCustomization.color = option.id
    } else if (option.category === 'accessory') {
      if (newCustomization.accessories.includes(option.id)) {
        newCustomization.accessories = newCustomization.accessories.filter(id => id !== option.id)
      } else {
        newCustomization.accessories = [...newCustomization.accessories, option.id]
      }
    } else if (option.category === 'effect') {
      if (newCustomization.effects.includes(option.id)) {
        newCustomization.effects = newCustomization.effects.filter(id => id !== option.id)
      } else {
        newCustomization.effects = [...newCustomization.effects, option.id]
      }
    } else if (option.category === 'badge') {
      newCustomization.badge = option.id === newCustomization.badge ? undefined : option.id
    }

    setPreviewCustomization(newCustomization)
  }

  const isOptionSelected = (option: CustomizationOption): boolean => {
    if (option.category === 'color') {
      return previewCustomization.color === option.id
    } else if (option.category === 'accessory') {
      return previewCustomization.accessories.includes(option.id)
    } else if (option.category === 'effect') {
      return previewCustomization.effects.includes(option.id)
    } else if (option.category === 'badge') {
      return previewCustomization.badge === option.id
    }
    return false
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Customize Your Companion</h2>
        <p className="text-foreground/60">Make your companion unique with colors, accessories, and effects</p>
      </div>

      {/* Preview */}
      <GlassCard className="p-8">
        <div className="text-center">
          <div className="text-9xl mb-4">🐉</div>
          <div className="flex flex-wrap gap-2 justify-center">
            {previewCustomization.accessories.map(acc => (
              <span key={acc} className="text-2xl">{acc}</span>
            ))}
          </div>
          {previewCustomization.badge && (
            <div className="mt-4 inline-block px-4 py-2 rounded-full bg-gradient-to-r from-brand-400 to-brand-600 text-white font-bold shadow-lg shadow-brand-500/20 backdrop-blur-md">
              {previewCustomization.badge}
            </div>
          )}
        </div>
      </GlassCard>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <GlassButton
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex-shrink-0 ${selectedCategory === cat.id ? 'ring-2 ring-purple-500' : ''}`}
          >
            {cat.icon}
            {cat.name}
          </GlassButton>
        ))}
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredOptions.map((option, index) => {
          const selected = isOptionSelected(option)

          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard
                className={`p-4 cursor-pointer transition-all ${
                  selected ? 'ring-2 ring-purple-500 bg-purple-500/10' : ''
                } ${!option.unlocked ? 'opacity-50' : 'hover:scale-105'}`}
                onClick={() => option.unlocked ? handleSelectOption(option) : null}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">{option.preview}</div>
                  <h4 className="font-semibold text-foreground text-sm mb-1">{option.name}</h4>
                  
                  {!option.unlocked && (
                    <div className="space-y-2">
                      {option.requirement && (
                        <div className="text-xs text-foreground/60">
                          {option.requirement.level && `Level ${option.requirement.level}`}
                          {option.requirement.achievement && `Achievement: ${option.requirement.achievement}`}
                        </div>
                      )}
                      {option.price && onPurchase && (
                        <GlassButton
                          size="sm"
                          onClick={() => onPurchase(option.id)}
                          className="w-full"
                        >
                          {option.price.premium ? '💎' : '💰'} {option.price.currency}
                        </GlassButton>
                      )}
                    </div>
                  )}
                  
                  {selected && (
                    <div className="mt-2 text-purple-600 font-semibold text-xs">
                      ✓ Selected
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          )
        })}
      </div>

      {/* Apply Button */}
      <div className="flex gap-4">
        <GlassButton
          onClick={() => setPreviewCustomization(currentCustomization)}
          className="flex-1"
        >
          Reset
        </GlassButton>
        <GlassButton
          onClick={() => onApply(previewCustomization)}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
        >
          Apply Changes
        </GlassButton>
      </div>
    </div>
  )
}
