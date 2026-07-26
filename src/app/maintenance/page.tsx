export const dynamic = "force-dynamic";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 text-center" style={{ backgroundColor: "#FAF9F6" }}>
      <div>
        <p className="font-rounded text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#B8901F" }}>
          Mr &amp; Miss FUL 2026
        </p>
        <h1 className="font-rounded text-2xl sm:text-3xl font-extrabold tracking-tight mb-3" style={{ color: "#0B132B" }}>
          We&apos;ll be right back
        </h1>
        <p className="text-sm max-w-sm mx-auto font-medium" style={{ color: "#0B132B99" }}>
          The site is undergoing quick maintenance. Please check back shortly.
        </p>
      </div>
    </div>
  );
}
