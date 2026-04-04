import { describe, expect, it } from "vitest";
import { buildCsvContent } from "./file-export";

describe("buildCsvContent", () => {
  it("renders primitive values as CSV rows", () => {
    const csv = buildCsvContent([
      ["Data", "Valor", "Ativo"],
      ["2026-03-10", 1200, true],
    ]);

    expect(csv).toBe("Data,Valor,Ativo\n2026-03-10,1200,true");
  });

  it("escapes commas, quotes and line breaks", () => {
    const csv = buildCsvContent([
      ["Descrição", "Observação"],
      ['Pagamento "parcial", ciclo 1', "linha 1\nlinha 2"],
    ]);

    expect(csv).toBe('Descrição,Observação\n"Pagamento ""parcial"", ciclo 1","linha 1\nlinha 2"');
  });

  it("normalizes nullish values to empty cells", () => {
    const csv = buildCsvContent([
      ["A", "B", "C"],
      [null, undefined, ""],
    ]);

    expect(csv).toBe("A,B,C\n,,");
  });
});

