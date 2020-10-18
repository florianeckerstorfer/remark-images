function renderStyle(style) {
  return Object.keys(style)
    .map((property) => `${property}: ${style[property]};`)
    .join(' ');
}

function renderAttribute(key, value) {
  return `${key}="${key === 'style' ? renderStyle(value) : value}"`;
}

function renderTag(tagName, attributes = {}, children = []) {
  const attrString = Object.keys(attributes)
    .filter((key) => attributes[key] !== undefined && attributes[key] !== null)
    .map((key) => renderAttribute(key, attributes[key]))
    .join(' ');

  const tagWithAttr = `${tagName}${
    attrString.length > 0 ? ' ' : ''
  }${attrString}`;

  const childString = Array.isArray(children)
    ? children.join('')
    : typeof children === 'string'
    ? children
    : '';

  if (children === true || children.length > 0) {
    return `<${tagWithAttr}>${childString || ''}</${tagName}>`;
  }
  return `<${tagWithAttr}>`;
}

export default renderTag;
