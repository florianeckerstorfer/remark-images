const remark = require('remark')
const html = require('remark-html')

export function isLinkNode(node) {
  return node.type === 'link';
}

export function findParentLinks({ children }) {
  return children.some(isLinkNode);
}

export function parseMarkdown(markdown) {
  const processedString = remark()
    .use(html)
    .processSync(markdown)
    .toString()

    return processedString
}
