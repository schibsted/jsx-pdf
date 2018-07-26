// libs
import { createElement } from '../../dst';
import ConfigProvider from './providers/config';

// templates
import MyDocument from './templates/mydocument';

export default ({ config }) => (
  <ConfigProvider config={config}>
    <MyDocument title="Example, inc" size="A4" />
  </ConfigProvider>
);
