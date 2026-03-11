import { FileText, Shield, Scale } from "lucide-react";

export const metadata = { title: "Legal" };

export default function LegalPage() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <h1 className="font-heading text-display text-text-primary mb-4">Legal</h1>
        <p className="text-body-lg text-text-secondary">Termos de uso, privacidade e conformidade</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <a href="#termos" className="card-surface p-6 text-center group hover:-translate-y-1 transition-transform">
          <FileText className="w-6 h-6 text-moss-500 mx-auto mb-3" />
          <h3 className="font-heading text-h4 text-text-primary">Termos de Uso</h3>
          <p className="text-caption text-text-muted mt-1">Última atualização: Dez 2025</p>
        </a>
        <a href="#privacidade" className="card-surface p-6 text-center group hover:-translate-y-1 transition-transform">
          <Shield className="w-6 h-6 text-moss-500 mx-auto mb-3" />
          <h3 className="font-heading text-h4 text-text-primary">Privacidade</h3>
          <p className="text-caption text-text-muted mt-1">LGPD Compliant</p>
        </a>
        <a href="#escrow" className="card-surface p-6 text-center group hover:-translate-y-1 transition-transform">
          <Scale className="w-6 h-6 text-moss-500 mx-auto mb-3" />
          <h3 className="font-heading text-h4 text-text-primary">Política de Escrow</h3>
          <p className="text-caption text-text-muted mt-1">Marketplace e pagamentos</p>
        </a>
      </div>
      <div className="space-y-12">
        <div id="termos" className="card-surface p-8">
          <h2 className="font-heading text-h2 text-text-primary mb-4">Termos de Uso</h2>
          <div className="prose prose-sm text-text-secondary space-y-3">
            <p>Ao utilizar a plataforma Olcan Compass, você concorda com estes termos. A plataforma é um serviço de inteligência para mobilidade internacional que fornece ferramentas de diagnóstico, planejamento e conexão com profissionais.</p>
            <p>O Compass não é uma agência de imigração e não garante resultados de processos de visto ou admissão. Os scores e métricas são estimativas baseadas em dados fornecidos pelo usuário e modelos estatísticos.</p>
            <p>Os profissionais listados no marketplace são prestadores independentes. O Olcan Compass atua como intermediário e não se responsabiliza diretamente pela qualidade dos serviços prestados, mas oferece mecanismos de escrow e resolução de disputas.</p>
          </div>
        </div>
        <div id="privacidade" className="card-surface p-8">
          <h2 className="font-heading text-h2 text-text-primary mb-4">Política de Privacidade</h2>
          <div className="prose prose-sm text-text-secondary space-y-3">
            <p>Seus dados pessoais são protegidos por criptografia e Row Level Security (RLS). Nunca vendemos ou compartilhamos seus dados com terceiros para fins de marketing.</p>
            <p>Dados psicológicos e financeiros são tratados como informações sensíveis e recebem camada adicional de proteção (PII masking) antes de qualquer processamento por IA.</p>
            <p>Em conformidade com a LGPD, você tem direito a: acessar, corrigir, exportar e solicitar a exclusão de todos os seus dados a qualquer momento.</p>
          </div>
        </div>
        <div id="escrow" className="card-surface p-8">
          <h2 className="font-heading text-h2 text-text-primary mb-4">Política de Escrow</h2>
          <div className="prose prose-sm text-text-secondary space-y-3">
            <p>Pagamentos no marketplace são processados via Stripe Connect. O valor é retido em escrow até que o serviço seja concluído e aprovado pelo comprador.</p>
            <p>Em caso de disputa, ambas as partes têm 7 dias para apresentar evidências. A equipe do Compass media a resolução com base nos termos do serviço contratado.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
