import React, { useState, useRef, useEffect } from 'react';

export default function Chatbot({ state, currentUser, enabled = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Hello! I am your Divine Classes Academic & Institute Assistant. How can I assist you with your schedule, dues, test marks, or syllabus doubts today?`,
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!enabled) return null;

  function handleVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your current browser. Please try Chrome or Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        sendMessage(transcript);
      };

      recognition.start();
    } catch (e) {
      console.error('Speech recognition error:', e);
      setIsListening(false);
    }
  }

  function resolveStateQuery(query) {
    const q = query.toLowerCase();

    // 1. Dues / Fees
    if (q.includes('fee') || q.includes('due') || q.includes('payment') || q.includes('paid')) {
      if (currentUser?.role === 'student') {
        const student = (state.students || []).find(s => s.id === currentUser.id || s.roll === currentUser.roll);
        if (student) {
          const dues = Math.max(0, (student.totalFee || 0) - (student.paidFee || 0));
          return `Your total course fee is ₹${student.totalFee.toLocaleString('en-IN')}, and you have paid ₹${student.paidFee.toLocaleString('en-IN')}. Monthly fee is ₹${student.monthlyFee}/month. Next fee status: ${student.dueDate === 'Paid' ? 'Fully Paid!' : `Due on ${student.dueDate}`}.`;
        }
      }
      return `For fee payments, you can transfer to our official UPI: ${state.settings?.upiId || 'divineclasses@upi'} or visit the institute reception during office hours.`;
    }

    // 2. Batches / Schedule
    if (q.includes('batch') || q.includes('schedule') || q.includes('time') || q.includes('class')) {
      if (currentUser?.role === 'student') {
        const batch = (state.batches || []).find(b => b.id === currentUser.batchId);
        if (batch) {
          return `You are in batch "${batch.name}". Schedule: ${batch.schedule}. Classroom: ${batch.room}. Lead Mentor: ${batch.teacher}.`;
        }
      }
      return `Divine Classes runs 3 premier batches: Alpha JEE Target (08:00 AM - 12:30 PM), NEET Bio-Elite (01:30 PM - 06:00 PM), and CBSE 10th NTSE (04:30 PM - 07:00 PM).`;
    }

    // 3. Faculty / Teachers
    if (q.includes('teacher') || q.includes('faculty') || q.includes('sir') || q.includes('rajesh') || q.includes('sunita')) {
      return `Our faculty director is Er. Rajesh Chahar (Senior Physics Mentor & IITian). Head of Medical Entrance is Dr. Sunita Sharma (M.D. AIIMS), and Mathematics mentor is Mr. Arvind Verma (Gold Medalist).`;
    }

    // 4. Contact / Address
    if (q.includes('address') || q.includes('location') || q.includes('phone') || q.includes('helpline')) {
      return `Center Address: ${state.settings?.address || '235 Paschimpuri Pocket 2, Club Rd New Delhi 110063'}. Official Helpline: ${state.settings?.phone || '+91 95556 78753'}.`;
    }

    // Default Academic Doubt response
    return `Regarding "${query}": Divine Classes faculty encourages step-by-step analytical derivation. Practice the high-yield formulas in the Study Materials section or consult your batch faculty during dedicated daily doubt hours!`;
  }

  function sendMessage(text) {
    const userText = text || input;
    if (!userText.trim()) return;

    const userMsg = {
      id: String(Date.now()),
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const botResponse = resolveStateQuery(userText);
      const botMsg = {
        id: String(Date.now() + 1),
        sender: 'bot',
        text: botResponse,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
      setLoading(false);
    }, 400);
  }

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        id="divine-chatbot-btn"
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-20 lg:bottom-6 right-5 z-40 w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 text-white shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition flex items-center justify-center select-none"
        title="Ask Divine AI Assistant"
      >
        <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-robot'} text-xl`}></i>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900 animate-ping"></span>
        )}
      </button>

      {/* Floating Chatbot Window */}
      {isOpen && (
        <div
          id="divine-chatbot-window"
          className="fixed bottom-36 lg:bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-96 max-h-[600px] h-[75vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-4 text-white flex items-center justify-between select-none">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-sm shadow-sm">
                <i className="fa-solid fa-robot"></i>
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm leading-tight">Divine AI Assistant</h4>
                <p className="text-[10px] text-indigo-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Connected to Academic State
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl hover:bg-white/20 transition text-white"
            >
              <i className="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
            {messages.map(m => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    <i className="fa-solid fa-atom"></i>
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-bl-none'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-line">{m.text}</p>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      m.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 items-center text-xs text-slate-400 italic">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
                <span>Resolving doubt...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          <div className="px-3 py-1.5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <button
              onClick={() => sendMessage('What is my fee status?')}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-600 dark:text-slate-300 transition"
            >
              My Fee Dues
            </button>
            <button
              onClick={() => sendMessage('Show my batch schedule')}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-600 dark:text-slate-300 transition"
            >
              Class Schedule
            </button>
            <button
              onClick={() => sendMessage('Who is my faculty director?')}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-600 dark:text-slate-300 transition"
            >
              Faculty Info
            </button>
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition text-sm ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-500 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 border-slate-200 dark:border-slate-700'
              }`}
              title="Speak your doubt (Web Speech API)"
            >
              <i className="fa-solid fa-microphone"></i>
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a doubt or institute inquiry..."
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-9 h-9 rounded-xl bg-indigo-600 disabled:opacity-50 text-white flex items-center justify-center transition hover:bg-indigo-700 text-xs shadow-sm"
            >
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
