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
          @click="openDialog"
        >
        </q-btn> </q-page-sticky
    ></template>

    <q-dialog v-model="dialog" position="bottom">
      <q-card style="width: 800px; max-width: 92vw;">
        <q-form>
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Bauprojekt hinzufügen</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>
          <q-card-section>
            <q-stepper
              v-model="stepper.step"
              header-nav
              ref="stepper"
              color="primary"
              flat
              vertical
            >
              <q-step
                :name="1"
                title="Name"
                icon="settings"
                :done="project.name !== ''"
              >
                <q-input
                  class="q-mt-md"
                  filled
                  v-model="project.name"
                  label="Name"
                  hint="Der Name des Bauprojektes"
                  lazy-rules
                  :rules="[
                    (val) =>
                      (val && val.length > 0) ||
                      'Ein Name muss angegeben werden',
                  ]"
                />
              </q-step>

              <q-step
                :name="2"
                title="Smart Contracts Container hochladen"
                icon="view_compact"
                :done="typeof project.scc.name == 'string'"
              >
                <q-file
                  class="q-mt-md"
                  filled
                  bottom-slots
                  v-model="project.scc"
                  label="Datei hier ablegen"
                  counter
                >
                  <template v-slot:before>
                    <q-icon name="attach_file" />
                  </template>

                  <template v-slot:append>
                    <q-btn round dense flat icon="add" @click.stop />
                  </template>
                </q-file>
              </q-step>

              <q-step
                :name="3"
                title="Vertragsrelevante Dokumente hinterlegen"
                caption="Optional"
                icon="gavel"
                :done="project.documents.length > 0"
              >
                <q-file
                  class="q-mt-md"
                  filled
                  bottom-slots
                  v-model="project.documents"
                  multiple
                  append
                  label="Dateien hier ablegen"
                  counter
                  use-chips
                >
                  <template v-slot:before>
                    <q-icon name="attach_file" />
                  </template>

                  <template v-slot:append>
                    <q-btn round dense flat icon="add" @click.stop />
                  </template>
                </q-file>
              </q-step>
              <q-step
                :name="4"
                title="Bauprojekt hinzufügen"
                icon="view_compact"
              >
                <p>Folgendes Bauprojekt wird hinzugefügt:</p>
                <q-field filled label="Name" stack-label readonly>
                  <template v-slot:control>
                    <div class="self-center full-width no-outline" tabindex="0">
                      {{ project.name }}
                    </div>
                  </template>
                </q-field>

                <q-btn
                  class="q-mt-md full-width"
                  @click="addProject"
                  color="primary"
                  label="Bauprojekt hinzufügen"
                />
              </q-step>
            </q-stepper>
          </q-card-section>

          <q-separator />

          <q-card-actions>
            <q-btn
              v-if="stepper.step < 4"
              @click="stepper.step++"
              color="primary"
              label="Weiter"
            />
            <q-btn
              v-if="stepper.step > 1"
              flat
              @click="stepper.step--"
              color="primary"
              label="Zurück"
              class="q-ml-sm"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
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
  },
  data() {
    return {
      error: false,
      loading: true,
      dialog: false,
      projects: [],
      project: {
        name: '',
        scc: null,
        documents: [],
      },
      contract: require('../contracts/ConstructionProjectFactory.json'),
      contractManager: {},
      stepper: {
        step: 1,
        done1: false,
        done2: false,
        done3: false,
      },
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
      console.log('add project');
      const file = this.project.scc;
      try {
        // await this.contractManager.methods
        //   .createConstructionProject()
        //   .send({ from: this.user.account.address, gas: 2000000 });
        const reader = new FileReader();
        reader.addEventListener('loadend', async (e) => {
          const doc = reader.result;
          console.log('reader result', doc);
          const hash = await this.$orbit.containerdb.put({
            _id: 'QmAwesomeIpfsHash',
            name: 'shamb0t',
            followers: 500,
          });
          // const hash = await this.$orbit.containerdb.put(doc);
          console.log('hash', hash);
        });
        reader.readAsText(file);

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
    openDialog() {
      this.dialog = true;
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
