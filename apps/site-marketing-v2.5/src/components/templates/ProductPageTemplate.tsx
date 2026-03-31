"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Star, ArrowRight, Shield, Users, Clock, Award, Globe, Map, BookOpen, Video, Target, Calendar, TrendingUp, FileCheck, MessageCircle, Edit, Zap, FileText } from 'lucide-react';
import Link from 'next/link';
import { trackProductView, trackEvent } from '@/lib/analytics';

// Icon mapping helper
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Globe,
  Map,
  Users,
  BookOpen,
  Video,
  Award,
  Target,
  Calendar,
  TrendingUp,
  FileCheck,
  MessageCircle,
  Edit,
  Zap,
  FileText,
  Shield,
  Clock,
  CheckCircle,
  Star,
  ArrowRight,
};

function getIcon(iconName: string, className?: string) {
  const IconComponent = iconMap[iconName];
  if (!IconComponent) {
    return <Globe className={className} />;
  }
  return <IconComponent className={className} />;
}

interface ProductFeature {
  title: string;
  description: string;
}

interface ProductBenefit {
  icon: string;
  title: string;
  description: string;
}

interface ProductTestimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
}

interface ProductFAQ {
  question: string;
  answer: string;
}

interface ProductPageProps {
  name: string;
  tagline: string;
  description: string;
  price: number;
  currency?: string;
  features: ProductFeature[];
  benefits: ProductBenefit[];
  testimonials: ProductTestimonial[];
  faqs: ProductFAQ[];
  enrollmentLink: string;
  category: string;
  duration?: string;
  format?: string;
  level?: string;
}

export function ProductPageTemplate({
  name,
  tagline,
  description,
  price,
  currency = 'BRL',
  features,
  benefits,
  testimonials,
  faqs,
  enrollmentLink,
  category,
  duration,
  format,
  level
}: ProductPageProps) {
  const [expandedFAQ, setExpandedFAQ] = React.useState<number | null>(null);

  React.useEffect(() => {
    trackProductView(name, category, price);
  }, [name, category, price]);

  const handleEnrollClick = () => {
    trackEvent('add_to_cart', {
      product_name: name,
      value: price,
      currency
    });
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-cream-50" />
        
        <div className="container-site relative z-10 mx-auto px-6 lg:px-12 w-full max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-200 mb-6">
              <Award className="w-4 h-4 text-brand-600" />
              <span className="text-sm font-semibold text-brand-700">{category}</span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl text-olcan-navy leading-tight mb-6">
              {name}
            </h1>

            <p className="text-2xl text-brand-600 font-medium mb-6">
              {tagline}
            </p>

            <p className="text-xl text-text-secondary leading-relaxed mb-8 max-w-3xl mx-auto">
              {description}
            </p>

            {/* Product Meta */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-8 text-sm text-text-secondary">
              {duration && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{duration}</span>
                </div>
              )}
              {format && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{format}</span>
                </div>
              )}
              {level && (
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>{level}</span>
                </div>
              )}
            </div>

            {/* Price & CTA */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-2xl p-8 max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <div className="text-sm text-text-secondary mb-2">Investimento</div>
                <div className="text-5xl font-bold text-olcan-navy">
                  {currency === 'BRL' ? 'R$' : '$'} {price.toLocaleString('pt-BR')}
                </div>
                <div className="text-sm text-text-secondary mt-2">Pagamento único ou parcelado</div>
              </div>

              <Link
                href={enrollmentLink}
                onClick={handleEnrollClick}
                className="btn-primary w-full py-4 text-center text-lg"
              >
                Garantir Minha Vaga
                <ArrowRight className="inline-block w-5 h-5 ml-2" />
              </Link>

              <div className="flex items-center justify-center gap-4 mt-6 text-sm text-text-secondary">
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-brand-600" />
                  <span>Garantia de 7 dias</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-brand-600" />
                  <span>Acesso imediato</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container-site mx-auto px-6 lg:px-12 w-full max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl text-olcan-navy mb-4">
              O que você vai conquistar
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Benefícios práticos e resultados reais para sua jornada internacional
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                viewport={{ once: true }}
                className="bg-cream-50 rounded-2xl p-8 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center mb-6">
                  {getIcon(benefit.icon, "w-8 h-8 text-white")}
                </div>
                <h3 className="font-bold text-xl text-olcan-navy mb-3">{benefit.title}</h3>
                <p className="text-text-secondary leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-cream-50">
        <div className="container-site mx-auto px-6 lg:px-12 w-full max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl text-olcan-navy mb-4">
              O que está incluído
            </h2>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-2xl p-8 md:p-12">
              <div className="space-y-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 * index }}
                    viewport={{ once: true }}
                    className="flex gap-4"
                  >
                    <CheckCircle className="w-6 h-6 text-brand-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-lg text-olcan-navy mb-2">{feature.title}</h4>
                      <p className="text-text-secondary leading-relaxed">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container-site mx-auto px-6 lg:px-12 w-full max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="font-display text-4xl md:text-5xl text-olcan-navy mb-4">
                Quem já transformou sua carreira
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  viewport={{ once: true }}
                  className="bg-cream-50 rounded-2xl p-8"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-brand-500 text-brand-500" />
                    ))}
                  </div>
                  <p className="text-text-secondary leading-relaxed mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-bold text-olcan-navy">{testimonial.name}</div>
                    <div className="text-sm text-text-secondary">{testimonial.role}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="py-20 bg-cream-50">
        <div className="container-site mx-auto px-6 lg:px-12 w-full max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl text-olcan-navy mb-4">
              Perguntas Frequentes
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 * index }}
                viewport={{ once: true }}
                className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => {
                    setExpandedFAQ(expandedFAQ === index ? null : index);
                    if (expandedFAQ !== index) {
                      trackEvent('faq_expand', { question: faq.question });
                    }
                  }}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-cream-50 transition-colors"
                >
                  <span className="font-semibold text-olcan-navy pr-4">{faq.question}</span>
                  <ArrowRight
                    className={`w-5 h-5 text-brand-600 flex-shrink-0 transition-transform ${
                      expandedFAQ === index ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {expandedFAQ === index && (
                  <div className="px-6 pb-4 text-text-secondary leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-olcan-navy to-olcan-navy-light">
        <div className="container-site mx-auto px-6 lg:px-12 w-full max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <h2 className="font-display text-4xl md:text-5xl mb-6">
              Pronto para começar sua jornada?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Junte-se a centenas de profissionais que já transformaram suas carreiras com a Olcan
            </p>
            <Link
              href={enrollmentLink}
              onClick={handleEnrollClick}
              className="inline-block px-8 py-4 bg-white text-olcan-navy font-semibold rounded-xl hover:bg-cream-50 transition-all duration-300 shadow-lg hover:scale-105"
            >
              Garantir Minha Vaga Agora
              <ArrowRight className="inline-block w-5 h-5 ml-2" />
            </Link>
            <div className="mt-6 text-white/60 text-sm">
              Garantia de 7 dias • Acesso imediato • Suporte dedicado
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
