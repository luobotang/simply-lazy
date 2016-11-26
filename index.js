(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Lazy = factory();
  }
})(this, function() {

  function Lazy(source) {
    // TODO
  }

  return Lazy;
});