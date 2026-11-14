import React, { useState } from 'react';

export default function FeedbackPage({ state, onUpdateState, currentUser }) {
  const isAdmin = currentUser?.role === 'admin';
  const allowDelete = state.settings?.allowAdminFeedbackDelete !== false;

  const [showAddModal, setShowAddModal] = useState(false);
  const [authorName, setAuthorName] = useState(currentUser?.name || '');
  const [role, setRole] = useState(currentUser?.role === 'student' ? 'Student' : 'Parent');
  const [category, setCategory] = useState('Teaching Quality');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  function handleAddFeedback(e) {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) return;

    const newFeedback = {
      id: 'f_' + Date.now(),
      authorName: authorName.trim(),
      role,
      batchName: 'Divine Classes Academic Program',
      category,
      rating: Number(rating),
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      comment: comment.trim()
    };

    onUpdateState({
      ...state,
      feedbacks: [newFeedback, ...(state.feedbacks || [])]
    });

    setComment('');
    setShowAddModal(false);
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this feedback entry?')) return;
    onUpdateState({
      ...state,
      feedbacks: (state.feedbacks || []).filter(f => f.id !== id)
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-black text-2xl text-slate-900 dark:text-white">
            Scholar &amp; Parent Feedback Wall
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Transparent testimonials on classroom pedagogy, offline test series, and mentorship
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/25 transition flex items-center justify-center gap-2"
        >
          <i className="fa-solid fa-pen"></i>
          <span>Share Feedback</span>
        </button>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {(state.feedbacks || []).map(f => (
          <div
            key={f.id}
            className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 font-bold text-[10px] uppercase">
                  {f.category}
                </span>
                <div className="flex items-center text-amber-400 text-xs gap-0.5">
                  {[...Array(f.rating || 5)].map((_, i) => (
                    <i key={i} className="fa-solid fa-star"></i>
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 italic mb-4 leading-relaxed">
                &ldquo;{f.comment}&rdquo;
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-slate-800 dark:text-slate-200">{f.authorName}</p>
                <p className="text-[10px] text-slate-400">{f.role} &bull; {f.date}</p>
              </div>

              {isAdmin && allowDelete && (
                <button
                  onClick={() => handleDelete(f.id)}
                  className="p-1 rounded-lg text-slate-300 hover:text-rose-500"
                  title="Delete Feedback"
                >
                  <i className="fa-solid fa-trash-can text-xs"></i>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* SUBMIT FEEDBACK MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white flex items-center justify-between">
              <h3 className="font-heading font-bold text-base">Submit Experience Feedback</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-white/20 rounded-lg text-white">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleAddFeedback} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Rajesh Sharma"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Your Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="Student">Student</option>
                    <option value="Parent">Parent / Guardian</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="Teaching Quality">Teaching Quality</option>
                    <option value="Study Material">Study Material &amp; DPP</option>
                    <option value="Offline Test Series">Offline Test Series</option>
                    <option value="Classroom Environment">Classroom Environment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Rating (Stars)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-lg transition ${star <= rating ? 'text-amber-400 scale-110' : 'text-slate-300 dark:text-slate-700'}`}
                    >
                      <i className="fa-solid fa-star"></i>
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-2">{rating} Stars</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Testimonial Comment *</label>
                <textarea
                  rows="3"
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share how Divine Classes faculty and test evaluation helped your preparation..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                ></textarea>
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
                  Submit Testimonial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
