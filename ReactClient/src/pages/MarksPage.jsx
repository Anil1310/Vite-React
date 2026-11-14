import React, { useState } from 'react';

export default function MarksPage({ state, onUpdateState, currentUser }) {
  const isAdminOrTeacher = currentUser?.role === 'admin' || currentUser?.role === 'teacher';
  const isStudent = currentUser?.role === 'student';

  const [selectedTestForMarks, setSelectedTestForMarks] = useState(null);
  const [showAddTestModal, setShowAddTestModal] = useState(false);

  // New test fields
  const [testTitle, setTestTitle] = useState('');
  const [testSubject, setTestSubject] = useState('Physics');
  const [testBatchId, setTestBatchId] = useState(state.batches?.[0]?.id || 'b1');
  const [testMaxMarks, setTestMaxMarks] = useState(100);
  const [testDate, setTestDate] = useState(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }));

  // Student specific view
  const currentStudent = isStudent
    ? (state.students || []).find(s => s.id === currentUser.id || s.roll === currentUser.roll)
    : null;

  function handleAddTest(e) {
    e.preventDefault();
    if (!testTitle.trim()) return;

    const newTest = {
      id: 't_' + Date.now(),
      batchId: testBatchId,
      title: testTitle.trim(),
      subject: testSubject.trim(),
      date: testDate,
      maxMarks: Number(testMaxMarks),
      marks: {}
    };

    onUpdateState({
      ...state,
      offlineTests: [...(state.offlineTests || []), newTest]
    });

    setTestTitle('');
    setShowAddTestModal(false);
  }

  function handleSaveMarks(testId, studentId, score, remarks) {
    const updatedTests = (state.offlineTests || []).map(t => {
      if (t.id === testId) {
        return {
          ...t,
          marks: {
            ...(t.marks || {}),
            [studentId]: {
              score: Number(score),
              remarks: remarks || 'Good effort'
            }
          }
        };
      }
      return t;
    });

    onUpdateState({
      ...state,
      offlineTests: updatedTests
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-black text-2xl text-slate-900 dark:text-white">
            Offline Tests &amp; Marks Evaluation
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sunday simulation series &bull; JEE/NEET grand tests &bull; Individual performance analytics
          </p>
        </div>

        {isAdminOrTeacher && (
          <button
            onClick={() => setShowAddTestModal(true)}
            className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/25 transition flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-plus"></i>
            <span>Schedule Offline Test</span>
          </button>
        )}
      </div>

      {/* STUDENT REPORT CARD VIEW */}
      {isStudent && currentStudent && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                My Official Academic Report Card
              </h3>
              <p className="text-xs text-slate-500 font-mono">Roll: {currentStudent.roll} &bull; {currentStudent.name}</p>
            </div>
            <button
              onClick={() => window.print()}
              className="py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1.5"
            >
              <i className="fa-solid fa-print"></i>
              <span>Print Card</span>
            </button>
          </div>

          <div className="space-y-3">
            {(state.offlineTests || [])
              .filter(t => t.batchId === currentStudent.batchId)
              .map(test => {
                const myMark = test.marks?.[currentStudent.id];
                const percentage = myMark ? Math.round((myMark.score / test.maxMarks) * 100) : null;
                return (
                  <div
                    key={test.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 text-[10px] font-bold uppercase">
                        {test.subject}
                      </span>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-1">{test.title}</h4>
                      <p className="text-[11px] text-slate-400">Date Held: {test.date}</p>
                    </div>

                    <div className="text-right flex items-center gap-4">
                      {myMark ? (
                        <div>
                          <div className="font-heading font-black text-xl text-indigo-600 dark:text-indigo-400">
                            {myMark.score} <span className="text-xs text-slate-400">/ {test.maxMarks}</span>
                          </div>
                          <span className="text-[11px] font-bold text-emerald-600">{percentage}% Score</span>
                          <p className="text-[10px] text-slate-500 italic mt-0.5">&ldquo;{myMark.remarks}&rdquo;</p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Evaluation pending</span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Tests Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {(state.offlineTests || []).map(test => {
          const batch = (state.batches || []).find(b => b.id === test.batchId);
          const evaluatedCount = Object.keys(test.marks || {}).length;
          return (
            <div
              key={test.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 font-bold text-[10px] uppercase">
                    {test.subject}
                  </span>
                  <span className="text-[11px] text-slate-400">{test.date}</span>
                </div>

                <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white mb-1">
                  {test.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  {batch ? batch.name : 'Divine Classes'}
                </p>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl flex items-center justify-between text-xs mb-3">
                  <span className="text-slate-500">Maximum Marks:</span>
                  <span className="font-bold text-indigo-600 font-mono">{test.maxMarks}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  <b>{evaluatedCount}</b> evaluated
                </span>
                {isAdminOrTeacher && (
                  <button
                    onClick={() => setSelectedTestForMarks(test)}
                    className="py-1.5 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 font-semibold text-xs transition"
                  >
                    Enter Marks &rarr;
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ENTER MARKS MODAL */}
      {selectedTestForMarks && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-base">{selectedTestForMarks.title}</h3>
                <p className="text-xs text-indigo-100">
                  Subject: {selectedTestForMarks.subject} &bull; Max: {selectedTestForMarks.maxMarks}
                </p>
              </div>
              <button onClick={() => setSelectedTestForMarks(null)} className="p-1 hover:bg-white/20 rounded-lg text-white">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {(state.students || [])
                .filter(s => s.batchId === selectedTestForMarks.batchId)
                .map(student => {
                  const currentMark = selectedTestForMarks.marks?.[student.id];
                  return (
                    <div key={student.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{student.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">Roll: {student.roll}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max={selectedTestForMarks.maxMarks}
                          defaultValue={currentMark ? currentMark.score : ''}
                          placeholder="Score"
                          onBlur={(e) => {
                            if (e.target.value !== '') {
                              handleSaveMarks(selectedTestForMarks.id, student.id, e.target.value, currentMark?.remarks);
                            }
                          }}
                          className="w-20 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-center font-mono"
                        />
                        <input
                          type="text"
                          defaultValue={currentMark ? currentMark.remarks : ''}
                          placeholder="Faculty remarks..."
                          onBlur={(e) => {
                            const score = currentMark ? currentMark.score : 0;
                            handleSaveMarks(selectedTestForMarks.id, student.id, score, e.target.value);
                          }}
                          className="w-48 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        />
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 text-right">
              <button
                onClick={() => setSelectedTestForMarks(null)}
                className="py-1.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE OFFLINE TEST MODAL */}
      {showAddTestModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white flex items-center justify-between">
              <h3 className="font-heading font-bold text-base">Schedule Offline Simulation Test</h3>
              <button onClick={() => setShowAddTestModal(false)} className="p-1 hover:bg-white/20 rounded-lg text-white">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleAddTest} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Test Title *</label>
                <input
                  type="text"
                  required
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  placeholder="e.g. Offline Grand Test #4 - Optics &amp; Modern Physics"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Subject</label>
                  <input
                    type="text"
                    value={testSubject}
                    onChange={(e) => setTestSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Batch</label>
                  <select
                    value={testBatchId}
                    onChange={(e) => setTestBatchId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    {(state.batches || []).map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Max Marks</label>
                  <input
                    type="number"
                    min="1"
                    value={testMaxMarks}
                    onChange={(e) => setTestMaxMarks(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Date Held</label>
                  <input
                    type="text"
                    value={testDate}
                    onChange={(e) => setTestDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTestModal(false)}
                  className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md"
                >
                  Publish Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
