/* eslint-disable no-undef */
const AgreementController = artifacts.require('AgreementController');

contract('AgreementController', (accounts) => {
  it('should put 10000 MetaCoin in the first account', async () => {
    const instance = await AgreementController.deployed();
    const agreements = instance.getAgreementsByClient.call(accounts[0]);
    console.log('agreements.length', agreements.length);
    assert.equal(agreements.length, 0, 'No Agreements detected');
  });
});
