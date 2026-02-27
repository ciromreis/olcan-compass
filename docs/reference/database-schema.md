import { useState } from 'react';  
import { Database, GitBranch, Layers, Code, List, Table } from 'lucide-react';  
import { TABLES, ENUMS, PILLAR\_COLORS } from '../components/schema/schemaData';  
import TableCard from '../components/schema/TableCard';  
import EnumSection from '../components/schema/EnumSection';  
import IndexSection from '../components/schema/IndexSection';  
import RelationshipSection from '../components/schema/RelationshipSection';  
import SqlDDL from '../components/schema/SqlDDL';

const TABS \= \[  
 { id: 'tables',        label: 'Tables',        icon: Table },  
 { id: 'enums',         label: 'Enums',          icon: List },  
 { id: 'relationships', label: 'Relationships',  icon: GitBranch },  
 { id: 'indexes',       label: 'Indexes & SQL',  icon: Code },  
 { id: 'ddl',           label: 'Full DDL',       icon: Layers },  
\];

const PILLARS \= \[...new Set(TABLES.map(t \=\> t.pillar))\];

export default function SchemaDocument() {  
 const \[activeTab, setActiveTab\] \= useState('tables');  
 const \[filterPillar, setFilterPillar\] \= useState('ALL');

 const filteredTables \= filterPillar \=== 'ALL'  
   ? TABLES  
   : TABLES.filter(t \=\> t.pillar \=== filterPillar);

 return (  
   \<div className="min-h-screen bg-\[\#0d1117\] text-slate-100"\>  
     {/\* Header \*/}  
     \<div className="border-b border-slate-800 bg-\[\#0d1117\]/80 backdrop-blur sticky top-0 z-20"\>  
       \<div className="max-w-7xl mx-auto px-4 sm:px-6 py-4"\>  
         \<div className="flex items-center gap-4"\>  
           \<div className="flex items-center gap-2.5"\>  
             \<div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center"\>  
               \<Database className="w-4 h-4 text-violet-400" /\>  
             \</div\>  
             \<div\>  
               \<h1 className="text-sm font-bold text-slate-100 leading-none"\>PROJECT COMPASS\</h1\>  
               \<p className="text-\[10px\] text-slate-500 mt-0.5 uppercase tracking-widest"\>Database Schema — v2.0\</p\>  
             \</div\>  
           \</div\>  
           \<div className="ml-auto flex items-center gap-3 flex-wrap"\>  
             \<span className="text-xs px-2.5 py-1 rounded-full border border-slate-700 text-slate-400"\>  
               {TABLES.length} tables  
             \</span\>  
             \<span className="text-xs px-2.5 py-1 rounded-full border border-slate-700 text-slate-400"\>  
               {ENUMS.length} enums  
             \</span\>  
             \<span className="text-xs px-2.5 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400"\>  
               PostgreSQL \+ pgvector  
             \</span\>  
           \</div\>  
         \</div\>

         {/\* Tabs \*/}  
         \<div className="flex gap-1 mt-4 overflow-x-auto"\>  
           {TABS.map(tab \=\> {  
             const Icon \= tab.icon;  
             return (  
               \<button  
                 key={tab.id}  
                 onClick={() \=\> setActiveTab(tab.id)}  
                 className={\`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${  
                   activeTab \=== tab.id  
                     ? 'bg-slate-700 text-slate-100'  
                     : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'  
                 }\`}  
               \>  
                 \<Icon className="w-3.5 h-3.5" /\>  
                 {tab.label}  
               \</button\>  
             );  
           })}  
         \</div\>  
       \</div\>  
     \</div\>

     {/\* Content \*/}  
     \<div className="max-w-7xl mx-auto px-4 sm:px-6 py-8"\>

       {/\* TABLES TAB \*/}  
       {activeTab \=== 'tables' && (  
         \<div\>  
           {/\* Stats row \*/}  
           \<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8"\>  
             {PILLARS.map(pillar \=\> {  
               const c \= PILLAR\_COLORS\[pillar\] || PILLAR\_COLORS\['Core Auth'\];  
               const count \= TABLES.filter(t \=\> t.pillar \=== pillar).length;  
               return (  
                 \<button  
                   key={pillar}  
                   onClick={() \=\> setFilterPillar(filterPillar \=== pillar ? 'ALL' : pillar)}  
                   className={\`text-left rounded-xl border p-3.5 transition-all ${  
                     filterPillar \=== pillar  
                       ? \`${c.bg} ${c.border}\`  
                       : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'  
                   }\`}  
                 \>  
                   \<div className={\`text-xs font-semibold mb-1 ${filterPillar \=== pillar ? c.text : 'text-slate-300'}\`}\>  
                     {pillar}  
                   \</div\>  
                   \<div className="text-2xl font-bold text-slate-100"\>{count}\</div\>  
                   \<div className="text-\[10px\] text-slate-500 mt-0.5"\>  
                     {count \=== 1 ? 'table' : 'tables'}  
                   \</div\>  
                 \</button\>  
               );  
             })}  
           \</div\>

           {filterPillar \!== 'ALL' && (  
             \<div className="flex items-center gap-2 mb-4"\>  
               \<span className="text-xs text-slate-400"\>Filtering by:\</span\>  
               \<span className={\`text-xs px-2 py-0.5 rounded-full border ${PILLAR\_COLORS\[filterPillar\]?.border} ${PILLAR\_COLORS\[filterPillar\]?.text}\`}\>  
                 {filterPillar}  
               \</span\>  
               \<button onClick={() \=\> setFilterPillar('ALL')} className="text-xs text-slate-500 hover:text-slate-300 underline ml-1"\>  
                 Clear filter  
               \</button\>  
             \</div\>  
           )}

           \<div className="space-y-3"\>  
             {filteredTables.map(table \=\> (  
               \<TableCard key={table.name} table={table} /\>  
             ))}  
           \</div\>  
         \</div\>  
       )}

       {/\* ENUMS TAB \*/}  
       {activeTab \=== 'enums' && (  
         \<div\>  
           \<div className="mb-6"\>  
             \<h2 className="text-lg font-semibold text-slate-100 mb-1"\>Enum Types\</h2\>  
             \<p className="text-sm text-slate-400"\>  
               {ENUMS.length} custom PostgreSQL enum types. All must be created before tables.  
               The \<span className="font-mono text-violet-400"\>oios\_archetype\</span\> and \<span className="font-mono text-violet-400"\>fear\_cluster\</span\> enums are the core of the adaptive UX engine.  
             \</p\>  
           \</div\>  
           \<EnumSection enums={ENUMS} /\>  
         \</div\>  
       )}

       {/\* RELATIONSHIPS TAB \*/}  
       {activeTab \=== 'relationships' && (  
         \<div\>  
           \<div className="mb-6"\>  
             \<h2 className="text-lg font-semibold text-slate-100 mb-1"\>Entity Relationships\</h2\>  
             \<p className="text-sm text-slate-400"\>  
               All foreign key constraints and their ON DELETE behaviors. Note the deliberate \<span className="font-mono text-amber-400"\>RESTRICT\</span\> on \<span className="font-mono text-slate-300"\>subscription\_events\</span\> for financial audit compliance, and \<span className="font-mono text-amber-400"\>SET NULL\</span\> on \<span className="font-mono text-slate-300"\>diagnostic\_sessions\</span\> to preserve pre-auth funnel data.  
             \</p\>  
           \</div\>  
           \<RelationshipSection /\>  
         \</div\>  
       )}

       {/\* INDEXES TAB \*/}  
       {activeTab \=== 'indexes' && (  
         \<div\>  
           \<div className="mb-6"\>  
             \<h2 className="text-lg font-semibold text-slate-100 mb-1"\>Indexes & Query Strategy\</h2\>  
             \<p className="text-sm text-slate-400"\>  
               B\-Tree indexes optimized for the Sprint Orchestrator (stall detection), the Oracle (opportunity filtering), and billing audit queries. IVFFlat vector indexes support sub-100ms Cosine Similarity matching.  
             \</p\>  
           \</div\>  
           \<IndexSection /\>  
         \</div\>  
       )}

       {/\* DDL TAB \*/}  
       {activeTab \=== 'ddl' && (  
         \<div\>  
           \<div className="mb-6"\>  
             \<h2 className="text-lg font-semibold text-slate-100 mb-1"\>Full DDL Script\</h2\>  
             \<p className="text-sm text-slate-400"\>  
               Production\-ready PostgreSQL DDL. Run against a fresh Supabase project after enabling the \<span className="font-mono text-pink-400"\>vector\</span\> and \<span className="font-mono text-pink-400"\>pgcrypto\</span\> extensions. IVFFlat index \<span className="font-mono text-amber-400"\>lists\</span\> values should be recalibrated after initial data load (target: \<code className="font-mono text-slate-300"\>sqrt(row\_count)\</code\>).  
             \</p\>  
           \</div\>  
           \<SqlDDL /\>  
         \</div\>  
       )}  
     \</div\>  
   \</div\>  
 );  
}  
