const reduce = (keys, object) =>
  keys.split('.').reduce((props, key) => props && props[key], object);

class FlatTree {
  static build(tree, collection, { builders, parent, billing }) {
    const roots = [];
    for (const key in builders) {
      const _desc = reduce(key, tree);
      if (_desc) {
        const desc = Array.isArray(_desc) ? _desc : Array.of(_desc); // Fix: xml2js parser transforms arrays with one entry to object
        for (let i = 0; i < desc.length; i++) {
          const node = builders[key](desc[i]);
          collection[node.hash] = node;
          if (parent) {
            node.addParent(parent);
            collection[parent].children.push(node.hash);
          } else {
            roots.push(node.hash); // No parent exists. Node is root.
          }
          if (billing) {
            const item = billing.nodes[node.hash];
            item && (node.billing_item = item);
          }
          this.build(desc[i], collection, {
            builders,
            parent: node.hash,
            billing,
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

export { FlatTree, FlatNode };
