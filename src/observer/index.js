
export class Observer {
  constructor(value) {
    this.value = value

    Object.defineProperty(value, '__ob__', {
      value: this,
      enumerable: false,
      configurable: true,
      writable: true
    })

    if (Array.isArray(value)) {
      // TODO: augment array methods here
    } else {
      this.walk(value)
    }
  }

  // walk through all properties of an object and convert them to getter/setter
  walk(obj) {
    for (const key in obj) {
      this.convert(key, obj[key])
    }
  }

  convert(key, val) {
    defineReactive(this.value, key, val)
  }
}

export function observe(value) {
  if (!value || typeof value !== 'object') return

  let ob

  if (hasOwnProperty.call(value, '__ob__') && value.__ob__ instanceof Observer) {
    // if value is already an observer, return it
    ob = value.__ob__
  } else if (typeof value === 'object' && Object.isExtensible(value) && !value.isVue) {
    ob = new Observer(value)
  }

  return ob
}

export function defineReactive(obj, key, val) {

  let prop = Object.getOwnPropertyDescriptor(obj, key)
  if (prop && prop.configurable === false) return

  const getter = prop && prop.get
  const setter = prop && prop.set

  let childOb = observe(val) // recursively observe all properties of the value as well (for deep observation)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      let value = getter ? getter.call(obj) : val

      return value
    },
    set(newValue) {
      let value = getter ? getter.call(obj) : val
      if (value === newValue) {
        return
      }
      setter ? setter.call(obj, newValue) : (val = newValue)
      childOb = observe(newValue)
      
    }
  })
}