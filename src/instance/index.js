import { compile } from '../compiler/index.js'
import Watcher from '../observer/watcher.js'
import VNode from '../vdom/vnode.js'
import { patch } from '../vdom/index.js'
import { isPrimitive } from '../util/index.js'

export default class Vue {
  constructor(options) {
    this.$options = options
    this._data = options.data
    const el = this.elm = document.querySelector(options.el)
    const render = compile(el.outerHTML)
    el.innerHTML = ''

    for (const key in options.data) {
      this._proxy(key)
    }

    this.watchers = []
    this.watcher = new Watcher(this, render)

    console.log(this.watcher.value)

    this._update(this.watcher.value)
  }

  _update(vtree) {
    if (!this._tree) {
      patch(this.elm, vtree)
    } else {
      patch(this._tree, vtree)
    }
    this._tree = vtree
  }

  _proxy(key) {
    Object.defineProperty(this, key, {
      enumerable: true,
      configurable: true,
      get: () => this._data[key],
      set: (val) => this._data[key] = val
    })
  }

  __h__(tag, b, c) {
    let data, children, text
    if (arguments.length === 3) {
      data = b
      if (Array.isArray(c)) children = c
      else if (isPrimitive(c)) text = c
    } else if (arguments.length === 2) {
      if (Array.isArray(b)) children = b
      else if (isPrimitive(b)) text = b
    }

    if (Array.isArray(c)) {
      for (let i = 0; i < children.length; i++) {
        if (isPrimitive(children[i])) children[i] = new VNode(undefined, undefined, undefined, children[i], undefined)
      }
    }

    return new VNode(tag, data, children, text, undefined)
  }

  __flatten__(arr) {
    return arr.flatMap(i => Array.isArray(i) ? this.__flatten__(i) : i)
  }
}

