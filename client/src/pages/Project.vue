<template>
  <q-page padding>
    <h1 class="text-h3">Bauprojekte</h1>
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
      <div class="row q-gutter-md">
        <q-card
          v-for="(project, index) of projects"
          :key="index"
          class="project-card"
          flat
          bordered
        >
          <q-card-section>
            <div class="row items-top no-wrap">
              <div class="col">
                <div class="text-h6 q-pb-md">{{ project.name }}</div>
              </div>

              <div class="col-auto">
                <q-chip dense square>
                  {{ formatDate(project.createdAt) }}
                </q-chip>
              </div>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-actions align="right" class="bg-grey-2">
            <q-btn dense color="primary" :to="'projects/' + project._id + '/'"
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
                v-model="project.contractor"
                label="Auftragnehmer"
                hint="Account Adresse"
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
import { date } from 'quasar';
import IcddParser from 'app/../utils/icdd.parser.js';

import BoQFile from 'assets/demo/BillingModelShortSzenario2/Payload Documents/Leistungsverzeichnis_1.xml';
import BillingModelFile from 'assets/demo/BillingModelShortSzenario2/Payload Documents/BillingModel.xml';

export default {
  name: 'PageProjectIndex',
  async mounted() {
    this.loadProjects();
  },
  computed: {
    projects() {
      return this.$store.getters['project/projects'];
    },
  },
  data() {
    return {
      loading: true,
      dialog: false,
      project: {
        name: '',
        contractor: '',
      },
      container: {
        boqs: [],
        billingModel: null,
      },
      projectdb: null,
    };
  },
  methods: {
    formatDate(timeStamp) {
      return (
        date.formatDate(timeStamp, 'DD.MM.YYYY') +
        ', ' +
        date.formatDate(timeStamp, 'HH:mm') +
        ' Uhr'
      );
    },
    useDemoProject() {
      this.project.name = 'Demoprojekt';
      this.container.boqs = [
        new File([BoQFile], 'Demo-Leistungsverzeichnis.x83'),
      ];
      this.container.billingModel = new File(
        [BillingModelFile],
        'Demo-BillingModel.xml'
      );
    },
    async loadProjects() {
      this.loading = true;
      this.$store.dispatch(
        'project/loadProjectsByUserAddress',
        this.$auth.user().address
      );
      this.loading = false;
    },
    async addProject() {
      this.$q.loading.show();
      const project = {
        name: this.project.name,
        actors: [this.$auth.user().address, this.project.contractor],
      };
      const container = await IcddParser.parseFromFiles(
        this.container.billingModel,
        this.container.boqs
      );
      try {
        await this.$store.dispatch('project/addProject', {
          project,
          container,
        });
        this.dialog = false;
        this.$q.notify({
          type: 'positive',
          message: `Das Bauprojekt ${this.project.name} wurde erfolgreich hinzugefügt`,
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
