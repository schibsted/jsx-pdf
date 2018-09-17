import JsxPdf from '../../../dst';

const baseMargin = 40;
const headerHeight = 100;
const footerHeight = 50;

const docTopMargin = baseMargin + headerHeight;
const docBottomMargin = baseMargin + footerHeight;

const docMargins = [baseMargin, docTopMargin, baseMargin, docBottomMargin];

const headerStyle = {
  fontSize: 24,
  margin: [baseMargin, baseMargin, baseMargin, 0],
};

const footerStyle = {
  margin: [baseMargin, 0, baseMargin, baseMargin],
};

export default (props, context) => (
  <document
    info={{
      title: 'Invoice',
      author: 'Example, Inc',
    }}
    pageSize={props.size}
    pageMargins={docMargins}
    defaultStyle={{
      font: 'OpenSans',
      fontSize: 12,
    }}
  >
    <header {...headerStyle}>{props.title}</header>
    <content>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris tincidunt
      ornare tortor vel facilisis. Nullam suscipit iaculis sollicitudin. In sit
      amet mi fermentum, bibendum ligula eget, tempus velit. Ut id tristique
      urna, at sodales ante. Pellentesque molestie augue ex, quis ultrices
      sapien malesuada sed. Cras ac nisl felis. Donec laoreet mi eget eleifend
      pellentesque. Sed eget nisi eleifend, ullamcorper orci eget, eleifend
      felis. Donec gravida enim dapibus nibh sollicitudin euismod.
    </content>
    <footer {...footerStyle}>© {context.config.copyrightYear}</footer>
  </document>
);
