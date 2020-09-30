<template>
  <q-page padding>
    <div class="row items-start q-gutter-md">
      <ServiceContractCard
        v-for="award in awards"
        class="full-width"
        :key="award.hash"
        :contract="award"
        type="award"
      />
    </div>
  </q-page>
</template>

<script>
import ServiceContractCard from 'components/ServiceContractCard.vue';

export default {
  name: 'PageProjectAwards',
  components: { ServiceContractCard },
  data() {
    return {};
  },
  computed: {
    awards() {
      return this.$store.getters['project/awards'](this.$auth.user().address);
    },
  },
  created() {
    this.loadAwards();
  },
  methods: {
    async loadAwards() {
      this.loading = true;
      const project_hash = this.$route.params.project;
      await this.$store.dispatch('project/loadAssignments', project_hash);
      this.loading = false;
    },
  },
};
</script>
