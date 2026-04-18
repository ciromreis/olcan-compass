import { NextResponse } from 'next/server';
import { composeDossierMarkdown, type DossierData } from '@/lib/dossier-builder';
import { createDocxBlob } from '@/lib/docx-export';

export async function POST(req: Request) {
  try {
    const body = await req.json() as { userId?: string; level?: number; data?: DossierData };

    if (!body.level || body.level < 10) {
      return NextResponse.json(
        { error: 'Manifestação insuficiente. O Dossier exige Nível 10.' },
        { status: 403 }
      );
    }

    if (!body.data) {
      return NextResponse.json(
        { error: 'Dados do dossier não fornecidos.' },
        { status: 400 }
      );
    }

    const title = `Dossier Digital - ${body.data.userName} - Olcan v2.5`;
    const markdown = composeDossierMarkdown(body.data);
    const blob = await createDocxBlob(title, markdown);
    const buffer = Buffer.from(await blob.arrayBuffer());

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="Dossier-Digital-Olcan-v2.5.docx"`,
      },
    });
  } catch (error) {
    console.error('Dossier export error:', error);
    return NextResponse.json({ error: 'Falha na geração do Dossier' }, { status: 500 });
  }
}
