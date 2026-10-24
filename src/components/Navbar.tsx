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
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-warmgray-200/80 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo & Brand with Honeycomb Icon */}
          <button
            onClick={onResetFilters}
            className="flex items-center gap-3 group text-left focus:outline-none"
          >
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 via-hive-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-hive-500/25 group-hover:scale-105 group-hover:rotate-6 transition-all duration-300">
              <Hexagon className="w-6 h-6 fill-white/90 stroke-hive-700 stroke-[1.5]" />
              <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-warmgray-900 flex items-center gap-0.5">
                Hobby<span className="text-transparent bg-clip-text bg-gradient-to-r from-hive-600 to-amber-600">Hive</span>
              </span>
              <span className="hidden sm:block text-[11px] font-semibold text-warmgray-400 -mt-1 tracking-wider uppercase">
                Community Forum
              </span>
            </div>
          </button>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warmgray-400 group-focus-within:text-hive-600 transition-colors pointer-events-none" />
              <input
                type="text"
                placeholder="Search discussions, hobbies, or users... (Press / to search)"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-11 pr-10 py-2.5 text-sm bg-warmgray-100/80 hover:bg-warmgray-100/90 focus:bg-white border border-warmgray-200/90 focus:border-hive-400 rounded-2xl focus:outline-none focus:ring-4 focus:ring-hive-400/15 shadow-inner transition-all placeholder:text-warmgray-400"
              />
              {searchQuery ? (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-warmgray-400 hover:text-warmgray-600 p-1 rounded-full hover:bg-warmgray-200/60"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-warmgray-200/80 text-[10px] font-mono text-warmgray-500 pointer-events-none">
                  /
                </span>
              )}
            </div>
          </div>

          {/* Right Action Items */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Supabase Status Pill */}
            <button
              onClick={onOpenSetupModal}
              title="Click to check Supabase backend configuration"
              className={`text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-2 transition-all border ${
                isDemoMode
                  ? 'bg-amber-50/90 text-amber-900 border-amber-200 hover:bg-amber-100 hover:shadow-sm'
                  : 'bg-emerald-50/90 text-emerald-900 border-emerald-200 hover:bg-emerald-100 hover:shadow-sm'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isDemoMode ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isDemoMode ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                />
              </span>
              <span>{isDemoMode ? 'Demo Mode' : 'Supabase Live'}</span>
            </button>

            {/* Create Post Button with Glow */}
            <button
              onClick={onOpenCreatePost}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-hive-600 to-amber-600 hover:from-hive-700 hover:to-amber-700 active:scale-95 rounded-2xl shadow-md shadow-hive-600/25 hover:shadow-lg hover:shadow-hive-600/35 transition-all duration-200 focus:outline-none"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Post</span>
            </button>

            {/* User Profile or Sign In */}
            {user && profile ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 p-1 pl-1.5 pr-3 rounded-2xl border border-warmgray-200/90 hover:border-hive-400/80 bg-white hover:bg-warmgray-50 transition-all text-left focus:outline-none shadow-xs hover:shadow"
                >
                  <img
                    src={
                      profile.avatar_url ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.id}`
                    }
                    alt={profile.username}
                    className="w-8 h-8 rounded-xl object-cover bg-warmgray-100 ring-1 ring-warmgray-200"
                  />
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-bold text-warmgray-900 max-w-[100px] truncate leading-tight">
                      {profile.full_name || profile.username}
                    </p>
                    <p className="text-[10px] text-warmgray-400 font-medium">@{profile.username}</p>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-60 glass-dropdown rounded-2xl shadow-xl border border-warmgray-200/90 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-warmgray-100">
                      <p className="text-[11px] font-semibold text-warmgray-400 uppercase tracking-wider">
                        Signed In
                      </p>
                      <p className="text-sm font-bold text-warmgray-900 truncate">
                        {profile.full_name || profile.username}
                      </p>
                      <p className="text-xs text-warmgray-400 truncate">@{profile.username}</p>
                    </div>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenProfile();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-warmgray-700 hover:bg-warmgray-100/80 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-warmgray-500" />
                      <span>My Activity & Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenCreatePost();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-warmgray-700 hover:bg-warmgray-100/80 transition-colors"
                    >
                      <PlusCircle className="w-4 h-4 text-warmgray-500" />
                      <span>Start a Discussion</span>
                    </button>

                    <div className="border-t border-warmgray-100 my-1" />

                    <button
                      onClick={async () => {
                        setUserMenuOpen(false);
                        await signOut();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
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
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-warmgray-800 hover:text-warmgray-950 bg-white hover:bg-warmgray-50 border border-warmgray-200/90 rounded-2xl shadow-xs hover:shadow transition-all"
              >
                <LogIn className="w-4 h-4 text-hive-600" />
                <span>Sign In / Join</span>
              </button>
            )}
          </div>

          {/* Mobile Buttons */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={onOpenCreatePost}
              className="p-2.5 text-white bg-gradient-to-r from-hive-600 to-amber-600 rounded-xl shadow-md active:scale-95"
              aria-label="New Post"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-warmgray-600 hover:text-warmgray-900 rounded-xl hover:bg-warmgray-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warmgray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search discussions or hobbies..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-9 py-2 text-sm bg-warmgray-100 border border-warmgray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-hive-400"
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

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-warmgray-200/80 py-3 space-y-2 animate-in fade-in slide-in-from-top-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSetupModal();
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-xl bg-warmgray-100 text-warmgray-800"
            >
              <span className="flex items-center gap-2 font-medium">
                <Sparkles className="w-4 h-4 text-hive-600" />
                Backend Status
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  isDemoMode ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {isDemoMode ? 'Demo Mode' : 'Supabase Live'}
              </span>
            </button>

            {user && profile ? (
              <>
                <div className="px-3 py-2 flex items-center gap-2.5">
                  <img
                    src={
                      profile.avatar_url ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.id}`
                    }
                    alt={profile.username}
                    className="w-9 h-9 rounded-xl object-cover"
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
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-warmgray-700 hover:bg-warmgray-100 rounded-xl text-left"
                >
                  <UserIcon className="w-4 h-4 text-warmgray-500" />
                  <span>My Activity & Profile</span>
                </button>

                <button
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await signOut();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl text-left"
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
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-hive-600 to-amber-600 rounded-xl shadow-md"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Create Account</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
