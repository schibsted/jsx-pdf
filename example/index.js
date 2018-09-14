import fs from 'fs';
import path from 'path';
import PDFMake from 'pdfmake';

import { OpenSans } from './font-descriptors';

// library
import { createElement, renderPdf } from '../dst';

// PDF to render
import PDF from './components/root';

// metrics
const start = Date.now();

try {
  console.log('Generating PDF...');

  // here's where the PDF is created
  const config = {
    copyrightYear: 2018,
  };

  const pdfMake = new PDFMake({
    OpenSans,
  });

  const stream = pdfMake.createPdfKitDocument(
    renderPdf(<PDF config={config} />),
  );

  // write the stream to a file; this could also be streamed to an HTTP connection, stdout etc
  stream.on('finish', () => console.log('PDF generated'));
  stream.pipe(fs.createWriteStream(path.resolve(__dirname, 'example.pdf')));
  stream.end();
} catch (e) {
  console.error('PDF generation failed');
  console.error(e);
} finally {
  // metrics
  const end = Date.now();
  console.error(`Took ${(end - start).toFixed(0)}ms`);
}
