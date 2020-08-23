const ConstructionProjectFactory = artifacts.require(
  'ConstructionProjectFactory'
);

module.exports = function (deployer) {
  deployer.deploy(ConstructionProjectFactory);
};
