/**
 * OIOS Dossier Builder - v2.5
 * 
 * Orquestrador central que consolida dados de Identidade, Jornada e Execução
 * em um artefato profissional unificado (O Dossier Digital).
 */

import { ArchetypeDefinition } from './archetypes';
import { ForgeDocument } from '@/stores/forge';
import { Aura } from '@/stores/auraStore';
import { downloadDocx } from './docx-export';

export interface DossierData {
  userName: string;
  archetype: ArchetypeDefinition;
  aura: Aura;
  origin: string;
  destination: string;
  readinessScore: number;
  featuredDocuments: ForgeDocument[];
  routesCount: number;
}

/**
 * Constrói a narrativa em Markdown para o Dossier Digital.
 */
export function composeDossierMarkdown(data: DossierData): string {
  const { userName, archetype, aura, origin, destination, readinessScore, featuredDocuments } = data;
  const stageName = aura.evolutionStage.toUpperCase();

  return `
# Dossier Digital Olcan - Relatório de Prontidão Operacional v2.5

## 01. Snapshot de Identidade (OIOS)
**Usuário:** ${userName}
**Arquétipo Dominante:** ${archetype.name}
**Companheiro de Jornada (Aura):** ${aura.name} (Estágio: ${stageName} | Nível: ${aura.level})

> *"${archetype.description}"*

---

## 02. Bússola Estratégica
Sua jornada está mapeada para a transição entre contextos distintos.

- **Origem:** ${origin}
- **Destino:** ${destination}
- **Status da Rota:** Em calibração ativa

A Aura ${aura.name} detecta uma afinidade forte com o motivador de **${archetype.motivator}**, o que deve guiar a escolha de empresas e culturas no destino.

---

## 03. Narrative Forge (Desempenho Profissional)
O motor do Forge analisou seus materiais atuais e calculou sua prontidão para o mercado internacional.

**Score de Competitividade Atual:** ${readinessScore}%

### Documentos em Destaque:
${featuredDocuments.map(doc => `- **${doc.title}**: Score de Alinhamento ${doc.competitivenessScore || 0}%`).join('\n')}

---

## 04. Análise de Risco e Próximos Passos
Baseado no seu cluster de medo de **${archetype.fearCluster}**, recomendamos os seguintes movimentos operacionais:

1. **Refining Narrative**: Ajustar o tom do currículo no Forge para refletir a habilidade de ${archetype.abilities[0]}.
2. **Ritual de Evolução**: Alcançar o nível ${aura.level + 2} para desbloquear a próxima camada de análise de mercado.
3. **Consolidação**: Exportar esta narrativa para revisão via Marketplace se o score de competitividade for menor que 75%.

---

## 05. Selo de Autenticidade Global
*Este documento foi gerado pelo Olcan Compass Intelligence Hub. A narrativa aqui contida é uma recombinação dinâmica de sinais de prontidão e identidade metamoderna.*
`;
}

/**
 * Exporta o Dossier Digital consolidado como um arquivo Word (.docx).
 */
export async function exportDigitalDossier(data: DossierData) {
  const title = `Dossier Digital - ${data.userName} - Olcan v2.5`;
  const markdown = composeDossierMarkdown(data);
  
  await downloadDocx(title, markdown, `Dossier_Digital_${data.userName.replace(/\s+/g, '_')}.docx`);
}
