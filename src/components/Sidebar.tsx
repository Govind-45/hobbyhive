import React from 'react';
import {
  Sparkles,
  Shield,
  Flame,
  PlusCircle,
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
      {/* Community Card */}
      <div className="bg-white rounded-2xl border border-warmgray-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-warmgray-900 font-black tracking-tight text-base">
          <Sparkles className="w-4 h-4 text-hive-600" />
          <span>About HobbyHive</span>
        </div>
        <p className="text-xs text-warmgray-600 leading-relaxed">
          HobbyHive is a welcoming space for hobbyists across books, gaming, music, photography, cooking, and craft making. No algorithms, no outrage — just genuine shared interests.
        </p>

        <button
          onClick={onOpenCreatePost}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-hive-600 hover:bg-hive-700 active:scale-95 shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Start a Discussion</span>
        </button>

        <div className="pt-3 border-t border-warmgray-100 flex items-center justify-between text-[11px] text-warmgray-500">
          <span>Database & Auth</span>
          <button
            onClick={onOpenSetupModal}
            className="text-hive-700 hover:underline font-semibold"
          >
            Supabase Info
          </button>
        </div>
      </div>

      {/* Community Guidelines */}
      <div className="bg-white rounded-2xl border border-warmgray-200 p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-warmgray-900 font-bold text-sm">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Hive Principles</span>
        </div>

        <ul className="space-y-2.5 text-xs text-warmgray-600">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-hive-500 mt-1.5 shrink-0" />
            <span><strong>Beginner Friendly:</strong> No gatekeeping. Everyone was new to their hobby once.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-hive-500 mt-1.5 shrink-0" />
            <span><strong>Constructive Feedback:</strong> Share tips, recipes, and critique with kindness.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-hive-500 mt-1.5 shrink-0" />
            <span><strong>Show Your Work:</strong> Share process photos, recipes, and gear setups.</span>
          </li>
        </ul>
      </div>

      {/* Category Directory */}
      <div className="bg-white rounded-2xl border border-warmgray-200 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-warmgray-900 font-bold text-sm">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>Hobby Hubs</span>
          </div>
          <span className="text-[11px] text-warmgray-400 font-normal">
            {categories.length} hubs
          </span>
        </div>

        <div className="space-y-1">
          {categories.slice(0, 7).map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(isSelected ? 'all' : cat.slug)}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-hive-50 text-hive-900 border border-hive-200'
                    : 'text-warmgray-600 hover:bg-warmgray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CategoryIcon
                    name={cat.icon}
                    className={`w-3.5 h-3.5 ${isSelected ? 'text-hive-600' : 'text-warmgray-400'}`}
                  />
                  <span>{cat.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-2 text-xs text-warmgray-400 space-y-1">
        <p>HobbyHive • Built with React, Supabase & Tailwind</p>
        <p>© 2026 HobbyHive Community</p>
      </div>
    </aside>
  );
};
