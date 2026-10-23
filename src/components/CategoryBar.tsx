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
    <div className="w-full">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar py-1">
        {/* All Hobbies button */}
        <button
          onClick={() => onSelectCategory('all')}
          className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
            selectedCategory === 'all'
              ? 'bg-warmgray-900 text-white border-warmgray-900 shadow-sm'
              : 'bg-white text-warmgray-600 border-warmgray-200 hover:border-warmgray-300 hover:bg-warmgray-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Discussions</span>
        </button>

        {/* Individual Category buttons */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                isSelected
                  ? 'bg-hive-600 text-white border-hive-600 shadow-sm shadow-hive-600/20'
                  : 'bg-white text-warmgray-700 border-warmgray-200 hover:border-warmgray-300 hover:bg-warmgray-50'
              }`}
            >
              <CategoryIcon
                name={cat.icon}
                className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-hive-600'}`}
              />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
