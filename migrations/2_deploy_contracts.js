/* eslint-disable no-undef */
const ServiceContractLib = artifacts.require('ServiceContractLib');
const ServiceContract = artifacts.require('ServiceContract');

module.exports = function (deployer) {
  deployer.deploy(ServiceContractLib);
  deployer.link(ServiceContractLib, ServiceContract);
  deployer.deploy(ServiceContract);
};
