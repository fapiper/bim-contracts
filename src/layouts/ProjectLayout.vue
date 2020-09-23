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
        <q-tabs shrink v-if="project">
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
            :to="'/projects/' + project.hash"
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
  async created() {
    this.loadProject();
  },
  watch: {
    $route: 'loadProject',
  },
  methods: {
    async loadProject() {
      this.loading = true;
      const project = this.$route.params.project;
      await this.$store.dispatch('project/loadProject', project);
      // Init boqdb to load only project specific boqs
      await this.$services.boq.loadDb(project);
      this.loading = false;
    },
  },
};
</script>
