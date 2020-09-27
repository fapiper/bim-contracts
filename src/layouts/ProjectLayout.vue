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
            :to="'/projects/' + project.hash"
            exact
          />
          <q-route-tab
            label="Leistungsverzeichnisse"
            :to="'/projects/' + project.hash + '/boqs'"
            exact
          />
          <q-route-tab
            label="Aufträge"
            :to="'/projects/' + project.hash + '/assignments'"
            exact
          >
            <q-badge color="red" floating>{{ newAssignments.length }}</q-badge>
          </q-route-tab>
          <q-route-tab
            label="Akteure"
            :to="'/projects/' + project.hash + '/contact'"
            exact
          />

          <!-- v-if="$auth.check([Roles.GENERAL_CONTRACTOR, Roles.SUB_CONTRACTOR])" -->
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
// import { Roles } from 'src/models/user-model';

export default {
  name: 'LayoutProject',
  data() {
    return {
      loading: true,
    };
  },
  computed: {
    newAssignments() {
      return this.$store.getters['project/newAssignments'];
    },
    project() {
      return this.$store.getters['project/project'];
    },
  },
  async mounted() {
    this.loading = true;
    const project_hash = this.$route.params.project;
    const user_address = this.$auth.user().address;
    await Promise.all([
      this.loadProject(project_hash),
      this.loadAssignments(project_hash, user_address),
    ]);
    console.log('loaded', this.project, this.newAssignments);
    this.loading = false;
  },
  methods: {
    async loadAssignments(project_hash, user_address) {
      return this.$store.dispatch('project/loadAssignments', {
        project_hash,
        user_address,
      });
    },
    async loadProject(project_hash) {
      return Promise.all([
        this.$store.dispatch('project/loadProject', project_hash),
        this.$services.boq.loadDb(project_hash),
      ]);
    },
  },
};
</script>
