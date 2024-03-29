<template>
  <q-page padding>
    <template v-if="loading">
      <div class="row justify-center">
        <q-spinner color="grey-6" size="3em" />
      </div>
    </template>
    <template v-else>
      <div class="row items-start q-gutter-md">
        <ServiceContractCard
          v-for="assignment in assignments"
          class="full-width"
          :key="assignment.hash"
          :contract="assignment"
          type="assignment"
          @assign="showDialog"
        />
      </div>
      <q-dialog v-model="prompt">
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
                selected && (selected.short_desc || selected.name)
              }}</span>
              bitte den gewünschten Auftragnehmer an:
            </p>
            <q-input
              filled
              dense
              placeholder="Adresse"
              hint="Blockchain Identität"
              v-model="address"
              autofocus
              @keyup.enter="prompt = false"
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
        </q-card> </q-dialog
    ></template>
  </q-page>
</template>

<script>
import ServiceContractCard from 'components/ServiceContractCard.vue';

export default {
  name: 'PageProjectAssignments',
  components: { ServiceContractCard },
  data() {
    return {
      loading: true,
      assignments: [],
      prompt: false,
      selected: null,
      address: '',
    };
  },
  mounted() {
    this.loadAssignments();
  },
  methods: {
    async loadAssignments() {
      try {
        this.loading = true;
        const projectId = this.$route.params.project;
        this.assignments = await this.$db.agreement.getAssignmentsByProject(
          projectId,
          this.$auth.user().address
        );
        this.loading = false;
      } catch (error) {
        console.error(error);
      }
    },
    showDialog(service) {
      this.selected = service;
      this.prompt = true;
    },
    async assign() {
      this.$q.loading.show();
      this.prompt = false;
      try {
        await this.$db.agreement.create({
          services: [this.selected],
          client: this.$auth.user().address,
          contractor: this.address,
          createdAt: new Date().toJSON(),
        });
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
  },
};
</script>
