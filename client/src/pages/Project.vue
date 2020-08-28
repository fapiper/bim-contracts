<template>
  <q-page padding>
    <q-banner inline-actions class="text-white bg-red" v-if="error">
      <template v-slot:avatar>
        <q-icon name="warning" color="white" />
      </template>

      Beim Laden der Projekte ist ein Fehler aufgetreten.
      <template v-slot:action>
        <q-btn
          flat
          color="white"
          label="Erneut versuchen"
          @click="loadProjects"
        />
      </template>
    </q-banner>

    <h1 class="text-h3">Projektauswahl</h1>
    <template v-if="loading">
      <div class="row justify-center">
        <q-spinner color="grey-6" size="3em" />
      </div>
    </template>

    <template v-else>
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
          label="Neues Bauprojekt hinzufügen"
          fab-mini
          color="primary"
          icon="add"
          @click="addProject"
        >
        </q-btn> </q-page-sticky
    ></template>
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
      error: false,
      loading: true,
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
      this.contractManager.events
        .ConstructionProjectCreated()
        .on('data', (event) => {
          console.log('created project', event);
          this.projects.push({
            address: event.returnValues.contractAddress,
          });
        });
    },
    async loadProjects() {
      console.log('load Projects');
      this.loading = true;
      try {
        const projects = await this.contractManager.methods
          .getProjectsByOwner(this.user.account.address)
          .call();
        this.projects = projects.map((p) => ({
          address: p,
        }));
        this.error = false;
      } catch (error) {
        console.error('Error loading projects', error);
        this.error = true;
      }
      this.loading = false;
    },
    async addProject() {
      try {
        await this.contractManager.methods
          .createConstructionProject()
          .send({ from: this.user.account.address, gas: 2000000 });
        this.$q.notify({
          type: 'positive',
          message: `Das Bauprojekt wurde erfolgreich hinzugefügt`,
          position: 'bottom-right',
        });
      } catch (error) {
        console.error('Error adding project', error);
        this.$q.notify({
          type: 'negative',
          message: `Beim Hinzufügen des Bauprojektes ist ein Fehler aufgetreten`,
          position: 'bottom-right',
        });
      }
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
