"use client";

import { motion } from "framer-motion";
import { Trophy, Target, Flame, Zap, Star, TrendingUp } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { AchievementShowcase } from "@/components/gamification/AchievementShowcase";
import { QuestDashboard } from "@/components/gamification/QuestDashboard";
import { StreakVisualizer } from "@/components/gamification/StreakVisualizer";
import { useGamificationStore } from "@/stores/eventDrivenGamificationStore";

export default function GamificationHubPage() {
  const progress = useGamificationStore((s) => s.userProgress);
  const streaks = useGamificationStore((s) => s.streaks);

  const highestStreak = Math.max(
    ...Object.values(streaks || {}).map((s) => s.currentCount),
    0
  );
  const bestStreak = Math.max(
    ...Object.values(streaks || {}).map((s) => s.bestCount),
    0
  );

  const xpPercent = progress.xpToNextLevel > 0
    ? Math.min(100, Math.round(((progress.totalXP % progress.xpToNextLevel) / progress.xpToNextLevel) * 100))
    : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24">
      {/* Header */}
      <section className="space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black tracking-[0.22em] uppercase shadow-xl">
          <Trophy className="w-3.5 h-3.5" />
          Centro de Evolução
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-slate-950">
          Gamificação <span className="text-slate-400">Compass</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl leading-relaxed font-medium">
          Sua progressão profissional traduzida em conquistas, missões e streaks.
          Cada ação no Compass fortalece sua presença.
        </p>
      </section>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-6 space-y-3" variant="olcan">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
            <Star className="w-4 h-4" />
            Nível
          </div>
          <p className="text-4xl font-black text-slate-950">{progress.level}</p>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{progress.title}</p>
        </GlassCard>

        <GlassCard className="p-6 space-y-3" variant="olcan">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
            <Zap className="w-4 h-4" />
            XP Total
          </div>
          <p className="text-4xl font-black text-slate-950">{progress.totalXP.toLocaleString()}</p>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-slate-950 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
            />
          </div>
        </GlassCard>

        <GlassCard className="p-6 space-y-3" variant="olcan">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
            <Flame className="w-4 h-4" />
            Streak Atual
          </div>
          <p className="text-4xl font-black text-slate-950">{highestStreak}</p>
          <p className="text-xs font-semibold text-slate-400">Melhor: {bestStreak} dias</p>
        </GlassCard>

        <GlassCard className="p-6 space-y-3" variant="olcan">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
            <TrendingUp className="w-4 h-4" />
            Moedas
          </div>
          <p className="text-4xl font-black text-slate-950">{progress.totalCoins}</p>
          <p className="text-xs font-semibold text-slate-400">Ganhas por missões</p>
        </GlassCard>
      </div>

      {/* Streak Visualizer */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black text-slate-950 tracking-tighter uppercase">Consistência</h2>
        <StreakVisualizer
          currentStreak={highestStreak}
          bestStreak={bestStreak}
          multiplier={1 + Math.floor(highestStreak / 7) * 0.1}
        />
      </section>

      {/* Two-column: Quests + Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-950 tracking-tighter uppercase flex items-center gap-3">
              <Target className="w-6 h-6" />
              Missões Ativas
            </h2>
            <Link href="/aura/quests">
              <GlassButton size="sm" className="text-[10px] font-bold uppercase tracking-widest">
                Ver Todas
              </GlassButton>
            </Link>
          </div>
          <QuestDashboard />
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-950 tracking-tighter uppercase flex items-center gap-3">
              <Trophy className="w-6 h-6" />
              Conquistas
            </h2>
            <Link href="/aura/achievements">
              <GlassButton size="sm" className="text-[10px] font-bold uppercase tracking-widest">
                Ver Todas
              </GlassButton>
            </Link>
          </div>
          <AchievementShowcase />
        </section>
      </div>
    </div>
  );
}
