const reduce = (keys, object) =>
  keys.split('.').reduce((props, key) => props && props[key], object);

class FlatTree {
  static build(
    tree,
    collection,
    { builders, parent, billing, selector = 'hash' }
  ) {
    const roots = [];
    for (const key in builders) {
      const _desc = reduce(key, tree);
      if (_desc) {
        const desc = Array.isArray(_desc) ? _desc : Array.of(_desc); // Fix: xml2js parser transforms arrays with one entry to object
        for (let i = 0; i < desc.length; i++) {
          const node = builders[key](desc[i]);
          collection[node[selector]] = node;
          if (parent) {
            node.addParent(parent);
            collection[parent].children.push(node[selector]);
          } else {
            roots.push(node[selector]); // No parent exists. Node is root.
          }
          if (billing) {
            const item = billing.nodes[node.id];
            item && (node.billing_item = item);
          }
          this.build(desc[i], collection, {
            builders,
            parent: node[selector],
            billing,
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
    this.children = [];
    this.parent = null;
  }

  addChild(child) {
    this.children.push(child);
  }

  addParent(parent) {
    this.parent = parent;
  }
}

module.exports = { FlatTree, FlatNode };
