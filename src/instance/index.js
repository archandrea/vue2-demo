import { compile } from '../compiler/index.js'

export default class Vue {
  constructor(options) {
    this.$options = options
    this._data = options.data
    const el = this.elm = document.querySelector(options.el)
    const render = compile(el.outerHTML)
    el.innerHTML = ''
  }
}