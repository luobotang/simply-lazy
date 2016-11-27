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
    if (source instanceof Array) {
      return ArrayWrapper(source);
    }
    throw new Error('Sorry, only array is supported in simply-lazy.')
  }

  /* Sequence */

  function Sequence() { }

  //Sequence.prototype.getIterator = function () {
  //  var seq = this
  //  var index = -1
  //  var cachedIndex
  //  return {
  //    current() { return cachedIndex && cachedIndex.get(index) },
  //    moveNext() {
  //      if (!cachedIndex) {
  //        cachedIndex = seq.getIndex()
  //      }
  //      if (index > cachedIndex.length() - 1) {
  //        return false
  //      } else {
  //        ++index
  //        return true
  //      }
  //    }
  //  };
  //}

  //Sequence.prototype.getIndex = function () {
  //  // TODO
  //  return ArrayWrapper(this.toArray())
  //}

  Sequence.prototype.get = function get(i) {
    var element;
    this.each(function(e, index) {
      if (index === i) {
        element = e;
        return false;
      }
    });
    return element;
  }

  Sequence.prototype.each = function each(fn) {
    var iterator = this.getIterator()
    var i = -1

    while (iterator.moveNext()) {
      if (fn(iterator.current(), ++i) === false) {
        return false;
      }
    }

    return true;
  }

  Sequence.prototype.map = function (mapFn) {
    return MappedSequence(this, mapFn)
  }

  Sequence.prototype.take = function (count) {
    return TakeSequence(this, count || 1)
  }

  /* MappedSequence */

  function MappedSequence(parent, mapFn) {
    var seq = new Sequence()
    seq.getIterator = () => {
      var iterator = parent.getIterator()
      var index = -1
      return {
        current() { return mapFn(iterator.current(), index) },
        moveNext() {
          if (iterator.moveNext()) {
            ++index
            return true
          }
          return false
        }
      }
    }
    seq.each = fn => parent.each((e, i) => fn(mapFn(e, i), i))
    return seq
  }

  /* TakeSequence */

  function TakeSequence(parent, count) {
    var seq = new Sequence()
    seq.getIterator = () => {
      var iterator = parent.getIterator()
      var _count = count
      return {
        current() { return iterator.current() },
        moveNext() { return (--_count >= 0) && iterator.moveNext() }
      }
    }
    seq.each = (fn) => {
      var _count = count
      var i = 0
      var result
      parent.each(e => {
        if (i < count) { result = fn(e, i++); }
        if (i >= count) { return false; }
        return result
      })
      return i === count && result !== false
    }
    return seq
  }

  /* ArrayLikeSequence */

  function ArrayLikeSequence() {
    var seq = new Sequence()
    seq.length = () => seq.parent.length()
    seq.map = mapFn => IndexedMappedSequence(seq, mapFn)
    seq.filter = filterFn => IndexedFilteredSequence(seq, filterFn)
    return seq
  }

  /* IndexedMappedSequence */

  function IndexedMappedSequence(parent, mapFn) {
    var seq = ArrayLikeSequence()
    seq.parent = parent
    seq.get = (i) => {
      if (i < 0 || i >= parent.length()) {
        return undefined;
      }
      return mapFn(parent.get(i), i);
    }
    return seq
  }

  /* FilteredSequence */

  function FilteredSequence(parent, filterFn) {
    var seq = new Sequence()
    seq.getIterator = () => {
      var iterator = parent.getIterator()
      var index = 0
      var value
      return {
        current() { return value },
        moveNext() {
          var _val
          while (iterator.moveNext()) {
            _val = iterator.current()
            if (filterFn(_val, index++)) {
              value = _val
              return true
            }
          }
          value = undefined
          return false
        }
      }
    }
    seq.each = fn => {
      var j = 0;
      return parent.each((e, i) => {
        if (filterFn(e, i)) {
          return fn(e, j++);
        }
      })
    }
    return seq
  }

  /* IndexedFilteredSequence */

  function IndexedFilteredSequence(parent, filterFn) {
    var seq = new FilteredSequence()
    seq.parent = parent
    seq.each = (fn) => {
      var length = parent.length()
      var i = -1
      var j = 0
      var e
      while (++i < length) {
        e = parent.get(i)
        if (filterFn(e, i) && fn(e, j++) === false) {
          return false
        }
      }
      return true
    }
    return seq
  }

  /* ArrayWrapper */

  function ArrayWrapper(source) {
    var seq = new ArrayLikeSequence()
    seq.source = source
    seq.get = i => source[i]
    seq.length = () => source.length
    seq.each = fn => forEach(source, fn)
    seq.map = mapFn => MappedArrayWrapper(seq, mapFn)
    seq.filter = filterFn => FilteredArrayWrapper(seq, filterFn)
    return seq
  }

  /* MappedArrayWrapper */

  function MappedArrayWrapper(parent, mapFn) {
    var source = parent.source
    var seq = new ArrayLikeSequence()
    seq.parent = parent
    seq.get = (i) => (i < 0 || i >= source.length) ? undefined : mapFn(source[i])
    seq.length = () => source.length
    seq.each = (fn) => {
      var i = -1;
      while (++i < length) {
        if (fn(mapFn(source[i], i), i) === false) {
          return false;
        }
      }
      return true;
    }
    return seq
  }

  /* FilteredArrayWrapper */

  function FilteredArrayWrapper(parent, filterFn) {
    var seq = FilteredSequence(parent, filterFn)
    seq.each = fn => {
      var source = parent.source
      var length = source.length
      var i = -1
      var j = 0
      var e

      while (++i < length) {
        e = source[i]
        if (filterFn(e, i) && fn(e, j++) === false) {
          return false
        }
      }

      return true
    }
    return seq
  }


  return Lazy
})