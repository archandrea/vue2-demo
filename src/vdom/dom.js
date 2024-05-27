// TODO: remove this file and use native api directly
export function createElement(tagName){
  return document.createElement(tagName)
}

export function createElementNS(namespaceURI, qualifiedName){
  return document.createElementNS(namespaceURI, qualifiedName)
}

export function createTextNode(text){
  return document.createTextNode(text)
}

export function insertBefore(parentNode, newNode, referenceNode){
  parentNode.insertBefore(newNode, referenceNode)
}

export function removeChild(node, child){
  node.removeChild(child)
}

export function appendChild(node, child){
  node.appendChild(child)
}

export function parentNode(node){
  return node.parentElement
}

export function nextSibling(node){
  return node.nextSibling
}

export function tagName(node){
  return node.tagName
}

export function setTextContent(node, text){
  node.textContent = text
}
