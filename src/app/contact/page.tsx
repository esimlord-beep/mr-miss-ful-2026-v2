import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact & Support — Mr & Miss FUL 2026",
  description: "Get in touch with the Mr & Miss FUL 2026 support team for help with voting or payments.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 text-white py-12 px-4 text-center">
        <p className="text-amber-400 text-xs font-black uppercase tracking-widest mb-2">Mr & Miss FUL 2026</p>
        <h1 className="text-3xl font-black">Contact & Support</h1>
        <p className="text-slate-300 mt-3 text-sm max-w-md mx-auto">
          Having trouble voting or with a payment? Reach out and we'll help as soon as possible.
        </p>
      </div>

      <div className="max-w-md mx-auto px-4 py-12 space-y-4">

        <a
          href="mailto:Esimlord09@gmail.com"
          className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-300 transition-colors"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-2xl">📧</span>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Email</p>
            <p className="font-black text-slate-900">Esimlord09@gmail.com</p>
          </div>
        </a>

        <a
          href="https://wa.me/2348105789086"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-green-300 transition-colors"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-2xl">💬</span>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">WhatsApp</p>
            <p className="font-black text-slate-900">+234 810 578 9086</p>
          </div>
        </a>

        <p className="text-center text-xs text-slate-400 font-semibold pt-4">
          For payment issues, please include your transaction reference if available.
        </p>
      </div>
    </main>
  );
}
