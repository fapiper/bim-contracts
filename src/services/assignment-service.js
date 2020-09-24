const flatHandle = async (node, handleFn) => {
  const children = await handleFn(node);
  return children.length > 0
    ? Promise.all(
        children.map((child) => flatHandle(child, handleFn))
      ).then((res) => res.flat())
    : node;
};

class AssignmentService {
  constructor(boqService) {
    this.boqService = boqService;
  }

  assign(project_hash, service) {
    const handleFn = async (node) => {
      const children = await this.boqService.query(project_hash, (item) =>
        node.children.some((hash) => item.hash === hash)
      );
      node.status = 1;
      return children.map((child) => (child.status = 1) && child);
    };

    return flatHandle(service, handleFn);
  }
}

export default AssignmentService;

// const flatTransition = async (hash, transitionFn) => {
//   const node = await transitionFn(hash);
//   return node.children.length > 0
//     ? Promise.all(
//         node.children.map(
//           async (child) => await flatTransition(child, transitionFn)
//         )
//       ).then((res) => res.flat())
//     : node.hash;
// };

// class AssignmentService {
//   constructor(boqService) {
//     this.boqService = boqService;
//   }

//   async assign(project_hash, node) {
//     const transitionFn = async (child) => {
//       const nodes = await this.boqService.get(project_hash, child);
//       const item = nodes[0];
//       item.status = 1;
//       return item;
//     };
//     const assigned = await flatTransition(node.hash, transitionFn);
//     // console.log('assigned', assigned);
//     return assigned;
//   }
// }

// export default AssignmentService;
