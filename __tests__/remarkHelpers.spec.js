import { isLinkNode, findParentLinks } from '../src/remarkHelpers';

describe('isLinkNode', () => {
  it('should return `true` if node type is "link"', () => {
    expect(isLinkNode({ type: 'link' })).toBe(true);
  });

  it('should return `false` if node type is not "link"', () => {
    expect(isLinkNode({ type: 'text' })).toBe(false);
  });
});

describe('findParentLinks()', () => {
  it('should return true if at least one children is a link node', () => {
    const children = [{ type: 'link' }, { type: 'text' }, { type: 'text' }];

    expect(findParentLinks({ children })).toBe(true);
  });

  it('should return false if no children is a link node', () => {
    const children = [{ type: 'text' }, { type: 'text' }];

    expect(findParentLinks({ children })).toBe(false);
  });
});
