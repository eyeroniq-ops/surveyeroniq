import React from 'react';
import { Layers, Lock } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onAdminClick: () => void;
  showAdminLink?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, onAdminClick, showAdminLink = true }) => {
  return (
    <div className="min-h-screen flex flex-col bg-black text-neutral-200 relative overflow-x-hidden">
      {/* Background ambient effects - Reduced saturation for black theme */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] bg-neutral-900/20 rounded-full blur-[120px] opacity-40"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-neutral-800/20 rounded-full blur-[120px] opacity-40"></div>
      </div>

      <header className="bg-black/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <span className="font-bold text-2xl text-white tracking-tighter hover:text-indigo-400 transition-colors cursor-default">eyeroniq</span>
            </div>
            <div className="hidden sm:block h-6 w-px bg-white/10"></div>
            <span className="hidden sm:block text-sm font-medium text-neutral-500 tracking-wide uppercase">
              Plataforma de validación de marcas
            </span>
          </div>
          
          <div className="flex items-center gap-3">
              <div className="text-[10px] font-bold px-2 py-1 rounded border border-neutral-800 bg-neutral-900 text-neutral-500">
                  BETA
              </div>
              {showAdminLink && (
                <button 
                  onClick={onAdminClick}
                  className="p-2 text-neutral-600 hover:text-white hover:bg-neutral-800 rounded-full transition-all"
                  title="Admin Access"
                >
                  <Lock className="w-4 h-4" />
                </button>
              )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        {children}
      </main>

      <footer className="border-t border-white/5 py-10 mt-auto relative z-10 bg-black">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-neutral-600 text-sm mb-4">&copy; {new Date().getFullYear()} eyeroniq.</p>
        </div>
      </footer>
    </div>
  );
};