import React from 'react';

export default function DashboardPage({ state, currentUser, onSelectTab, onOpenProfileModal }) {
  const isAdmin = currentUser?.role === 'admin';
  const isTeacher = currentUser?.role === 'teacher';
  const isStudent = currentUser?.role === 'student';

  const totalStudents = (state.students || []).length;
  const totalBatches = (state.batches || []).length;
  const totalTeachers = (state.teachers || []).length;
  const totalMaterials = (state.materials || []).length;

  const totalFeeCollected = (state.students || []).reduce((acc, s) => acc + (Number(s.paidFee) || 0), 0);
  const totalFeePending = (state.students || []).reduce((acc, s) => {
    const diff = (Number(s.totalFee) || 0) - (Number(s.paidFee) || 0);
    return acc + Math.max(0, diff);
  }, 0);

  // Student specific stats
  const currentStudent = isStudent ? (state.students || []).find(s => s.id === currentUser.id || s.roll === currentUser.roll) : null;
  const currentBatch = isStudent && currentStudent ? (state.batches || []).find(b => b.id === currentStudent.batchId) : null;
  const studentAttendance = isStudent && currentStudent
    ? (state.attendanceRecords || []).filter(a => a.studentId === currentStudent.id)
    : [];
  const presentCount = studentAttendance.filter(a => a.status === 'Present').length;
  const attendanceRate = studentAttendance.length > 0
    ? Math.round((presentCount / studentAttendance.length) * 100)
    : 94;

  return (
    <div className="space-y-6">
      {/* 1. Top Role Banner with Quick Actions (per Rule 1) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white p-6 sm:p-8 shadow-xl shadow-indigo-600/20">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-md mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>{currentUser?.badge || currentUser?.role?.toUpperCase()} SESSION ACTIVE</span>
            </div>
            <h2 className="font-heading font-black text-2xl sm:text-3xl tracking-tight">
              Welcome back, {currentUser?.name}!
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100 max-w-xl mt-1 leading-relaxed">
              {isAdmin && 'Full institute governance active. Real-time sync with Supabase and Google Sheets enabled.'}
              {isTeacher && `Faculty Portal &bull; Department of ${currentUser.subject || 'Excellence'}.`}
              {isStudent && `Enrolled in ${currentBatch ? currentBatch.name : 'Divine Classes Target Batch'}. Keep pushing your limits!`}
            </p>
          </div>

          {/* Role-specific Banner Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {isStudent && (
              <button
                onClick={onOpenProfileModal}
                className="py-2.5 px-4 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-semibold text-xs shadow-md transition flex items-center gap-2"
              >
                <i className="fa-solid fa-id-card"></i>
                <span>My ID Card</span>
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => onSelectTab('students')}
                className="py-2.5 px-4 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-semibold text-xs shadow-md transition flex items-center gap-2"
              >
                <i className="fa-solid fa-user-plus"></i>
                <span>Add Student</span>
              </button>
            )}
            {(isAdmin || isTeacher) && (
              <button
                onClick={() => onSelectTab('attendance')}
                className="py-2.5 px-4 rounded-xl bg-indigo-900/50 hover:bg-indigo-900/70 text-white border border-white/20 font-semibold text-xs backdrop-blur-md transition flex items-center gap-2"
              >
                <i className="fa-solid fa-calendar-check"></i>
                <span>Mark Attendance</span>
              </button>
            )}
            <button
              onClick={() => onSelectTab('materials')}
              className="py-2.5 px-4 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs backdrop-blur-md transition flex items-center gap-2"
            >
              <i className="fa-solid fa-file-pdf"></i>
              <span>Study DPPs</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isAdmin && (
          <>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Enrolled</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs">
                  <i className="fa-solid fa-users"></i>
                </div>
              </div>
              <p className="font-heading font-black text-2xl text-slate-900 dark:text-white">{totalStudents}</p>
              <span className="text-[11px] text-emerald-600 font-medium">100% Active Scholars</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Batches</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs">
                  <i className="fa-solid fa-layer-group"></i>
                </div>
              </div>
              <p className="font-heading font-black text-2xl text-slate-900 dark:text-white">{totalBatches}</p>
              <span className="text-[11px] text-purple-600 font-medium">Smart AC Classrooms</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Fees Collected</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs">
                  <i className="fa-solid fa-indian-rupee-sign"></i>
                </div>
              </div>
              <p className="font-heading font-black text-2xl text-emerald-600">₹{(totalFeeCollected / 1000).toFixed(1)}k</p>
              <span className="text-[11px] text-slate-400">Monthly Tuition Ledger</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Faculty Mentors</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs">
                  <i className="fa-solid fa-chalkboard-user"></i>
                </div>
              </div>
              <p className="font-heading font-black text-2xl text-slate-900 dark:text-white">{totalTeachers}</p>
              <span className="text-[11px] text-amber-600 font-medium">IIT &amp; AIIMS Alumni</span>
            </div>
          </>
        )}

        {isStudent && (
          <>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">My Attendance</span>
              <p className="font-heading font-black text-2xl text-emerald-600 mt-1">{attendanceRate}%</p>
              <span className="text-[11px] text-slate-400">Required threshold: 75%</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Fees Paid</span>
              <p className="font-heading font-black text-2xl text-indigo-600 mt-1">₹{currentStudent?.paidFee || 0}</p>
              <span className="text-[11px] text-slate-400">Monthly ₹{currentStudent?.monthlyFee}/mo</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Next Fee Due</span>
              <p className="font-heading font-bold text-xl text-amber-600 mt-1 truncate">{currentStudent?.dueDate || 'Paid'}</p>
              <span className="text-[11px] text-slate-400">UPI: {state.settings?.upiId || 'divineclasses@upi'}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Study Materials</span>
              <p className="font-heading font-black text-2xl text-purple-600 mt-1">{totalMaterials}</p>
              <span className="text-[11px] text-slate-400">DPPs, Tests &amp; Formulas</span>
            </div>
          </>
        )}

        {isTeacher && (
          <>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">My Department</span>
              <p className="font-heading font-bold text-lg text-indigo-600 mt-1 truncate">{currentUser.subject}</p>
              <span className="text-[11px] text-slate-400">Senior Faculty Role</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Batches</span>
              <p className="font-heading font-black text-2xl text-purple-600 mt-1">{totalBatches}</p>
              <span className="text-[11px] text-slate-400">Scheduled Batches</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Scholars</span>
              <p className="font-heading font-black text-2xl text-emerald-600 mt-1">{totalStudents}</p>
              <span className="text-[11px] text-slate-400">In Active Roster</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Study Materials</span>
              <p className="font-heading font-black text-2xl text-amber-600 mt-1">{totalMaterials}</p>
              <span className="text-[11px] text-slate-400">Published DPPs</span>
            </div>
          </>
        )}
      </div>

      {/* 3. Batches Roster Highlights */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">Active Institute Batches</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Curriculum schedule &amp; faculty assignments</p>
          </div>
          <button
            onClick={() => onSelectTab('batches')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View All Batches &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(state.batches || []).slice(0, 3).map(batch => (
            <div
              key={batch.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex flex-col justify-between"
            >
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 text-[10px] font-bold uppercase">
                  {batch.id}
                </span>
                <h4 className="font-heading font-bold text-sm text-slate-800 dark:text-slate-200 mt-2 mb-1">
                  {batch.name}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{batch.subject}</p>
                <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <i className="fa-solid fa-clock text-indigo-500"></i>
                    <span>{batch.schedule}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <i className="fa-solid fa-door-open text-purple-500"></i>
                    <span>{batch.room}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <i className="fa-solid fa-chalkboard-user text-emerald-500"></i>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{batch.teacher}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-400">Enrolled:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {(batch.studentIds || []).length} Students
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Two Columns: Recent Notices & Test Series */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Offline Tests Overview */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
              Recent Offline Tests &amp; Marks
            </h3>
            <button
              onClick={() => onSelectTab('marks')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Report Cards &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {(state.offlineTests || []).slice(0, 3).map(test => (
              <div
                key={test.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
              >
                <div>
                  <h5 className="font-semibold text-xs text-slate-800 dark:text-slate-200">{test.title}</h5>
                  <p className="text-[11px] text-slate-400">{test.subject} &bull; {test.date}</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300 font-bold text-xs">
                    Max: {test.maxMarks}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Study Links / NCERT Portals */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
              Official Study Resources
            </h3>
            <button
              onClick={() => onSelectTab('links')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              All Links &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {(state.externalLinks || []).slice(0, 3).map(link => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 border border-slate-100 dark:border-slate-800 flex items-center gap-3 transition"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xs shrink-0">
                  <i className={`fa-solid ${link.icon || 'fa-link'}`}></i>
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">{link.title}</h5>
                  <p className="text-[11px] text-slate-400 truncate">{link.provider}</p>
                </div>
                <i className="fa-solid fa-arrow-up-right-from-square text-xs text-slate-400"></i>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
