import fetch from 'node-fetch';
import PDFParser from 'pdf2json';

const URL = process.env.E2E_BASE_URL;

const pages = json => json.formImage.Pages;

const text = json => pages(json).map(page => page.Texts.map(line => line.R.map(item => decodeURIComponent(item.T)).join('')).join('')).join('');

describe('pdf', () => {
  describe('invoice', () => {
    let pdf;
    let content;
    let response;

    beforeAll(async () => {
      response = await fetch(`${URL}/invoices`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      const pdfParser = new PDFParser();

      const data = new Promise((resolve, reject) => {
        pdfParser.on('pdfParser_dataError', errData => reject(errData.parserError));
        pdfParser.on('pdfParser_dataReady', pdfData => resolve(pdfData));
      });

      pdfParser.parseBuffer(await response.buffer());

      pdf = await data;
      content = text(pdf);
    });

    it('should return a PDF', () => {
      expect(response.headers.get('content-type')).toEqual('application/pdf');
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
  });
});
