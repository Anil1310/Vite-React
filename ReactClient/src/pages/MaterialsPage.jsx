import React, { useState } from 'react';

export default function MaterialsPage({ state, onUpdateState, currentUser }) {
  const isAdminOrTeacher = currentUser?.role === 'admin' || currentUser?.role === 'teacher';
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Assignment PDF');
  const [batchId, setBatchId] = useState(state.batches?.[0]?.id || 'b1');
  const [description, setDescription] = useState('');
  const [driveUrl, setDriveUrl] = useState('https://drive.google.com/');

  const filteredMaterials = (state.materials || []).filter(m => {
    return categoryFilter === 'all' || m.category === categoryFilter;
  });

  function handleAddMaterial(e) {
    e.preventDefault();
    if (!title.trim()) return;

    const newMaterial = {
      id: 'm_' + Date.now(),
      batchId,
      title: title.trim(),
      category,
      uploadDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      uploadedBy: currentUser?.name || 'Er. Rajesh Chahar',
      fileSize: '2.1 MB',
      downloads: 1,
      driveUrl: driveUrl || 'https://drive.google.com/',
      description: description.trim() || 'Curated high-yield practice module.'
    };

    onUpdateState({
      ...state,
      materials: [newMaterial, ...(state.materials || [])]
    });

    setTitle('');
    setDescription('');
    setShowAddModal(false);
  }

  function handleDownload(m) {
    if (m.driveUrl && m.driveUrl.startsWith('http')) {
      window.open(m.driveUrl, '_blank');
    } else {
      alert(`Downloading ${m.title}... Starting study module download.`);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-black text-2xl text-slate-900 dark:text-white">
            Study Materials &amp; Daily Practice Papers (DPP)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Curated high-yield formula sheets &bull; Offline question banks &bull; NCERT drills
          </p>
        </div>

        {isAdminOrTeacher && (
          <button
            onClick={() => setShowAddModal(true)}
            className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/25 transition flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-cloud-arrow-up"></i>
            <span>Upload Material</span>
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
        {['all', 'Assignment PDF', 'Worksheet', 'Test Paper'].map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-xl font-semibold transition whitespace-nowrap ${
              categoryFilter === cat
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
            }`}
          >
            {cat === 'all' ? 'All Materials' : cat}
          </button>
        ))}
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMaterials.map(mat => {
          const batch = (state.batches || []).find(b => b.id === mat.batchId);
          return (
            <div
              key={mat.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-800 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 font-bold text-[10px] uppercase">
                    {mat.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{mat.fileSize}</span>
                </div>

                <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white mb-2 leading-snug">
                  {mat.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                  {mat.description}
                </p>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl space-y-1 text-[11px] text-slate-500 dark:text-slate-400 mb-4">
                  <div className="flex items-center justify-between">
                    <span>Batch:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                      {batch ? batch.name : 'General'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Uploaded By:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{mat.uploadedBy}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Date:</span>
                    <span>{mat.uploadDate}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  <i className="fa-solid fa-download mr-1"></i>
                  <b>{mat.downloads || 0}</b> downloads
                </span>
                <button
                  onClick={() => handleDownload(mat)}
                  className="py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-download"></i>
                  <span>Get Material</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* UPLOAD MATERIAL MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white flex items-center justify-between">
              <h3 className="font-heading font-bold text-base">Upload Study Module</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-white/20 rounded-lg text-white">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleAddMaterial} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Material Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Electromagnetic Waves Quick Revision Formula Booklet"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="Assignment PDF">Assignment PDF</option>
                    <option value="Worksheet">Booster Worksheet</option>
                    <option value="Test Paper">Simulation Test Paper</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Batch</label>
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
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Drive Link / Download URL</label>
                <input
                  type="url"
                  value={driveUrl}
                  onChange={(e) => setDriveUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Description / Instructions</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief syllabus coverage, hints, or instructions..."
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
                  Publish Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
