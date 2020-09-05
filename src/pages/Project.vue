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
            <div class="text-h5">{{ project.name }}</div>
            <div class="text-subtitle3">{{ project.designation }}</div>
          </q-card-section>
          <q-separator />
          <q-card-actions align="left">
            <q-btn flat :to="'projects/' + project.hash + '/boqs'"
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
                @input="readBoQs"
                :value="container.boqs"
                multiple
                label="Leistungsverzeichnisse"
              >
                <template v-slot:before>
                  <q-icon name="assignment" />
                </template>
                <template v-slot:file="{ index, file }">
                  <q-chip
                    removable
                    size="sm"
                    @remove="container.boqs.splice(index + 1, 1)"
                  >
                    <div class="ellipsis relative-position">
                      {{ file.GAEB.Award.BoQ.BoQInfo.Name }}
                    </div>
                  </q-chip>
                </template>
                <template v-slot:append>
                  <q-btn round dense flat icon="add" @click.stop />
                </template>
              </q-file>
              <q-file
                filled
                ref="billingModel"
                @input="readBillingModel"
                :value="container.billingModel"
                label="Abrechnungsplan"
              >
                <template v-slot:before>
                  <q-icon name="account_balance" />
                </template>
                <template v-slot:file="{ index, file }">
                  <q-chip
                    removable
                    size="sm"
                    class="q-my-xs"
                    @remove="container.billingModel = null"
                  >
                    <div class="ellipsis relative-position">
                      {{
                        file.BillingModel.BillingUnit[0].ShortDescription.span
                      }}
                      und
                      {{ file.BillingModel.BillingUnit.length - 1 }} weitere
                    </div>
                  </q-chip>
                </template>

                <template v-slot:append>
                  <q-btn round dense flat icon="add" @click.stop />
                </template>
              </q-file>
              <q-file
                class="q-mt-md"
                filled
                bottom-slots
                v-model="project.documents"
                multiple
                append
                label="Dateien hier ablegen"
                use-chips
              >
                <template v-slot:before>
                  <q-icon name="description" />
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
import xml2js from 'xml2js';

import BoQ from 'assets/demo/BillingModelShortSzenario2/Payload Documents/Leistungsverzeichnis_1.xml';
import BillingModel from 'assets/demo/BillingModelShortSzenario2/Payload Documents/BillingModel.xml';

import { abi as ProjectFactoryAbi } from '../contracts/ConstructionProjectFactory.json';
const ProjectFactoryAddress = '0x852543528aF03b706b2785dFd3103898Ed256eaD';

export default {
  name: 'PageProjectIndex',
  mounted() {
    this.contract.events.ConstructionProjectCreated().on('data', (event) => {
      this.projects.push({
        address: event.returnValues.project,
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
        documents: [],
      },
      container: {
        boqs: [],
        billingModel: null,
      },
      contract: new this.$web3.eth.Contract(
        ProjectFactoryAbi,
        ProjectFactoryAddress
      ),
      parser: new xml2js.Parser({
        explicitArray: false,
        async: true,
      }),
    };
  },
  methods: {
    async send() {
      const created = new Date().toJSON();
      const projectHash = this.$web3.utils.sha3(this.project.name + created);

      const project = {
        hash: projectHash,
        building_contractor: {
          name: 'Example Name',
          address: '0x1234567890',
        },
        general_contractor: {
          address: this.address,
          name: this.$auth.user().name,
        },
        sub_contractors: [],
        ...this.project,
        created,
      };
      const orbitdb = await this.$orbitdb.load();
      await orbitdb.$projectdb.put(project);
      await this.contract.methods
        .createConstructionProject(projectHash)
        .send({ from: this.address, gas: 2000000 });
      this.projects.push(project);
    },
    async loadProjects() {
      this.loading = true;
      const orbitdb = await this.$orbitdb.load();
      this.projects = await orbitdb.$projectdb.query(
        (e) => e.general_contractor.address === this.address
      );
      console.log('projects', this.projects);
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
      this.container.billingModel = BillingModel;
      this.container.boqs = [BoQ];
    },
    readBillingModel(file) {
      this.$refs.billingModel.loading = true;
      const reader = new FileReader();
      reader.onload = async () => {
        const parser = new xml2js.Parser({
          explicitArray: false,
          async: true,
        });
        this.container.billingModel = await parser.parseStringPromise(
          reader.result
        );
        this.$refs.billingModel.loading = false;
      };
      reader.readAsText(file);
    },
    readBoQs(files) {
      const reader = new FileReader();
      reader.onload = async () => {
        this.$refs.boqs.loading = true;
        const parser = new xml2js.Parser({
          explicitArray: false,
          async: true,
        });
        const boq = await parser.parseStringPromise(reader.result);
        this.container.boqs.push(boq);
        this.project.name = boq.GAEB.PrjInfo.NamePrj;
        this.project.designation = boq.GAEB.PrjInfo.LblPrj;
        this.$refs.boqs.loading = false;
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

.add-project-card {
  width: 800px;
  max-width: 100% !important;
}
</style>
