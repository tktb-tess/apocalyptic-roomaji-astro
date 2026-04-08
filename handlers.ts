import type * as Mdast from 'mdast';
import type * as Hast from 'hast';
import type { TextDirective } from 'mdast-util-directive';
import type { Handler } from 'mdast-util-to-hast';
import { toHast } from 'mdast-util-to-hast';
import { h } from 'hastscript';

const emptyText: Hast.Text = {
  type: 'text',
  value: '',
};

const safeToHast = (tree: Mdast.Nodes) => {
  const hast = toHast(tree, { allowDangerousHtml: true });
  if (hast.type === 'root' || hast.type === 'doctype') {
    return emptyText;
  }
  if (hast.type === 'element' && hast.tagName === 'script') {
    return emptyText;
  }
  return hast;
};

const _tdHandler = (node: TextDirective) => {
  if (node.name === 'ipa') {
    return h('span.font-ipa', node.children.map(phrasingToHast));
  } else {
    return safeToHast(node);
  }
};

const phrasingToHast = (mdNode: Mdast.PhrasingContent): Hast.ElementContent => {
  if (mdNode.type === 'textDirective') {
    return _tdHandler(mdNode);
  } else {
    return safeToHast(mdNode);
  }
};

export const tdHandler: Handler = (_, node: TextDirective) => {
  return _tdHandler(node);
};

const tcHandler = (tc: Mdast.TableCell, tag: 'td' | 'th') => {
  if (tc.children.length !== 1) {
    return h(tag, tc.children.map(phrasingToHast));
  }

  const ph = tc.children[0];

  if (!ph || ph.type !== 'textDirective') {
    return h(tag, tc.children.map(phrasingToHast));
  }

  if (ph.name === 's') {
    const parse = (v: string) => {
      const n = Number.parseInt(v);
      return Number.isFinite(n) && n >= 0 ? n : 1;
    };

    const rowspan = parse(ph.attributes?.r ?? '1');
    const colspan = parse(ph.attributes?.c ?? '1');

    if (rowspan === 0 || colspan === 0) {
      return null;
    }

    return h(tag, { rowspan, colspan }, ph.children.map(phrasingToHast));
  }

  if (ph.name === 'e') {
    return null;
  }

  return h(tag, tc.children.map(phrasingToHast));
};

export const tableHandler: Handler = (_, node: Mdast.Table) => {
  const [head, ...body] = node.children;

  if (head == null) {
    throw TypeError('unexpected: `head` is undefined');
  }

  const ths = head.children
    .map((th) => tcHandler(th, 'th'))
    .filter((e) => e != null);

  const cond = ths.some((th) => th.children.length > 0);

  const thead = cond ? h('thead', h('tr', ths)) : null;

  const bodyTrs = body.map((row) => {
    const children = row.children
      .map((td) => tcHandler(td, 'td'))
      .filter((e) => e != null);

    return h('tr', children);
  });

  const tbody = h('tbody', bodyTrs);
  const table = h('table', thead ? [thead, tbody] : tbody);

  return h('div.table-container', table);
};
