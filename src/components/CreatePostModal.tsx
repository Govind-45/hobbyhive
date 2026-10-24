import React, { useState, useEffect } from 'react';
import {
  X,
  PlusCircle,
  Loader2,
  Sparkles,
  AlertCircle,
  Bold,
  Italic,
  List,
  Quote,
  Code,
} from 'lucide-react';
import { Category, PostWithDetails } from '../types/database';
import { useAuth } from '../context/AuthContext';
import { createPost } from '../services/postsService';
import { CategoryIcon } from './CategoryIcon';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  initialCategorySlug?: string;
  onPostCreated: (post: PostWithDetails) => void;
  onOpenAuth: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  categories,
  initialCategorySlug,
  onPostCreated,
  onOpenAuth,
}) => {
  const { user, profile } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Set initial category
  useEffect(() => {
    if (categories.length > 0) {
      if (initialCategorySlug && initialCategorySlug !== 'all') {
        const found = categories.find((c) => c.slug === initialCategorySlug);
        setCategoryId(found ? found.id : categories[0].id);
      } else if (!categoryId) {
        setCategoryId(categories[0].id);
      }
    }
  }, [categories, initialCategorySlug, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  if (!user || !profile) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-warmgray-900/60 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-xl w-full max-w-md rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl border border-warmgray-200 animate-in zoom-in-95">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="w-7 h-7 text-hive-600" />
          </div>
          <h2 className="text-xl font-bold text-warmgray-900">Sign in to start a discussion</h2>
          <p className="text-sm text-warmgray-600 leading-relaxed">
            You must be signed in to share tips, ask questions, or showcase your hobby projects to the community.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-warmgray-600 hover:bg-warmgray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-hive-600 to-amber-600 hover:from-hive-700 hover:to-amber-700 rounded-xl shadow-md transition-all"
            >
              Sign In / Join
            </button>
          </div>
        </div>
      </div>
    );
  }

  const insertFormat = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('post-content-textarea') as HTMLTextAreaElement | null;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = `${prefix}${selected || 'text'}${suffix}`;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (trimmedTitle.length < 3) {
      setErrorMsg('Title must be at least 3 characters long.');
      return;
    }
    if (trimmedTitle.length > 200) {
      setErrorMsg('Title must not exceed 200 characters.');
      return;
    }
    if (trimmedContent.length < 5) {
      setErrorMsg('Content must be at least 5 characters long.');
      return;
    }
    if (!categoryId) {
      setErrorMsg('Please select a hobby community category.');
      return;
    }

    setIsSubmitting(true);

    const { data, error } = await createPost({
      title: trimmedTitle,
      content: trimmedContent,
      categoryId,
      author: profile,
    });

    setIsSubmitting(false);

    if (error) {
      setErrorMsg(error.message || 'Failed to publish post. Please try again.');
      return;
    }

    if (data) {
      onPostCreated(data);
      setTitle('');
      setContent('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-warmgray-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="bg-white/95 backdrop-blur-xl w-full max-w-2xl rounded-3xl shadow-2xl border border-warmgray-200 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-warmgray-100 flex items-center justify-between bg-warmgray-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-hive-600 to-amber-500 text-white flex items-center justify-center shadow-md shadow-hive-600/20">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-warmgray-900 tracking-tight">
                Start a New Discussion
              </h2>
              <p className="text-xs text-warmgray-500">
                Posting as <span className="font-bold text-warmgray-800">@{profile.username}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-warmgray-400 hover:text-warmgray-700 hover:bg-warmgray-200/80 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-warmgray-500 mb-2">
              Choose Hobby Community <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold text-left transition-all border ${
                      isSelected
                        ? 'bg-amber-50 text-amber-950 border-hive-500 ring-2 ring-hive-500/20 shadow-xs'
                        : 'bg-warmgray-50/80 text-warmgray-700 border-warmgray-200 hover:bg-warmgray-100 hover:border-warmgray-300'
                    }`}
                  >
                    <div className={`p-1 rounded-lg ${isSelected ? 'bg-amber-200 text-amber-900' : 'bg-warmgray-200/60'}`}>
                      <CategoryIcon
                        name={cat.icon}
                        className="w-3.5 h-3.5"
                      />
                    </div>
                    <span className="truncate">{cat.name.split('&')[0].trim()}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-warmgray-500">
                Discussion Title <span className="text-rose-500">*</span>
              </label>
              <span className={`text-xs ${title.length > 180 ? 'text-amber-600 font-bold' : 'text-warmgray-400'}`}>
                {title.length}/200
              </span>
            </div>
            <input
              type="text"
              placeholder="e.g., Best prime lens for low-light street photography under $400?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              className="w-full px-4 py-3 text-sm font-semibold bg-warmgray-50 border border-warmgray-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-hive-500 transition-all placeholder:text-warmgray-400"
              required
            />
          </div>

          {/* Body Content with Formatting Toolbar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-warmgray-500">
                Content & Discussion Details <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs text-warmgray-400">
                {content.length} characters
              </span>
            </div>

            {/* Quick Markdown Toolbar */}
            <div className="flex items-center gap-1 p-1 bg-warmgray-100/80 rounded-t-xl border-t border-x border-warmgray-200 text-xs text-warmgray-600">
              <button
                type="button"
                onClick={() => insertFormat('**', '**')}
                className="p-1.5 hover:bg-white rounded-lg transition-colors font-bold"
                title="Bold"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormat('*', '*')}
                className="p-1.5 hover:bg-white rounded-lg transition-colors"
                title="Italic"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormat('\n- ')}
                className="p-1.5 hover:bg-white rounded-lg transition-colors"
                title="Bullet List"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormat('\n> ')}
                className="p-1.5 hover:bg-white rounded-lg transition-colors"
                title="Quote"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormat('`', '`')}
                className="p-1.5 hover:bg-white rounded-lg transition-colors"
                title="Code"
              >
                <Code className="w-3.5 h-3.5" />
              </button>
            </div>

            <textarea
              id="post-content-textarea"
              rows={6}
              placeholder="Share your experience, specific questions, context, or steps you've already tried. Keep it constructive and welcoming..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-4 text-sm bg-warmgray-50 border border-warmgray-200 rounded-b-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-hive-500 transition-all placeholder:text-warmgray-400 resize-none leading-relaxed"
              required
            />
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-warmgray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-warmgray-600 hover:bg-warmgray-100 rounded-2xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-hive-600 to-amber-600 hover:from-hive-700 hover:to-amber-700 active:scale-95 disabled:opacity-40 disabled:pointer-events-none rounded-2xl shadow-md shadow-hive-600/25 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Publish Discussion</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
