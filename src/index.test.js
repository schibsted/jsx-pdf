/*
 * Copyright 2018 Schibsted.
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 */

import { createElement, renderPdf } from '.';

jest.mock('pdfmake', () => jest.fn());

describe('#jsx-pdf', () => {
  it('should add custom style to pdfmake document', () => {
    expect(
      renderPdf(
        <document
          defaultStyle={{
            font: 'FontCustom',
            fontSize: 24,
          }}
        />,
      ),
    ).toEqual(
      expect.objectContaining({
        defaultStyle: {
          font: 'FontCustom',
          fontSize: 24,
        },
      }),
    );
  });

  it('should return the pdfmake document definition for simple components', () => {
    expect(
      renderPdf(
        <document>
          <content>hello</content>
        </document>,
      ),
    ).toEqual({
      content: {
        stack: ['hello'],
      },
    });
  });

  it('should return the pdfmake document definition for complex trees of components', () => {
    expect(
      renderPdf(
        <document>
          <content>
            <text>first</text>
            <text>second</text>
          </content>
        </document>,
      ),
    ).toEqual({
      content: {
        stack: [{ text: 'first' }, { text: 'second' }],
      },
    });
  });

  it('should support numbers inside jsx', () => {
    expect(
      renderPdf(
        <document>
          <content>{123}</content>
        </document>,
      ),
    ).toEqual({
      content: {
        stack: [123],
      },
    });
  });

  it('should concatenate consecutive numbers rather than adding them', () => {
    expect(
      renderPdf(
        <document>
          <content>
            {123}
            {456}
          </content>
        </document>,
      ),
    ).toEqual({
      content: {
        stack: ['123456'],
      },
    });
  });

  describe('component functions', () => {
    it('should traverse composite components', () => {
      const Component = () => <text>hello</text>;

      expect(
        renderPdf(
          <document>
            <content>
              <Component />
            </content>
          </document>,
        ),
      ).toEqual({
        content: {
          stack: [{ text: 'hello' }],
        },
      });
    });

    it('should traverse nested composite components', () => {
      const ChildComponent = () => <text>hello</text>;
      const Component = () => (
        <stack>
          <ChildComponent />
        </stack>
      );

      expect(
        renderPdf(
          <document>
            <content>
              <Component />
            </content>
          </document>,
        ),
      ).toEqual({
        content: {
          stack: [
            {
              stack: [{ text: 'hello' }],
            },
          ],
        },
      });
    });

    it('should support object', () => {
      const fragment = <text>test</text>;

      expect(
        renderPdf(
          <document>
            <content>{fragment}</content>
          </document>,
        ),
      ).toEqual({
        content: {
          stack: [{ text: 'test' }],
        },
      });
    });

    it('should join resulting text elements together', () => {
      const Name = () => 'Mr. Test';

      expect(
        renderPdf(
          <document>
            <content>
              <text>
                Hello <Name />!
              </text>
            </content>
          </document>,
        ),
      ).toEqual({
        content: {
          stack: [{ text: 'Hello Mr. Test!' }],
        },
      });
    });

    it('should support nested text elements in the stack', () => {
      expect(
        renderPdf(
          <document>
            <content>
              <text>
                <text>first</text>
                <text>second</text>
              </text>
            </content>
          </document>,
        ),
      ).toEqual({
        content: {
          stack: [{ text: [{ text: 'first' }, { text: 'second' }] }],
        },
      });
    });
  });

  it('should ignore falsy values', () => {
    expect(
      renderPdf(
        <document>
          <content>
            Hello{null}
            {undefined}
            {''}
            {0}
            {NaN}
            {false}!
          </content>
        </document>,
      ),
    ).toEqual({
      content: {
        stack: ['Hello!'],
      },
    });
  });

  it('should ignore wrapped falsy values', () => {
    const Null = () => null;
    const Undefined = () => {};
    const Empty = () => '';
    const Zero = () => 0;
    const NAN = () => NaN;
    const False = () => () => false;

    expect(
      renderPdf(
        <document>
          <content>
            <text>
              Hello<Null />
              <Undefined />
              <Empty />
              <Zero />
              <NAN />
              <False />!
            </text>
          </content>
        </document>,
      ),
    ).toEqual({
      content: {
        stack: [{ text: 'Hello!' }],
      },
    });
  });

  describe('higher order components', () => {
    it('should allow higher order components', () => {
      const Component = attributes => <text>{attributes.children}</text>;

      expect(
        renderPdf(
          <document>
            <content>
              <Component>hello</Component>
            </content>
          </document>,
        ),
      ).toEqual({
        content: {
          stack: [{ text: 'hello' }],
        },
      });
    });
  });

  describe('context', () => {
    it('should pass context to children', () => {
      const Provider = (attributes, context, updateContext) => {
        updateContext({ mytest: 'test' });
        return attributes.children[0];
      };

      const MyContextualisedComponent = (attributes, context) => (
        <text>{context.mytest}</text>
      );

      expect(
        renderPdf(
          <Provider>
            <document>
              <content>
                <MyContextualisedComponent />
              </content>
            </document>
          </Provider>,
        ),
      ).toEqual({
        content: {
          stack: [{ text: 'test' }],
        },
      });
    });

    it('should not pass context to siblings', () => {
      const Provider = (attributes, context, updateContext) => {
        updateContext({ mytest: 'this should not exist in the sibling' });
        return <text>first</text>;
      };

      const SiblingProvider = (attributes, context) => (
        <text>{context.mytest || 'it worked'}</text>
      );

      expect(
        renderPdf(
          <document>
            <content>
              <Provider />
              <SiblingProvider />
            </content>
          </document>,
        ),
      ).toEqual({
        content: {
          stack: [{ text: 'first' }, { text: 'it worked' }],
        },
      });
    });

    it('should pass context to grandchildren', () => {
      const Provider = (attributes, context, updateContext) => {
        updateContext({ mytest: 'test' });
        return attributes.children[0];
      };

      const MyContextualisedComponent = (attributes, context) => (
        <text>{context.mytest}</text>
      );
      const MyParentComponent = () => <MyContextualisedComponent />;

      expect(
        renderPdf(
          <Provider>
            <document>
              <content>
                <MyParentComponent />
              </content>
            </document>
          </Provider>,
        ),
      ).toEqual({
        content: {
          stack: [{ text: 'test' }],
        },
      });
    });
  });

  describe('document', () => {
    it('should set page size', () => {
      expect(renderPdf(<document pageSize={5} />)).toEqual({
        pageSize: 5,
      });
    });

    it('should set page margins', () => {
      expect(renderPdf(<document pageMargins={10} />)).toEqual({
        pageMargins: 10,
      });
    });

    ['title', 'author', 'subject', 'keywords'].forEach(field => {
      it(`should set ${field} in info`, () => {
        expect(renderPdf(<document info={{ [field]: 'foo' }} />)).toEqual({
          info: {
            [field]: 'foo',
          },
        });
      });
    });

    it('should error if a top-level element appears below the top level', () => {
      expect(() => {
        renderPdf(
          <document>
            <content>
              <stack>
                <header />
              </stack>
            </content>
          </document>,
        );
      }).toThrow(/immediate descendents/);
    });

    it('should error if a non-top-level element appears at the top level', () => {
      expect(() => {
        renderPdf(
          <document>
            <text>oops!</text>
            <content>
              <text>¯\_(ツ)_/¯</text>
            </content>
          </document>,
        );
      }).toThrow(
        /the <document> element can only contain <header>, <content>, and <footer> elements/i,
      );
    });

    it('should error if document is not the root element', () => {
      expect(() => {
        renderPdf(
          <stack>
            <text>foobar</text>
          </stack>,
        );
      }).toThrow(/root/);
    });

    it('should error if a document appears below the top level', () => {
      expect(() => {
        renderPdf(
          <document>
            <content>
              <document />
            </content>
          </document>,
        );
      }).toThrow(/root/);
    });

    it('should not error if a top level element appears nested inside a function component', () => {
      const Nested = () => <content />;

      expect(() => {
        renderPdf(
          <document>
            <Nested />
          </document>,
        );
      }).not.toThrow();
    });

    it('should resolve functional top level elements', () => {
      const Component = () => (
        <content>
          <text>test</text>
        </content>
      );

      expect(
        renderPdf(
          <document>
            <Component />
          </document>,
        ),
      ).toEqual({
        content: {
          stack: [{ text: 'test' }],
        },
      });
    });
  });

  describe('primitives', () => {
    describe('header', () => {
      it('should be converted', () => {
        expect(
          renderPdf(
            <document>
              <header>
                <text>test header</text>
              </header>
            </document>,
          ),
        ).toEqual({
          header: {
            stack: [{ text: 'test header' }],
          },
        });
      });

      it('should set passed attributes', () => {
        expect(
          renderPdf(
            <document>
              <header fontSize={18} bold>
                <text>test header</text>
              </header>
            </document>,
          ),
        ).toEqual({
          header: {
            stack: [{ text: 'test header' }],
            fontSize: 18,
            bold: true,
          },
        });
      });
    });

    describe('content', () => {
      it('should be converted', () => {
        expect(
          renderPdf(
            <document>
              <content>
                <text>test content</text>
              </content>
            </document>,
          ),
        ).toEqual({
          content: {
            stack: [{ text: 'test content' }],
          },
        });
      });

      it('should set passed attributes', () => {
        expect(
          renderPdf(
            <document>
              <content fontSize={18} bold>
                <text>test content</text>
              </content>
            </document>,
          ),
        ).toEqual({
          content: {
            stack: [{ text: 'test content' }],
            fontSize: 18,
            bold: true,
          },
        });
      });
    });

    describe('footer', () => {
      it('should be converted', () => {
        expect(
          renderPdf(
            <document>
              <footer>
                <text>test footer</text>
              </footer>
            </document>,
          ),
        ).toEqual({
          footer: {
            stack: [{ text: 'test footer' }],
          },
        });
      });

      it('should set passed attributes', () => {
        expect(
          renderPdf(
            <document>
              <footer fontSize={18} bold>
                <text>test footer</text>
              </footer>
            </document>,
          ),
        ).toEqual({
          footer: {
            stack: [{ text: 'test footer' }],
            fontSize: 18,
            bold: true,
          },
        });
      });
    });

    describe('text', () => {
      it('should be converted', () => {
        expect(
          renderPdf(
            <document>
              <content>
                <text>test text</text>
              </content>
            </document>,
          ),
        ).toEqual({
          content: {
            stack: [
              {
                text: 'test text',
              },
            ],
          },
        });
      });

      it('should set passed attributes', () => {
        expect(
          renderPdf(
            <document>
              <content>
                <text color="blue" bold>
                  test text
                </text>
              </content>
            </document>,
          ),
        ).toEqual({
          content: {
            stack: [
              {
                text: 'test text',
                color: 'blue',
                bold: true,
              },
            ],
          },
        });
      });
    });

    describe('image', () => {
      it('should be converted', () => {
        expect(
          renderPdf(
            <document>
              <content>
                <image src="/users/bob/photo.png" />
              </content>
            </document>,
          ),
        ).toEqual({
          content: {
            stack: [
              {
                image: '/users/bob/photo.png',
              },
            ],
          },
        });
      });

      it('should set passed attributes', () => {
        expect(
          renderPdf(
            <document>
              <content>
                <image src="/users/bob/photo.png" margin={[0, 40, 10, 30]} />
              </content>
            </document>,
          ),
        ).toEqual({
          content: {
            stack: [
              {
                image: '/users/bob/photo.png',
                margin: [0, 40, 10, 30],
              },
            ],
          },
        });
      });
    });

    describe('stack', () => {
      it('should be converted', () => {
        expect(
          renderPdf(
            <document>
              <content>
                <stack>
                  <text>test item 1</text>
                  <text>test item 2</text>
                </stack>
              </content>
            </document>,
          ),
        ).toEqual({
          content: {
            stack: [
              {
                stack: [{ text: 'test item 1' }, { text: 'test item 2' }],
              },
            ],
          },
        });
      });

      it('should set passed attributes', () => {
        expect(
          renderPdf(
            <document>
              <content>
                <stack fontSize={24} color="red">
                  <text>test item 1</text>
                  <text>test item 2</text>
                </stack>
              </content>
            </document>,
          ),
        ).toEqual({
          content: {
            stack: [
              {
                stack: [{ text: 'test item 1' }, { text: 'test item 2' }],
                fontSize: 24,
                color: 'red',
              },
            ],
          },
        });
      });
    });

    describe('columns', () => {
      it('should be converted', () => {
        expect(
          renderPdf(
            <document>
              <content>
                <columns>
                  <text>test columns</text>
                </columns>
              </content>
            </document>,
          ),
        ).toEqual({
          content: {
            stack: [
              {
                columns: [{ text: 'test columns' }],
              },
            ],
          },
        });
      });

      it('should set passed attributes', () => {
        expect(
          renderPdf(
            <document>
              <content>
                <columns fontSize={14} margin={[10, 20, 20, 0]}>
                  <text>test columns</text>
                </columns>
              </content>
            </document>,
          ),
        ).toEqual({
          content: {
            stack: [
              {
                columns: [{ text: 'test columns' }],
                fontSize: 14,
                margin: [10, 20, 20, 0],
              },
            ],
          },
        });
      });

      describe('column', () => {
        it('should be converted', () => {
          expect(
            renderPdf(
              <document>
                <content>
                  <column>
                    <text>test column</text>
                  </column>
                </content>
              </document>,
            ),
          ).toEqual({
            content: {
              stack: [
                {
                  stack: [{ text: 'test column' }],
                },
              ],
            },
          });
        });

        it('should set passed attributes', () => {
          expect(
            renderPdf(
              <document>
                <content>
                  <column fontSize={24}>
                    <text>test column</text>
                  </column>
                </content>
              </document>,
            ),
          ).toEqual({
            content: {
              stack: [
                {
                  stack: [{ text: 'test column' }],
                  fontSize: 24,
                },
              ],
            },
          });
        });
      });
    });

    describe('table', () => {
      it('should be converted', () => {
        expect(
          renderPdf(
            <document>
              <content>
                <table>
                  <text>test table</text>
                </table>
              </content>
            </document>,
          ),
        ).toEqual({
          content: {
            stack: [
              {
                table: {
                  body: [{ text: 'test table' }],
                },
              },
            ],
          },
        });
      });

      it('should set "headerRows" and "widths" attributes on table', () => {
        expect(
          renderPdf(
            <document>
              <content>
                <table headerRows={1} widths={['auto']}>
                  <text>test table</text>
                </table>
              </content>
            </document>,
          ),
        ).toEqual({
          content: {
            stack: [
              {
                table: {
                  body: [{ text: 'test table' }],
                  headerRows: 1,
                  widths: ['auto'],
                },
              },
            ],
          },
        });
      });

      it('should omit "headerRows" and "widths" on wrapper', () => {
        expect(
          renderPdf(
            <document>
              <content>
                <table
                  headerRows={1}
                  widths={['auto']}
                  margin={[10, 20, 20, 30]}
                >
                  <text>test table</text>
                </table>
              </content>
            </document>,
          ),
        ).toEqual({
          content: {
            stack: [
              {
                table: {
                  body: [{ text: 'test table' }],
                  headerRows: 1,
                  widths: ['auto'],
                },
                margin: [10, 20, 20, 30],
              },
            ],
          },
        });
      });

      describe('row', () => {
        it('should be converted', () => {
          expect(
            renderPdf(
              <document>
                <content>
                  <row>
                    <text>test row</text>
                  </row>
                </content>
              </document>,
            ),
          ).toEqual({
            content: {
              stack: [[{ text: 'test row' }]],
            },
          });
        });
      });

      describe('cell', () => {
        it('should be converted', () => {
          expect(
            renderPdf(
              <document>
                <content>
                  <cell>
                    <text>test cell</text>
                  </cell>
                </content>
              </document>,
            ),
          ).toEqual({
            content: {
              stack: [
                {
                  stack: [{ text: 'test cell' }],
                },
              ],
            },
          });
        });

        it('should set passed attributes', () => {
          expect(
            renderPdf(
              <document>
                <content>
                  <cell fontSize={24}>
                    <text>test cell</text>
                  </cell>
                </content>
              </document>,
            ),
          ).toEqual({
            content: {
              stack: [
                {
                  stack: [{ text: 'test cell' }],
                  fontSize: 24,
                },
              ],
            },
          });
        });
      });
    });

    describe('unordered list', () => {
      it('should be converted', () => {
        expect(
          renderPdf(
            <document>
              <content>
                <ul>
                  <text>test item 1</text>
                  <text>test item 2</text>
                </ul>
              </content>
            </document>,
          ),
        ).toEqual({
          content: {
            stack: [
              {
                ul: [{ text: 'test item 1' }, { text: 'test item 2' }],
              },
            ],
          },
        });
      });

      it('should set passed attributes', () => {
        expect(
          renderPdf(
            <document>
              <content>
                <ul
                  type="square"
                  separator={['(', ')']}
                  start={50}
                  color="blue"
                  markerColor="red"
                  reversed
                >
                  <text>test item 1</text>
                  <text>test item 2</text>
                </ul>
              </content>
            </document>,
          ),
        ).toEqual({
          content: {
            stack: [
              {
                ul: [{ text: 'test item 1' }, { text: 'test item 2' }],
                type: 'square',
                separator: ['(', ')'],
                start: 50,
                color: 'blue',
                markerColor: 'red',
                reversed: true,
              },
            ],
          },
        });
      });
    });

    describe('ordered list', () => {
      it('should be converted', () => {
        expect(
          renderPdf(
            <document>
              <content>
                <ol>
                  <text>test item 1</text>
                  <text>test item 2</text>
                </ol>
              </content>
            </document>,
          ),
        ).toEqual({
          content: {
            stack: [
              {
                ol: [{ text: 'test item 1' }, { text: 'test item 2' }],
              },
            ],
          },
        });
      });

      it('should set passed attributes', () => {
        expect(
          renderPdf(
            <document>
              <content>
                <ol
                  type="lower-roman"
                  separator={['(', ')']}
                  start={50}
                  color="blue"
                  markerColor="red"
                  reversed
                >
                  <text>test item 1</text>
                  <text>test item 2</text>
                </ol>
              </content>
            </document>,
          ),
        ).toEqual({
          content: {
            stack: [
              {
                ol: [{ text: 'test item 1' }, { text: 'test item 2' }],
                type: 'lower-roman',
                separator: ['(', ')'],
                start: 50,
                color: 'blue',
                markerColor: 'red',
                reversed: true,
              },
            ],
          },
        });
      });
    });
  });
});
