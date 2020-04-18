import path from 'path';

import PDFParser from 'pdf2json';

const pages = (json) => json.formImage.Pages;

const text = (json) =>
  pages(json)
    .map((page) =>
      page.Texts.map((line) =>
        line.R.map((item) => decodeURIComponent(item.T)).join(''),
      ).join(''),
    )
    .join('');

describe('pdf', () => {
  describe('invoice', () => {
    let pdf;
    let content;

    beforeAll(async () => {
      const pdfParser = new PDFParser();

      const data = new Promise((resolve, reject) => {
        pdfParser.on('pdfParser_dataError', (errData) =>
          reject(errData.parserError),
        );
        pdfParser.on('pdfParser_dataReady', (pdfData) => resolve(pdfData));
      });

      pdfParser.loadPDF(path.resolve(__dirname, '../example/example.pdf'));

      pdf = await data;
      content = text(pdf);
    });

    it('should have a content', () => {
      expect(content.length).toBeGreaterThan(100);
    });

    it('should contain lorum ipsum', () => {
      expect(content).toContain('Lorem ipsum');
    });

    it('should contain the company name', () => {
      expect(content).toContain('Example, Inc');
    });

    it('should contain page info in the footer', () => {
      expect(content).toContain('Page 1 of 1.');
    });
  });
});
