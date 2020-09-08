/* eslint-disable no-undef */
const ServiceFactory = artifacts.require('ServiceFactory');

module.exports = function (deployer) {
  deployer.deploy(ServiceFactory);
};
