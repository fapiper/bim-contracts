/* eslint-disable no-undef */
const ServiceContractLib = artifacts.require('ServiceContractLib');
const ServiceContract = artifacts.require('ServiceContract');

module.exports = async function (deployer) {
  await deployer.deploy(ServiceContractLib);
  await deployer.link(ServiceContractLib, ServiceContract);
  await deployer.deploy(ServiceContract);
};
