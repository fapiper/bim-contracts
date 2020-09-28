<template>
  <q-card flat bordered>
    <template v-if="loading">Lädt</template>
    <template v-else>
      <q-card-section>
        <pre>{{ service }}</pre>
        <div class="text-overline">
          {{ service.short_desc || service.name }}
        </div>
        <div class="text-h5 q-mt-sm q-mb-xs">
          {{ service.short_desc || service.name }}
        </div>
      </q-card-section>

      <q-card-actions>
        <q-btn flat color="primary" label="Nächste Phase" @click="next" />
        <q-btn flat label="Vergeben" @click="assign" />

        <q-space />
        <q-btn
          color="grey"
          round
          flat
          dense
          :icon="expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
          @click="expanded = !expanded"
        />
      </q-card-actions>

      <q-slide-transition>
        <div v-show="expanded">
          <q-separator />
          <q-card-section>
            <q-separator />
          </q-card-section>
        </div>
      </q-slide-transition>
    </template>
  </q-card>
</template>

<script>
export default {
  name: 'ComponentAssignmentCard',
  data() {
    return {
      loading: true,
      tab: 'info',
      expanded: false,
      client: null,
      contractor: null,
      service: null,
    };
  },
  async mounted() {
    this.loading = true;
    await this.loadAssignment();
    this.loading = false;
  },
  computed: {
    project() {
      return this.$store.getters['project/project'];
    },
  },
  props: {
    assignment: null,
  },
  methods: {
    async loadAssignment() {
      this.client = await this.$services.user.get(
        this.assignment.client_address
      );
      console.log('got client', this.client);
      this.contractor = await this.$services.user.get(
        this.assignment.contractor_address
      );
      console.log('got contractor', this.contractor);

      const services = await this.$services.boq.get(
        this.project.hash,
        this.assignment.service.hash
      );
      this.service = services[0];
      console.log('got service', this.service);
      return true;
    },
    assign() {},
    next() {
      this.$services.assignment.nextStage(this.assignment);
    },
  },
};
</script>
