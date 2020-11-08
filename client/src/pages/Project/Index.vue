<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <div class="col-6">
        <q-toolbar class="bg-primary text-white shadow-2">
          <q-toolbar-title>Leistungen</q-toolbar-title>
        </q-toolbar>
        <bc-boq-table
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
              <q-avatar color="primary" text-color="white" icon="person">
              </q-avatar>
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
export default {
  name: 'PageProjectOverview',
  data() {
    return {
      actorsLoading: true,
      addActorsPrompt: false,
      actorId: '',
      selectedBoq: null,
      boqsLoading: true,
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
    async loadBoqs() {
      this.boqsLoading = true;
      const servicedb = await this.$db.service(this.project._id);
      await servicedb.load();
      this.services = servicedb.query((s) => !s.parent);
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
