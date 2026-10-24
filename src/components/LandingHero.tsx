import React from 'react';
import {
  Sparkles,
  Users,
  MessageSquare,
  ShieldCheck,
  Flame,
  ArrowRight,
  PlusCircle,
  Compass,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Category } from '../types/database';
import { CategoryIcon } from './CategoryIcon';

interface LandingHeroProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  onOpenCreatePost: () => void;
  onOpenAuth: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  onOpenCreatePost,
  onOpenAuth,
}) => {
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden bg-mesh-pattern border-b border-amber-200/50 pt-10 pb-12 sm:pt-16 sm:pb-16 transition-colors">
      {/* Decorative ambient glowing orbs */}
      <div className="absolute top-[-80px] right-[10%] w-[420px] h-[420px] bg-gradient-to-br from-hive-300/30 via-amber-200/20 to-transparent rounded-full blur-3xl pointer-events-none -z-10 animate-float" />
      <div className="absolute bottom-[-60px] left-[5%] w-[360px] h-[360px] bg-gradient-to-tr from-orange-200/25 via-hive-100/30 to-transparent rounded-full blur-3xl pointer-events-none -z-10 animate-float-delayed" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Heading, Subtitle & Actions */}
          <div className="lg:col-span-7 space-y-6">
            {/* Live Community Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-amber-200/80 shadow-sm text-xs font-bold text-warmgray-800 hover:scale-105 transition-transform cursor-default">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span>1,400+ Hobbyists Online</span>
              <span className="text-amber-300">•</span>
              <span className="text-hive-700 flex items-center gap-1 font-semibold">
                <Sparkles className="w-3 h-3 text-hive-500" />
                Zero Algorithm Feed
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-warmgray-900 tracking-tight leading-[1.12]">
              Where your hobbies find their{' '}
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-hive-600 via-amber-600 to-orange-600">
                Hive.
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-hive-400/60"
                  viewBox="0 0 100 12"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,5 Q50,12 100,5"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            {/* Tagline */}
            <p className="text-base sm:text-lg text-warmgray-600 leading-relaxed max-w-xl font-normal">
              A welcoming community forum for bookworms, home bakers, street photographers, retro gamers, plant parents, and tinkerer makers. Connect over projects that ignite your spark.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <button
                onClick={user ? onOpenCreatePost : onOpenAuth}
                className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-hive-600 to-amber-600 hover:from-hive-700 hover:to-amber-700 active:scale-95 shadow-lg shadow-hive-600/25 hover:shadow-xl hover:shadow-hive-600/35 transition-all duration-200"
              >
                <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
                <span>{user ? 'Start a Discussion' : 'Join the Hive & Share'}</span>
                <ArrowRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href="#feed-section"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold text-warmgray-700 hover:text-warmgray-900 bg-white/90 hover:bg-white border border-warmgray-200/90 shadow-sm hover:shadow transition-all"
              >
                <Compass className="w-4 h-4 text-hive-600" />
                <span>Explore Discussions</span>
              </a>
            </div>

            {/* Micro Feature Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-warmgray-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Passwordless OTP Ready</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-hive-600" />
                <span>Beginner Friendly</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Real-time Discussions</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Stats & Community Preview Cards */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
            {/* Stat Card 1 */}
            <div className="p-4 sm:p-5 rounded-3xl glass-panel border border-white/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="w-10 h-10 rounded-2xl bg-amber-100/80 text-amber-800 flex items-center justify-center font-bold mb-3 shadow-inner">
                <MessageSquare className="w-5 h-5 text-hive-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-warmgray-900 tracking-tight">
                2,400+
              </div>
              <p className="text-xs font-medium text-warmgray-500 mt-0.5">
                Active Discussions & Project Logs
              </p>
            </div>

            {/* Stat Card 2 */}
            <div className="p-4 sm:p-5 rounded-3xl glass-panel border border-white/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="w-10 h-10 rounded-2xl bg-orange-100/80 text-orange-800 flex items-center justify-center font-bold mb-3 shadow-inner">
                <Flame className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-warmgray-900 tracking-tight">
                10 Hubs
              </div>
              <p className="text-xs font-medium text-warmgray-500 mt-0.5">
                Dedicated Hobby Communities
              </p>
            </div>

            {/* Stat Card 3 */}
            <div className="p-4 sm:p-5 rounded-3xl glass-panel border border-white/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center font-bold mb-3 shadow-inner">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-warmgray-900 tracking-tight">
                98%
              </div>
              <p className="text-xs font-medium text-warmgray-500 mt-0.5">
                Helpful Feedback Rate
              </p>
            </div>

            {/* Stat Card 4 */}
            <div className="p-4 sm:p-5 rounded-3xl glass-panel border border-white/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="w-10 h-10 rounded-2xl bg-sky-100/80 text-sky-800 flex items-center justify-center font-bold mb-3 shadow-inner">
                <Sparkles className="w-5 h-5 text-sky-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-warmgray-900 tracking-tight">
                100%
              </div>
              <p className="text-xs font-medium text-warmgray-500 mt-0.5">
                Free & Open Discussion
              </p>
            </div>
          </div>
        </div>

        {/* Quick Category Badges Bar with Hover Glow */}
        <div className="mt-10 pt-6 border-t border-amber-200/40">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-warmgray-500 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-hive-600" />
              <span>Jump Straight into a Hobby Hub</span>
            </span>
            <span className="text-xs text-warmgray-400 font-medium hidden sm:inline">
              Click any hub to filter feed
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {categories.slice(0, 9).map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(isSelected ? 'all' : cat.slug)}
                  className={`group inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all duration-200 border ${
                    isSelected
                      ? 'bg-hive-600 text-white border-hive-600 shadow-md shadow-hive-600/30 scale-105'
                      : 'bg-white/80 hover:bg-white text-warmgray-700 border-warmgray-200/80 hover:border-hive-400 hover:shadow hover:-translate-y-0.5'
                  }`}
                >
                  <div
                    className={`p-1 rounded-lg transition-transform group-hover:scale-110 ${
                      isSelected ? 'bg-white/20' : 'bg-hive-50'
                    }`}
                  >
                    <CategoryIcon
                      name={cat.icon}
                      className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-hive-600'}`}
                    />
                  </div>
                  <span>{cat.name.split('&')[0].trim()}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
