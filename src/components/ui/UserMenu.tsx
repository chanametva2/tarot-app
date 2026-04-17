'use client';

import { signOut, useSession } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export function UserMenu() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="text-sm text-amber-200/70 hover:text-amber-100 transition"
      >
        Login
      </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-amber-200/70 hover:text-amber-100 transition"
      >
        <div className="w-8 h-8 rounded-full bg-amber-700 flex items-center justify-center text-amber-100 font-medium">
          {session.user.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <span className="hidden sm:inline">{session.user.name}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-amber-950 border border-amber-700/30 rounded-lg shadow-xl py-1 z-50">
          <div className="px-4 py-2 border-b border-amber-700/30">
            <p className="text-amber-100 font-medium truncate">{session.user.name}</p>
            <p className="text-amber-200/50 text-xs truncate">{session.user.email}</p>
            <p className="text-amber-200/30 text-xs mt-1">
              Role: {(session.user as any).role || 'user'}
            </p>
          </div>
          <Link
            href="/journal"
            className="block px-4 py-2 text-amber-200/70 hover:text-amber-100 hover:bg-amber-900/30 transition"
            onClick={() => setIsOpen(false)}
          >
            My Journal
          </Link>
          <Link
            href="/favorites"
            className="block px-4 py-2 text-amber-200/70 hover:text-amber-100 hover:bg-amber-900/30 transition"
            onClick={() => setIsOpen(false)}
          >
            My Favorites
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full text-left px-4 py-2 text-red-400 hover:text-red-300 hover:bg-amber-900/30 transition"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
