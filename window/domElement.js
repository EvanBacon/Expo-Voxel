
import { Dimensions } from 'react-native';
import EventEmitter from 'EventEmitter';

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

    addEventListener(eventName, listener) {
        this.emitter.addListener(eventName, listener)
    }

    removeEventListener(eventName, listener) {
        this.emitter.removeListener(eventName, listener)
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
}

class DOMDocument extends DOMElement {
    body = new DOMElement('BODY');

    constructor() {
        super('#document');
    }

    createElement(tagName) {
        return new DOMElement(tagName);
    }

    createElementNS(tagName) {
        const canvas = this.createElement(tagName);
        canvas.getContext = () => ({
            fillRect: (_ => ({})),
            drawImage: (_ => ({})),
            getImageData: (_ => ({})),
            getContextAttributes: (_ => ({
                stencil: true
            })),
            getExtension: (_ => ({
                loseContext: (_ => ({

                }))
            })),
        })
        canvas.toDataURL = (_ => ({}))

        return canvas;
    }

    getElementById(id) {
        return new DOMElement('div');
    }
}

process.browser = true

window.emitter = window.emitter || new EventEmitter();
window.addEventListener = window.addEventListener || ((eventName, listener) => window.emitter.addListener(eventName, listener));
window.removeEventListener = window.removeEventListener || ((eventName, listener) => window.emitter.removeListener(eventName, listener));
window.document = new DOMDocument();
window.document.body = new DOMElement('body');
global.document = window.document;

global.performance = null;