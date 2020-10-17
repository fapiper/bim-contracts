<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <div class="col-6">
        <bc-boq-table
          title="Leistungen"
          @assign="showAssignPrompt"
          :data="services"
          :loading="boqsLoading"
          :project="project._id"
          is-root
        />
      </div>
      <div class="col-6">
        <q-toolbar class="bg-primary text-white shadow-2">
          <q-toolbar-title>Akteure</q-toolbar-title>
          <q-btn flat round dense icon="add" @click="addActorsPrompt = true" />
        </q-toolbar>
        <q-list bordered>
          <q-item
            v-for="actor in project.actors"
            :key="actor.address"
            class="q-my-sm"
          >
            <q-item-section avatar>
              <q-avatar color="primary" text-color="white"> MM </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label>{{ actor.name }}</q-item-label>
              <q-item-label caption>{{ actor.address }}</q-item-label>
            </q-item-section>
            <q-item-section side v-if="actor.address === $auth.user().address">
              <q-item-label caption>Du</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
    <q-dialog v-model="assignPrompt">
      <q-card style="min-width: 450px">
        <q-card-section class="row items-center">
          <div class="text-h6">Auftragsvergabe</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <p>
            Geben Sie zur Auftragsvergabe
            <span class="text-weight-bold">{{
              selectedBoq && (selectedBoq.short_desc || selectedBoq.name)
            }}</span>
            bitte den gewünschten Auftragnehmer an:
          </p>
          <q-input
            filled
            dense
            placeholder="Adresse"
            hint="Blockchain Identität"
            v-model="assigneeAddress"
            autofocus
          />
        </q-card-section>

        <q-card-actions align="center">
          <q-btn
            unelevated
            class="full-width"
            color="primary"
            label="Auftrag vergeben"
            @click="assign"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="addActorsPrompt">
      <q-card style="min-width: 450px">
        <q-card-section class="row items-center">
          <div class="text-h6">Akteur hinzufügen</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <p>Geben Sie bitte die Adresse des neuen Akteurs ein:</p>
          <q-input
            filled
            dense
            placeholder="Adresse"
            hint="Blockchain Identität"
            v-model="actorId"
            autofocus
          />
        </q-card-section>
        <q-card-actions align="center">
          <q-btn
            unelevated
            class="full-width"
            color="primary"
            label="Akteur hinzufügen"
            @click="addActor"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import Assignment from 'src/models/assignment-model';

export default {
  name: 'PageProjectOverview',
  data() {
    return {
      actorsLoading: true,
      addActorsPrompt: false,
      actorId: '',
      selectedBoq: null,
      boqsLoading: true,
      assignPrompt: false,
      assigneeAddress: '',
      services: [],
    };
  },
  created() {
    this.loadBoqs();
  },
  computed: {
    project() {
      return this.$store.getters['project/project'];
    },
  },
  methods: {
    showAssignPrompt(service) {
      this.selectedBoq = service;
      this.assignPrompt = true;
    },
    async assign() {
      this.$q.loading.show();
      this.assignPrompt = false;
      try {
        const { privateKey, ...client } = this.$auth.user();
        const assignment = new Assignment(
          this.project.name,
          this.selectedBoq,
          client,
          { address: this.assigneeAddress }
        );
        await this.$services.assignment.assign(this.project._id, assignment);
        this.$q.notify({
          type: 'positive',
          message: `Der Auftrag wurde erfolgreich vergeben.`,
          position: 'bottom-right',
        });
      } catch (error) {
        console.error(error);
        this.$q.notify({
          type: 'negative',
          message: `Bei der Auftragsvergabe ist ein Fehler aufgetreten.`,
          position: 'bottom-right',
        });
      }
      this.$q.loading.hide();
    },
    async loadBoqs() {
      this.boqsLoading = true;
      this.services = await this.$services.boq.query(
        this.project._id,
        (item) => !item.parent
      );
      console.log('services', this.services);
      this.boqsLoading = false;
    },
    async addActor() {
      this.addActorsPrompt = false;
      this.$q.loading.show();
      try {
        const project = await this.$store.dispatch(
          'project/addActor',
          this.actorId
        );
        this.$q.notify({
          type: 'positive',
          message: `${this.actorId} erfolgreich hinzugefügt.`,
          position: 'bottom-right',
        });
        console.log('updated', project);
      } catch (error) {
        console.error(error);
        this.$q.notify({
          type: 'negative',
          message: `Ein Fehler ist aufgetreten.`,
          position: 'bottom-right',
        });
      }
      this.$q.loading.hide();
    },
  },
};
</script>
