/* eslint-disable no-undef */
const ConstructionProject = artifacts.require('ConstructionProject');
const ConstructionProjectFactory = artifacts.require(
  'ConstructionProjectFactory'
);

module.exports = async function (deployer) {
  const constructionProject = await ConstructionProject.deployed();
  deployer.deploy(ConstructionProjectFactory, constructionProject.address);
};
