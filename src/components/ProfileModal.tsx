import React, { useState, useEffect } from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { isFirebaseConfigured } from '../services/firebase';
import { loginWithGoogle, logoutUser } from '../services/authService';
import { X, User, Shield, RefreshCw, LogIn, LogOut, Check } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const userProfile = useWorkspaceStore((state) => state.userProfile);
  const saveHandles = useWorkspaceStore((state) => state.saveHandles);
  const updateCodeforcesStats = useWorkspaceStore((state) => state.updateCodeforcesStats);
  const showNotification = useWorkspaceStore((state) => state.showNotification);

  const [lcHandle, setLcHandle] = useState('');
  const [cfHandle, setCfHandle] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync state from local storage on mount/open
  useEffect(() => {
    if (isOpen) {
      setLcHandle(localStorage.getItem('leetcode_username') || '');
      setCfHandle(localStorage.getItem('codeforces_username') || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Firebase Google Login
  const handleLogin = async () => {
    if (!isFirebaseConfigured) {
      showNotification('Firebase is not configured. Setup instructions are displayed below.', 'error');
      return;
    }
    setLoading(true);
    try {
      await loginWithGoogle();
      showNotification('Signed in successfully with Google', 'success');
    } catch (err: any) {
      console.error(err);
      showNotification(err?.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      showNotification('Signed out successfully', 'info');
    } catch (err: any) {
      console.error(err);
      showNotification('Logout failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Sync CF profile statistics from official Codeforces API
  const handleSyncCodeforces = async () => {
    if (!cfHandle.trim()) {
      showNotification('Please enter a Codeforces handle first', 'info');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`https://codeforces.com/api/user.info?handles=${cfHandle.trim()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'OK' && data.result?.[0]) {
          const cfUser = data.result[0];
          updateCodeforcesStats({
            rating: cfUser.rating,
            rank: cfUser.rank,
            maxRating: cfUser.maxRating,
            maxRank: cfUser.maxRank
          });
          showNotification(`Synced CF profile for ${cfUser.handle}! Rating: ${cfUser.rating || 'Unrated'}`, 'success');
        } else {
          showNotification('Unable to fetch Codeforces profile: User handle not found', 'error');
        }
      } else {
        showNotification('Unable to fetch Codeforces profile: API is currently offline', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Unable to fetch Codeforces profile: Request failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Save handles locally
  const handleSaveProfileSettings = () => {
    saveHandles(lcHandle.trim(), cfHandle.trim());
    showNotification('Connected handles updated successfully', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center">
      {/* Backdrop click to close */}
      <div className="absolute inset-0 z-0 cursor-default" onClick={onClose} />

      {/* Profile Box */}
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-900 rounded-lg shadow-2xl overflow-hidden flex flex-col font-mono z-10 mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-900 bg-zinc-950">
          <div className="flex items-center gap-2">
            <User size={15} className="text-purple-400" />
            <span className="text-xs font-bold tracking-wider text-zinc-100 uppercase">Profile & Accounts</span>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded text-zinc-500 hover:text-zinc-300 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
          {/* User Profile Card */}
          {userProfile ? (
            <div className="flex items-center gap-3 p-3 rounded bg-zinc-900/60 border border-zinc-900">
              {userProfile.avatarUrl ? (
                <img 
                  src={userProfile.avatarUrl} 
                  alt="Avatar" 
                  className="w-12 h-12 rounded border border-zinc-800 bg-zinc-950 object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded border border-zinc-800 bg-zinc-950 flex items-center justify-center text-zinc-700 flex-shrink-0">
                  <User size={20} />
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-zinc-100 truncate">{userProfile.name}</span>
                <span className="text-[10px] text-zinc-500 truncate mt-0.5">{userProfile.email}</span>
                {userProfile.cfRating !== undefined && (
                  <span className="text-[9px] font-bold text-blue-400 mt-1 uppercase">CF Rating: {userProfile.cfRating} ({userProfile.cfRank || 'unranked'})</span>
                )}
              </div>
              <button 
                onClick={handleLogout}
                disabled={loading}
                className="ml-auto p-1.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-rose-400 cursor-pointer flex items-center gap-1 text-[10px] transition-colors disabled:opacity-50"
                title="Sign Out"
              >
                <LogOut size={12} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 rounded bg-zinc-900/40 border border-zinc-900 border-dashed text-center">
              <Shield size={24} className="text-zinc-700 mb-2" />
              <span className="text-xs font-semibold text-zinc-400">Authentication Status</span>
              
              {!isFirebaseConfigured ? (
                <div className="mt-2 text-center">
                  <span className="text-xs font-bold text-amber-500 bg-amber-950/20 border border-amber-900/50 px-2 py-0.5 rounded uppercase tracking-wider">Not Configured</span>
                  <p className="text-[9px] text-zinc-500 mt-2 leading-normal max-w-xs">
                    Firebase variables are missing. Configure VITE_FIREBASE_* in your .env file to enable authentication.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-[10px] text-zinc-600 mt-1 mb-4 leading-normal max-w-xs">Sign in with Google to view and sync your profile details.</p>
                  <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="flex items-center justify-center gap-1.5 px-4 py-1.5 rounded bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer transition-colors"
                  >
                    {loading ? <RefreshCw size={12} className="animate-spin" /> : <LogIn size={12} />}
                    <span>Sign in with Google</span>
                  </button>
                </>
              )}
            </div>
          )}

          {/* Connected Handles Section */}
          <div className="flex flex-col gap-3">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Connected Platforms</h3>
            
            {/* LeetCode Input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-500 uppercase">LeetCode Username</span>
                <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded ${
                  lcHandle.trim() 
                    ? 'text-emerald-400 bg-emerald-950/20 border border-emerald-900/30' 
                    : 'text-zinc-600 bg-zinc-900 border border-zinc-800'
                }`}>
                  {lcHandle.trim() ? 'Connected' : 'Not Connected'}
                </span>
              </div>
              <input 
                type="text" 
                placeholder="Leetcode handle (e.g. neetcode)"
                value={lcHandle}
                onChange={(e) => setLcHandle(e.target.value)}
                className="bg-zinc-950 border border-zinc-900 rounded p-2 text-xs text-zinc-100 placeholder-zinc-800 focus:outline-none focus:border-zinc-800 font-mono"
              />
            </div>

            {/* Codeforces Input with Sync Button */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-500 uppercase">Codeforces Username</span>
                <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded ${
                  cfHandle.trim() 
                    ? 'text-blue-400 bg-blue-950/20 border border-blue-900/30' 
                    : 'text-zinc-600 bg-zinc-900 border border-zinc-800'
                }`}>
                  {cfHandle.trim() ? 'Connected' : 'Not Connected'}
                </span>
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Codeforces handle (e.g. tourist)"
                  value={cfHandle}
                  onChange={(e) => setCfHandle(e.target.value)}
                  className="flex-1 bg-zinc-950 border border-zinc-900 rounded p-2 text-xs text-zinc-100 placeholder-zinc-800 focus:outline-none focus:border-zinc-800 font-mono"
                />
                <button
                  onClick={handleSyncCodeforces}
                  disabled={loading}
                  className="px-2.5 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50 font-mono"
                  title="Query Codeforces profile statistics"
                >
                  <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                  <span>Sync</span>
                </button>
              </div>
            </div>

            {/* Read-only Stats Display (No fake counts generated) */}
            {cfHandle.trim() && userProfile && userProfile.cfRating !== undefined && (
              <div className="p-3 bg-zinc-900/40 border border-zinc-900 rounded flex flex-col gap-1.5 text-[10px] text-zinc-400">
                <span className="text-[8px] uppercase font-bold text-zinc-500">Official Codeforces Stats</span>
                <div className="flex justify-between">
                  <span>Current Rating:</span>
                  <span className="text-zinc-200 font-semibold">{userProfile.cfRating} ({userProfile.cfRank})</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Rating reached:</span>
                  <span className="text-zinc-200 font-semibold">{userProfile.cfMaxRating} ({userProfile.cfMaxRank})</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-3 border-t border-zinc-900 bg-zinc-950/20 flex justify-end gap-2 select-none">
          <button 
            onClick={onClose}
            className="px-3 py-1 rounded bg-transparent border border-zinc-900 hover:border-zinc-800 text-zinc-500 hover:text-zinc-300 text-xs cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSaveProfileSettings}
            disabled={loading}
            className="flex items-center gap-1 px-4 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50"
          >
            <Check size={12} />
            <span>Save Handles</span>
          </button>
        </div>
      </div>
    </div>
  );
};
