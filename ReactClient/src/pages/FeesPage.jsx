import React, { useState } from 'react';

export default function FeesPage({ state, onUpdateState, currentUser }) {
  const isAdmin = currentUser?.role === 'admin';
  const isStudent = currentUser?.role === 'student';

  const [selectedStudentForPay, setSelectedStudentForPay] = useState(null);
  const [payAmount, setPayAmount] = useState(1000);
  const [payMode, setPayMode] = useState('UPI');
  const [payRef, setPayRef] = useState('');
  const [receiptStudent, setReceiptStudent] = useState(null);
  const [search, setSearch] = useState('');

  // Calculate summary metrics
  const students = state.students || [];
  const totalCollected = students.reduce((sum, s) => sum + (Number(s.paidFee) || 0), 0);
  const totalPending = students.reduce((sum, s) => {
    const diff = (Number(s.totalFee) || 0) - (Number(s.paidFee) || 0);
    return sum + Math.max(0, diff);
  }, 0);

  const filteredStudents = isStudent
    ? students.filter(s => s.id === currentUser.id || s.roll === currentUser.roll)
    : students.filter(s =>
        (s.name && s.name.toLowerCase().includes(search.toLowerCase())) ||
        (s.roll && s.roll.toLowerCase().includes(search.toLowerCase())) ||
        (s.phone && s.phone.includes(search))
      );

  // RULE 8: Advance Due Date Forward by Math.floor(payment / monthlyFee)
  function advanceDueDate(currentDueDateStr, monthsToAdd) {
    if (!currentDueDateStr || currentDueDateStr === 'Paid' || isNaN(Date.parse(currentDueDateStr))) {
      const d = new Date();
      d.setMonth(d.getMonth() + monthsToAdd);
      return d.toISOString().split('T')[0];
    }
    const d = new Date(currentDueDateStr);
    d.setMonth(d.getMonth() + monthsToAdd);
    return d.toISOString().split('T')[0];
  }

  function handleRecordPayment(e) {
    e.preventDefault();
    if (!selectedStudentForPay || payAmount <= 0) return;

    const amount = Number(payAmount);
    const monthlyFee = Number(selectedStudentForPay.monthlyFee) || 1000;
    const monthsPaid = Math.floor(amount / monthlyFee) || 1;

    const newDueDate = advanceDueDate(selectedStudentForPay.dueDate, monthsPaid);
    const newPaidFee = (Number(selectedStudentForPay.paidFee) || 0) + amount;

    const updatedStudents = (state.students || []).map(s => {
      if (s.id === selectedStudentForPay.id) {
        return {
          ...s,
          paidFee: newPaidFee,
          dueDate: newDueDate,
          lastReminder: 'Paid ' + new Date().toLocaleDateString('en-IN')
        };
      }
      return s;
    });

    onUpdateState({
      ...state,
      students: updatedStudents
    });

    setReceiptStudent({
      student: selectedStudentForPay,
      amount,
      mode: payMode,
      ref: payRef || 'UPI-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      date: new Date().toLocaleDateString('en-IN')
    });

    setSelectedStudentForPay(null);
    setPayRef('');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-black text-2xl text-slate-900 dark:text-white">
            Tuition Fees &amp; Collections Ledger
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Dynamic monthly fee accumulation &bull; Instant UPI reconciliation
          </p>
        </div>

        {/* Official UPI ID Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-xs text-indigo-700 dark:text-indigo-300 font-semibold">
          <i className="fa-solid fa-qrcode text-indigo-600"></i>
          <span>UPI: <b>{state.settings?.upiId || 'divineclasses@upi'}</b></span>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Cumulative Collections</span>
          <p className="font-heading font-black text-2xl text-emerald-600 mt-1">
            ₹{totalCollected.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-slate-400">Recorded across all scholar cycles</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Current Pending Balances</span>
          <p className="font-heading font-black text-2xl text-amber-600 mt-1">
            ₹{totalPending.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-slate-400">Outstanding tuition dues</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Monthly Standard Slab</span>
          <p className="font-heading font-black text-2xl text-indigo-600 mt-1">
            ₹1,000 / month
          </p>
          <span className="text-[11px] text-slate-400">Advance moves due date 1 mo / ₹1k</span>
        </div>
      </div>

      {/* Search Bar */}
      {!isStudent && (
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search scholar by name, roll number, or mobile..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Fees Ledger Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
              <tr>
                <th className="py-3 px-4">Roll No.</th>
                <th className="py-3 px-4">Scholar Name</th>
                <th className="py-3 px-4">Monthly Rate</th>
                <th className="py-3 px-4">Total Paid (₹)</th>
                <th className="py-3 px-4">Next Due Date</th>
                <th className="py-3 px-4">Last Payment</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No fee records found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {student.roll}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-100">
                      {student.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      ₹{student.monthlyFee || 1000}/mo
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                      ₹{(Number(student.paidFee) || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        student.dueDate === 'Paid'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                      }`}>
                        {student.dueDate}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {student.lastReminder || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {isAdmin ? (
                        <button
                          onClick={() => {
                            setSelectedStudentForPay(student);
                            setPayAmount(student.monthlyFee || 1000);
                          }}
                          className="py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition inline-flex items-center gap-1.5"
                        >
                          <i className="fa-solid fa-receipt"></i>
                          <span>Record Payment</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => alert(`To pay online, send ₹${student.monthlyFee || 1000} to official UPI ID: ${state.settings?.upiId || 'divineclasses@upi'} with Roll ${student.roll} in remarks.`)}
                          className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition inline-flex items-center gap-1.5"
                        >
                          <i className="fa-solid fa-qrcode"></i>
                          <span>Pay Online</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD PAYMENT MODAL */}
      {selectedStudentForPay && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-base">Record Tuition Fee</h3>
                <p className="text-xs text-indigo-100">{selectedStudentForPay.name} &bull; {selectedStudentForPay.roll}</p>
              </div>
              <button onClick={() => setSelectedStudentForPay(null)} className="p-1 hover:bg-white/20 rounded-lg text-white">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Payment Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="100"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-base text-emerald-600"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Advancement: Every ₹{selectedStudentForPay.monthlyFee || 1000} extends due date by 1 month forward.
                </p>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Payment Mode</label>
                <select
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="UPI">UPI Transfer / QR Code</option>
                  <option value="Cash">Cash at Center Reception</option>
                  <option value="NetBanking">Net Banking / IMPS</option>
                  <option value="Cheque">Bank Cheque / Draft</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Transaction Reference / UTR Number
                </label>
                <input
                  type="text"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="e.g. UPI-928374928"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForPay(null)}
                  className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md"
                >
                  Confirm &amp; Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECEIPT PREVIEW MODAL */}
      {receiptStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-150 text-xs">
            <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2 text-lg">
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <h3 className="font-heading font-black text-base text-slate-900 dark:text-white">
                Payment Receipt Confirmed
              </h3>
              <p className="text-[11px] text-slate-400">Divine Classes Official Fee Voucher</p>
            </div>

            <div className="space-y-2.5 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl mb-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Student:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{receiptStudent.student.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Roll Number:</span>
                <span className="font-mono font-bold text-indigo-600">{receiptStudent.student.roll}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount Paid:</span>
                <span className="font-bold text-emerald-600 text-sm">₹{receiptStudent.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Mode:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{receiptStudent.mode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Reference:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{receiptStudent.ref}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Receipt Date:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{receiptStudent.date}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              >
                Print Receipt
              </button>
              <button
                onClick={() => setReceiptStudent(null)}
                className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-semibold text-white shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
