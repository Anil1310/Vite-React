import React, { useState } from 'react';

export default function StudentsPage({ state, onUpdateState, currentUser }) {
  const isAdmin = currentUser?.role === 'admin';
  const [search, setSearch] = useState('');
  const [batchFilter, setBatchFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // Add form fields
  const [name, setName] = useState('');
  const [roll, setRoll] = useState('');
  const [phone, setPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [batchId, setBatchId] = useState(state.batches?.[0]?.id || 'b1');
  const [monthlyFee, setMonthlyFee] = useState(1000);
  const [password, setPassword] = useState('password123');

  const filteredStudents = (state.students || []).filter(s => {
    const matchesSearch =
      (s.name && s.name.toLowerCase().includes(search.toLowerCase())) ||
      (s.roll && s.roll.toLowerCase().includes(search.toLowerCase())) ||
      (s.phone && s.phone.includes(search));
    const matchesBatch = batchFilter === 'all' || s.batchId === batchFilter;
    return matchesSearch && matchesBatch;
  });

  function handleAddStudent(e) {
    e.preventDefault();
    if (!name.trim() || !roll.trim()) return;

    const newStudent = {
      id: 's_' + Date.now(),
      roll: roll.trim(),
      name: name.trim(),
      phone: phone.trim(),
      parentName: parentName.trim(),
      batchId,
      totalFee: monthlyFee * 12,
      // STRICT RULE 8: Initial Total Fees Paid is permanently 0 and strictly non-editable!
      paidFee: 0,
      monthlyFee: Number(monthlyFee),
      dueDate: new Date().toISOString().split('T')[0],
      lastReminder: 'Never',
      password: password || 'password123',
      status: 'Active',
      admissionDate: new Date().toISOString().split('T')[0]
    };

    const updatedStudents = [...(state.students || []), newStudent];

    // Also update batch studentIds
    const updatedBatches = (state.batches || []).map(b => {
      if (b.id === batchId) {
        return { ...b, studentIds: [...(b.studentIds || []), newStudent.id] };
      }
      return b;
    });

    onUpdateState({
      ...state,
      students: updatedStudents,
      batches: updatedBatches
    });

    // Reset & close
    setName('');
    setRoll('');
    setPhone('');
    setParentName('');
    setShowAddModal(false);
  }

  function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingStudent) return;

    const updatedStudents = (state.students || []).map(s => {
      if (s.id === editingStudent.id) {
        return {
          ...s,
          name: editingStudent.name,
          roll: editingStudent.roll,
          phone: editingStudent.phone,
          parentName: editingStudent.parentName,
          batchId: editingStudent.batchId,
          monthlyFee: Number(editingStudent.monthlyFee),
          status: editingStudent.status,
          password: editingStudent.password
          // Note: paidFee remains untouched and strictly read-only!
        };
      }
      return s;
    });

    onUpdateState({
      ...state,
      students: updatedStudents
    });

    setEditingStudent(null);
  }

  function handleDeleteStudent(studentId) {
    if (!window.confirm('Are you sure you want to delete this student record?')) return;
    const updatedStudents = (state.students || []).filter(s => s.id !== studentId);
    const updatedBatches = (state.batches || []).map(b => ({
      ...b,
      studentIds: (b.studentIds || []).filter(id => id !== studentId)
    }));

    onUpdateState({
      ...state,
      students: updatedStudents,
      batches: updatedBatches
    });
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-black text-2xl text-slate-900 dark:text-white">
            Students Master Directory
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enrolled scholars &bull; Dynamic tuition fee ledger &bull; ID records
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/25 transition flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-user-plus"></i>
            <span>Add New Student</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, roll number, or phone..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs font-semibold text-slate-500 shrink-0">Batch:</label>
          <select
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            className="w-full md:w-auto py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Batches (Alpha, NEET, 10th)</option>
            {(state.batches || []).map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
              <tr>
                <th className="py-3 px-4">Roll No.</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Batch</th>
                <th className="py-3 px-4">Parent / Phone</th>
                <th className="py-3 px-4">Monthly Fee</th>
                <th className="py-3 px-4">Total Paid (₹)</th>
                <th className="py-3 px-4">Next Due Date</th>
                <th className="py-3 px-4">Status</th>
                {isAdmin && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="p-8 text-center text-slate-400">
                    No student records matching query
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => {
                  const batch = (state.batches || []).find(b => b.id === student.batchId);
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {student.roll}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-100">
                        {student.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px]">
                          {batch ? batch.name.split(' ')[0] : 'General'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        <div>{student.parentName || '-'}</div>
                        <div className="text-[10px] text-slate-400">{student.phone}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                        ₹{student.monthlyFee}/mo
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                        ₹{student.paidFee?.toLocaleString('en-IN') || 0}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          student.dueDate === 'Paid'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                        }`}>
                          {student.dueDate}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                          {student.status || 'Active'}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => setEditingStudent(student)}
                            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                            title="Edit Student"
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Delete Student"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
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

      {/* MODAL 1: ADD NEW STUDENT (STRICT RULE 8 IMPLEMENTATION) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-user-plus text-base"></i>
                <h3 className="font-heading font-bold text-base">Enroll New Scholar</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-white/20 rounded-lg text-white">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Roll Number *</label>
                  <input
                    type="text"
                    required
                    value={roll}
                    onChange={(e) => setRoll(e.target.value)}
                    placeholder="e.g. DC-112"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Parent / Guardian Name</label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="Guardian Name"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Contact Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Select Batch</label>
                  <select
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    {(state.batches || []).map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Monthly Tuition Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={monthlyFee}
                    onChange={(e) => setMonthlyFee(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>
              </div>

              {/* STRICT RULE 8: Non-Editable Total Paid Field */}
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-amber-800 dark:text-amber-300">Total Fees Paid (₹)</label>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">Strict Rule 8 Governance</span>
                </div>
                <input
                  type="number"
                  readOnly
                  disabled
                  value={0}
                  className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-100/50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 font-mono font-bold cursor-not-allowed select-none"
                />
                <p className="text-[10px] text-amber-700/80 dark:text-amber-400/80 mt-1">
                  Permanently initialized to ₹0 on admission. Cumulative payments can only be recorded via the Fees Ledger.
                </p>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Initial Student Password</label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
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
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT STUDENT */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white flex items-center justify-between">
              <h3 className="font-heading font-bold text-base">Edit Scholar Profile</h3>
              <button onClick={() => setEditingStudent(null)} className="p-1 hover:bg-white/20 rounded-lg text-white">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Roll Number</label>
                  <input
                    type="text"
                    value={editingStudent.roll}
                    onChange={(e) => setEditingStudent({ ...editingStudent, roll: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Student Name</label>
                  <input
                    type="text"
                    value={editingStudent.name}
                    onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Guardian Name</label>
                  <input
                    type="text"
                    value={editingStudent.parentName || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, parentName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Phone</label>
                  <input
                    type="text"
                    value={editingStudent.phone || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Batch</label>
                  <select
                    value={editingStudent.batchId}
                    onChange={(e) => setEditingStudent({ ...editingStudent, batchId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    {(state.batches || []).map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Monthly Fee (₹)</label>
                  <input
                    type="number"
                    value={editingStudent.monthlyFee || 0}
                    onChange={(e) => setEditingStudent({ ...editingStudent, monthlyFee: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>
              </div>

              {/* STRICT RULE 8: Read-only in Edit modal too! */}
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Total Fees Paid (₹) &bull; Strictly Read-Only
                </label>
                <input
                  type="number"
                  readOnly
                  disabled
                  value={editingStudent.paidFee || 0}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono font-bold cursor-not-allowed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
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
