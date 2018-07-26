// http app server
import Koa from 'koa';

// library
import { createElement, createRenderer } from '../dst';

// PDF to render
import PDF from './components/root';

const app = new Koa();
const render = createRenderer();

const config = {
  copyrightYear: 2018,
};

app.use(async ctx => {
  // monitoring
  const start = Date.now();

  console.log('Generating PDF...');

  try {
    ctx.set('Content-Type', 'application/pdf');

    ctx.body = render(<PDF config={config} />);

    ctx.body.end();

    console.log('PDF generated');
  } catch (e) {
    console.error('PDF generation failed');
    console.error(e);
  } finally {
    // monitoring
    const end = Date.now();
    console.error(`Took ${(end - start).toFixed(0)}ms`);
  }
});

app.listen(3000, () => console.log('Listening on http://localhost:3000'));
