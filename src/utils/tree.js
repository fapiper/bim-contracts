export const flatten = function (_tree, collection, builders) {
  for (const props in builders) {
    const keys = props.split('.');
    const children = keys.reduce((tree, key) => tree && tree[key], _tree);
    if (children && Array.isArray(children)) {
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        // collection[child.id] = child;
        collection.push(builders[props](child));
        flatten(child, collection, builders);
      }
    }
  }
  return collection;
};
