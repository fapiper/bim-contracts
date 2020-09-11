const reduce = (keys, object) =>
  keys.split('.').reduce((props, key) => props && props[key], object);

class FlatTree {
  static build(tree, collection, { builders, parent, billing }) {
    for (const key in builders) {
      const _nodes = reduce(key, tree);
      if (_nodes) {
        const nodes = Array.isArray(_nodes) ? _nodes : Array.of(_nodes); // Fix: xml2js parser transforms arrays with one entry to object
        for (let i = 0; i < nodes.length; i++) {
          const node = builders[key](nodes[i]);
          collection[node.hash] = node;
          if (parent) {
            node.addParent(parent);
            collection[parent].children.push(node.hash);
          }
          if (billing) {
            const item = billing.items[node.hash];
            item && (node.billing_item = item);
          }
          this.build(nodes[i], collection, {
            builders,
            parent: node.hash,
            billing,
          });
        }
      }
    }
    return collection;
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
