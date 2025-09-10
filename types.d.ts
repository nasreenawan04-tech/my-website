// Type declarations for modules without TypeScript definitions
declare module 'pdf-parse-debugging-disabled' {
  function pdfParse(dataBuffer: Buffer | Uint8Array): Promise<{
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    version: string;
    text: string;
  }>;
  
  export default pdfParse;
}