/**
 * DOCX Export for Narrative Forge documents.
 *
 * Uses a lightweight approach: generates a valid .docx file via the Office Open XML
 * format (a zip containing XML). No external libraries required.
 *
 * The generated file includes:
 * - Document title as heading
 * - Body content with paragraph preservation
 * - Basic styling (font: Calibri, size: 11pt)
 *
 * For richer formatting (tables, images, styled headings), install the `docx` npm
 * package and replace this implementation. This file is designed as a drop-in
 * foundation that works without any additional dependencies.
 */

// Minimal DOCX generator using JSZip-free approach (browser-native)
// The .docx format is a ZIP of XML files following the OOXML standard.

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function textToParagraphs(content: string): string {
  const lines = content.split(/\n/);
  return lines
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        // Empty paragraph (spacing)
        return '<w:p><w:pPr><w:spacing w:after="120"/></w:pPr></w:p>';
      }

      // Detect markdown-like headings
      const h1Match = trimmed.match(/^#\s+(.+)/);
      const h2Match = trimmed.match(/^##\s+(.+)/);
      const h3Match = trimmed.match(/^###\s+(.+)/);

      if (h1Match) {
        return `<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>${escapeXml(h1Match[1])}</w:t></w:r></w:p>`;
      }
      if (h2Match) {
        return `<w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr><w:r><w:t>${escapeXml(h2Match[1])}</w:t></w:r></w:p>`;
      }
      if (h3Match) {
        return `<w:p><w:pPr><w:pStyle w:val="Heading3"/></w:pPr><w:r><w:t>${escapeXml(h3Match[1])}</w:t></w:r></w:p>`;
      }

      // Bold detection: **text**
      const segments: string[] = [];
      const boldRegex = /\*\*(.+?)\*\*/g;
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = boldRegex.exec(trimmed)) !== null) {
        if (match.index > lastIndex) {
          segments.push(`<w:r><w:t xml:space="preserve">${escapeXml(trimmed.slice(lastIndex, match.index))}</w:t></w:r>`);
        }
        segments.push(`<w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">${escapeXml(match[1])}</w:t></w:r>`);
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < trimmed.length) {
        segments.push(`<w:r><w:t xml:space="preserve">${escapeXml(trimmed.slice(lastIndex))}</w:t></w:r>`);
      }

      return `<w:p>${segments.join("")}</w:p>`;
    })
    .join("\n");
}

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;

const RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

const WORD_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
        <w:sz w:val="22"/>
        <w:lang w:val="pt-BR"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:after="160" w:line="276" w:lineRule="auto"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:pPr><w:spacing w:before="360" w:after="120"/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="32"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:pPr><w:spacing w:before="240" w:after="80"/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="28"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="heading 3"/>
    <w:pPr><w:spacing w:before="200" w:after="60"/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="24"/></w:rPr>
  </w:style>
</w:styles>`;

function buildDocumentXml(title: string, content: string): string {
  const titleParagraph = `<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>${escapeXml(title)}</w:t></w:r></w:p>`;
  const bodyParagraphs = textToParagraphs(content);

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${titleParagraph}
    ${bodyParagraphs}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
    </w:sectPr>
  </w:body>
</w:document>`;
}

/**
 * Creates a .docx Blob from document title and plain text/markdown content.
 * Uses the browser's Compression Streams API (available in all modern browsers).
 */
export async function createDocxBlob(title: string, content: string): Promise<Blob> {
  // We need to create a ZIP file. Use a minimal ZIP builder.
  const files: Record<string, string> = {
    "[Content_Types].xml": CONTENT_TYPES,
    "_rels/.rels": RELS,
    "word/_rels/document.xml.rels": WORD_RELS,
    "word/document.xml": buildDocumentXml(title, content),
    "word/styles.xml": STYLES,
  };

  // Minimal ZIP file creation (no compression for simplicity — Word handles it fine)
  const encoder = new TextEncoder();
  const parts: BlobPart[] = [];
  const centralDirectory: Uint8Array[] = [];
  let offset = 0;

  const entries = Object.entries(files);

  for (const [name, data] of entries) {
    const nameBytes = encoder.encode(name);
    const dataBytes = encoder.encode(data);

    // Local file header
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const lhView = new DataView(localHeader.buffer);
    lhView.setUint32(0, 0x04034b50, true); // Signature
    lhView.setUint16(4, 20, true); // Version needed
    lhView.setUint16(6, 0, true); // Flags
    lhView.setUint16(8, 0, true); // Compression (none)
    lhView.setUint16(10, 0, true); // Mod time
    lhView.setUint16(12, 0, true); // Mod date
    lhView.setUint32(14, crc32(dataBytes), true); // CRC-32
    lhView.setUint32(18, dataBytes.length, true); // Compressed size
    lhView.setUint32(22, dataBytes.length, true); // Uncompressed size
    lhView.setUint16(26, nameBytes.length, true); // Name length
    lhView.setUint16(28, 0, true); // Extra length
    localHeader.set(nameBytes, 30);

    // Central directory entry
    const cdEntry = new Uint8Array(46 + nameBytes.length);
    const cdView = new DataView(cdEntry.buffer);
    cdView.setUint32(0, 0x02014b50, true); // Signature
    cdView.setUint16(4, 20, true); // Version made by
    cdView.setUint16(6, 20, true); // Version needed
    cdView.setUint16(8, 0, true); // Flags
    cdView.setUint16(10, 0, true); // Compression
    cdView.setUint16(12, 0, true); // Mod time
    cdView.setUint16(14, 0, true); // Mod date
    cdView.setUint32(16, crc32(dataBytes), true); // CRC-32
    cdView.setUint32(20, dataBytes.length, true); // Compressed size
    cdView.setUint32(24, dataBytes.length, true); // Uncompressed size
    cdView.setUint16(28, nameBytes.length, true); // Name length
    cdView.setUint16(30, 0, true); // Extra length
    cdView.setUint16(32, 0, true); // Comment length
    cdView.setUint16(34, 0, true); // Disk number
    cdView.setUint16(36, 0, true); // Internal attrs
    cdView.setUint32(38, 0, true); // External attrs
    cdView.setUint32(42, offset, true); // Relative offset
    cdEntry.set(nameBytes, 46);

    parts.push(localHeader as BlobPart, dataBytes as BlobPart);
    centralDirectory.push(cdEntry);
    offset += localHeader.length + dataBytes.length;
  }

  const cdOffset = offset;
  let cdSize = 0;
  for (const cd of centralDirectory) {
    parts.push(cd as BlobPart);
    cdSize += cd.length;
  }

  // End of central directory
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);
  eocdView.setUint32(0, 0x06054b50, true); // Signature
  eocdView.setUint16(4, 0, true); // Disk number
  eocdView.setUint16(6, 0, true); // CD disk number
  eocdView.setUint16(8, entries.length, true); // Entries on disk
  eocdView.setUint16(10, entries.length, true); // Total entries
  eocdView.setUint32(12, cdSize, true); // CD size
  eocdView.setUint32(16, cdOffset, true); // CD offset
  eocdView.setUint16(20, 0, true); // Comment length
  parts.push(eocd as BlobPart);

  return new Blob(parts, {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

/**
 * Download a .docx file from document data.
 */
export async function downloadDocx(title: string, content: string, filename?: string): Promise<void> {
  const blob = await createDocxBlob(title, content);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || `${title.replace(/[^a-zA-Z0-9\u00C0-\u024F\s-]/g, "").trim()}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── CRC-32 Implementation ──────────────────────────────
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[i] = c;
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
