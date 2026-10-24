import React from 'react';
import { Layers } from 'lucide-react';
import { Category } from '../types/database';
import { CategoryIcon } from './CategoryIcon';

interface CategoryBarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  totalPostsCount?: number;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none no-scrollbar py-1.5 px-0.5">
        {/* All Discussions Pill */}
        <button
          onClick={() => onSelectCategory('all')}
          className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 border ${
            selectedCategory === 'all'
              ? 'bg-warmgray-900 text-white border-warmgray-900 shadow-md shadow-warmgray-900/20 scale-102'
              : 'bg-white/90 hover:bg-white text-warmgray-600 border-warmgray-200/90 hover:border-warmgray-300 hover:shadow-xs'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Discussions</span>
        </button>

        {/* Individual Category Pills */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`shrink-0 group inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 border ${
                isSelected
                  ? 'bg-gradient-to-r from-hive-600 to-amber-600 text-white border-hive-600 shadow-md shadow-hive-600/30 scale-102'
                  : 'bg-white/90 hover:bg-white text-warmgray-700 border-warmgray-200/90 hover:border-hive-300 hover:shadow-xs hover:-translate-y-0.5'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-transform group-hover:scale-110 ${
                  isSelected ? 'bg-white/20' : 'bg-warmgray-100'
                }`}
              >
                <CategoryIcon
                  name={cat.icon}
                  className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-hive-600'}`}
                />
              </div>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
