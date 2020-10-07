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
    return { awards: [] };
  },
  mounted() {
    this.loadAwards();
  },
  methods: {
    async loadAwards() {
      this.loading = true;
      const project_hash = this.$route.params.project;
      this.awards = await this.$services.assignment.getAwardsByProject(
        project_hash,
        this.$auth.user().address
      );
      this.loading = false;
    },
  },
};
</script>
