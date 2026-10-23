/* eslint-disable */

if (!window.scrollTo) {
  window.scrollTo = function ({ left, top, behavior }) {
    console.warn('not support scrollTo behavior');
    window.pageXOffset = left;
    window.pageYOffset = top;
  };
}

if (!document.body.scrollTo) {
  Element.prototype.scrollTo = function ({ left, top, behavior }) {
    console.warn('not support scrollTo behavior');
    this.scrollLeft = left;
    this.scrollTop = top;
  };
}
