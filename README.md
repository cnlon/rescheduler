# rescheduler

rescheduler 用于收集异步任务，重新调度，以实现批量执行和去抖（debouncing）、节流（throttling）等自定义操作。

## 安装和使用

```shell
npm install rescheduler
```

```javascript
const Rescheduler = require('rescheduler')

const fetchRescheduler = new Rescheduler(async function (arglists) { // arglists: [['a'], ['b'], ['c']]
    const raws = await fetch('/book?ids=' + arglists.toString()) // fetch only once
    return await raws.json() // like [bookA, bookB, bookC]
})
fetchRescheduler.run('a').then(bookA => { /* do something */ })
fetchRescheduler.run('b').then(bookB => { /* do something */ })
fetchRescheduler.run('c').then(bookC => { /* do something */ })
fetchRescheduler.flush()
```

---

[MIT](https://github.com/cnlon/rescheduler/tree/master/LICENSE)
