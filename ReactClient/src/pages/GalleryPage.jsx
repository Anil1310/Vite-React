import React, { useState } from 'react';

export default function GalleryPage({ state, onUpdateState, currentUser }) {
  const isAdmin = currentUser?.role === 'admin';
  const [showAddModal, setShowAddModal] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Result Banner');
  const [date, setDate] = useState('June 2026');
  const [badge, setBadge] = useState('AIR Rank');
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  function handleAddBanner(e) {
    e.preventDefault();
    if (!title.trim()) return;

    const newBanner = {
      id: 'g_' + Date.now(),
      title: title.trim(),
      category,
      date,
      badge: badge.trim() || 'Achievement',
      caption: caption.trim() || 'Divine Classes academic celebration.',
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80'
    };

    onUpdateState({
      ...state,
      gallery: [newBanner, ...(state.gallery || [])]
    });

    setTitle('');
    setCaption('');
    setShowAddModal(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-black text-2xl text-slate-900 dark:text-white">
            Results &amp; Campus Gallery
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            JEE Advanced toppers &bull; NEET selections &bull; Smart infrastructure showcases
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/25 transition flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-plus"></i>
            <span>Upload Showcase Banner</span>
          </button>
        )}
      </div>

      {/* Gallery Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(state.gallery || []).map(item => (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-lg transition"
          >
            <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover hover:scale-105 transition duration-500"
              />
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-white text-[11px] font-bold shadow-md">
                {item.badge}
              </span>
              <span className="absolute bottom-4 right-4 px-2.5 py-0.5 rounded-lg bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium">
                {item.date}
              </span>
            </div>

            <div className="p-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {item.category}
              </span>
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white mt-1 mb-2">
                {item.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {item.caption}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* UPLOAD SHOWCASE BANNER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white flex items-center justify-between">
              <h3 className="font-heading font-bold text-base">Add Result or Campus Photo</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-white/20 rounded-lg text-white">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleAddBanner} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Banner Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. JEE Advanced 2026 Toppers Felicitation"
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
                    <option value="Result Banner">Result Banner</option>
                    <option value="Classroom Photo">Smart Classroom</option>
                    <option value="Event">Annual Event</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Highlight Badge</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="AIR 14, 28"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Image Web URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Caption / Description</label>
                <textarea
                  rows="3"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Student accomplishments, percentiles, or event details..."
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
                  Publish Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
