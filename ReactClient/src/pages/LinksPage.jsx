import React, { useState } from 'react';

export default function LinksPage({ state, onUpdateState, currentUser }) {
  const isAdmin = currentUser?.role === 'admin';
  const [showAddModal, setShowAddModal] = useState(false);

  const [title, setTitle] = useState('');
  const [provider, setProvider] = useState('');
  const [subject, setSubject] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');

  function handleAddLink(e) {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    const newLink = {
      id: 'l_' + Date.now(),
      title: title.trim(),
      provider: provider.trim() || 'National Portal',
      subject: subject.trim() || 'All Disciplines',
      url: url.trim(),
      driveUrl: '',
      description: description.trim() || 'Official digital repository resource.',
      icon: 'fa-globe',
      color: 'bg-indigo-600'
    };

    onUpdateState({
      ...state,
      externalLinks: [...(state.externalLinks || []), newLink]
    });

    setTitle('');
    setUrl('');
    setDescription('');
    setShowAddModal(false);
  }

  function handleDeleteLink(linkId) {
    if (!window.confirm('Remove this resource link?')) return;
    onUpdateState({
      ...state,
      externalLinks: (state.externalLinks || []).filter(l => l.id !== linkId)
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-black text-2xl text-slate-900 dark:text-white">
            Official Study Links &amp; Knowledge Hub
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Government e-textbooks &bull; Interactive STEM labs &bull; National archives
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/25 transition flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-plus"></i>
            <span>Add Study Resource</span>
          </button>
        )}
      </div>

      {/* Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {(state.externalLinks || []).map(link => (
          <div
            key={link.id}
            className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-800 transition"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl ${link.color || 'bg-indigo-600'} text-white flex items-center justify-center text-sm shadow-md shrink-0`}>
                    <i className={`fa-solid ${link.icon || 'fa-globe'}`}></i>
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                      {link.title}
                    </h3>
                    <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                      {link.provider}
                    </p>
                  </div>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => handleDeleteLink(link.id)}
                    className="p-1 rounded-lg text-slate-300 hover:text-rose-500"
                    title="Remove Link"
                  >
                    <i className="fa-solid fa-trash-can text-xs"></i>
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                {link.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Subject: <b>{link.subject}</b>
              </span>
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="py-1.5 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold text-xs transition flex items-center gap-1.5"
              >
                <span>Open Portal</span>
                <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* ADD LINK MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white flex items-center justify-between">
              <h3 className="font-heading font-bold text-base">Add Academic Resource Link</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-white/20 rounded-lg text-white">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleAddLink} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Resource Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Swayam Prabha Educational DTH Channels"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Provider / Organization</label>
                <input
                  type="text"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  placeholder="Ministry of Education / IIT"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Target Disciplines</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="JEE / NEET / Olympiad"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Target Web URL *</label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary of resources offered..."
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
                  Save Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
