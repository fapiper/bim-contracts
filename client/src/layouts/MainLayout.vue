<template>
  <q-layout view="hHh Lpr lff">
    <q-header>
      <q-toolbar>
        <q-btn flat @click="drawer = !drawer" round dense icon="menu" />
        <q-toolbar-title>BIMContracts</q-toolbar-title>
        <q-space />

        <q-btn flat label="Abmelden" icon-right="login" @click="logout" />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawer"
      show-if-above
      :breakpoint="500"
      content-class="bg-grey-1"
    >
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
    link: '/dashboard',
  },
  {
    title: 'Projekte',
    icon: 'assignment',
    link: '/projects',
  },
  {
    title: 'Kontakte',
    icon: 'group',
    link: '',
  },
  {
    title: 'Mein Profil',
    icon: 'person',
    link: '/me',
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
  methods: {
    logout() {
      this.$auth.logout();
      this.$router.go('/');
    },
  },
};
</script>
<style lang="scss" scoped>
// .menu-list .q-item {
//   border-radius: 0 32px 32px 0;
// }
</style>
