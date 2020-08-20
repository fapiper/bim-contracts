<template>
  <q-page padding>
    <h1 class="text-h3">Projektauswahl</h1>
    <div v-if="projects.length <= 0" class="text-center">
      <h4 class="text-subtitle1">
        Bislang sind noch keine Projekte vorhanden
      </h4>
    </div>
    <div class="row items-start q-gutter-md">
      <q-card v-for="project of projects" :key="project" class="project-card">
        <q-card-section class="bg-grey-8 text-white">
          <div class="text-h5">Projekt {{ project }}</div>
          <div class="text-subtitle3">von John Doe</div>
        </q-card-section>
        <q-separator />
        <q-card-actions align="left">
          <q-btn flat>Action 1</q-btn>
          <q-btn flat>Action 2</q-btn>
        </q-card-actions>
      </q-card>
    </div>
    <q-page-sticky position="bottom" :offset="[18, 18]">
      <q-btn
        glossy
        label="Neues Projekt hinzufügen"
        fab
        color="primary"
        icon="add"
      >
      </q-btn>
    </q-page-sticky>
  </q-page>
</template>

<script>
export default {
  name: 'PageProjectIndex',
  mounted() {
    console.log('this.$web3', this.$web3);
  },
  data() {
    return {
      projects: [],
    };
  },
};
</script>
<style lang="scss">
.project-card {
  width: 100%;
  max-width: 420px;
}
</style>
