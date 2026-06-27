export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-sm">
        <p className="text-amber-400 text-xs font-black uppercase tracking-widest">Mr & Miss FUL 2026</p>
        <h1 className="text-6xl font-black text-white">404</h1>
        <p className="text-slate-300 font-semibold">This page doesn't exist or may have been moved.</p>
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-full bg-amber-500 px-6 py-3 text-sm font-black text-white hover:bg-amber-600 transition-colors mt-2"
        >
          ← Back to Home
        </a>
      </div>
    </main>
  );
}
