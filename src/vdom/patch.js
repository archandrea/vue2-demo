import VNode from './vnode.js'

const emptyNode = new VNode('', {}, [], undefined, undefined)
const hooks = ['create', 'update', 'remove', 'destroy']

export function createPatchFunction(modules) {
  let cbs = {}, j, h

  for (let i = 0; i < hooks.length; i++) {
    h = hooks[i]
      ; (j = cbs[h]) || (j = cbs[h] = [])
    for (const key in modules) j.push(modules[key][h])
  }

  console.log('cbs', cbs)

  function emptyNodeAt(elm) {
    return new VNode(elm.tagName.toLowerCase(), {}, [], undefined, elm)
  }

  function sameNode(a, b) {
    return (a.key === b.key) && (a.tag === b.tag)
  }

  function createElm(vnode, insertedVnodeQueue) {
    let i, data = vnode.data
    let tag = vnode.tag, ch = vnode.children, elm
    if (tag) {
      elm = vnode.elm = document.createElement(tag)
      if (ch && ch.length) {
        for (i = 0; i < ch.length; ++i) {
          elm.appendChild(createElm(ch[i], insertedVnodeQueue))
        }
      }
      for (i = 0; i < cbs.create.length; ++i) cbs.create[i](emptyNode, vnode)
        ; (i = vnode.hooks) && i.create && i.create(emptyNode, vnode)
      i && i.insert && insertedVnodeQueue.push(vnode)
    } else {
      elm = vnode.elm = document.createTextNode(vnode.text)
    }
    return vnode.elm
  }

  // TODO: redo this part
  function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue) {
    let oldStartIdx = 0,
      newStartIdx = 0,
      oldEndIdx = oldCh.length - 1,
      newEndIdx = newCh.length - 1,
      oldStartVnode = oldCh[0],
      oldEndVnode = oldCh[oldEndIdx],
      newStartVnode = newCh[0],
      newEndVnode = newCh[newEndIdx]

    var oldKeyToIdx, idxInOld, elmToMove, before
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx]
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue)
        oldStartVnode = oldCh[++oldStartIdx]
        newStartVnode = newCh[++newStartIdx]
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue)
        oldEndVnode = oldCh[--oldEndIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue)
        parentElm.insertBefore(oldStartVnode.elm, oldEndVnode.elm.nextSibling)
        oldStartVnode = oldCh[++oldStartIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue)
        parentElm.insertBefore(oldEndVnode.elm, oldStartVnode.elm)
        oldEndVnode = oldCh[--oldEndIdx]
        newStartVnode = newCh[++newStartIdx]
      } else {
        if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
        idxInOld = oldKeyToIdx[newStartVnode.key]
        if (isUndef(idxInOld)) { // New element
          parentElm.insertBefore(createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm)
          newStartVnode = newCh[++newStartIdx]
        } else {
          elmToMove = oldCh[idxInOld]
          patchVnode(elmToMove, newStartVnode, insertedVnodeQueue)
          oldCh[idxInOld] = undefined
          parentElm.insertBefore(elmToMove.elm, oldStartVnode.elm)
          newStartVnode = newCh[++newStartIdx]
        }
      }
    }
    if (oldStartIdx > oldEndIdx) {
      before = !newCh[newEndIdx + 1] ? null : newCh[newEndIdx + 1].elm
      addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
    } else if (newStartIdx > newEndIdx) {
      removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)
    }
  }

  function addVnodes(elm, referenceNode, vnodes, startIdx, endIdx, insertedVnodeQueue) {
    for (; startIdx < endIdx; ++startIdx) {
      const newElm = createElm(vnodes[startIdx], insertedVnodeQueue)
      elm.insertBefore(newElm, referenceNode)
    }
  }

  function removeVnodes(elm, vnodes, startIdx, endIdx) {
    for (; startIdx < endIdx; ++startIdx) {
      let vn = vnodes[startIdx], listeners, i
      if (vn) {
        if (vn.tag) {
          invokeDestroyHook(vn)
          listeners = cbs.remove.length
          let rmCb = createRmCb(vn.elm, listeners)
          for (let i, len = cbs.remove.length; i < len; i++) cbs.remove[i](vn, rmCb)
          if ((i = vn.data) && (i = i.hook) && (i = i.remove)) i(vn, rmCb)
          else rmCb()
        } else {
          // text node
          elm.removeChild(vn.elm)
        }
      }
    }
  }

  function invokeDestroyHook(vnode) {
    let i, j, data = vnode.data
    if (data) {
      (i = data.hook) && (i = i.destroy) && i(vnode)
      for (let i = 0; i < cbs.destroy.length; i++) cbs.destroy[i](vnode)
      if (j = vnode.children) {
        for (let i = 0, len = vnode.children; i < len; i++) invokeDestroyHook(j[i])
      }
    }
  }

  function createRmCb(elm, listeners) {
    return function () {
      let p = elm.parentNode
      p && listeners-- === 0 && p.removeChild(elm)
    }
  }

  function patchVnode(oldVnode, newVnode, insertedVnodeQueue) {
    if (newVnode === oldVnode) return

    let elm = newVnode.elm = oldVnode.elm,
      newCh = newVnode.children,
      oldCh = oldVnode.children

    if (newVnode.data) {
      let i = cbs.update.length
      while (i--) cbs.update[i](oldVnode, newVnode)
      i = newVnode.data.hook
      i && (i = i.update) && i(oldVnode, newVnode)
    }

    if (!newVnode.text) {
      if (newCh && oldCh) {
        updateChildren(elm, oldCh, newCh, insertedVnodeQueue)
      } else if (newCh) {
        addVnodes(elm, null, newCh, 0, newCh.length - 1, insertedVnodeQueue)
      } else if (oldCh) {
        removeVnodes(elm)
      } else if (oldVnode.text) {
        elm.textContent = ''
      }
    } else if (oldVnode.text !== newVnode.text) {
      elm.textContent = newVnode.text
    }
  }

  // TODO: redo this part
  return (oldVnode, newVnode) => {
    console.dir(oldVnode, newVnode)
    let elm, parent, i
    let insertedVnodeQueue = []

    // first render, oldVnode is a real DOM element
    if (oldVnode.nodeType) {
      oldVnode = emptyNodeAt(oldVnode)
    }

    if (sameNode(oldVnode, newVnode)) {
      patchVnode(oldVnode, newVnode, insertedVnodeQueue)
    } else {
      elm = oldVnode.elm
      parent = elm.parentNode

      createElm(newVnode, insertedVnodeQueue)

      if (parent !== null) {
        parent.insertBefore(newVnode.elm, elm.nextSibling)
        removeVnodes(parent, [oldVnode], 0, 0)
      }
    }

    for (i = 0; i < insertedVnodeQueue.length; ++i) {
      insertedVnodeQueue[i].data.hook.insert(insertedVnodeQueue[i])
    }
    // for (i = 0; i < cbs.post.length; ++i) cbs.post[i]()

    console.log(newVnode)
    return newVnode
  }
}