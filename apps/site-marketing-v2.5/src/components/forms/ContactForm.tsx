"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { mautic } from '@/lib/mautic';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    product: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Track in Google Analytics
      trackEvent('consultation_request', {
        product_interest: formData.product,
        source: 'contact_page'
      });

      // Send to Mautic
      await mautic.identifyContact({
        email: formData.email,
        firstName: formData.name.split(' ')[0],
        lastName: formData.name.split(' ').slice(1).join(' '),
        phone: formData.phone,
        tags: ['consultation_request', 'contact_form'],
        fields: {
          product_interest: formData.product,
          message: formData.message
        }
      });

      // Add points for consultation request
      await mautic.addPoints(formData.email, 30, 'consultation_request');

      setIsSubmitted(true);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        product: '',
        message: ''
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Form submission error:', error);
      }
      alert('Erro ao enviar formulário. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-2xl p-12 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-brand-600" />
        </div>
        <h3 className="font-bold text-2xl text-olcan-navy mb-4">
          Mensagem Enviada!
        </h3>
        <p className="text-text-secondary mb-6">
          Recebemos sua mensagem e entraremos em contato em até 24 horas.
        </p>
        <button
          onClick={() => setIsSubmitted(false)}
          className="text-brand-600 hover:text-brand-700 font-semibold"
        >
          Enviar outra mensagem
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-2xl p-8">
      <div className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-olcan-navy mb-2">
            Nome Completo *
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 bg-white border border-cream-300 rounded-xl text-olcan-navy placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="Seu nome"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-olcan-navy mb-2">
            Email *
          </label>
          <input
            type="email"
            id="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 bg-white border border-cream-300 rounded-xl text-olcan-navy placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-olcan-navy mb-2">
            Telefone/WhatsApp
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 bg-white border border-cream-300 rounded-xl text-olcan-navy placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="(11) 99999-9999"
          />
        </div>

        <div>
          <label htmlFor="product" className="block text-sm font-semibold text-olcan-navy mb-2">
            Interesse em *
          </label>
          <select
            id="product"
            required
            value={formData.product}
            onChange={(e) => setFormData({ ...formData, product: e.target.value })}
            className="w-full px-4 py-3 bg-white border border-cream-300 rounded-xl text-olcan-navy focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="">Selecione um produto</option>
            <option value="Curso Cidadão do Mundo">Curso Cidadão do Mundo</option>
            <option value="Rota da Internacionalização">Rota da Internacionalização</option>
            <option value="Kit Application">Kit Application</option>
            <option value="Mentoria Individual">Mentoria Individual</option>
            <option value="Sem Fronteiras">Sem Fronteiras</option>
            <option value="MedMind Pro">MedMind Pro</option>
            <option value="Outro">Outro</option>
          </select>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-semibold text-olcan-navy mb-2">
            Mensagem *
          </label>
          <textarea
            id="message"
            required
            rows={5}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 py-3 bg-white border border-cream-300 rounded-xl text-olcan-navy placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
            placeholder="Conte-nos sobre seus objetivos e como podemos ajudar..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-4 bg-olcan-navy text-white font-semibold rounded-xl hover:bg-olcan-navy-light transition-all duration-300 shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>Enviando...</>
          ) : (
            <>
              Enviar Mensagem
              <Send className="w-5 h-5" />
            </>
          )}
        </button>

        <p className="text-sm text-text-secondary text-center">
          Ao enviar, você concorda com nossa{' '}
          <a href="/politica-privacidade" className="text-brand-600 hover:text-brand-700">
            Política de Privacidade
          </a>
        </p>
      </div>
    </form>
  );
}
