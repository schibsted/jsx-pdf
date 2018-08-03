![jsx-pdf logo](https://user-images.githubusercontent.com/11426386/43649419-0819a78a-9735-11e8-8a74-12d26e5e830b.jpg)

[![npm version](https://badge.fury.io/js/jsx-pdf.svg)](https://www.npmjs.com/jsx-pdf) [![Build Status](https://travis-ci.org/schibsted/jsx-pdf.svg?branch=master)](https://travis-ci.org/schibsted/jsx-pdf) [![Coverage Status](https://coveralls.io/repos/github/schibsted/jsx-pdf/badge.svg?branch=master)](https://coveralls.io/github/schibsted/jsx-pdf?branch=master)

This library allows you to generate PDFs using a react-like JSX syntax.

```jsx
import { createElement, createRenderer } from 'jsx-pdf';

const render = createRenderer();

const pdf = render(
  <document>
    <content>This will appear in my PDF!</content>
  </document>,
);

this.headers['Content-Type'] = 'application/pdf';
this.body = pdf;
```

The library is a thin layer built on top of [pdfmake](http://pdfmake.org/). It currently supports a subset of pdfmake's features; most of the time, simply translating tags and attributes into pdfmake document definition format.

## Quick start

- `yarn add jsx-pdf babel-plugin-transform-react-jsx@^6.0.0`
- Ensure babel is set up for your project and your .babelrc or equivalent contains
  ```json
  {
    "plugins": [
      [
        "transform-react-jsx",
        {
          "pragma": "createElement"
        }
      ]
    ]
  }
  ```
- Code away! See the examples below.

You can also run our example [Koa](https://koajs.org) app by running `yarn demo` and opening [http://localhost:3000](http://localhost:3000) in your browser. This should download a PDF in your browser. Check the console logs for additional information.

## Components

Similar to modern front-end frameworks, you can define your own components using declarative syntax.

#### Basic example:

```jsx
import { createElement } from 'jsx-pdf';

const Greeting = ({ name }) => <text>Hello, {name}!</text>;

const doc = (
  <document>
    <content>
      <Greeting name="Bob" />
    </content>
  </document>
);
```

#### List example:

```jsx
import { createElement } from 'jsx-pdf';

const GroupGreeting = ({ names }) => (
  <stack>{names.map(name => <Greeting name={name} />)}</stack>
);

const doc = (
  <document>
    <content>
      <GroupGreeting names={['Bob', 'Alice']} />
    </content>
  </document>
);
```

#### Inline If example:

```jsx
import { createElement } from 'jsx-pdf';

const Signature = () => <text>JSX-PDF, Inc.</text>;

const SignedGreeting = ({ name }) => (
  <stack>
    {name && <Greeting name={name} />}
    <Signature />
  </stack>
);

const doc = (
  <document>
    <content>
      <SignedGreeting />
    </content>
  </document>
);
```

#### Inline If-Else example:

```jsx
import { createElement } from 'jsx-pdf';

const AnonymousGreeting = () => <text>We don't know you.</text>;

const SignedGreeting = ({ name }) => (
  <stack>
    {name ? <Greeting name={name} /> : <AnonymousGreeting />}
    <Signature />
  </stack>
);

const doc = (
  <document>
    <content>
      <SignedGreeting />
    </content>
  </document>
);
```

#### Element variable example:

```jsx
import { createElement } from 'jsx-pdf';

const SignedGreeting = ({ name }) => {
  let greeting;

  if (name) {
    greeting = <Greeting name={name} />;
  } else {
    greeting = <AnonymousGreeting />;
  }

  return (
    <stack>
      {greeting}
      <Signature />
    </stack>
  );
};

const doc = (
  <document>
    <content>
      <SignedGreeting />
    </content>
  </document>
);
```

### Styling

Styling can be done by adding appropriate attributes to tags. It's often helpful for readability to group style-related attributes together and use the spread syntax.

```jsx
import { createElement } from 'jsx-pdf';

const Greeting = ({ name }) => {
  const styles = {
    italics: true,
    fontSize: 10,
  };

  return <text {...styles}>Hello, {name}!</text>;
};

const doc = (
  <document>
    <content>
      <Greeting name="Bob" />
    </content>
  </document>
);
```

### Context

Each component has access to global context and can update it if necessary.

```jsx
import { createElement } from 'jsx-pdf';

const AllowedUsersProvider = (attributes, context, updateContext) => {
  updateContext({
    allowedUsers: ['Alice'],
  });

  return attributes.children[0];
};

const SecureGreeting = ({ name }, { allowedUsers }) =>
  allowedUsers.includes(name) ? (
    <text>Hello, {name}!</text>
  ) : (
    <text>You are not allowed.</text>
  );

const doc = (
  <AllowedUsersProvider>
    <document>
      <content>
        <SecureGreeting name="Bob" />
      </content>
    </document>
  </AllowedUsersProvider>
);
```

## Document primitives

This section describes basic elements provided by the library. More information about supported attributes and advanced examples can be found [here](http://pdfmake.org/playground.html).

### Top elements

Each document has to be enclosed within `document` tag with nested `content`, and optional `header` and `footer`.

```jsx
import { createElement } from 'jsx-pdf';

const doc = (
  <document>
    <header>Greeting</header>
    <content>Hello, Bob!</content>
    <footer>JSX-PDF, Inc.</footer>
  </document>
);
```

### Paragraphs

Paragraphs are defined using `text` tag.

<!-- prettier-ignore -->
```jsx
import { createElement } from 'jsx-pdf';

const doc = (
  <document>
    <content>
      <text>
        This sentence will be rendered as one paragraph,

        even though there are

        line


        breaks.
      </text>
      <text>This is another paragraph.</text>
    </content>
  </document>
);
```

In order to apply styling to a group of paragraphs, they can be wrapped with a `stack` tag.

```jsx
import { createElement } from 'jsx-pdf';

const doc = (
  <document>
    <content>
      <stack color="red">
        <text>First red parahraph.</text>
        <text>Second red parahraph.</text>
      </stack>
      <text color="blue">Blue parahraph.</text>
    </content>
  </document>
);
```

### Columns

Elements nested in `columns` tag will be stacked horizontally.

```jsx
import { createElement } from 'jsx-pdf';

const doc = (
  <document>
    <content>
      <columns columnGap={10}>
        <column width={100}>Fixed width column</column>
        <column width="10%">Percentage width column</column>
        <column width="auto">
          Column that adjusts width based on the content
        </column>
        <column width="*">Column that fills the remaining space</column>
      </columns>
    </content>
  </document>
);
```

### Lists

Both ordered and unordered lists are supported.

```jsx
import { createElement } from 'jsx-pdf';

const docWithOrderedList = (
  <document>
    <content>
      <ol reversed start={10} separator={['(', ')']} type="lower-roman">
        <text>Item 1</text>
        <text>Item 2</text>
        <text>Item 3</text>
      </ol>
    </content>
  </document>
);

const docWithUnorderedList = (
  <document>
    <content>
      <ul color="blue" markerColor="red" type="square">
        <text>Item 1</text>
        <text>Item 2</text>
        <text>Item 3</text>
      </ul>
    </content>
  </document>
);
```

### Tables

`table` tag provides a simple way of creating table layouts.

```jsx
const leftCellStyle = {
  color: 'grey',
};

const doc = (
  <document>
    <content>
      <table widths={[100, '*', 'auto']} headerRows={1} layout="headerLineOnly">
        <row>
          <cell>Fixed width column</cell>
          <cell>Column that fills the remaining space</cell>
          <cell>Column that adjusts width based on the content</cell>
        </row>
        <row>
          <cell {...leftCellStyle}>Cell 1.1</cell>
          <cell>Cell 1.2</cell>
          <cell>Cell 1.3</cell>
        </row>
        <row>
          <cell {...leftCellStyle}>Cell 2.1</cell>
          <cell>Cell 2.2</cell>
          <cell>Cell 2.3</cell>
        </row>
      </table>
    </content>
  </document>
);
```

### Images

`image` supports JPEG and PNG formats.

```jsx
import { createElement } from 'jsx-pdf';

const doc = (
  <document>
    <content>
      <image src="/home/bob/photos/Bob.png" width={150} height={150} />
    </content>
  </document>
);
```

## API

### createRenderer

A factory function that optionally takes fonts and default document style as parameters and returns a render function.

#### fontDescriptors

While the library uses OpenSans as a default font, additional fonts can be passed to the factory. Font paths have to be absolute.

```javascript
const render = createRenderer({
  fontDescriptors: {
    Roboto: {
      normal: '/home/bob/fonts/Roboto-Regular.ttf',
      bold: '/home/bob/fonts/Roboto-Medium.ttf',
      italics: '/home/bob/fonts/Roboto-Italic.ttf',
      bolditalics: '/home/bob/fonts/Roboto-MediumItalic.ttf'
    }
  }
}
```

#### defaultStyle

The library defaults to using OpenSans 12pt, which can be overridden in the factory function.

```javascript
const render = createRenderer({
  defaultStyle: {
    font: 'Roboto',
    fontSize: 14
  }
}
```

### createElement

This function converts JSX to object representation. Every time JSX syntax is used, the function has to be made available. The functionality depends the babel plugin `babel-plugin-transform-react-jsx` (or equivalent), and Babel must be set up in the project in order to transpile the JSX correctly.

Example `.babelrc` file:

```json
{
  "presets": [
    [
      "env",
      {
        "targets": {
          "node": "6"
        }
      }
    ]
  ],
  "plugins": [
    [
      "transform-react-jsx",
      {
        "pragma": "createElement"
      }
    ]
  ]
}
```

## Disclaimer

Copyright 2018 Schibsted

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

## License

By contributing to this project, you agree that your contributions will be licensed under its MIT license.
