<template>
  <q-layout view="hHh Lpr lff">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat @click="drawer = !drawer" round dense icon="menu" />
        <q-toolbar-title>BIMContracts</q-toolbar-title>
        <q-space />
        <q-btn round dense no-caps color="orange">
          <q-avatar>
            {{ initials }}
          </q-avatar>

          <q-menu>
            <div class="row no-wrap q-pa-md">
              <div class="column">
                <div class="text-h6 q-mb-md">Account</div>
                <q-input
                  filled
                  v-model="$auth.user().address"
                  hint="Adresse"
                  dense
                  readonly
                />
                <q-input
                  filled
                  v-model="balance"
                  hint="Balance"
                  dense
                  readonly
                />
              </div>

              <q-separator vertical inset class="q-mx-lg" />

              <div class="column items-center">
                <q-avatar color="orange" text-color="white" size="72px">
                  {{ initials }}
                </q-avatar>

                <div class="text-subtitle2 q-my-xs text-center">
                  {{ $auth.user().name }}
                </div>

                <q-btn
                  color="primary"
                  label="Abmelden"
                  push
                  size="sm"
                  v-close-popup
                  @click="logout"
                />
              </div>
            </div>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawer"
      show-if-above
      bordered
      :breakpoint="500"
      content-class="bg-grey-2"
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
    title: 'Bauvorhaben',
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
  computed: {
    initials() {
      const initials = this.$auth.user().name.match(/\b\w/g) || [];
      return ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
    },
  },
  async mounted() {
    this.balance = await this.getBalance();
  },
  data() {
    return {
      drawer: false,
      essentialLinks: linksData,
      balance: 0,
    };
  },
  methods: {
    async getBalance() {
      // eslint-disable-next-line vue/no-async-in-computed-properties
      const balance = await this.$web3.eth.getBalance(
        this.$auth.user().address
      );
      return this.$web3.utils.fromWei(balance);
    },

    logout() {
      this.$auth.logout();
      this.$router.go('/auth/login');
    },
  },
};
</script>
<style lang="scss" scoped>
// .menu-list .q-item {
//   border-radius: 0 32px 32px 0;
// }
</style>
