"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, User, Building2, ArrowRight } from "lucide-react";

export default function OrgRegisterPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", orgName: "", email: "", password: "", role: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="card-surface p-8">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-sage-50 flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-6 h-6 text-sage-500" />
        </div>
        <h1 className="font-heading text-h2 text-text-primary mb-2">Cadastro Institucional</h1>
        <p className="text-body text-text-secondary">Gerencie a mobilidade da sua organização</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-body-sm font-medium text-text-primary mb-1.5">Seu nome</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome do responsável" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent" required />
          </div>
        </div>
        <div>
          <label className="block text-body-sm font-medium text-text-primary mb-1.5">Nome da organização</label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input type="text" value={form.orgName} onChange={(e) => setForm({ ...form, orgName: e.target.value })} placeholder="Universidade, escola, empresa" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent" required />
          </div>
        </div>
        <div>
          <label className="block text-body-sm font-medium text-text-primary mb-1.5">E-mail institucional</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="contato@organizacao.edu.br" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent" required />
          </div>
        </div>
        <div>
          <label className="block text-body-sm font-medium text-text-primary mb-1.5">Seu cargo</label>
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent" required>
            <option value="">Selecione</option>
            <option value="coordinator">Coordenador de Internacionalização</option>
            <option value="director">Diretor Acadêmico</option>
            <option value="hr">Recursos Humanos</option>
            <option value="admin">Administrador</option>
            <option value="other">Outro</option>
          </select>
        </div>
        <div>
          <label className="block text-body-sm font-medium text-text-primary mb-1.5">Senha</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 8 caracteres" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cream-500 bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent" required minLength={8} />
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-sage-500 text-white font-heading font-semibold hover:bg-sage-600 disabled:opacity-50 transition-colors">
          {loading ? "Criando conta..." : "Criar Conta Institucional"}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>
      <div className="mt-6 text-center">
        <Link href="/register" className="text-body-sm text-text-secondary hover:text-brand-500 transition-colors">← Voltar para cadastro padrão</Link>
      </div>
    </div>
  );
}
