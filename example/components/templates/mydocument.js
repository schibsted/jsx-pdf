import JsxPdf from '../../../dst';
import PDFIcon from './pdf-icon';

const baseMargin = 40;
const headerHeight = 100;
const footerHeight = 50;

const documentTopMargin = baseMargin + headerHeight;
const documentBottomMargin = baseMargin + footerHeight;

const documentMargins = [
  baseMargin,
  documentTopMargin,
  baseMargin,
  documentBottomMargin,
];

const headerStyle = {
  fontSize: 24,
  margin: [baseMargin, baseMargin, baseMargin, 0],
};

const footerStyle = {
  margin: [baseMargin, 0, baseMargin, baseMargin],
};

export default ({ size, title }, context) => (
  <document
    info={{
      title: 'Invoice',
      author: 'Example, Inc',
    }}
    pageSize={size}
    pageMargins={documentMargins}
    defaultStyle={{
      font: 'OpenSans',
      fontSize: 12,
    }}
  >
    <header {...headerStyle}>{title}</header>
    <content>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris tincidunt
      ornare tortor vel facilisis. Nullam suscipit iaculis sollicitudin. In sit
      amet mi fermentum, bibendum ligula eget, tempus velit. Ut id tristique
      urna, at sodales ante. Pellentesque molestie augue ex, quis ultrices
      sapien malesuada sed. Cras ac nisl felis. Donec laoreet mi eget eleifend
      pellentesque. Sed eget nisi eleifend, ullamcorper orci eget, eleifend
      felis. Donec gravida enim dapibus nibh sollicitudin euismod.
      <PDFIcon width={150} alignment="center" margin={[0, 50, 0, 0]} />
    </content>
    <footer {...footerStyle}>
      {(page, count) =>
        `© ${context.config.copyrightYear}. Page ${page} of ${count}.`
      }
    </footer>
  </document>
);
