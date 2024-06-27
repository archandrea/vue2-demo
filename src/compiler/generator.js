// TODO: we take the source code from vue2.0.0 for now. will be rewrited this part later, probably.

const bindRE = /^:|^v-bind:/
const onRE = /^@|^v-on:/
const mustUsePropsRE = /^(value|selected|checked|muted)$/

export function generate (ast) {
  const code = genElement(ast)
  return new Function (`with (this) { return ${code}}`)
}

function genElement (el, key) {
  let exp
  if (exp = getAttr(el, 'v-for')) {
    return genFor(el, exp)
  } else if (exp = getAttr(el, 'v-if')) {
    return genIf(el, exp)
  } else if (el.tag === 'template') {
    return genChildren(el)
  } else {
    return `__h__('${ el.tag }', ${ genData(el, key) }, ${ genChildren(el) })`
  }
}

function genIf (el, exp) {
  return `(${ exp }) ? ${ genElement(el) } : ''`
}

function genFor (el, exp) {
  const inMatch = exp.match(/([a-zA-Z_][\w]*)\s+(?:in|of)\s+(.*)/)
  if (!inMatch) {
    throw new Error('Invalid v-for expression: '+ exp)
  }
  const alias = inMatch[1].trim()
  exp = inMatch[2].trim()
  const key = el.attrsMap['track-by'] || 'undefined'
  return `(${ exp }).map(function (${ alias }, $index) {return ${ genElement(el, key) }})`
}

function genData (el, key) {
  if (!el.attrs.length) {
    return '{}'
  }
  let data = key ? `{key:${ key },` : `{`
  if (el.attrsMap[':class'] || el.attrsMap['class']) {
    data += `class: _renderClass(${ el.attrsMap[':class'] }, "${ el.attrsMap['class'] || '' }"),`
  }
  let attrs = `attrs:{`
  let props = `props:{`
  let hasAttrs = false
  let hasProps = false
  for (let i = 0, l = el.attrs.length; i < l; i++) {
    let attr = el.attrs[i]
    let name = attr.name
    if (bindRE.test(name)) {
      name = name.replace(bindRE, '')
      if (name === 'class') {
        continue
      } else if (name === 'style') {
        data += `style: ${ attr.value },`
      } else if (mustUsePropsRE.test(name)) {
        hasProps = true
        props += `"${ name }": (${ attr.value }),`
      } else {
        hasAttrs = true
        attrs += `"${ name }": (${ attr.value }),`
      }
    } else if (onRE.test(name)) {
      name = name.replace(onRE, '')
      // TODO
    } else if (name !== 'class') {
      hasAttrs = true
      attrs += `"${ name }": (${ JSON.stringify(attr.value) }),`
    }
  }
  if (hasAttrs) {
    data += attrs.slice(0, -1) + '},'
  }
  if (hasProps) {
    data += props.slice(0, -1) + '},'
  }
  return data.replace(/,$/, '') + '}'
}

function genChildren (el) {
  if (!el.children.length) {
    return 'undefined'
  }
  return '__flatten__([' + el.children.map(genNode).join(',') + '])'
}

function genNode (node) {
  if (node.tag) {
    return genElement(node)
  } else {
    return genText(node)
  }
}

function genText (text) {
  if (text === ' ') {
    return '" "'
  } else {
    const exp = parseText(text)
    if (exp) {
      return 'String(' + escapeNewlines(exp) + ')'
    } else {
      return escapeNewlines(JSON.stringify(text))
    }
  }
}

function escapeNewlines (str) {
  return str.replace(/\n/g, '\\n')
}

function getAttr (el, attr) {
  let val
  if (val = el.attrsMap[attr]) {
    el.attrsMap[attr] = null
    for (let i = 0, l = el.attrs.length; i < l; i++) {
      if (el.attrs[i].name === attr) {
        el.attrs.splice(i, 1)
        break
      }
    }
  }
  return val
}

const tagRE = /\{\{((?:.|\\n)+?)\}\}/g

export function parseText (text) {
  if (!tagRE.test(text)) {
    return null
  }
  var tokens = []
  var lastIndex = tagRE.lastIndex = 0
  var match, index, value
  /* eslint-disable no-cond-assign */
  while (match = tagRE.exec(text)) {
  /* eslint-enable no-cond-assign */
    index = match.index
    // push text token
    if (index > lastIndex) {
      tokens.push(JSON.stringify(text.slice(lastIndex, index)))
    }
    // tag token
    value = match[1]
    tokens.push('(' + match[1].trim() + ')')
    lastIndex = index + match[0].length
  }
  if (lastIndex < text.length) {
    tokens.push(JSON.stringify(text.slice(lastIndex)))
  }
  return tokens.join('+')
}