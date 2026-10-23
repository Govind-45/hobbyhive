import React, { useState } from 'react';
import {
  Search,
  PlusCircle,
  LogIn,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Hexagon,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenCreatePost: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenSetupModal: () => void;
  onResetFilters: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenCreatePost,
  onOpenAuth,
  onOpenProfile,
  onOpenSetupModal,
  onResetFilters,
}) => {
  const { user, profile, signOut, isDemoMode } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-warmgray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <button
            onClick={onResetFilters}
            className="flex items-center gap-2.5 group text-left focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-hive-500 to-hive-400 flex items-center justify-center text-white shadow-md shadow-hive-500/20 group-hover:scale-105 transition-transform">
              <Hexagon className="w-6 h-6 fill-white stroke-hive-600 stroke-[1.5]" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-warmgray-900 flex items-center gap-1">
                Hobby<span className="text-hive-600">Hive</span>
              </span>
              <span className="hidden sm:block text-[11px] font-medium text-warmgray-500 -mt-1 tracking-wide">
                Community Discussion Forum
              </span>
            </div>
          </button>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-2">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warmgray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search hobbies, discussions, or tags..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-9 py-2 text-sm bg-warmgray-100/80 border border-warmgray-200 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-hive-400 focus:border-transparent transition-all placeholder:text-warmgray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-warmgray-400 hover:text-warmgray-600 p-0.5 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Action buttons (Right) */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Status / Mode Pill */}
            <button
              onClick={onOpenSetupModal}
              title="Click to check Supabase backend configuration"
              className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 transition-colors border ${
                isDemoMode
                  ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${
                  isDemoMode ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              />
              {isDemoMode ? 'Demo Mode' : 'Supabase Live'}
            </button>

            {/* Create Post Button */}
            <button
              onClick={onOpenCreatePost}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-hive-600 hover:bg-hive-700 active:scale-95 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-hive-500 focus:ring-offset-1"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Post</span>
            </button>

            {/* Auth Area */}
            {user && profile ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2 pr-3 rounded-xl border border-warmgray-200 hover:border-warmgray-300 bg-white hover:bg-warmgray-50 transition-colors text-left focus:outline-none"
                >
                  <img
                    src={
                      profile.avatar_url ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.id}`
                    }
                    alt={profile.username}
                    className="w-7 h-7 rounded-lg object-cover bg-warmgray-100 border border-warmgray-200"
                  />
                  <span className="text-sm font-semibold text-warmgray-800 max-w-[120px] truncate">
                    {profile.full_name || profile.username}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-warmgray-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-warmgray-100">
                      <p className="text-xs text-warmgray-500">Signed in as</p>
                      <p className="text-sm font-bold text-warmgray-900 truncate">
                        @{profile.username}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenProfile();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-warmgray-700 hover:bg-warmgray-50 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-warmgray-500" />
                      <span>My Activity & Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenCreatePost();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-warmgray-700 hover:bg-warmgray-50 transition-colors"
                    >
                      <PlusCircle className="w-4 h-4 text-warmgray-500" />
                      <span>Create a Post</span>
                    </button>

                    <div className="border-t border-warmgray-100 my-1" />

                    <button
                      onClick={async () => {
                        setUserMenuOpen(false);
                        await signOut();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-warmgray-700 hover:text-warmgray-900 bg-warmgray-100 hover:bg-warmgray-200 rounded-xl transition-colors"
              >
                <LogIn className="w-4 h-4 text-warmgray-600" />
                <span>Sign In / Join</span>
              </button>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={onOpenCreatePost}
              className="p-2 text-white bg-hive-600 rounded-lg active:scale-95"
              aria-label="New Post"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-warmgray-600 hover:text-warmgray-900 rounded-lg hover:bg-warmgray-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warmgray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search hobbies or discussions..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-9 py-2 text-sm bg-warmgray-100/90 border border-warmgray-200 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-hive-400"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-warmgray-400 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu collapsible */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-warmgray-200 py-3 space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSetupModal();
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg bg-warmgray-100 text-warmgray-800"
            >
              <span className="flex items-center gap-2 font-medium">
                <Sparkles className="w-4 h-4 text-hive-600" />
                Backend Status
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  isDemoMode ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {isDemoMode ? 'Demo Mode' : 'Supabase Live'}
              </span>
            </button>

            {user && profile ? (
              <>
                <div className="px-3 py-2 flex items-center gap-2">
                  <img
                    src={
                      profile.avatar_url ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.id}`
                    }
                    alt={profile.username}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                  <div>
                    <p className="text-sm font-bold text-warmgray-900">{profile.full_name}</p>
                    <p className="text-xs text-warmgray-500">@{profile.username}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenProfile();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-warmgray-700 hover:bg-warmgray-100 rounded-lg text-left"
                >
                  <UserIcon className="w-4 h-4 text-warmgray-500" />
                  <span>My Activity & Profile</span>
                </button>

                <button
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await signOut();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-hive-600 hover:bg-hive-700 rounded-xl"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Join with Email OTP</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
