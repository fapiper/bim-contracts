/* eslint-disable no-undef */
const ServiceContract = artifacts.require('ServiceContract');
const ServiceContractFactory = artifacts.require('ServiceContractFactory');

module.exports = async function (deployer) {
  await deployer.deploy(ServiceContract);
  const serviceContract = await ServiceContract.deployed();
  await deployer.deploy(ServiceContractFactory, serviceContract.address);
};
