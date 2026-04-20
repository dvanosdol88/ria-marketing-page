import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CalcInputs, CalcResults, YearRow } from "@/lib/calc";

// Mock DOM APIs before importing makeCsv
const mockClick = vi.fn();
const mockCreateObjectURL = vi.fn(() => "blob:mock-url");
const mockRevokeObjectURL = vi.fn();

vi.stubGlobal("URL", {
  createObjectURL: mockCreateObjectURL,
  revokeObjectURL: mockRevokeObjectURL,
});

// Capture the Blob content so we can inspect it
let capturedBlobContent = "";
vi.stubGlobal(
  "Blob",
  class MockBlob {
    constructor(parts: BlobPart[], _opts?: BlobPropertyBag) {
      capturedBlobContent = (parts as string[]).join("");
    }
  }
);

// Capture anchor element
const mockAnchorElement = {
  href: "",
  download: "",
  click: mockClick,
};
vi.spyOn(document, "createElement").mockReturnValue(mockAnchorElement as unknown as HTMLElement);

// Import after mocks are in place
import { makeCsv } from "@/lib/csv";

const sampleInputs: CalcInputs = {
  initial: 100_000,
  years: 5,
  annualReturnPct: 7,
  contribution: { amount: 500, frequency: "monthly" },
  fees: { aumPct: 1, flatAnnual: 0 },
  contributionTiming: "end",
  compounding: "monthly",
};

const sampleYearRow: YearRow = {
  year: 1,
  gross: 110_000,
  net: 108_000,
  feesPaidYtd: 1_050,
  contribYtd: 6_000,
};

const sampleResults: CalcResults = {
  endingGross: 180_000,
  endingNet: 160_000,
  totalFees: 15_000,
  totalContrib: 30_000,
  series: [],
  yearRows: [sampleYearRow],
};

describe("makeCsv", () => {
  beforeEach(() => {
    mockClick.mockClear();
    mockCreateObjectURL.mockClear();
    mockRevokeObjectURL.mockClear();
    capturedBlobContent = "";
  });

  it("triggers a download click", () => {
    makeCsv(sampleInputs, sampleResults);
    expect(mockClick).toHaveBeenCalledOnce();
  });

  it("creates a blob URL and revokes it after download", () => {
    makeCsv(sampleInputs, sampleResults);
    expect(mockCreateObjectURL).toHaveBeenCalledOnce();
    expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });

  it("sets the download filename to fee-drag-export.csv", () => {
    makeCsv(sampleInputs, sampleResults);
    expect(mockAnchorElement.download).toBe("fee-drag-export.csv");
  });

  it("CSV contains input values", () => {
    makeCsv(sampleInputs, sampleResults);
    expect(capturedBlobContent).toContain("100000");
    expect(capturedBlobContent).toContain("7");
    expect(capturedBlobContent).toContain("monthly");
  });

  it("CSV contains result values", () => {
    makeCsv(sampleInputs, sampleResults);
    expect(capturedBlobContent).toContain("180000");
    expect(capturedBlobContent).toContain("160000");
    expect(capturedBlobContent).toContain("15000");
  });

  it("CSV contains a year row", () => {
    makeCsv(sampleInputs, sampleResults);
    // Year row format: year,contribYtd,feesPaidYtd,gross,net
    expect(capturedBlobContent).toContain("1,6000,1050,110000,108000");
  });

  it("CSV contains the disclosure line", () => {
    makeCsv(sampleInputs, sampleResults);
    expect(capturedBlobContent).toContain("Disclosure");
    expect(capturedBlobContent).toContain("hypothetical");
  });

  it("CSV contains section headers", () => {
    makeCsv(sampleInputs, sampleResults);
    expect(capturedBlobContent).toContain("Inputs");
    expect(capturedBlobContent).toContain("Results");
    expect(capturedBlobContent).toContain("Year,ContribYTD,FeesYTD,Gross,Net");
  });

  it("handles empty yearRows without crashing", () => {
    const emptyResults = { ...sampleResults, yearRows: [] };
    expect(() => makeCsv(sampleInputs, emptyResults)).not.toThrow();
  });

  it("CSV has Fee Drag Calculator Export header", () => {
    makeCsv(sampleInputs, sampleResults);
    expect(capturedBlobContent).toContain("Fee Drag Calculator Export");
  });
});
