const reduce = (keys, object) =>
  keys.split('.').reduce((props, key) => props && props[key], object);

class TreeUtils {
  static async deepHandle(node, handleFn, once = true) {
    const children = node.children || [];
    for (const child of children) {
      if (once) {
        once = false;
        handleFn && (await handleFn(node, children));
      }
      await this.deepHandle(child, handleFn);
    }
    return node;
  }

  static async flatHandle(node, handleFn, collect = []) {
    const children = await handleFn(node);
    const _collect = await Promise.all(
      children.map((child) => this.flatHandle(child, handleFn, collect))
    );
    _collect.push(node);
    return _collect.flat();
  }

  static unflat(array) {
    const hashTable = Object.create(null);
    array.forEach((node) => (hashTable[node.hash] = { ...node, children: [] }));
    const tree = [];
    array.forEach((node) => {
      if (node.parent && hashTable[node.parent])
        hashTable[node.parent].children.push(hashTable[node.hash]);
      else tree.push(hashTable[node.hash]);
    });
    return tree;
  }

  static flat(
    tree,
    collection,
    { builders, parent, billing, links, selector = 'hash' }
  ) {
    const roots = [];
    for (const key in builders) {
      const _desc = reduce(key, tree);
      if (_desc) {
        const desc = Array.isArray(_desc) ? _desc : Array.of(_desc); // xml2js parser transforms arrays with one entry to object
        for (let i = 0; i < desc.length; i++) {
          const node = builders[key](desc[i]);
          collection[node[selector]] = node;
          if (parent) {
            node.parent = parent;
            collection[parent].children.push(node[selector]);
          } else {
            roots.push(node[selector]); // No parent exists. Node is root.
          }
          if (billing && links) {
            const ref = links.nodes[node.id];
            if (ref) {
              const item = billing.nodes[ref.link];
              item && (node.billing_item = item);
            }
          }
          this.flat(desc[i], collection, {
            builders,
            parent: node[selector],
            billing,
            links,
            selector,
          });
        }
      }
    }
    return { roots, nodes: collection };
  }
}

class FlatNode {
  constructor() {
    this.parent = null;
    this.children = [];
  }
}
module.exports = { TreeUtils, FlatNode };
