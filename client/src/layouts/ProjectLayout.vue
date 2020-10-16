<template>
  <q-page>
    <template v-if="loading">
      <div class="row justify-center q-pa-md">
        <q-spinner color="grey-6" size="3em" />
      </div>
    </template>
    <template v-else>
      <q-toolbar class="bg-grey-2">
        <q-toolbar-title> {{ project.name }} </q-toolbar-title>
        <q-space />
        <q-tabs shrink>
          <q-route-tab
            label="Übersicht"
            :to="'/projects/' + project._id"
            exact
          />
          <q-route-tab
            label="Auftragsbearbeitung"
            :to="'/projects/' + project._id + '/assignments'"
            exact
          >
            <!-- <q-badge color="red" floating>{{ newAssignments.length }}</q-badge> -->
          </q-route-tab>
          <q-route-tab
            label="Auftragsvergabe"
            :to="'/projects/' + project._id + '/awards'"
            exact
          />
        </q-tabs>
      </q-toolbar>
      <div class="q-pa-md q-gutter-sm">
        <q-breadcrumbs gutter="sm">
          <q-breadcrumbs-el to="/projects" label="Projekte" />
          <q-breadcrumbs-el
            :to="'/projects/' + project._id"
            :label="project.name"
          />
          <q-breadcrumbs-el :label="$route.meta.label" />
        </q-breadcrumbs>
      </div>
      <router-view />
    </template>
  </q-page>
</template>

<script>
// import { Roles } from 'src/models/user-model';

export default {
  name: 'LayoutProject',
  data() {
    return {
      loading: true,
    };
  },
  computed: {
    project() {
      return this.$store.getters['project/project'];
    },
  },
  async mounted() {
    this.loading = true;
    await this.loadProject(this.$route.params.project);
    this.loading = false;
  },
  methods: {
    async loadProject(projectId) {
      return Promise.all([
        this.$store.dispatch('project/loadProject', projectId),
        this.$services.boq.loadDb(projectId),
      ]);
    },
  },
};
</script>
