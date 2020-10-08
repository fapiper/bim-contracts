<template>
  <q-page padding>
    <h2 class="text-h5 q-pb-sm">Benutzer</h2>
    <q-form class="q-gutter-md">
      <q-input filled v-model="user.name" readonly label="Name" />
      <q-input filled v-model="user.iban" readonly label="IBAN" />
      <q-input filled v-model="user.privateKey" readonly label="Private Key" />
    </q-form>
    <h2 class="text-h5 q-pb-sm">Account</h2>
    <q-form class="q-gutter-md">
      <q-input filled v-model="user.address" readonly label="Addresse" />
      <q-input filled v-model="account.balance" readonly label="Balance" />
    </q-form>
  </q-page>
</template>

<script>
export default {
  name: 'PageMe',
  async mounted() {
    const balance = await this.$web3.eth.getBalance(this.$auth.user().address);
    this.account.balance = this.$web3.utils.fromWei(balance);
  },
  computed: {
    user() {
      return this.$auth.user();
    },
  },
  data() {
    return {
      account: {
        balance: 0,
      },
    };
  },
  methods: {},
};
</script>
<style lang="scss"></style>
