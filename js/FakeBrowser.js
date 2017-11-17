import { Dimensions } from "react-native";
import EventEmitter from "EventEmitter";

class DOMNode {
  constructor(nodeName) {
    this.nodeName = nodeName;
  }

  get ownerDocument() {
    return window.document;
  }

  appendChild(element) {
    // unimplemented
  }
}

class DOMElement extends DOMNode {
  style = {};
  emitter = new EventEmitter();
  constructor(tagName) {
    return super(tagName.toUpperCase());
  }

  get tagName() {
    return this.nodeName;
  }

  get clientWidth() {
    return this.innerWidth;
  }
  get clientHeight() {
    return this.innerHeight;
  }

  get innerWidth() {
    return window.innerWidth;
  }
  get innerHeight() {
    return window.innerHeight;
  }
  getContext(contextType) {
    // if (global.canvasContext) {
    //   return global.canvasContext;
    // }

    if (global.ctx) {
      // console.warn("canvas");
      global.ctx.flush();
      global.ctx.getContextAttributes = () => ({
        stencil: true
      });
      global.ctx.getExtension = () => ({
        loseContext: _ => {}
      });
      return global.ctx;
      //   return global.canvasInstance.getContext(contextType);
    }

    return {
      fillRect: _ => {},
      drawImage: _ => {},
      getImageData: (x, y, width, height) => {
        console.warn("context.getImageData: uni", x, y, width, height);

        return {
          data: {}
        };
      },
      scale: (x, y) => {
        console.warn("context.scale: uni", x, y);
      },
      getContextAttributes: _ => ({
        stencil: true
      }),
      getExtension: _ => ({
        loseContext: _ => {}
      }),
      measureText: text => {
        console.warn("context.measureText: uni", text);

        return {
          width: 100,
          height: 100 //??
        };
      },
      fillText: (text, x, y) => {
        console.warn("context.fillText: uni", text, x, y);
        return {};
      },
      clearRect: (x, y, width, height) => {
        console.warn("context.clearRect: uni", x, y, width, height);
      },
      fillStyle: null,
      textBaseline: null,
      font: null
    };
  }

  addEventListener(eventName, listener) {
    // unimplemented
    console.log("VOXEL:: add listener", this.tagName, eventName, listener);
    this.emitter.addListener(eventName, listener);
  }

  removeEventListener(eventName, listener) {
    // unimplemented
    this.emitter.removeListener(eventName, listener);
  }
}

class DOMDocument extends DOMElement {
  body = new DOMElement("BODY");

  constructor() {
    super("#document");
  }

  createElement(tagName) {
    return new DOMElement(tagName);
  }

  createElementNS(tagName) {
    const canvas = this.createElement(tagName);
    canvas.getContext = () => ({
      fillRect: _ => ({}),
      drawImage: _ => ({}),
      getImageData: _ => ({}),
      getContextAttributes: _ => ({
        stencil: true
      }),
      getExtension: _ => ({
        loseContext: _ => ({})
      })
    });
    canvas.toDataURL = _ => ({});

    return canvas;
  }

  getElementById(id) {
    return new DOMElement("div");
  }
}

process.browser = true;

window.emitter = new EventEmitter();
window.addEventListener = (eventName, listener) => {
  // unimplemented
  console.log("VOXEL:: add listener", "WINDOW", eventName, listener);
  window.emitter.addListener(eventName, listener);
};
window.removeEventListener = (eventName, listener) => {
  // unimplemented
  window.emitter.removeListener(eventName, listener);
};

let { width, height } = Dimensions.get("window");
window.innerWidth = window.clientWidth = width;
window.innerHeight = window.clientHeight = height;
window.document = new DOMDocument();

global.performance = null;
