'use client';
import React, { useState, useEffect } from 'react';
import { auth, isConfigured } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConfigured || !auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    if (!auth) return;
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Sign-in error:', error);
    }
  };

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  // Don't render anything if Firebase isn't configured
  if (!isConfigured) return null;

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse"></div>;
  }

  if (user) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          {user.photoURL ? (
            <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full border-2 border-slate-200" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-indigo-600" />
            </div>
          )}
          <span className="text-sm font-medium text-slate-700 hidden sm:inline">
            {user.displayName?.split(' ')[0]}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className="text-slate-400 hover:text-slate-600 transition-colors"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
    >
      <LogIn className="w-4 h-4" />
      <span>Sign In</span>
    </button>
  );
}
