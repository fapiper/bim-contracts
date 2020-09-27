<template>
  <q-page padding>
    <div class="row items-start q-gutter-md">
      <template v-for="assignment in assignments">
        <AssignmentCard
          class="assignment-card"
          v-if="assignment.service.short_desc"
          :key="assignment.hash"
          :assignment="assignment"
      /></template>
    </div>
  </q-page>
</template>

<script>
import AssignmentCard from 'components/AssignmentCard.vue';

export default {
  name: 'PageProjectAssignments',
  components: { AssignmentCard },
  data() {
    return {
      tab: 'one',
    };
  },
  computed: {
    assignments() {
      return this.$store.getters['project/assignments'];
    },
  },
  created() {
    this.loadAssignments();
  },
  methods: {
    async loadAssignments() {
      this.loading = true;
      // const project_hash = this.$route.params.project;
      // const user_address = this.$auth.user().address;
      // await this.$store.dispatch('project/loadAssignments', {
      //   project_hash,
      //   user_address,
      // });
      const assignments = await this.$services.assignment.getAll(
        this.$auth.user().address
      );
      console.log('got assignments', assignments);
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
