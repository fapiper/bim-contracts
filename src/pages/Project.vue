<template>
  <q-page padding>
    <h1 class="text-h3">Bauvorhaben</h1>
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
          flat
          bordered
        >
          <q-card-section>
            <div class="text-h5">{{ project.name }}</div>
            <div class="text-subtitle3">{{ project.designation }}</div>
          </q-card-section>
          <q-separator />
          <q-card-actions align="left" class="bg-grey-2">
            <q-btn flat :to="'projects/' + project.hash + '/boqs'"
              >Auswählen</q-btn
            >
          </q-card-actions>
        </q-card>
      </div>
      <q-page-sticky position="bottom" :offset="[18, 18]">
        <q-btn
          label="Neues Bauprojekt hinzufügen"
          fab-mini
          color="primary"
          icon="add"
          @click="dialog = true"
        >
        </q-btn> </q-page-sticky
    ></template>

    <q-dialog v-model="dialog" position="bottom">
      <q-card class="add-project-card">
        <q-form>
          <q-card-section class="row items-center">
            <div class="text-h6">Bauprojekt hinzufügen</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>
          <q-card-section>
            <div class="q-gutter-y-md">
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
              <q-file
                ref="boqs"
                filled
                use-chips
                counter
                append
                v-model="container.boqs"
                multiple
                label="Leistungsverzeichnisse"
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
                ref="billingModel"
                v-model="container.billingModel"
                label="Abrechnungsplan"
                use-chips
                counter
              >
                <template v-slot:before>
                  <q-icon name="account_balance" />
                </template>
                <template v-slot:append>
                  <q-btn round dense flat icon="add" @click.stop />
                </template>
              </q-file>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-actions align="right">
            <q-btn
              label="Demoprojekt laden"
              color="primary"
              outline
              class="q-mr-sm"
              @click="useDemoProject"
            >
            </q-btn>
            <q-btn
              @click="addProject"
              color="primary"
              label="Bauprojekt hinzufügen"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import IcddParser from 'src/utils/icdd-parser.js';
import Project from 'src/models/project-model.js';

import BoQ from 'assets/demo/BillingModelShortSzenario2/Payload Documents/Leistungsverzeichnis_1.xml';
import BillingModel from 'assets/demo/BillingModelShortSzenario2/Payload Documents/BillingModel.xml';

import { abi as ProjectFactoryAbi } from '../contracts/ConstructionProjectFactory.json';
const ProjectFactoryAddress = '0x852543528aF03b706b2785dFd3103898Ed256eaD';

export default {
  name: 'PageProjectIndex',
  async mounted() {
    this.projectdb = await this.$orbitdb.projectdb;
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
      },
      container: {
        boqs: [],
        billingModel: null,
      },
      contract: new this.$web3.eth.Contract(
        ProjectFactoryAbi,
        ProjectFactoryAddress
      ),
      projectdb: null,
    };
  },
  methods: {
    async send() {
      const project = new Project(
        this.project.name,
        this.project.designation,
        this.project.description,
        {
          name: 'Muster Bauherr',
          address: 0x0,
        },
        {
          name: 'Muster Generalunternehmer',
          address: this.address,
        },
        []
      );
      const { billing, boqs } = await IcddParser.parseFromFiles(
        this.container.billingModel,
        this.container.boqs
      );
      billing.assignProject(project);
      await this.$orbitdb.billingdb.put(billing);
      boqs.forEach(async (boq) => {
        boq.assignProject(project);
        await this.$orbitdb.boqdb.put(boq);
      });
      await this.projectdb.put(project);
      this.projects.push(project);
    },
    async loadProjects() {
      this.loading = true;
      await this.projectdb.load();
      this.projects = await this.projectdb.query(
        (e) => e.general_contractor.address === this.address
      );
      this.loading = false;
    },
    async addProject() {
      this.$q.loading.show();
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
      this.$q.loading.hide();
    },
    useDemoProject() {
      this.container.boqs = [new File([BoQ], 'Demo-Leistungsverzeichnis.xml')];
      this.container.billingModel = new File(
        [BillingModel],
        'Demo-BillingModel.xml'
      );
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

.add-project-card {
  width: 800px;
  max-width: 100% !important;
}
</style>
