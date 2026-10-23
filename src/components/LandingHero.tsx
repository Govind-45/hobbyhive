import React from 'react';
import {
  Sparkles,
  Users,
  MessageSquareText,
  ShieldCheck,
  Flame,
  ArrowRight,
  PlusCircle,
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
    <div className="relative overflow-hidden bg-gradient-to-b from-hive-50 via-warmgray-50/50 to-transparent border-b border-warmgray-200/60 pb-10 pt-8 sm:pt-12">
      {/* Decorative subtle backdrop elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-hive-200/30 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-10 w-72 h-72 bg-amber-100/40 rounded-full blur-2xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-hive-100/80 border border-hive-300/60 text-hive-900 text-xs font-semibold mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-hive-600" />
            <span>Welcome to the Hobby Hive Community</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-warmgray-900 tracking-tight leading-[1.15]">
            Where your shared hobbies spark <span className="text-transparent bg-clip-text bg-gradient-to-r from-hive-600 via-amber-600 to-orange-600">genuine conversations.</span>
          </h1>

          {/* Description */}
          <p className="mt-4 text-base sm:text-lg text-warmgray-600 leading-relaxed max-w-2xl">
            Whether you're perfecting sourdough hydration, hunting for your next sci-fi read, dialing in a 35mm prime lens, or building mechanical keyboards — join hobbyists sharing authentic tips and passion projects.
          </p>

          {/* Action CTAs */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={user ? onOpenCreatePost : onOpenAuth}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-hive-600 hover:bg-hive-700 active:scale-95 shadow-md shadow-hive-600/20 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{user ? 'Start a Discussion' : 'Join the Hive & Share'}</span>
            </button>

            <a
              href="#feed-section"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-warmgray-700 hover:text-warmgray-900 bg-white hover:bg-warmgray-100 border border-warmgray-200 transition-colors"
            >
              <span>Browse Discussions</span>
              <ArrowRight className="w-4 h-4 text-warmgray-400" />
            </a>
          </div>

          {/* Value props mini pills */}
          <div className="mt-8 pt-6 border-t border-warmgray-200/60 flex flex-wrap items-center gap-y-3 gap-x-6 text-xs text-warmgray-500 font-medium">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-hive-600" />
              <span>Friendly & beginner-welcoming</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Passwordless Email OTP Security</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageSquareText className="w-4 h-4 text-sky-600" />
              <span>No algorithmic feed manipulation</span>
            </div>
          </div>
        </div>

        {/* Quick Category Bubbles */}
        <div className="mt-8">
          <p className="text-xs font-bold uppercase tracking-wider text-warmgray-400 mb-3 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-hive-500" />
            <span>Popular Communities</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 8).map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(isSelected ? 'all' : cat.slug)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-hive-600 text-white border-hive-600 shadow-sm'
                      : 'bg-white text-warmgray-700 border-warmgray-200 hover:border-hive-400 hover:bg-hive-50/50'
                  }`}
                >
                  <CategoryIcon
                    name={cat.icon}
                    className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-hive-600'}`}
                  />
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
