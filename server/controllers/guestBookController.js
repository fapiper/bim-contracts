const guestBookArtifact = require('../../build/contracts/Guestbook.json');

const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:9545'));

exports.sign = async (req, res, next) => {
  try {
    const accounts = await web3.eth.getAccounts();
    const networkId = await web3.eth.net.getId();

    const guestBookContract = new web3.eth.Contract(
      guestBookArtifact.abi,
      guestBookArtifact.networks[networkId].address
    );

    const guestBook = await guestBookContract.methods
      .signBook(web3.utils.fromAscii('Test'))
      .send({ from: accounts[0] });

    res.json(guestBook);
  } catch (error) {
    next(error);
  }
};
