'use strict';

const htmlparser = require('htmlparser');
const tags = require('./tags');

const handler = new htmlparser.DefaultHandler((err) => {
  if (err) throw new Error(err);
});

const parser = new htmlparser.Parser(handler);

let elements = {};

function createElement(name, element) {
  elements[name] = element;
}

function getElements() {
  return elements;
}

function extendElements(newElements) {
  const keys = Object.keys(newElements);
  let length = keys.length;
  let name = "";
  while (length--) {
    name = keys[length];
    elements[name] = newElements[name];
  }
}

function renderUnknownElement(children, dom) {
  if (dom.type === 'tag' && tags.indexOf(dom.name) >= 0) {
    return '<' + dom.data + '>' + children + '</' + dom.name + '>';
  }
  return children;
}

function renderBaseElement(dom, children) {
  if (!elements.hasOwnProperty(dom.name)) return renderUnknownElement(children, dom);
  const element = elements[dom.name];
  const renderHtml =  element.render.call({
    children: children,
    props: dom.attribs || (element.getDefaultProps && element.getDefaultProps()) || {}
  });
  return renderElement(renderHtml);
}

function renderElements(dom) {
  if (dom.type === 'text') return renderBaseElement(dom, dom.data);
  if (!dom.children) return renderBaseElement(dom, '');
  const children = dom.children.filter(e => e.type === 'tag');
  if (!children.length) {
    return renderBaseElement(dom, dom.children[0].data);
  }
  const childrens = dom.children.map(e => renderElements(e)).join('');
  return renderBaseElement(dom, childrens);
}

function renderElement(html) {
  parser.parseComplete(html);
  return handler.dom.map(d => renderElements(d)).join('');
}

module.exports = { createElement, extendElements, getElements, renderElement };
