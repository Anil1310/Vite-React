import React, { useState } from 'react';

export default function AttendancePage({ state, onUpdateState, currentUser }) {
  const isStudent = currentUser?.role === 'student';
  const isAdminOrTeacher = currentUser?.role === 'admin' || currentUser?.role === 'teacher';

  const [selectedBatchId, setSelectedBatchId] = useState(
    isStudent
      ? ((state.students || []).find(s => s.id === currentUser.id || s.roll === currentUser.roll)?.batchId || 'b1')
      : (state.batches?.[0]?.id || 'b1')
  );
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const batchStudents = (state.students || []).filter(s => s.batchId === selectedBatchId);
  const attendanceRecords = state.attendanceRecords || [];

  function getStatus(studentId, date) {
    const rec = attendanceRecords.find(r => r.studentId === studentId && r.date === date);
    return rec ? rec.status : 'Present'; // Default to Present
  }

  function handleSetStatus(studentId, newStatus) {
    const existingIndex = attendanceRecords.findIndex(r => r.studentId === studentId && r.date === selectedDate);
    let updated = [...attendanceRecords];

    if (existingIndex >= 0) {
      updated[existingIndex] = {
        ...updated[existingIndex],
        status: newStatus,
        markedBy: currentUser?.name || 'Faculty'
      };
    } else {
      updated.push({
        id: 'att_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        date: selectedDate,
        batchId: selectedBatchId,
        studentId,
        status: newStatus,
        markedBy: currentUser?.name || 'Faculty'
      });
    }

    onUpdateState({
      ...state,
      attendanceRecords: updated
    });
  }

  function handleMarkAllPresent() {
    let updated = [...attendanceRecords];
    batchStudents.forEach(s => {
      const idx = updated.findIndex(r => r.studentId === s.id && r.date === selectedDate);
      if (idx >= 0) {
        updated[idx] = { ...updated[idx], status: 'Present', markedBy: currentUser?.name || 'Faculty' };
      } else {
        updated.push({
          id: 'att_' + Date.now() + '_' + s.id,
          date: selectedDate,
          batchId: selectedBatchId,
          studentId: s.id,
          status: 'Present',
          markedBy: currentUser?.name || 'Faculty'
        });
      }
    });

    onUpdateState({
      ...state,
      attendanceRecords: updated
    });
  }

  // Student perspective
  const currentStudent = isStudent
    ? (state.students || []).find(s => s.id === currentUser.id || s.roll === currentUser.roll)
    : null;
  const myRecords = currentStudent
    ? attendanceRecords.filter(r => r.studentId === currentStudent.id)
    : [];
  const myPresent = myRecords.filter(r => r.status === 'Present').length;
  const myRate = myRecords.length > 0 ? Math.round((myPresent / myRecords.length) * 100) : 94;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-black text-2xl text-slate-900 dark:text-white">
            Attendance Register
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Daily lecture tracker &bull; Biometric and roll-call records
          </p>
        </div>

        {isAdminOrTeacher && (
          <button
            onClick={handleMarkAllPresent}
            className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-check-double"></i>
            <span>Mark All Present Today</span>
          </button>
        )}
      </div>

      {/* STUDENT PERSONAL SUMMARY CARD */}
      {isStudent && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl font-bold font-mono">
              {myRate}%
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                Personal Attendance Ratio
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You have attended <b>{myPresent}</b> out of <b>{myRecords.length || 12}</b> recorded lectures.
              </p>
            </div>
          </div>
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold text-xs">
            Regular Standing
          </span>
        </div>
      )}

      {/* Batch & Date Selector Controls */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-semibold text-slate-500 shrink-0">Batch:</label>
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            disabled={isStudent}
            className="w-full sm:w-auto py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
          >
            {(state.batches || []).map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-semibold text-slate-500 shrink-0">Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full sm:w-auto py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>
      </div>

      {/* Daily Attendance Marking Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
              <tr>
                <th className="py-3 px-4">Roll No.</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-center">Status on Record</th>
                {isAdminOrTeacher && <th className="py-3 px-4 text-right">Quick Mark Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {batchStudents.length === 0 ? (
                <tr>
                  <td colSpan={isAdminOrTeacher ? 6 : 5} className="p-8 text-center text-slate-400">
                    No scholars enrolled in this batch.
                  </td>
                </tr>
              ) : (
                batchStudents.map(student => {
                  const currentStatus = getStatus(student.id, selectedDate);
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {student.roll}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-100">
                        {student.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        {student.phone}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {selectedDate}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                            currentStatus === 'Present'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                              : currentStatus === 'Absent'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                              : currentStatus === 'Late'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                          }`}
                        >
                          {currentStatus}
                        </span>
                      </td>

                      {isAdminOrTeacher && (
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleSetStatus(student.id, 'Present')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                                currentStatus === 'Present'
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50'
                              }`}
                            >
                              P
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetStatus(student.id, 'Absent')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                                currentStatus === 'Absent'
                                  ? 'bg-rose-600 text-white shadow-sm'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50'
                              }`}
                            >
                              A
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetStatus(student.id, 'Late')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                                currentStatus === 'Late'
                                  ? 'bg-amber-500 text-white shadow-sm'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-50'
                              }`}
                            >
                              L
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetStatus(student.id, 'Leave')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                                currentStatus === 'Leave'
                                  ? 'bg-blue-600 text-white shadow-sm'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50'
                              }`}
                            >
                              Leave
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
