import React from 'react';
import {
  Sparkles,
  Shield,
  Flame,
  PlusCircle,
  ArrowRight,
} from 'lucide-react';
import { Category } from '../types/database';
import { CategoryIcon } from './CategoryIcon';

interface SidebarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  onOpenCreatePost: () => void;
  onOpenSetupModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  onOpenCreatePost,
  onOpenSetupModal,
}) => {
  return (
    <aside className="w-full space-y-5">
      {/* Community Intro Card */}
      <div className="bg-gradient-to-br from-amber-500/10 via-white to-hive-50/60 rounded-3xl border border-amber-200/80 p-6 shadow-sm space-y-4 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-hive-300/20 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center gap-2 text-warmgray-900 font-black tracking-tight text-base">
          <div className="w-8 h-8 rounded-xl bg-hive-500 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <span>About HobbyHive</span>
        </div>

        <p className="text-xs text-warmgray-600 leading-relaxed font-medium">
          A welcoming space for hobbyists across books, gaming, music, photography, cooking, and craft making. No algorithms, no outrage — just genuine shared interests.
        </p>

        <button
          onClick={onOpenCreatePost}
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-hive-600 to-amber-600 hover:from-hive-700 hover:to-amber-700 active:scale-95 shadow-md shadow-hive-600/20 hover:shadow-lg transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Start a Discussion</span>
        </button>

        <div className="pt-2 border-t border-amber-200/50 flex items-center justify-between text-[11px] text-warmgray-500">
          <span>Backend Connected</span>
          <button
            onClick={onOpenSetupModal}
            className="text-hive-700 hover:text-hive-800 font-bold hover:underline"
          >
            Supabase Info →
          </button>
        </div>
      </div>

      {/* Community Guidelines Card */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-warmgray-200/80 p-6 shadow-sm space-y-3.5">
        <div className="flex items-center gap-2 text-warmgray-900 font-bold text-sm">
          <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Shield className="w-4 h-4 text-emerald-600" />
          </div>
          <span>Hive Principles</span>
        </div>

        <ul className="space-y-3 text-xs text-warmgray-600">
          <li className="flex items-start gap-2.5">
            <span className="w-2 h-2 rounded-full bg-hive-500 mt-1 shrink-0" />
            <span><strong>Beginner Friendly:</strong> No gatekeeping. Everyone was new to their hobby once.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-2 h-2 rounded-full bg-hive-500 mt-1 shrink-0" />
            <span><strong>Constructive Feedback:</strong> Share tips, recipes, and critique with kindness.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-2 h-2 rounded-full bg-hive-500 mt-1 shrink-0" />
            <span><strong>Show Your Process:</strong> Share photos, recipes, failure notes, and setups.</span>
          </li>
        </ul>
      </div>

      {/* Hobby Hubs Directory */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-warmgray-200/80 p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-warmgray-900 font-bold text-sm mb-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center">
              <Flame className="w-4 h-4 text-orange-600" />
            </div>
            <span>Explore Hubs</span>
          </div>
          <span className="text-[11px] font-semibold text-warmgray-400">
            {categories.length} hubs
          </span>
        </div>

        <div className="space-y-1">
          {categories.slice(0, 8).map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(isSelected ? 'all' : cat.slug)}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-amber-50 text-amber-900 border border-amber-200/90 shadow-xs'
                    : 'text-warmgray-600 hover:text-warmgray-900 hover:bg-warmgray-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1 rounded-lg ${isSelected ? 'bg-amber-100 text-amber-800' : 'text-warmgray-400'}`}>
                    <CategoryIcon
                      name={cat.icon}
                      className="w-3.5 h-3.5"
                    />
                  </div>
                  <span>{cat.name}</span>
                </div>
                <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-amber-700 translate-x-0.5' : 'text-warmgray-300'}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-3 text-xs text-warmgray-400 space-y-1">
        <p className="font-medium">HobbyHive • Built with React, Supabase & Tailwind</p>
        <p className="text-[11px]">© 2026 HobbyHive Community</p>
      </div>
    </aside>
  );
};
