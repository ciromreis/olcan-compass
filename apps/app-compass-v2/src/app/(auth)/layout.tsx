import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f6f3ec_0%,#edf3fa_42%,#f7f8fb_100%)] flex flex-col">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(14,32,74,0.14),transparent_68%)] blur-2xl" />
        <div className="absolute right-[-6rem] top-16 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(191,201,214,0.22),transparent_62%)] blur-3xl" />
        <div className="absolute bottom-[-8rem] left-1/3 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(27,76,138,0.10),transparent_65%)] blur-3xl" />
        <div className="absolute left-[12%] top-[18%] h-36 w-36 rounded-full border border-white/30 bg-[radial-gradient(circle,rgba(255,255,255,0.85),rgba(211,222,234,0.18)_70%,transparent_72%)] opacity-70 shadow-[0_0_40px_rgba(255,255,255,0.25)] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute right-[14%] top-[28%] h-44 w-44 rounded-full border border-slate-200/70 bg-[conic-gradient(from_140deg,rgba(255,255,255,0.15),rgba(15,23,42,0.06),rgba(255,255,255,0.45),rgba(15,23,42,0.08),rgba(255,255,255,0.15))] opacity-80 blur-[1px] animate-[spin_18s_linear_infinite]" />
        <div className="absolute bottom-[12%] left-[16%] h-28 w-72 rounded-full border border-white/20 bg-[linear-gradient(90deg,rgba(255,255,255,0.05),rgba(148,163,184,0.22),rgba(255,255,255,0.05))] blur-2xl" />
        <div
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.06) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div className="absolute inset-0 opacity-[0.22] [mask-image:radial-gradient(circle_at_center,black,transparent_72%)]">
          <div className="absolute inset-x-0 top-[24%] h-px bg-[linear-gradient(90deg,transparent,rgba(15,23,42,0.18),transparent)] animate-[pulse_7s_ease-in-out_infinite]" />
          <div className="absolute inset-x-0 top-[48%] h-px bg-[linear-gradient(90deg,transparent,rgba(148,163,184,0.3),transparent)] animate-[pulse_9s_ease-in-out_infinite]" />
          <div className="absolute inset-x-0 top-[72%] h-px bg-[linear-gradient(90deg,transparent,rgba(15,23,42,0.14),transparent)] animate-[pulse_11s_ease-in-out_infinite]" />
        </div>
        <div className="absolute inset-x-0 top-[18%] h-px bg-[linear-gradient(90deg,transparent,rgba(15,23,42,0.10),transparent)]" />
        <div className="absolute inset-x-0 top-[62%] h-px bg-[linear-gradient(90deg,transparent,rgba(15,23,42,0.08),transparent)]" />
      </div>
      <header className="relative z-10 h-16 px-6 flex items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/olcan-logo.png" alt="Olcan Compass" width={140} height={40} className="h-8 w-auto" priority />
        </Link>
      </header>
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="relative z-10 py-6 text-center">
        <p className="text-caption text-text-muted">
          &copy; {new Date().getFullYear()} Olcan. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
