/* eslint-disable no-undef */
const StateMachine = artifacts.require('StateMachine');
const ServiceRoles = artifacts.require('ServiceRoles');
const ServiceStorage = artifacts.require('ServiceStorage');
const ServiceAgreement = artifacts.require('ServiceAgreement');

const AgreementController = artifacts.require('AgreementController');

module.exports = async function (deployer) {
  await deployer.deploy(StateMachine);
  await deployer.deploy(ServiceRoles);
  await deployer.deploy(ServiceStorage);
  await deployer.deploy(ServiceAgreement);
  await deployer.deploy(AgreementController);
};
