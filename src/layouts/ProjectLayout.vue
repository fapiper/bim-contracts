<template>
  <q-page>
    <q-toolbar class="bg-grey-2">
      <q-toolbar-title v-if="project"> {{ project.name }} </q-toolbar-title>
      <q-space />
      <q-tabs shrink>
        <q-route-tab
          label="Leistungsverzeichnisse"
          :to="'/projects/' + project.hash + '/boqs'"
          exact
        />
        <q-route-tab
          label="Abrechnungen"
          :to="'/projects/' + project.hash + '/billing'"
          exact
        />
        <q-route-tab
          label="Fortschritt"
          :to="'/projects/' + project.hash + '/progress'"
          exact
        />
        <q-route-tab
          label="Dokumente"
          :to="'/projects/' + project.hash + '/documents'"
          exact
        />
      </q-tabs>
    </q-toolbar>
    <div class="q-pa-md q-gutter-sm">
      <q-breadcrumbs gutter="sm">
        <q-breadcrumbs-el to="/projects" label="Projekte" />
        <q-breadcrumbs-el
          v-if="project"
          :to="'/projects/' + project.hash"
          :label="project.name"
        />
        <q-breadcrumbs-el :label="$route.meta.label" />
      </q-breadcrumbs>
    </div>
    <router-view />
  </q-page>
</template>

<script>
export default {
  name: 'LayoutProject',
  data() {
    return {
      project: null,
    };
  },
  created() {
    this.loadProject();
  },
  watch: {
    $route: 'loadProject',
  },

  methods: {
    async loadProject(hash) {
      const projectdb = await this.$orbitdb.projectdb;
      await projectdb.load();
      const projects = await projectdb.get(this.$route.params.project);
      this.project = projects[0];
    },
  },
};
</script>
