<template>
  <q-page>
    <q-toolbar class="bg-grey-1">
      <q-toolbar-title> Projekt {{ $route.params.project }} </q-toolbar-title>
      <q-space />
      <q-tabs shrink>
        <q-route-tab label="Leistungsverzeichnisse" to="boqs" exact />
        <q-route-tab label="Abrechnungen" to="billing" exact />
        <q-route-tab label="Fortschritt" to="progress" exact />
        <q-route-tab label="Dokumente" to="documents" exact />
        <q-route-tab label="Eigenschaften" to="properties" exact />
      </q-tabs>
    </q-toolbar>
    <div class="q-pa-md q-gutter-sm">
      <q-breadcrumbs gutter="sm">
        <q-breadcrumbs-el to="/projects" label="Projekte" />
        <q-breadcrumbs-el :label="$route.params.project" />
        <q-breadcrumbs-el label="Leistungsverzeichnisse" />
      </q-breadcrumbs>
    </div>
    <router-view />
  </q-page>
</template>

<script>
export default {
  name: 'LayoutProject',
};
</script>
