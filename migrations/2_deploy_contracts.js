/* eslint-disable no-undef */
const ServiceAgreement = artifacts.require('ServiceAgreement');

module.exports = async function (deployer) {
  await deployer.deploy(ServiceAgreement);
};
