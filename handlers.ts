import type { PhrasingContent, Table } from 'mdast';
import type { Element, ElementContent, Text } from 'hast';
import type { TextDirective } from 'mdast-util-directive';
import type { Handler } from 'mdast-util-to-hast';
import { toHast } from 'mdast-util-to-hast';

const emptyText: Text = {
  type: 'text',
  value: '',
};

const ipaRender = (mdNode: TextDirective): Element => ({
  type: 'element',
  tagName: 'span',
  properties: {
    class: ['font-ipa'],
  },
  children: mdNode.children.map(phrasingToElement),
});

const _textDirectiveH = (node: TextDirective): ElementContent => {
  if (node.name === 'ipa') {
    return ipaRender(node);
  } else {
    const hast = toHast(node, { allowDangerousHtml: true });
    if (hast.type === 'root' || hast.type === 'doctype') {
      return emptyText;
    } else if (hast.type === 'element' && hast.tagName === 'script') {
      return emptyText;
    } else {
      return hast;
    }
  }
};

const phrasingToElement = (mdNode: PhrasingContent): ElementContent => {
  if (mdNode.type === 'textDirective') {
    return _textDirectiveH(mdNode);
  } else {
    const hast = toHast(mdNode, { allowDangerousHtml: true });

    if (hast.type === 'root' || hast.type === 'doctype') {
      return emptyText;
    } else if (hast.type === 'element' && hast.tagName === 'script') {
      return emptyText;
    } else {
      return hast;
    }
  }
};

export const tableHandler: Handler = (_, node: Table) => {
  const [head, ...body] = node.children;
  const ths = head.children.map(
    (th): Element => ({
      type: 'element',
      tagName: 'th',
      properties: {},
      children: th.children.map(phrasingToElement),
    }),
  );

  const cond = ths.some((th) => th.children.length > 0);

  const thead: Element | null = cond
    ? {
        type: 'element',
        tagName: 'thead',
        properties: {},
        children: [
          {
            type: 'element',
            tagName: 'tr',
            properties: {},
            children: ths,
          },
        ],
      }
    : null;

  const bodyTrs = body.map(
    (row): Element => ({
      type: 'element',
      tagName: 'tr',
      properties: {},
      children: row.children.map((td) => ({
        type: 'element',
        tagName: 'td',
        properties: {},
        children: td.children.map(phrasingToElement),
      })),
    }),
  );

  const tbody: Element = {
    type: 'element',
    tagName: 'tbody',
    properties: {},
    children: bodyTrs,
  };

  const table: Element = {
    type: 'element',
    tagName: 'table',
    properties: {},
    children: thead ? [thead, tbody] : [tbody],
  };

  return {
    type: 'element',
    tagName: 'div',
    properties: {
      class: ['table-container'],
    },
    children: [table],
  };
};

export const textDirectiveHandler: Handler = (_, node: TextDirective) => {
  return _textDirectiveH(node);
};
