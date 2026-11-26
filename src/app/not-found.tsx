import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-4">
      <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        Could not find the requested resource.
      </p>
      <Link
        href="/"
        className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
