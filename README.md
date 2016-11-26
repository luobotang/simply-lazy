# simply-lazy

A simple [Lazy.js](http://danieltao.com/lazy.js) implementation, to show the core of lazy evaluation.

## demo

```javascript
Lazy([1, 2, 3, 4, 5])
  .filter(i => i % 2 === 0)
  .map(i => i * 2)
  .each(i => console.log(i))
// output:
// 4
// 8
```
