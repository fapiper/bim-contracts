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
            <div class="row no-wrap items-center q-pa-md">
              <div class="column">
                <q-form class="q-gutter-sm">
                  <q-input
                    class="cursor-pointer"
                    input-class="cursor-pointer"
                    filled
                    v-model="$auth.user().address"
                    hint="Adresse"
                    dense
                    readonly
                    @click="copy($event, 'Adresse')"
                  >
                    <template v-slot:prepend>
                      <q-icon name="fingerprint" />
                    </template>
                  </q-input>
                  <q-input
                    class="cursor-pointer"
                    input-class="cursor-pointer"
                    filled
                    v-model="$auth.user().privateKey"
                    hint="Private Key"
                    dense
                    readonly
                    @click="copy($event, 'Private Key')"
                  >
                    <template v-slot:prepend>
                      <q-icon name="vpn_key" />
                    </template>
                  </q-input>

                  <q-input
                    class="cursor-pointer"
                    input-class="cursor-pointer"
                    filled
                    v-model="balance"
                    hint="Balance"
                    dense
                    readonly
                    @click="copy($event, 'Balance')"
                  >
                    <template v-slot:prepend>
                      <q-icon name="monetization_on" />
                    </template>
                  </q-input>
                </q-form>
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
import { copyToClipboard } from 'quasar';

const linksData = [
  {
    title: 'Bauvorhaben',
    icon: 'assignment',
    link: '/projects',
  },
  {
    title: 'Mein Profil',
    icon: 'person',
    link: '/me',
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
    this.balance = (await this.getBalance()) + ' ETH';
  },
  data() {
    return {
      drawer: false,
      essentialLinks: linksData,
      balance: 0,
    };
  },
  methods: {
    copy(e, label) {
      copyToClipboard(e.target.value).then(() => {
        this.$q.notify({
          message: `${label} in die Zwischenablage kopiert.`,
          color: 'white',
          textColor: 'primary',
          position: 'bottom-right',
        });
      });
    },
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
