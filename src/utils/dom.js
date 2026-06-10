// Mini DOM helpers for vanilla JS components

export function el(tag, attrs = {}, ...children) {
  const element = document.createElement(tag);
  for (const [key, val] of Object.entries(attrs)) {
    if (key === 'style' && typeof val === 'object') {
      Object.assign(element.style, val);
    } else if (key === 'className') {
      element.className = val;
    } else if (key === 'innerHTML') {
      element.innerHTML = val;
    } else if (key.startsWith('on')) {
      element.addEventListener(key.slice(2).toLowerCase(), val);
    } else if (key === 'draggable') {
      element.draggable = val;
    } else {
      element.setAttribute(key, val);
    }
  }
  for (const child of children) {
    if (child == null) continue;
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      element.appendChild(child);
    }
  }
  return element;
}

export function setStyles(element, styles) {
  Object.assign(element.style, styles);
}

export function clearChildren(element) {
  element.innerHTML = '';
}
