/*
 * Copyright 2018 Schibsted.
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 */

// libs
import flattenDeep from 'lodash/flattenDeep';
import isNil from 'lodash/isNil';
import last from 'lodash/last';
import omit from 'lodash/omit';
import pick from 'lodash/pick';

const isTextElement = (tag) =>
  typeof tag === 'string' || typeof tag === 'number';
const isTopLevelElement = (elementName) =>
  ['header', 'content', 'footer'].includes(elementName);

function updateContext(context, overrides) {
  return Object.assign(context, overrides);
}

function createContext(parentContext = {}) {
  return { ...parentContext };
}

function createElement(elementName, attributes, ...children) {
  const flatChildren = flattenDeep(children);
  return {
    elementName,
    children: flatChildren,
    attributes: attributes || {},
  };
}

function resolve(tag, context) {
  let resolvedTag = tag;
  while (resolvedTag && typeof resolvedTag.elementName === 'function') {
    resolvedTag = resolvedTag.elementName(
      { ...resolvedTag.attributes, children: resolvedTag.children },
      context,
      updateContext.bind(null, context),
    );
  }

  return resolvedTag;
}

function unwrapTextElements(elements) {
  if (elements.length === 1 && isTextElement(elements[0])) {
    return elements[0];
  }

  return elements;
}

function resolveChildren(tag, parentContext, isTopLevel) {
  const resolvedTag = resolve(tag, parentContext);

  if (!resolvedTag) {
    return null;
  }

  if (isTextElement(resolvedTag)) {
    return resolvedTag;
  }

  const { elementName, children = [], attributes } = resolvedTag;

  if (!isTopLevel && isTopLevelElement(elementName)) {
    throw new Error(
      '<header>, <content> and <footer> elements can only appear as immediate descendents of the <document>',
    );
  }

  if (isTopLevel && !isTopLevelElement(elementName)) {
    throw new Error(
      `The <document> element can only contain <header>, <content>, and <footer> elements but found ${elementName}`,
    );
  }

  if (
    ['header', 'footer'].includes(elementName) &&
    children.length === 1 &&
    typeof children[0] === 'function'
  ) {
    return (...args) => ({
      stack: [
        resolveChildren(children[0](...args), createContext(parentContext)),
      ],
      ...attributes,
    });
  }

  const resolvedChildren = children.reduce((accumulator, child) => {
    const resolvedChild = resolveChildren(child, createContext(parentContext));

    if (isTextElement(last(accumulator)) && isTextElement(resolvedChild)) {
      // If the previous child is a string
      // and the next child is a string,
      // join them together.
      accumulator[accumulator.length - 1] = `${
        accumulator[accumulator.length - 1]
      }${resolvedChild}`;
    } else if (!isNil(resolvedChild)) {
      // Otherwise push the child onto
      // the accumulator (as long as it's
      // not null or undefined).
      accumulator.push(resolvedChild);
    }

    return accumulator;
  }, []);

  /**
   * This is the meat. If you're in this file, you're probably looking for this.
   *
   * Converts the React-like syntax to something PDFMake understands.
   */
  switch (elementName) {
    case 'header':
    case 'content':
    case 'footer':
    case 'stack':
    case 'column':
    case 'cell':
      return { stack: resolvedChildren, ...attributes };
    case 'text':
      return {
        text: unwrapTextElements(resolvedChildren),
        ...attributes,
      };
    case 'columns':
      return { columns: resolvedChildren, ...attributes };
    case 'image':
      return { image: attributes.src, ...omit(attributes, 'src') };
    case 'svg':
      return { svg: attributes.content, ...omit(attributes, 'content') };
    case 'qr':
      return { qr: attributes.content, ...omit(attributes, 'content') };
    case 'table':
      return {
        table: {
          body: resolvedChildren,
          ...pick(attributes, ['headerRows', 'widths']),
        },
        ...omit(attributes, ['headerRows', 'widths']),
      };
    case 'row':
      return resolvedChildren;
    case 'ul':
      return { ul: resolvedChildren, ...attributes };
    case 'ol':
      return { ol: resolvedChildren, ...attributes };
    case 'document':
      throw new Error('<document> can only appear as the root element');
    default:
      return null;
  }
}

/*
 * Recursively traverse the JSON component tree created by the createElement calls,
 * resolving components from the bottom up.
 */
function renderPdf(tag) {
  const context = createContext();
  const resolvedTag = resolve(tag, context);
  const { children, elementName, attributes } = resolvedTag;

  if (elementName !== 'document') {
    throw new Error(
      `The root element must resolve to a <document>, actually resolved to ${elementName}`,
    );
  }

  const result = {};
  const isTopLevel = true;

  children.forEach((child) => {
    const resolvedChild = resolve(child, context);
    result[resolvedChild.elementName] = resolveChildren(
      resolvedChild,
      context,
      isTopLevel,
    );
  });

  return {
    ...result,
    ...attributes,
  };
}

const Fragment = (props) => createElement('stack', null, props.children);

export default {
  createElement,
  renderPdf,
  Fragment,
};
