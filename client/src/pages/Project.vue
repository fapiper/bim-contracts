<template>
  <q-page padding>
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
          @click="dialog = true"
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
          <q-card-section class="q-pb-none">
            <q-btn
              label="Demoprojekt hinzufügen"
              color="primary"
              @click="useDemoProject"
            >
            </q-btn>
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
                title="BIM Contracts Container initialisieren"
                icon="create_new_folder"
                :done="project.boqs.length > 0"
              >
                <div class="q-gutter-md q-mt-md">
                  <q-file
                    filled
                    bottom-slots
                    @input="readBoQs"
                    v-model="boqs"
                    multiple
                    append
                    label="Leistungsverzeichnisse"
                    counter
                    use-chips
                  >
                    <template v-slot:before>
                      <q-icon name="assignment" />
                    </template>

                    <template v-slot:append>
                      <q-btn round dense flat icon="add" @click.stop />
                    </template>
                  </q-file>
                  <q-file
                    filled
                    bottom-slots
                    @input="readBillingModel"
                    v-model="billingModel"
                    label="Abrechnungsplan"
                    counter
                    use-chips
                  >
                    <template v-slot:before>
                      <q-icon name="account_balance" />
                    </template>

                    <template v-slot:append>
                      <q-btn round dense flat icon="add" @click.stop />
                    </template>
                  </q-file>
                </div>
              </q-step>

              <q-step
                :name="2"
                title="Name"
                icon="settings"
                :done="project.name !== ''"
              >
                <div class="q-gutter-md q-mt-md">
                  <q-input filled v-model="project.name" label="Name" />
                  <q-input
                    filled
                    v-model="project.designation"
                    label="Bezeichnung"
                  />
                  <q-input
                    filled
                    v-model="project.decription"
                    label="Beschreibung"
                    type="textarea"
                  />
                </div>
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
                    <q-icon name="description" />
                  </template>

                  <template v-slot:append>
                    <q-btn round dense flat icon="add" @click.stop />
                  </template>
                </q-file>
              </q-step>
              <q-step :name="4" title="Bauprojekt hinzufügen" icon="done_all">
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

          <q-card-actions align="center">
            <q-btn
              :style="{ visibility: stepper.step > 1 ? 'visible' : 'hidden' }"
              flat
              @click="stepper.step--"
              color="primary"
              label="Zurück"
              class="q-ml-sm"
            />
            <q-btn
              :style="{ visibility: stepper.step < 4 ? 'visible' : 'hidden' }"
              @click="stepper.step++"
              color="primary"
              label="Weiter"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { xml2js } from 'xml-js';

import { abi as ProjectFactoryAbi } from '../contracts/ConstructionProjectFactory.json';
const ProjectFactoryAddress = '0x852543528aF03b706b2785dFd3103898Ed256eaD';

export default {
  name: 'PageProjectIndex',
  mounted() {
    this.contract.events.ConstructionProjectCreated().on('data', (event) => {
      this.projects.push({
        address: event.returnValues.contractAddress,
      });
    });
    this.loadProjects();
  },
  computed: {
    address() {
      return this.$auth.user().account.address;
    },
  },
  data() {
    return {
      loading: true,
      dialog: false,
      projects: [],
      project: {
        name: '',
        designation: '',
        description: '',
        boqs: [],
        billingModel: null,
        documents: [],
      },
      contract: new this.$web3.eth.Contract(
        ProjectFactoryAbi,
        ProjectFactoryAddress
      ),
      stepper: {
        step: 1,
      },
      boqs: [],
      billingModel: null,
    };
  },
  methods: {
    async send() {
      const data = {
        ...this.project,
        created: new Date().toJSON(),
      };
      const res = await this.contract.methods
        .createConstructionProject()
        .send({ from: this.address, gas: 2000000 });
      data.address =
        res.events.ConstructionProjectCreated.returnValues.contractAddress;
      await this.$orbit.projectdb.put(data);
    },
    async loadProjects() {
      this.loading = true;
      const projects = await this.contract.methods
        .getProjectsByOwner(this.address)
        .call();
      this.projects = projects.map((p) => ({
        address: p,
      }));
      this.loading = false;
    },
    async addProject() {
      try {
        await this.send();
        this.dialog = false;
        this.$q.notify({
          type: 'positive',
          message: `Das Bauprojekt wurde erfolgreich hinzugefügt`,
          position: 'bottom-right',
        });
      } catch (error) {
        console.error(error);
        this.$q.notify({
          type: 'negative',
          message: `Beim Hinzufügen des Bauprojektes ist ein Fehler aufgetreten`,
          position: 'bottom-right',
        });
      }
    },
    useDemoProject() {
      console.log('demo is not supported');
    },
    readBillingModel(file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.project.billingModel = xml2js(reader.result, {
          compact: true,
        });
      };
      reader.readAsText(file);
    },
    readBoQs(files) {
      const reader = new FileReader();
      reader.onload = () => {
        const boq = xml2js(reader.result, { compact: true });
        this.project.boqs.push(boq);
        this.project.name = boq.GAEB.PrjInfo.NamePrj._text;
        this.project.designation = boq.GAEB.PrjInfo.LblPrj._text;
      };
      Object.keys(files).forEach((i) => {
        reader.readAsText(files[i]);
      });
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
