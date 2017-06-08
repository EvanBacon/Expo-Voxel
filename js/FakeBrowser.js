import { Dimensions } from 'react-native';

class DOMNode {
  constructor(nodeName) {
    this.nodeName = nodeName;
  }

  appendChild(element) {
    // unimplemented
  }
}

class DOMElement extends DOMNode {
  style = {};

  constructor(tagName) {
    return super(tagName.toUpperCase());
  }

  get tagName() {
    return this.nodeName;
  }

  addEventListener(eventName, listener) {
    // unimplemented
  }

  removeEventListener(eventName, listener) {
    // unimplemented
  }
}

class DOMDocument extends DOMNode {
  body = new DOMElement('BODY');

  constructor() {
    super('#document');
  }

  createElement(tagName) {
    return new DOMElement(tagName);
  }

  getElementById(id) {
    return new DOMElement('div');
  }
}

let { width, height } = Dimensions.get('window');
window.innerWidth = width;
window.innerHeight = height;
window.document = new DOMDocument();

global.performance = null;
