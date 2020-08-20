<template>
  <q-page>
    <q-toolbar class="bg-grey-1">
      <q-toolbar-title>
        Example Project
      </q-toolbar-title>
      <q-space />
      <q-tabs shrink>
        <q-route-tab label="Leistungsverzeichnisse" to="projects/boqs" exact />
        <q-route-tab label="Abrechnungen" to="projects/billing" exact />
        <q-route-tab label="Fortschritt" to="projects/progress" exact />
        <q-route-tab label="Dokumente" to="projects/documents" exact />
        <q-route-tab label="Eigenschaften" to="projects/properties" exact />
      </q-tabs>
    </q-toolbar>
    <router-view />
  </q-page>
</template>

<script>
export default {
  name: 'LayoutProject',
};
</script>
