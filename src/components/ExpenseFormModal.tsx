'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Sparkles, Calendar, Clock, IndianRupee } from 'lucide-react';
import { CATEGORIES, PAYMENT_MODES } from '@/lib/constants';
import { parseVoiceExpense } from '@/lib/voiceParser';
import { Expense, ExpenseCategory, PaymentMode } from '@/types/expense';

interface ExpenseFormModalProps {
  initialExpense?: Expense | null;
  onSave: (expenseData: Omit<Expense, 'id' | 'createdAt'>, existingId?: string) => void;
  onClose: () => void;
}

export default function ExpenseFormModal({
  initialExpense,
  onSave,
  onClose,
}: ExpenseFormModalProps) {
  const now = new Date();
  const defaultDate = now.toISOString().split('T')[0];
  const defaultTime = now.toTimeString().slice(0, 5);

  const [title, setTitle] = useState(initialExpense?.title || '');
  const [amount, setAmount] = useState(initialExpense ? String(initialExpense.amount) : '');
  const [category, setCategory] = useState<ExpenseCategory>(
    initialExpense?.category || 'Food & Dining'
  );
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(initialExpense?.paymentMode || 'UPI');
  const [date, setDate] = useState(initialExpense?.date || defaultDate);
  const [time, setTime] = useState(initialExpense?.time || defaultTime);
  const [notes, setNotes] = useState(initialExpense?.notes || '');

  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceError, setVoiceError] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const toggleVoiceInput = () => {
    setVoiceError('');
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError('Speech recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setVoiceTranscript(transcript);
      const parsed = parseVoiceExpense(transcript);
      if (parsed.title) setTitle(parsed.title);
      if (parsed.amount !== null) setAmount(String(parsed.amount));
      setCategory(parsed.category);
      setPaymentMode(parsed.paymentMode);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      setVoiceError(`Voice error: ${event.error || 'Could not hear clearly'}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numericAmount) || numericAmount <= 0) return;

    onSave(
      {
        title: title.trim(),
        amount: numericAmount,
        category,
        paymentMode,
        date,
        time,
        notes: notes.trim() || undefined,
      },
      initialExpense?.id
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {initialExpense ? 'Edit Expense' : 'Add Day-to-Day Expense'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          {/* Voice Quick Entry Card */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 border border-indigo-200/70 dark:border-indigo-800/60">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Voice Quick Entry
                </p>
                <p className="text-[11px] text-indigo-600/90 dark:text-indigo-400 mt-0.5">
                  Say e.g. &ldquo;Spent 250 on lunch by UPI&rdquo;
                </p>
              </div>
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" /> Listening...
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" /> Speak
                  </>
                )}
              </button>
            </div>
            {voiceTranscript && (
              <p className="mt-2 text-[11px] text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-900/60 px-2.5 py-1.5 rounded-lg">
                Heard: &ldquo;{voiceTranscript}&rdquo;
              </p>
            )}
            {voiceError && (
              <p className="mt-2 text-[11px] text-rose-600 dark:text-rose-400">{voiceError}</p>
            )}
          </div>

          <form id="expense-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Expense Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Morning Milk, Petrol, Lunch"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Amount (₹) *
                </label>
                <div className="relative">
                  <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Category
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                      category === cat.name
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Mode Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Payment Mode
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PAYMENT_MODES.map((pm) => (
                  <button
                    key={pm.name}
                    type="button"
                    onClick={() => setPaymentMode(pm.name)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                      paymentMode === pm.name
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {pm.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Time
                </label>
                <div className="relative">
                  <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any extra details or vendor name..."
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </form>
        </div>

        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2.5 bg-slate-50/70 dark:bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="expense-form"
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            {initialExpense ? 'Update Expense' : 'Save Expense'}
          </button>
        </div>
      </div>
    </div>
  );
}
