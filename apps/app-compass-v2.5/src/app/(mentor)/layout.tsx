import { ReactNode } from "react";
import Link from "next/link";
import { LayoutDashboard, MessageSquare, Briefcase, LogOut } from "lucide-react";

export default function MentorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row font-body text-slate-300">
      {/* Mentor Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-white/5 flex flex-col md:min-h-screen sticky top-0 md:h-screen">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-white text-slate-900 flex items-center justify-center font-heading font-semibold text-xl">O</div>
            <span className="font-heading font-semibold text-xl text-white tracking-widest uppercase">
              Zenith
            </span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 text-white font-medium transition-colors">
            <LayoutDashboard className="w-5 h-5" /> Mission Control
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 font-medium transition-colors">
            <Briefcase className="w-5 h-5" /> Appointments
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 font-medium transition-colors">
            <MessageSquare className="w-5 h-5" /> Client Inbox
            <span className="ml-auto w-5 h-5 rounded-full bg-white text-slate-900 text-caption font-bold flex items-center justify-center">2</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-white/5">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 font-medium transition-colors">
            <LogOut className="w-5 h-5" /> Exit Portal
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden pt-6 px-4 pb-20 md:p-10 relative">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-white/5 rounded-full blur-[120px] pointer-events-none"></div>
        {children}
      </main>
    </div>
  );
}
