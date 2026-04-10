"use client";

import { motion } from "framer-motion";

const fears = [
  {
    emoji: "🧠",
    title: "\"Será que sou bom o suficiente?\"",
    cluster: "Competência",
    color: "border-blue-200 bg-blue-50",
    iconBg: "bg-blue-100",
    solution: "O diagnóstico identifica suas forças reais e constrói a narrativa que o comitê de seleção precisa ouvir.",
  },
  {
    emoji: "💔",
    title: "\"E se eu aplicar e não passar?\"",
    cluster: "Rejeição",
    color: "border-rose-200 bg-rose-50",
    iconBg: "bg-rose-100",
    solution: "Cada rejeição vira combustível com o Fear Reframe Coach. A IA analisa o gap e constrói a candidatura mais forte.",
  },
  {
    emoji: "💸",
    title: "\"E se eu largar tudo e não der certo?\"",
    cluster: "Perda",
    color: "border-orange-200 bg-orange-50",
    iconBg: "bg-orange-100",
    solution: "O Compass mapeia sua viabilidade financeira antes de qualquer decisão. Zero surpresas, máxima clareza.",
  },
  {
    emoji: "⏳",
    title: "\"E se eu tomar a decisão errada?\"",
    cluster: "Irreversibilidade",
    color: "border-emerald-200 bg-emerald-50",
    iconBg: "bg-emerald-100",
    solution: "O Oráculo Determinístico omite rotas inviáveis e apresenta apenas os caminhos reais para o seu perfil.",
  },
];

export function FearClustersSection() {
  return (
    <section className="section-py bg-cream">
      <div className="section-wrapper">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-brand-500 font-display font-bold text-sm uppercase tracking-widest">
            Os 4 Medos da Internacionalização
          </span>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-void mt-3 mb-4 text-balance">
            Reconhece algum desses pensamentos?
          </h2>
          <p className="text-ink-muted font-body text-lg max-w-xl mx-auto">
            A Olcan foi construída para transformar esses medos em sistemas. Não sorte — metodologia.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {fears.map((fear, i) => (
            <motion.div
              key={fear.cluster}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className={`rounded-2xl p-6 border-2 ${fear.color} hover:shadow-md transition-shadow duration-300`}
            >
              <div className="flex items-start gap-4">
                <div className={`${fear.iconBg} w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0`}>
                  {fear.emoji}
                </div>
                <div>
                  <span className="fear-pill mb-2 inline-block">{fear.cluster}</span>
                  <p className="font-display font-bold text-void text-base mb-2">{fear.title}</p>
                  <p className="text-ink-muted font-body text-sm leading-relaxed">{fear.solution}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
