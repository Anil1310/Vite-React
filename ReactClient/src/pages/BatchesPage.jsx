import React, { useState } from 'react';

export default function BatchesPage({ state, onUpdateState, currentUser }) {
  const isAdmin = currentUser?.role === 'admin';
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [selectedBatchForStudents, setSelectedBatchForStudents] = useState(null);

  // Form states
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [schedule, setSchedule] = useState('');
  const [room, setRoom] = useState('Lecture Hall 101');
  const [teacher, setTeacher] = useState(state.teachers?.[0]?.name || 'Er. Rajesh Chahar');

  function handleAddBatch(e) {
    e.preventDefault();
    if (!name.trim()) return;

    const newId = id.trim() || 'b_' + Date.now();
    const newBatch = {
      id: newId,
      name: name.trim(),
      subject: subject.trim() || 'Science & Mathematics',
      schedule: schedule.trim() || 'Mon - Fri • 08:00 AM - 12:30 PM',
      room: room.trim() || 'Lecture Hall 101',
      teacher: teacher.trim(),
      studentIds: []
    };

    onUpdateState({
      ...state,
      batches: [...(state.batches || []), newBatch]
    });

    setId('');
    setName('');
    setSubject('');
    setSchedule('');
    setShowAddModal(false);
  }

  function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingBatch) return;

    const updatedBatches = (state.batches || []).map(b => {
      if (b.id === editingBatch.id) {
        return editingBatch;
      }
      return b;
    });

    onUpdateState({
      ...state,
      batches: updatedBatches
    });

    setEditingBatch(null);
  }

  function handleDeleteBatch(batchId) {
    if (!window.confirm('Are you sure you want to delete this batch?')) return;
    const updatedBatches = (state.batches || []).filter(b => b.id !== batchId);
    onUpdateState({
      ...state,
      batches: updatedBatches
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-black text-2xl text-slate-900 dark:text-white">
            Academic Batches Roster
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Schedule &bull; Lecture halls &bull; Faculty mentors &bull; Enrolled rosters
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/25 transition flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-plus"></i>
            <span>Create New Batch</span>
          </button>
        )}
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {(state.batches || []).map(batch => {
          const studentCount = (batch.studentIds || []).length;
          return (
            <div
              key={batch.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-800 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold text-xs font-mono">
                    {batch.id}
                  </span>
                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingBatch({ ...batch })}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit Batch"
                      >
                        <i className="fa-solid fa-pen-to-square text-xs"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteBatch(batch.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Delete Batch"
                      >
                        <i className="fa-solid fa-trash text-xs"></i>
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white mb-1.5">
                  {batch.name}
                </h3>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-3">
                  {batch.subject}
                </p>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl">
                  <div className="flex items-start gap-2">
                    <i className="fa-solid fa-clock text-indigo-500 mt-0.5"></i>
                    <div>
                      <span className="text-slate-400 block text-[10px] leading-tight">Schedule:</span>
                      <span className="font-medium">{batch.schedule}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <i className="fa-solid fa-door-open text-purple-500 mt-0.5"></i>
                    <div>
                      <span className="text-slate-400 block text-[10px] leading-tight">Classroom:</span>
                      <span className="font-medium">{batch.room}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <i className="fa-solid fa-chalkboard-user text-emerald-500 mt-0.5"></i>
                    <div>
                      <span className="text-slate-400 block text-[10px] leading-tight">Lead Faculty:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{batch.teacher}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  <i className="fa-solid fa-user-graduate mr-1 text-slate-400"></i>
                  <b>{studentCount}</b> Scholars
                </span>
                <button
                  onClick={() => setSelectedBatchForStudents(batch)}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View Students &rarr;
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* VIEW STUDENTS IN BATCH MODAL */}
      {selectedBatchForStudents && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-base">{selectedBatchForStudents.name}</h3>
                <p className="text-xs text-indigo-100">Enrolled Students Roster</p>
              </div>
              <button onClick={() => setSelectedBatchForStudents(null)} className="p-1 hover:bg-white/20 rounded-lg text-white">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {((state.students || []).filter(s => s.batchId === selectedBatchForStudents.id)).length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">No students enrolled in this batch yet.</div>
              ) : (
                (state.students || []).filter(s => s.batchId === selectedBatchForStudents.id).map(s => (
                  <div key={s.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{s.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">Roll: {s.roll} &bull; {s.phone}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                      {s.dueDate === 'Paid' ? 'Paid' : `Due: ${s.dueDate}`}
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 text-right">
              <button
                onClick={() => setSelectedBatchForStudents(null)}
                className="py-1.5 px-4 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW BATCH MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white flex items-center justify-between">
              <h3 className="font-heading font-bold text-base">Create New Batch</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-white/20 rounded-lg text-white">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleAddBatch} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Batch Code (e.g. b4)</label>
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="Leave empty for auto ID"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Batch Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. JEE Dropper Super-30"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Curriculum Subjects</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Physics, Chemistry, Maths"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Classroom Hall</label>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="Lecture Hall 101 (Smart AC)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Weekly Schedule</label>
                <input
                  type="text"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  placeholder="Mon - Fri • 08:00 AM - 12:30 PM"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Lead Faculty</label>
                <select
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  {(state.teachers || []).map(t => (
                    <option key={t.id} value={t.name}>{t.name} ({t.subject})</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md"
                >
                  Save Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT BATCH MODAL */}
      {editingBatch && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white flex items-center justify-between">
              <h3 className="font-heading font-bold text-base">Edit Batch Details</h3>
              <button onClick={() => setEditingBatch(null)} className="p-1 hover:bg-white/20 rounded-lg text-white">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Batch Name</label>
                <input
                  type="text"
                  required
                  value={editingBatch.name}
                  onChange={(e) => setEditingBatch({ ...editingBatch, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Subjects</label>
                <input
                  type="text"
                  value={editingBatch.subject}
                  onChange={(e) => setEditingBatch({ ...editingBatch, subject: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Schedule</label>
                <input
                  type="text"
                  value={editingBatch.schedule}
                  onChange={(e) => setEditingBatch({ ...editingBatch, schedule: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Classroom</label>
                <input
                  type="text"
                  value={editingBatch.room}
                  onChange={(e) => setEditingBatch({ ...editingBatch, room: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Lead Faculty</label>
                <input
                  type="text"
                  value={editingBatch.teacher}
                  onChange={(e) => setEditingBatch({ ...editingBatch, teacher: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBatch(null)}
                  className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
