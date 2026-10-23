import React from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface SetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupModal: React.FC<SetupModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-warmgray-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-warmgray-200 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-warmgray-100 flex items-center justify-between bg-warmgray-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-hive-500 text-white flex items-center justify-center shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-warmgray-900 tracking-tight">
                Supabase Backend Setup
              </h2>
              <p className="text-xs text-warmgray-500">
                Connection Status & Configuration Guide
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-warmgray-400 hover:text-warmgray-700 hover:bg-warmgray-200/80 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5 text-sm text-warmgray-700">
          {/* Status Alert */}
          {isSupabaseConfigured ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-900">Supabase is Live & Connected!</p>
                <p className="text-xs text-emerald-700 mt-1">
                  Your application is communicating with your real Supabase backend with Row Level Security and Email OTP.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900">Running in Demo Mode</p>
                <p className="text-xs text-amber-700 mt-1">
                  Supabase environment variables (<code className="font-mono bg-amber-100 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> & <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code>) are not yet set. The app is fully interactive with realistic mock data and simulated local OTP auth so you can demo immediately!
                </p>
              </div>
            </div>
          )}

          {/* Quick 3-Step Setup Instructions */}
          <div className="space-y-3">
            <h3 className="font-bold text-warmgray-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-hive-600" />
              <span>How to link your live Supabase database</span>
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-warmgray-50 border border-warmgray-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-warmgray-900">
                  <span>1. Create a Supabase Project</span>
                  <a
                    href="https://database.new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-hive-700 hover:underline"
                  >
                    <span>database.new</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-warmgray-600">
                  Sign in to Supabase and create a new project named <code className="bg-warmgray-200 px-1 py-0.5 rounded">hobbyhive</code>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-warmgray-50 border border-warmgray-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-warmgray-900">
                  <span>2. Run Schema & RLS Policies</span>
                  <span className="font-mono text-[11px] text-warmgray-500">supabase/schema.sql</span>
                </div>
                <p className="text-warmgray-600">
                  In your Supabase Dashboard, navigate to the <strong>SQL Editor</strong>, open the provided file <code className="font-mono bg-warmgray-200 px-1 py-0.5 rounded">supabase/schema.sql</code>, and click <strong>Run</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-warmgray-50 border border-warmgray-200 text-xs space-y-1.5">
                <div className="font-bold text-warmgray-900">
                  <span>3. Add Environment Variables</span>
                </div>
                <p className="text-warmgray-600">
                  In your project root, copy <code className="font-mono bg-warmgray-200 px-1 py-0.5 rounded">.env.example</code> to <code className="font-mono bg-warmgray-200 px-1 py-0.5 rounded">.env</code> and fill in your keys:
                </p>
                <pre className="p-2.5 rounded-lg bg-warmgray-900 text-warmgray-100 font-mono text-[11px] overflow-x-auto">
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...`}
                </pre>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold text-white bg-warmgray-900 hover:bg-warmgray-800 rounded-xl transition-colors shadow-sm"
            >
              Got it, close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
