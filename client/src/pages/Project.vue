<template>
  <q-page padding>
    <h1 class="text-h3">Projektauswahl</h1>
    <div v-if="projects.length <= 0" class="text-center">
      <h4 class="text-subtitle1">
        Bislang sind noch keine Projekte vorhanden
      </h4>
    </div>
    <div class="row items-start q-gutter-md">
      <q-card
        v-for="(project, index) of projects"
        :key="index"
        class="project-card"
      >
        <q-card-section class="bg-grey-8 text-white">
          <div class="text-h5">Projekt {{ index + 1 }}</div>
          <div class="text-subtitle3">{{ project.address }}</div>
        </q-card-section>
        <q-separator />
        <q-card-actions align="left">
          <q-btn flat :to="'projects/' + project.address + '/boqs'"
            >Auswählen</q-btn
          >
        </q-card-actions>
      </q-card>
    </div>
    <q-page-sticky position="bottom" :offset="[18, 18]">
      <q-btn
        glossy
        label="Neues Projekt hinzufügen"
        fab
        color="primary"
        icon="add"
        @click="addProject"
      >
      </q-btn>
    </q-page-sticky>
  </q-page>
</template>

<script>
const PROJECT_CONTRACT_ADDRESS = '0x852543528aF03b706b2785dFd3103898Ed256eaD';

export default {
  name: 'PageProjectIndex',
  async mounted() {
    await this.init();
    this.loadProjects();
  },
  computed: {
    user() {
      return this.$auth.user();
    },
    account() {
      return this.$web3.eth.defaultAccount;
    },
  },
  data() {
    return {
      projects: [],
      contract: require('../contracts/ConstructionProjectFactory.json'),
      contractManager: {},
    };
  },
  methods: {
    async init() {
      this.contractManager = await new this.$web3.eth.Contract(
        this.contract.abi,
        PROJECT_CONTRACT_ADDRESS
      );
      const account = this.$web3.eth.accounts.privateKeyToAccount(
        '0x' + this.user.privateKey
      );
      this.$web3.eth.accounts.wallet.add(account);
      this.$web3.eth.defaultAccount = account.address;
      this.contractManager.events
        .ConstructionProjectCreated()
        .on('data', ({ returnValues: { contractAddress } }) => {
          console.log('created project', this.projects);
          this.projects.push({
            address: contractAddress,
          });
        });
    },
    async loadProjects() {
      const projects = await this.contractManager.methods
        .getProjectsByOwner(this.account)
        .call();
      console.log('got projects by owner', projects);
      this.projects = projects.map((p) => ({
        address: p,
      }));
    },
    async addProject() {
      // const account = this.$web3.eth.accounts.privateKeyToAccount(
      //   this.$auth.user().privateKey
      // );
      this.contractManager.methods
        .createConstructionProject()
        .send({ from: this.account, gas: 2000000 });
    },
  },
};
</script>
<style lang="scss">
.project-card {
  width: 100%;
  max-width: 420px;
  overflow: hidden;
}
</style>
