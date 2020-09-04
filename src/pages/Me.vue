<template>
  <q-page padding>
    <h1 class="text-h3">Benutzerprofil</h1>
    <q-form class="q-gutter-md">
      <q-input filled v-model="user.balance" readonly label="Balance" />
    </q-form>
  </q-page>
</template>

<script>
export default {
  name: 'PageMe',
  async mounted() {
    const balance = await this.$web3.eth.getBalance(
      this.$auth.user().account.address
    );
    this.user.balance = this.$web3.utils.fromWei(balance);
  },
  computed: {},
  data() {
    return {
      user: {
        balance: 0,
      },
    };
  },
  methods: {},
};
</script>
<style lang="scss"></style>
