const reduce = (keys, object) =>
  keys.split('.').reduce((props, key) => props && props[key], object);

class TreeUtils {
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
