export function isLinkNode(node) {
  return node.type === 'link';
}

export function findParentLinks({ children }) {
  return children.some(isLinkNode);
}
