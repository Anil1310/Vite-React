import React, { useState } from 'react';

export default function TeachersPage({ state, onUpdateState, currentUser }) {
  const isAdmin = currentUser?.role === 'admin';
  const [showAddModal, setShowAddModal] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState('10+ Years');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [bio, setBio] = useState('');
  const [password, setPassword] = useState('teacher123');

  function handleAddTeacher(e) {
    e.preventDefault();
    if (!name.trim()) return;

    const initials = name
      .split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const newTeacher = {
      id: 'tr_' + Date.now(),
      name: name.trim(),
      subject: subject.trim() || 'Senior Faculty',
      qualification: qualification.trim() || 'M.Sc., B.Ed.',
      experience: experience.trim() || '8+ Years',
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@divineclasses.in`,
      phone: phone.trim() || '+91 95556 78753',
      specialization: specialization.trim() || 'JEE / NEET Guidance',
      bio: bio.trim() || 'Dedicated academic coach at Divine Classes.',
      avatarColor: 'bg-indigo-600',
      initials,
      password: password || 'teacher123',
      status: 'Active'
    };

    onUpdateState({
      ...state,
      teachers: [...(state.teachers || []), newTeacher]
    });

    setName('');
    setSubject('');
    setQualification('');
    setEmail('');
    setShowAddModal(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-black text-2xl text-slate-900 dark:text-white">
            Academic Faculty &amp; Mentor Directory
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Expert educators from IIT Roorkee, AIIMS &amp; IISc Bangalore
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/25 transition flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-user-tie"></i>
            <span>Add Faculty Mentor</span>
          </button>
        )}
      </div>

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {(state.teachers || []).map(teacher => (
          <div
            key={teacher.id}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-800 transition"
          >
            <div>
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-14 h-14 rounded-2xl ${teacher.avatarColor || 'bg-indigo-600'} text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md`}>
                  {teacher.initials || teacher.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white leading-tight">
                    {teacher.name}
                  </h3>
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {teacher.subject}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {teacher.qualification} &bull; {teacher.experience}
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl space-y-1.5 text-xs text-slate-600 dark:text-slate-300 mb-4">
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Specialization:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{teacher.specialization}</span>
                </div>
                <div className="pt-1">
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Biography:</span>
                  <p className="italic text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    &ldquo;{teacher.bio}&rdquo;
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono text-[11px]">{teacher.email}</span>
              <a
                href={`tel:${teacher.phone}`}
                className="py-1 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px] hover:bg-indigo-50 hover:text-indigo-600 transition flex items-center gap-1.5"
              >
                <i className="fa-solid fa-phone text-xs"></i>
                <span>Call Mentor</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* ADD FACULTY MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white flex items-center justify-between">
              <h3 className="font-heading font-bold text-base">Register Faculty Mentor</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-white/20 rounded-lg text-white">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleAddTeacher} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Faculty Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Er. Rajesh Chahar"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Department / Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Senior Physics Faculty"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Qualifications</label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="B.Tech (IIT), M.Tech"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Experience</label>
                  <input
                    type="text"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="15+ Years"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="faculty@divineclasses.in"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 95556 78753"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Specialization</label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="Rotational Dynamics, JEE Strategy"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Faculty Biography</label>
                <textarea
                  rows="2"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Mentor achievements and coaching philosophy..."
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
                  Register Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
