const reduce = (keys, object) =>
  keys.split('.').reduce((props, key) => props && props[key], object);

class FlatTree {
  static from(tree, collection) {
    return tree.map((hash) => {
      const node = collection[hash];
      const children = FlatTree.from(node.children, collection);
      return { ...node, children };
    });
  }

  static build(tree, collection, { builders, parent, billing }) {
    const children = [];
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
          } else {
            children.push(node.hash); // No parent exists. Node is root.
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
    return { children, items: collection };
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
