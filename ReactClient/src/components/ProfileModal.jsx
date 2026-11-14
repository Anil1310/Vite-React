import React from 'react';

export default function ProfileModal({ user, onClose, onLogout, state }) {
  if (!user) return null;

  const isStudent = user.role === 'student';
  const isTeacher = user.role === 'teacher';
  const isAdmin = user.role === 'admin';

  const fullStudent = isStudent ? (state.students || []).find(s => s.id === user.id || s.roll === user.roll) : null;
  const fullTeacher = isTeacher ? (state.teachers || []).find(t => t.id === user.id || t.email === user.email) : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Card */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-6 text-white text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>

          <div className="w-20 h-20 rounded-2xl mx-auto mb-3 bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center text-3xl font-black shadow-lg">
            {user.initials || user.name.slice(0, 2).toUpperCase()}
          </div>
          <h3 className="font-heading font-bold text-xl">{user.name}</h3>
          <p className="text-xs text-indigo-100 mt-0.5">{user.title || user.badge || user.role}</p>
          <span className="inline-block mt-2 px-3 py-1 rounded-full bg-white/15 text-[11px] font-semibold uppercase tracking-wider">
            {user.role} Account
          </span>
        </div>

        {/* Content Details */}
        <div className="p-6 space-y-4">
          {/* STUDENT PROFILE & ID CARD */}
          {isStudent && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-500 dark:text-slate-400">Roll Number:</span>
                  <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400">{user.roll || fullStudent?.roll}</span>
                </div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-500 dark:text-slate-400">Enrolled Batch:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{user.batchName || 'JEE Target 2027'}</span>
                </div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-500 dark:text-slate-400">Guardian Name:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{user.parentName || fullStudent?.parentName || 'Not Set'}</span>
                </div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-500 dark:text-slate-400">Emergency Phone:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{user.phone || fullStudent?.phone || 'Not Set'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Fee Status:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    fullStudent?.dueDate === 'Paid'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                  }`}>
                    {fullStudent?.dueDate === 'Paid' ? 'Fully Cleared' : `Due on ${fullStudent?.dueDate}`}
                  </span>
                </div>
              </div>

              {/* Barcode Preview */}
              <div className="text-center py-2 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                <p className="font-mono text-xl tracking-widest text-slate-700 dark:text-slate-300 mb-1 select-none">
                  ||||| | |||| || |||||| |
                </p>
                <p className="text-[10px] text-slate-400 uppercase font-mono">
                  ID: {user.roll || fullStudent?.roll || 'DC-STUDENT'}
                </p>
              </div>
            </div>
          )}

          {/* TEACHER PROFILE */}
          {isTeacher && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Department:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{fullTeacher?.subject || user.subject}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Qualification:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{fullTeacher?.qualification || user.qualification}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Experience:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{fullTeacher?.experience || user.experience}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Official Email:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{fullTeacher?.email || user.email}</span>
                </div>
              </div>
              {fullTeacher?.bio && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-400 italic">
                  &ldquo;{fullTeacher.bio}&rdquo;
                </div>
              )}
            </div>
          )}

          {/* ADMIN PROFILE */}
          {isAdmin && (
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Institute:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{state.settings?.instituteName || 'Divine Classes'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Admin Email:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{user.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Database Engine:</span>
                <span className="font-medium text-emerald-600 font-semibold">Supabase REST (Live)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Sheets Mirror:</span>
                <span className="font-medium text-indigo-600 font-semibold">Enabled</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => {
                window.print();
              }}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-print"></i>
              <span>Print ID Card</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="py-2.5 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-arrow-right-from-bracket"></i>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
