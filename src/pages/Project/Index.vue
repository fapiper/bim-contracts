<template>
  <q-page padding>
    <div class="row q-col-gutter-y-md">
      <q-banner
        class="bg-grey-2 col-12"
        inline-actions
        v-if="newAssignments.length > 0"
      >
        <template v-slot:avatar>
          <q-icon name="assignment" />
        </template>
        Sie haben {{ newAssignments.length }} neue{{
          newAssignments.length > 1 ? ' Aufträge' : 'n Auftrag'
        }}
        <template v-slot:action>
          <q-btn flat label="Ansehen" />
        </template>
      </q-banner>
      <template v-if="actorsLoading">
        <q-spinner color="grey-6" size="3em" />
      </template>
      <template v-else>
        <div class="col-6">
          <q-toolbar class="bg-primary text-white shadow-2">
            <q-toolbar-title>Akteure</q-toolbar-title>
            <q-btn
              flat
              round
              dense
              icon="add"
              @click="addActorsPrompt = true"
            />
          </q-toolbar>
          <q-list bordered>
            <q-item
              v-for="actor in actors"
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
              <q-item-section
                side
                v-if="actor.address === $auth.user().address"
              >
                <q-item-label caption>Du</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </template>
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
            v-model="actorAddress"
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
      actors: [],
      addActorsPrompt: false,
      actorAddress: '',
    };
  },
  created() {
    this.loadActors();
  },
  computed: {
    project() {
      return this.$store.getters['project/project'];
    },
    newAssignments() {
      return this.$store.getters['project/newAssignments'];
    },
  },
  methods: {
    async loadActors() {
      this.actorsLoading = true;
      const users = await this.$services.user.getAll();
      this.actors = this.project.actor_addresses.map(
        (address) => users[address]
      );
      this.actorsLoading = false;
    },
    async addActor() {
      const users = await this.$services.user.getAll();
      if (users[this.actorAddress]) {
        await this.$services.project.addActor(
          this.project.hash,
          this.actorAddress
        );
      }
    },
  },
};
</script>
