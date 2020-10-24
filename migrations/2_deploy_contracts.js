/* eslint-disable no-undef */
const AgreementController = artifacts.require('AgreementController');

module.exports = async function (deployer) {
  await deployer.deploy(AgreementController);
};
