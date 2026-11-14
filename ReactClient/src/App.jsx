import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MobileBottomNav from './components/MobileBottomNav';
import Footer from './components/Footer';
import ProfileModal from './components/ProfileModal';
import Chatbot from './components/Chatbot';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BatchesPage from './pages/BatchesPage';
import StudentsPage from './pages/StudentsPage';
import AttendancePage from './pages/AttendancePage';
import FeesPage from './pages/FeesPage';
import MarksPage from './pages/MarksPage';
import MaterialsPage from './pages/MaterialsPage';
import TeachersPage from './pages/TeachersPage';
import GalleryPage from './pages/GalleryPage';
import LinksPage from './pages/LinksPage';
import FeedbackPage from './pages/FeedbackPage';
import SettingsPage from './pages/SettingsPage';

import { loadInitialState, saveStateLocally } from './services/storage';
import { getActiveSession, clearActiveSession, recordActivity, isSessionExpiredByInactivity } from './services/auth';
import { fetchRemoteStateFromSupabase, syncStateToSupabase } from './services/supabase';
import { syncToGoogleSheets } from './services/sheetsSync';

export default function App() {
  const [state, setState] = useState(() => loadInitialState());
  const [currentUser, setCurrentUser] = useState(() => getActiveSession());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Theme Management
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('DIVINE_THEME') || 'light';
  });

  // Cloud Sync state
  const [syncStatus, setSyncStatus] = useState({
    syncing: false,
    lastSynced: null,
    error: null
  });

  // Apply theme to document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('DIVINE_THEME', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Remote data load from Supabase on mount
  useEffect(() => {
    async function loadRemote() {
      const res = await fetchRemoteStateFromSupabase(state.settings);
      if (res.success && res.payload) {
        setState(prev => {
          const merged = { ...prev, ...res.payload };
          saveStateLocally(merged);
          return merged;
        });
        setSyncStatus({
          syncing: false,
          lastSynced: new Date(res.updatedAt || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          error: null
        });
      }
    }
    loadRemote();
  }, []);

  // Update State & persist
  const handleUpdateState = useCallback((newState) => {
    setState(newState);
    saveStateLocally(newState);

    // Debounced or background sync to Supabase
    syncStateToSupabase(newState).then(res => {
      if (res.success) {
        setSyncStatus({ syncing: false, lastSynced: res.syncedAt, error: null });
      }
    });
  }, []);

  // Manual Trigger 1-Click Sync
  const handleTriggerSync = async () => {
    setSyncStatus(prev => ({ ...prev, syncing: true, error: null }));
    const supaRes = await syncStateToSupabase(state);
    const sheetRes = await syncToGoogleSheets(state.settings?.sheetsWebAppUrl);

    if (supaRes.success) {
      setSyncStatus({
        syncing: false,
        lastSynced: supaRes.syncedAt,
        error: null
      });
    } else {
      setSyncStatus({
        syncing: false,
        lastSynced: null,
        error: supaRes.error || 'Sync notice'
      });
    }
  };

  // User Inactivity Auto-Logout Tracker (Rule 7)
  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'touchmove', 'scroll', 'click'];
    let lastRecord = 0;

    const onUserActivity = () => {
      const now = Date.now();
      if (now - lastRecord > 5000) { // Throttle every 5s
        lastRecord = now;
        recordActivity();
      }
    };

    events.forEach(e => window.addEventListener(e, onUserActivity, { passive: true }));

    // Inactivity interval check every minute
    const interval = setInterval(() => {
      if (currentUser && isSessionExpiredByInactivity()) {
        clearActiveSession();
        setCurrentUser(null);
        alert('Your session has ended automatically due to 2 hours of inactivity. Please sign in again.');
      }
    }, 60000);

    return () => {
      events.forEach(e => window.removeEventListener(e, onUserActivity));
      clearInterval(interval);
    };
  }, [currentUser]);

  const handleLogout = () => {
    clearActiveSession();
    setCurrentUser(null);
  };

  const handleMarkAllNotificationsRead = () => {
    const updated = (state.notifications || []).map(n => ({ ...n, read: true }));
    handleUpdateState({ ...state, notifications: updated });
  };

  // If not authenticated, render Login Page
  if (!currentUser) {
    return (
      <LoginPage
        state={state}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setActiveTab('dashboard');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-indigo-600 selection:text-white">
      {/* Strict 4-Control Header */}
      <Header
        currentUser={currentUser}
        syncStatus={syncStatus}
        onTriggerSync={handleTriggerSync}
        theme={theme}
        onToggleTheme={toggleTheme}
        notifications={state.notifications || []}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        onSelectTab={setActiveTab}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex w-full">
        {/* Sidebar Nav */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          currentUser={currentUser}
          chatbotEnabled={state.settings?.chatbotEnabled !== false}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 lg:pb-12">
          {activeTab === 'dashboard' && (
            <DashboardPage
              state={state}
              currentUser={currentUser}
              onSelectTab={setActiveTab}
              onOpenProfileModal={() => setIsProfileModalOpen(true)}
            />
          )}

          {activeTab === 'batches' && (
            <BatchesPage
              state={state}
              onUpdateState={handleUpdateState}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'students' && (
            <StudentsPage
              state={state}
              onUpdateState={handleUpdateState}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendancePage
              state={state}
              onUpdateState={handleUpdateState}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'fees' && (
            <FeesPage
              state={state}
              onUpdateState={handleUpdateState}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'marks' && (
            <MarksPage
              state={state}
              onUpdateState={handleUpdateState}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'materials' && (
            <MaterialsPage
              state={state}
              onUpdateState={handleUpdateState}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'teachers' && (
            <TeachersPage
              state={state}
              onUpdateState={handleUpdateState}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'gallery' && (
            <GalleryPage
              state={state}
              onUpdateState={handleUpdateState}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'links' && (
            <LinksPage
              state={state}
              onUpdateState={handleUpdateState}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'feedback' && (
            <FeedbackPage
              state={state}
              onUpdateState={handleUpdateState}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'chatbot' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <h2 className="font-heading font-black text-2xl text-slate-900 dark:text-white mb-2">
                Divine AI Academic Assistant &bull; Dedicated Desk
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                Interactive doubt clearing, syllabus hints, dues checking, and timetable inquiries.
              </p>
              <div className="max-w-2xl mx-auto">
                <Chatbot state={state} currentUser={currentUser} enabled={true} />
                <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                  <i className="fa-solid fa-robot text-4xl text-indigo-500 mb-3 block"></i>
                  <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm mb-1">
                    AI Assistant Launcher is Active
                  </p>
                  <p>Click the floating robot button in the bottom right corner or ask any academic inquiry directly!</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && currentUser.role === 'admin' && (
            <SettingsPage
              state={state}
              onUpdateState={handleUpdateState}
              currentUser={currentUser}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation (Rule 3) */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenMenu={() => setIsSidebarOpen(true)}
        currentUser={currentUser}
      />

      {/* Floating Chatbot (Rule 9) */}
      <Chatbot
        state={state}
        currentUser={currentUser}
        enabled={state.settings?.chatbotEnabled !== false}
      />

      {/* Multi-Role Profile Modal & ID Card (Rule 2) */}
      {isProfileModalOpen && (
        <ProfileModal
          user={currentUser}
          onClose={() => setIsProfileModalOpen(false)}
          onLogout={handleLogout}
          state={state}
        />
      )}

      {/* Universal Developer Attribution Footer (Rule 6) */}
      <Footer />
    </div>
  );
}
