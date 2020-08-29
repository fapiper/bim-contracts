// const pairs = {
//   projects: 'containerdb',
// };

const hashAndPack = async (account, db, data, method) => {
  const id = 'QmAwesomeIpfsHash';
  console.log('hashAndPack data', data);
  const hash = await db.put({
    _id: id,
    ...data,
  });
  await method().send({ from: account, gas: 2000000 });
  return hash;
};

// const packByHash = async (hash, db, method) => {
//   const id = 'QmAwesomeIpfsHash';
//   console.log('hashAndPack data', data);
//   const hash = await db.put({
//     _id: id,
//     ...data,
//   });
//   await method().call({ from: account });
//   return hash;
// };

export default {
  methods: {
    hashAndPack,
  },
};
