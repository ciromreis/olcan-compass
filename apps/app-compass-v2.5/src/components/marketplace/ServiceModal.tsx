"use client";

import { useState, useEffect } from "react";
import { 
  Modal, 
  Input, 
  Select, 
  Textarea, 
  Button 
} from "@/components/ui";
import { 
  ServiceListing, 
  ServiceCategory, 
  CATEGORY_LABELS, 
  useMarketplaceStore 
} from "@/stores/canonicalMarketplaceProviderStore";

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service?: ServiceListing;
}

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ServiceCategory[];

export function ServiceModal({ isOpen, onClose, service }: ServiceModalProps) {
  const { createService, updateService } = useMarketplaceStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "career_coaching" as ServiceCategory,
    price: 0,
    currency: "BRL",
    duration: 60,
    isActive: true,
  });

  useEffect(() => {
    if (service) {
      setFormData({
        title: service.title,
        description: service.description,
        category: service.category,
        price: service.price,
        currency: service.currency || "BRL",
        duration: service.duration,
        isActive: service.isActive,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        category: "career_coaching",
        price: 0,
        currency: "BRL",
        duration: 60,
        isActive: true,
      });
    }
  }, [service, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (service) {
        await updateService(service.id, formData);
      } else {
        await createService(formData);
      }
      onClose();
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error saving service:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={service ? "Editar Serviço" : "Novo Serviço"}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <Input
          label="Título do Serviço"
          placeholder="Ex: Revisão de Currículo em Inglês"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Categoria"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as ServiceCategory })}
            options={CATEGORIES.map(c => ({ label: CATEGORY_LABELS[c], value: c }))}
          />
          <Input
            label="Duração (min)"
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Preço (BRL)"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            required
          />
          <div className="flex flex-col">
            <label className="text-caption text-text-muted mb-1.5">Status</label>
            <div className="flex bg-cream-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isActive: true })}
                className={`flex-1 py-1.5 text-caption font-medium rounded-md transition-all ${formData.isActive ? 'bg-white text-brand-600 shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
              >
                Ativo
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isActive: false })}
                className={`flex-1 py-1.5 text-caption font-medium rounded-md transition-all ${!formData.isActive ? 'bg-white text-clay-600 shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
              >
                Pausado
              </button>
            </div>
          </div>
        </div>

        <Textarea
          label="Descrição"
          placeholder="Descreva o que está incluído no serviço..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          required
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-cream-200">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            {service ? "Salvar Alterações" : "Criar Serviço"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
