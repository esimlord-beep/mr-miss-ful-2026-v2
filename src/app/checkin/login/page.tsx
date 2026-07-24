import { gateLogin } from "./actions";
import { ScanLine } from "lucide-react";

export default async function GateLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B132B] px-4">
      <div className="max-w-sm w-full space-y-6 bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 rounded-2xl">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#D4AF37]/10">
            <ScanLine size={20} strokeWidth={1.75} className="text-[#D4AF37]" />
          </div>
          <h2 className="text-xl font-bold text-white">Gate Check-in</h2>
          <p className="mt-1.5 text-xs text-white/40">Enter the gate password to start scanning tickets</p>
        </div>

        <form action={gateLogin} className="space-y-4">
          {params.error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs font-semibold text-red-300 text-center">
              {params.error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-white/50 mb-1.5">Gate Password</label>
            <input
              type="password"
              name="password"
              required
              autoFocus
              className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2.5 text-sm font-semibold text-white outline-none focus:border-[#D4AF37] transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-[#D4AF37] py-3 text-sm font-bold text-[#0B132B] shadow-lg shadow-[#D4AF37]/20 hover:-translate-y-0.5 hover:shadow-xl transition-all"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
