<template>
  <q-layout view="hHh Lpr lff">
    <q-header>
      <q-toolbar>
        <q-btn flat @click="drawer = !drawer" round dense icon="menu" />
        <q-toolbar-title>BIMContracts</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawer" show-if-above :breakpoint="500">
      <q-scroll-area class="fit">
        <q-list padding class="menu-list">
          <q-item
            clickable
            v-ripple
            v-for="link in essentialLinks"
            :key="link.title"
            :to="link.link"
          >
            <q-item-section avatar>
              <q-icon :name="link.icon" />
            </q-item-section>

            <q-item-section>
              {{ link.title }}
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
const linksData = [
  {
    title: 'Dashboard',
    icon: 'dashboard',
    link: 'dashboard',
  },
  {
    title: 'Leistungsverzeichnisse',
    icon: 'assignment',
    link: '',
  },
  {
    title: 'Abrechnungen',
    icon: 'account_balance',
    link: '',
  },
  {
    title: 'Akteure',
    icon: 'group',
    link: '',
  },
  {
    title: 'Baufortschritt',
    icon: 'trending_up',
    link: '',
  },
  {
    title: 'Mein Profil',
    icon: 'person',
    link: '',
  },
  {
    title: 'Einstellungen',
    icon: 'settings',
    link: '',
  },
];

export default {
  name: 'MainLayout',
  components: {},
  data() {
    return {
      drawer: false,
      essentialLinks: linksData,
    };
  },
};
</script>
<style lang="scss" scoped>
// .menu-list .q-item {
//   border-radius: 0 32px 32px 0;
// }
</style>
