/* eslint-disable no-undef */
const ServiceAgreement = artifacts.require('ServiceAgreement');
const ServiceAgreementFactory = artifacts.require('ServiceAgreementFactory');

module.exports = async function (deployer) {
  const serviceAgreement = await ServiceAgreement.deployed();
  await deployer.deploy(ServiceAgreementFactory, serviceAgreement.address);
};
