<template>
  <Layout>
    <v-sheet color="grey lighten-4" class="px-3 pt-3 pb-3">
      <v-skeleton-loader
        class="mx-auto"
        max-width="400"
        type="card"
      ></v-skeleton-loader>
      <v-skeleton-loader
        class="mx-auto"
        max-width="400"
        type="card"
      ></v-skeleton-loader>
      <v-skeleton-loader
        class="mx-auto"
        max-width="400"
        type="card"
      ></v-skeleton-loader>
      <v-skeleton-loader
        class="mx-auto"
        max-width="400"
        type="card"
      ></v-skeleton-loader>
      <v-skeleton-loader
        class="mx-auto"
        max-width="400"
        type="card"
      ></v-skeleton-loader>
    </v-sheet>
  </Layout>
</template>

<script>
import Layout from './layouts/default.vue';
export default {
  props: {
    source: String,
  },
  components: {
    Layout,
  },
  data: () => ({
    drawer: null,
    items: [
      { icon: 'lightbulb_outline', text: 'Notes' },
      { icon: 'touch_app', text: 'Reminders' },
      { divider: true },
      { heading: 'Labels' },
      { icon: 'add', text: 'Create new label' },
      { divider: true },
      { icon: 'archive', text: 'Archive' },
      { icon: 'delete', text: 'Trash' },
      { divider: true },
      { icon: 'settings', text: 'Settings' },
      { icon: 'chat_bubble', text: 'Trash' },
      { icon: 'help', text: 'Help' },
      { icon: 'phonelink', text: 'App downloads' },
      { icon: 'keyboard', text: 'Keyboard shortcuts' },
    ],
  }),
};
</script>

<style>
#keep .v-navigation-drawer__border {
  display: none;
}
</style>
