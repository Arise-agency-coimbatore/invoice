'use client';

import { Menu, LogOut, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserEmail(user.email || '');
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <header className="h-16 border-b border-navy-700/40 bg-navy-900/30 backdrop-blur-xl flex items-center justify-between px-4 lg:px-6">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-navy-400 hover:text-white hover:bg-navy-800/50 transition-all"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-sm font-medium text-navy-300 hidden sm:block">
          Invoice Manager
        </h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {userEmail && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy-800/40 border border-navy-700/30">
            <User className="h-3.5 w-3.5 text-navy-400" />
            <span className="text-xs text-navy-300 hidden sm:block">{userEmail}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-navy-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200 text-sm"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:block">Logout</span>
        </button>
      </div>
    </header>
  );
}
