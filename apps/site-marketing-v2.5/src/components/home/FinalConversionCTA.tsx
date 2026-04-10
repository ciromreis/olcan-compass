import Link from 'next/link';

export function FinalConversionCTA() {
  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-olcan-navy">
      {/* Subtle World Map Overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10h80v80H10z' fill='none' stroke='%23fff' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '100px 100px',
        }}
      />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-display-xl font-display text-white mb-6">
          Sua transição internacional começa com clareza.
        </h2>
        <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
          Diagnóstico estratégico gratuito em 10 minutos. 
          Descubra seu perfil de mobilidade e o próximo passo concreto.
        </p>

        <Link
          href="/diagnostico"
          className="inline-flex items-center gap-3 px-12 py-5 bg-[#00BCD4] hover:bg-[#00ACC1] text-[#001338] font-display font-bold text-lg rounded-full transition-all duration-300 shadow-2xl hover:shadow-[#00BCD4]/50 hover:scale-105"
        >
          Fazer Meu Diagnóstico Agora
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
