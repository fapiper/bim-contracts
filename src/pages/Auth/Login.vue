<template>
  <q-page class="flex flex-center">
    <div class="login-card">
      <q-card-section>
        <h1 class="text-h3 text-center">Anmelden</h1>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="login" class="q-gutter-md">
          <q-select
            :value="data.privateKey"
            use-input
            hide-selected
            filled
            input-debounce="0"
            fill-input
            :options="options"
            @filter="filterFn"
            @input-value="setModel"
            label="Private Key"
            @keyup.enter="login"
          >
            <template v-slot:prepend>
              <q-icon name="vpn_key" />
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-italic text-grey">
                  Keinen passenden Private Key gefunden
                </q-item-section>
              </q-item>
            </template>
          </q-select>
          <q-checkbox
            id="rememberMe"
            v-model="data.rememberMe"
            label="Anmeldung merken"
          />

          <div>
            <q-btn
              class="full-width"
              label="Anmelden"
              type="submit"
              color="primary"
              :loading="loading"
            />
          </div>
        </q-form>
        <div class="q-mt-md">
          <p>
            Noch keinen Account?
            <router-link to="/auth/register"> Hier registrieren </router-link>
          </p>
        </div>
      </q-card-section>
    </div>
  </q-page>
</template>

<script>
import { required } from 'vuelidate/lib/validators';

export default {
  name: 'PageLogin',
  mounted() {
    const privateKeys = this.$q.localStorage.getItem('key_history');
    this.keyHistory = privateKeys ? privateKeys.split(',') : [];
  },
  data() {
    return {
      keyHistory: [],
      options: [],
      data: {
        privateKey: '',
        rememberMe: false,
      },
      loading: false,
    };
  },
  methods: {
    filterFn(val, update, abort) {
      update(() => {
        const needle = val.toLocaleLowerCase();
        this.options = this.keyHistory.filter(
          (v) => v.toLocaleLowerCase().indexOf(needle) > -1
        );
      });
    },

    setModel(val) {
      this.data.privateKey = val;
    },
    async login() {
      this.$v.data.$touch();
      if (!this.$v.data.$error) {
        this.loading = true;
        await this.$auth.login(this.data);
        this.loading = false;
        this.$router.push('/projects');
      }
    },
  },
  validations: {
    data: {
      privateKey: {
        required,
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.login-card {
  width: 100%;
  max-width: 600px;
}
</style>
