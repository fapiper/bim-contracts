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
    return {
      tab: 'one',
    };
  },
  computed: {
    awards() {
      return this.$store.getters['project/awards'](this.$auth.user().address);
    },
  },
  created() {
    this.loadAssignments();
  },
  methods: {
    async loadAssignments() {
      this.loading = true;
      const project_hash = this.$route.params.project;
      // const user_address = this.$auth.user().address;
      await this.$store.dispatch('project/loadAssignments', project_hash);
      // const assignments = await this.$services.assignment.getAll(
      //   this.$auth.user().address
      // );
      // console.log('got assignments', assignments);
      this.loading = false;
    },
  },
};
</script>
