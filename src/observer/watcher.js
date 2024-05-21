export default class Watcher {
  constructor(vm, expOrFn, cb, options) {
    Object.assign(this, options)
    this.vm = vm
    this.cb = cb
    vm.watchers.push(this)

    this.getter = expOrFn
    this.setter = undefined
    this.value = this.get()
  }
}

Watcher.prototype.get = function () {
  return this.getter.call(this.vm, this.vm)
}