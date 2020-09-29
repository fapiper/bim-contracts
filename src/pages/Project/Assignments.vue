<template>
  <q-page padding>
    <div class="row items-start q-gutter-md">
      <template v-for="assignment in assignments">
        <AssignmentCard
          class="assignment-card"
          :key="assignment.hash"
          :assignment="assignment"
          @assign="showDialog"
      /></template>
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
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import AssignmentCard from 'components/AssignmentCard.vue';

export default {
  name: 'PageProjectAssignments',
  components: { AssignmentCard },
  data() {
    return {
      prompt: false,
      selected: null,
      address: '',
    };
  },
  computed: {
    assignments() {
      return this.$store.getters['project/assignments'](
        this.$auth.user().address
      );
    },
  },
  created() {
    this.loadAssignments();
  },
  methods: {
    async loadAssignments() {
      this.loading = true;
      const project_hash = this.$route.params.project;
      await this.$store.dispatch('project/loadAssignments', project_hash);
      this.loading = false;
    },
    showDialog(service) {
      this.selected = service;
      this.prompt = true;
    },
    async assign() {
      this.$q.loading.show();
      this.prompt = false;
      try {
        const nodes = await this.$services.assignment.assign(
          this.$route.params.project,
          this.selected,
          this.$auth.user(),
          { address: this.address }
        );
        console.log('assigned', nodes);
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
<style lang="scss">
.assignment-card {
  width: 100%;
  // max-width: 800px;
  overflow: hidden;
}
</style>
