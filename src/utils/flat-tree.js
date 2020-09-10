class FlatTree {
  static build(_tree, collection, builders, parent) {
    for (const props in builders) {
      const keys = props.split('.');
      let children = keys.reduce((tree, key) => tree && tree[key], _tree);
      if (children) {
        if (!Array.isArray(children)) children = [children]; // Fix: xml2js parser transforms arrays with one entry to object
        for (let i = 0; i < children.length; i++) {
          const child = builders[props](children[i]);
          collection[child.hash] = child;
          if (parent) {
            child.addParent(parent);
            collection[parent].children.push(child.hash);
          }
          this.build(children[i], collection, builders, child.hash);
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
