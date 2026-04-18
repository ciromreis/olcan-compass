/**
 * DOCX Import for Narrative Forge documents.
 *
 * Extracts text content from .docx files (Office Open XML format).
 * The .docx format is a ZIP containing XML files. We extract and parse
 * the document.xml file to retrieve text content.
 *
 * This implementation uses browser-native APIs (no external dependencies):
 * - File API for reading uploaded files
 * - Compression Streams API for unzipping
 * - DOMParser for XML parsing
 *
 * Limitations:
 * - Extracts plain text only (no formatting preservation)
 * - Does not extract images, tables, or complex structures
 * - For richer import, consider using mammoth.js library
 */

interface DocxContent {
  text: string;
  paragraphs: string[];
  wordCount: number;
}

/**
 * Reads a .docx file and extracts text content.
 */
export async function importDocx(file: File): Promise<DocxContent> {
  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Parse ZIP structure to find document.xml
    const documentXml = await extractDocumentXml(arrayBuffer);
    
    if (!documentXml) {
      throw new Error("Could not find document.xml in .docx file");
    }
    
    // Parse XML and extract text
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(documentXml, "text/xml");
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector("parsererror");
    if (parserError) {
      throw new Error("Failed to parse document XML");
    }
    
    // Extract text from paragraphs
    const paragraphs = extractParagraphs(xmlDoc);
    const text = paragraphs.join("\n\n");
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    
    return {
      text,
      paragraphs,
      wordCount,
    };
  } catch (error) {
    console.error("Error importing .docx:", error);
    throw new Error(
      error instanceof Error 
        ? `Failed to import .docx: ${error.message}` 
        : "Failed to import .docx file"
    );
  }
}

/**
 * Extracts document.xml from the .docx ZIP archive.
 */
async function extractDocumentXml(arrayBuffer: ArrayBuffer): Promise<string | null> {
  const view = new DataView(arrayBuffer);
  
  // Verify ZIP signature (PK\x03\x04)
  if (view.getUint32(0, true) !== 0x04034b50) {
    throw new Error("Invalid .docx file: not a valid ZIP archive");
  }
  
  let offset = 0;
  const decoder = new TextDecoder();
  
  // Parse ZIP entries
  while (offset < arrayBuffer.byteLength - 4) {
    const signature = view.getUint32(offset, true);
    
    // Local file header signature
    if (signature === 0x04034b50) {
      const nameLength = view.getUint16(offset + 26, true);
      const extraLength = view.getUint16(offset + 28, true);
      const compressedSize = view.getUint32(offset + 18, true);
      const compressionMethod = view.getUint16(offset + 8, true);
      
      // Extract filename
      const nameBytes = new Uint8Array(arrayBuffer, offset + 30, nameLength);
      const filename = decoder.decode(nameBytes);
      
      // Check if this is document.xml
      if (filename === "word/document.xml") {
        const dataOffset = offset + 30 + nameLength + extraLength;
        const compressedData = new Uint8Array(arrayBuffer, dataOffset, compressedSize);
        
        // Decompress if needed (method 8 = DEFLATE)
        if (compressionMethod === 8) {
          try {
            const decompressed = await decompressDeflate(compressedData);
            return decoder.decode(decompressed);
          } catch (error) {
            console.error("Decompression failed:", error);
            // Try reading as uncompressed
            return decoder.decode(compressedData);
          }
        } else if (compressionMethod === 0) {
          // Stored (no compression)
          return decoder.decode(compressedData);
        }
      }
      
      // Move to next entry
      offset += 30 + nameLength + extraLength + compressedSize;
    } else if (signature === 0x02014b50) {
      // Central directory header - we've passed all files
      break;
    } else {
      // Unknown signature, try to skip
      offset += 4;
    }
  }
  
  return null;
}

/**
 * Decompresses DEFLATE-compressed data using browser's DecompressionStream API.
 */
async function decompressDeflate(data: Uint8Array): Promise<Uint8Array> {
  // Check if DecompressionStream is available
  if (typeof DecompressionStream === "undefined") {
    throw new Error("DecompressionStream not supported in this browser");
  }
  
  const stream = new Blob([data as BlobPart]).stream();
  const decompressedStream = stream.pipeThrough(
    new DecompressionStream("deflate-raw")
  );
  
  const reader = decompressedStream.getReader();
  const chunks: Uint8Array[] = [];
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  
  // Combine chunks
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  
  return result;
}

/**
 * Extracts text from Word document XML paragraphs.
 */
function extractParagraphs(xmlDoc: Document): string[] {
  const paragraphs: string[] = [];
  
  // Find all paragraph elements (w:p)
  const wNamespace = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
  const pElements = xmlDoc.getElementsByTagNameNS(wNamespace, "p");
  
  // Fallback to non-namespaced search if namespace search fails
  const paragraphElements = pElements.length > 0 
    ? Array.from(pElements)
    : Array.from(xmlDoc.getElementsByTagName("w:p"));
  
  for (const p of paragraphElements) {
    // Extract all text elements (w:t) within this paragraph
    const tElements = p.getElementsByTagNameNS(wNamespace, "t");
    const textElements = tElements.length > 0
      ? Array.from(tElements)
      : Array.from(p.getElementsByTagName("w:t"));
    
    const paragraphText = textElements
      .map((t) => t.textContent || "")
      .join("")
      .trim();
    
    if (paragraphText) {
      paragraphs.push(paragraphText);
    }
  }
  
  return paragraphs;
}

/**
 * Validates if a file is a .docx file.
 */
export function isDocxFile(file: File): boolean {
  return (
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.toLowerCase().endsWith(".docx")
  );
}

/**
 * Formats imported content for display in the editor.
 * Preserves paragraph breaks and basic structure.
 */
export function formatImportedContent(content: DocxContent): string {
  return content.paragraphs.join("\n\n");
}
