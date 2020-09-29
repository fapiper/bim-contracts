<template>
  <q-page padding>
    <div class="row items-start q-gutter-md">
      <template v-for="award in awards">
        <AssignmentCard
          class="assignment-card"
          :key="award.hash"
          :assignment="award"
      /></template>
    </div>
  </q-page>
</template>

<script>
import AssignmentCard from 'components/AssignmentCard.vue';

export default {
  name: 'PageProjectAwards',
  components: { AssignmentCard },
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
<style lang="scss">
.assignment-card {
  width: 100%;
  // max-width: 800px;
  overflow: hidden;
}
</style>
