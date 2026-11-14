import React, { useState, useEffect } from 'react';
import { getSavedCredentials, saveCredentials, clearSavedCredentials, authenticateUser, setActiveSession } from '../services/auth';

export default function LoginPage({ state, onLoginSuccess }) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const saved = getSavedCredentials();
    if (saved) {
      setLoginId(saved.loginId || '');
      setPassword(saved.password || '');
      setRememberMe(true);
    }
  }, []);

  function handleLogin(e) {
    e?.preventDefault();
    setError('');

    const user = authenticateUser(loginId, password, state);
    if (!user) {
      setError('Invalid login credentials. Please check your username/roll and password.');
      return;
    }

    if (rememberMe) {
      saveCredentials(loginId, password);
    } else {
      clearSavedCredentials();
    }

    setActiveSession(user);
    onLoginSuccess(user);
  }

  function handleDemoLogin(role) {
    if (role === 'admin') {
      setLoginId(state.settings?.adminEmail || 'divineclasses1010@gmail.com');
      setPassword(state.settings?.adminPassword || 'admin123');
    } else if (role === 'teacher') {
      const firstTeacher = (state.teachers || [])[0];
      setLoginId(firstTeacher ? firstTeacher.email : 'rajesh.chahar@divineclasses.in');
      setPassword(firstTeacher ? firstTeacher.password : 'teacher123');
    } else if (role === 'student') {
      const firstStudent = (state.students || [])[0];
      setLoginId(firstStudent ? firstStudent.roll : 'DC-101');
      setPassword(firstStudent ? firstStudent.password : 'password123');
    }
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex flex-col justify-between p-4 sm:p-6 transition-colors selection:bg-indigo-600 selection:text-white">
      <div className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header branding */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 flex items-center justify-center text-white text-2xl mx-auto shadow-lg shadow-indigo-600/30 mb-3">
              <i className="fa-solid fa-graduation-cap"></i>
            </div>
            <h2 className="font-heading font-black text-2xl text-slate-900 dark:text-white tracking-tight">
              Divine Classes
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Sign in to Institute Management &amp; Learning Portal
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation shrink-0"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Login ID / Roll No. / Email
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  <i className="fa-solid fa-user"></i>
                </span>
                <input
                  type="text"
                  required
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="e.g. DC-101 or email@divineclasses.in"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  <i className="fa-solid fa-lock"></i>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your security password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            {/* 10-Day Remember Me Checkbox */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 border-slate-300 dark:border-slate-700"
                />
                <span>Remember me (10 days)</span>
              </label>
              <span className="text-[11px] text-slate-400">Auto-secures session</span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 active:scale-[0.99] transition flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-right-to-bracket"></i>
              <span>Access Institute Portal</span>
            </button>
          </form>

          {/* Quick Demo Logins per settings */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
              One-Click Demo Roles
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="py-2 px-2.5 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold hover:bg-indigo-100 transition flex flex-col items-center gap-1"
              >
                <i className="fa-solid fa-shield-halved text-sm"></i>
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('teacher')}
                className="py-2 px-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold hover:bg-emerald-100 transition flex flex-col items-center gap-1"
              >
                <i className="fa-solid fa-chalkboard-user text-sm"></i>
                <span>Teacher</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('student')}
                className="py-2 px-2.5 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 text-[11px] font-semibold hover:bg-amber-100 transition flex flex-col items-center gap-1"
              >
                <i className="fa-solid fa-user-graduate text-sm"></i>
                <span>Student</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Universal Developer Attribution Footer per Rule 6 */}
      <footer className="text-center text-xs text-slate-500 dark:text-slate-400 py-3 select-none">
        <p className="font-sans text-[11px] sm:text-xs tracking-tight">
          &copy; 2026 Designed &amp; Engineered by Dev. Anil Kumar Chahar &bull; 8126390611 &bull; v2.5 Cloud Edition
        </p>
      </footer>
    </div>
  );
}
