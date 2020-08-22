<template>
  <q-page padding>
    <h1 class="text-h3">Projektauswahl</h1>
    <div v-if="projectLength <= 0" class="text-center">
      <h4 class="text-subtitle1">
        Bislang sind noch keine Projekte vorhanden
      </h4>
    </div>
    <div class="row items-start q-gutter-md">
      <q-card
        v-for="project in projectLength"
        :key="project"
        class="project-card"
      >
        <q-card-section class="bg-grey-8 text-white">
          <div class="text-h5">Projekt {{ project }}</div>
          <div class="text-subtitle3">von John Doe</div>
        </q-card-section>
        <q-separator />
        <q-card-actions align="left">
          <q-btn flat>Action 1</q-btn>
          <q-btn flat>Action 2</q-btn>
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
  mounted() {
    this.init();
    this.loadProjects();
  },
  data() {
    return {
      projects: [],
      projectLength: 0,
      contract: require('../../contracts/ContractManager.json'),
      contractManager: {},
    };
  },
  methods: {
    async init() {
      this.contractManager = await new this.$web3.eth.Contract(
        this.contract.abi,
        PROJECT_CONTRACT_ADDRESS
      );
      const length = await this.contractManager.methods
        .getProjectsLength()
        .call();
      this.projectLength = parseInt(length, 10);
      this.contractManager.events
        .ConstructionProjectCreated()
        .on('data', ({ returnValues: { index } }) => {
          console.log('projects length', index);
          this.projectLength = parseInt(index, 10);
        });
    },
    loadProjects() {},
    async addProject() {
      const accounts = await this.$web3.eth.getAccounts();
      console.log('Accounts', accounts);
      await this.contractManager.methods
        .registerGeneralContractor()
        .send({ from: accounts[0] });
      this.contractManager.methods
        .createConstructionProject()
        .send({ from: accounts[0] });
    },
  },
};
</script>
<style lang="scss">
.project-card {
  width: 100%;
  max-width: 420px;
}
</style>
