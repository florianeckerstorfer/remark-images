function renderTag(tagName, attributes = {}, children = []) {
  const attrString = Object.keys(attributes)
    .filter((key) => attributes[key] !== undefined && attributes[key] !== null)
    .map((key) => `${key}="${attributes[key]}"`)
    .join(' ');

  const tagWithAttr = `${tagName}${
    attrString.length > 0 ? ' ' : ''
  }${attrString}`;

  const childString = Array.isArray(children) ? children.join('') : children;

  if (children.length > 0) {
    return `<${tagWithAttr}>${childString}</${tagName}>`;
  }
  return `<${tagWithAttr}>`;
}

export default renderTag;
