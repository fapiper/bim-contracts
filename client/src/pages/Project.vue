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

    <q-dialog v-model="dialog" position="bottom" full-width>
      <q-card>
        <q-form>
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Bauprojekt hinzufügen</div>
            <q-btn
              label="Demoprojekt laden"
              color="primary"
              outline
              class="q-ml-sm"
              @click="useDemoProject"
            >
            </q-btn>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>
          <q-card-section class="q-pb-none"> </q-card-section>

          <q-card-section>
            <q-stepper
              v-model="step"
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
                :done="stepperDone.container"
              >
                <div class="q-gutter-md q-mt-md">
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
                        class="q-my-xs"
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
                            file.BillingModel.BillingUnit[0].ShortDescription
                              .span
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
                </div>
              </q-step>

              <q-step
                :name="2"
                title="Projekt Informationen hinzufügen"
                icon="settings"
                :done="stepperDone.info"
                :header-nav="stepperDone.container"
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
                :done="stepperDone.documents"
                :header-nav="stepperDone.info"
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

          <q-card-actions align="right" class="q-px-lg">
            <q-btn
              v-if="step > 1"
              flat
              @click="$refs.stepper.previous()"
              color="primary"
              label="Zurück"
              class="q-ml-lg"
            />
            <q-btn
              v-if="step < 4"
              @click="$refs.stepper.next()"
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
import xml2js from 'xml2js';

import BoQ from 'assets/demo/BillingModelShortSzenario2/Payload Documents/Leistungsverzeichnis_1.xml';
import BillingModel from 'assets/demo/BillingModelShortSzenario2/Payload Documents/BillingModel.xml';

import { abi as ProjectFactoryAbi } from '../contracts/ConstructionProjectFactory.json';
const ProjectFactoryAddress = '0x852543528aF03b706b2785dFd3103898Ed256eaD';

export default {
  name: 'PageProjectIndex',
  mounted() {
    this.contract.events.ConstructionProjectCreated().on('data', (event) => {
      console.log('created', event);
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
    stepperDone() {
      return {
        container:
          this.container.boqs.length > 0 &&
          this.container.billingModel !== null,
        info: this.project.name !== '',
        documents: this.project.documents.length > 0,
      };
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
      step: 1,
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
      const containerHash = this.$web3.utils.sha3(projectHash + created);

      const project = {
        hash: projectHash,
        containerHash,
        ownerAddress: this.address,
        ...this.project,
        created,
      };
      const container = {
        hash: containerHash,
        projectHash,
        ownerAddress: this.address,
        ...this.container,
        created,
      };
      await this.$db.$projects.put(project);
      await this.$db.$container.put(container);
      await this.contract.methods
        .createConstructionProject(projectHash)
        .send({ from: this.address, gas: 2000000 });
    },
    async loadProjects() {
      this.loading = true;
      console.log('address', this.address);
      try {
        const projects = await this.contract.methods
          .getProjectsByOwner(this.address)
          .call();
        console.log('got projects by owner', projects);
        this.projects = projects.map((p) => ({
          address: p,
        }));
      } catch (error) {
        console.error(error);
      }
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
        this.container.billingModel = await this.parser.parseStringPromise(
          reader.result
        );
        this.parser.reset();
        this.$refs.billingModel.loading = false;
      };
      reader.readAsText(file);
    },
    readBoQs(files) {
      const reader = new FileReader();
      reader.onload = async () => {
        this.$refs.boqs.loading = true;
        const boq = await this.parser.parseStringPromise(reader.result);
        this.parser.reset();
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
</style>
