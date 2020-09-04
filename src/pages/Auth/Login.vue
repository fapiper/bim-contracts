<template>
  <q-page class="flex flex-center">
    <div class="login-card">
      <q-card-section>
        <h1 class="text-h3 text-center">
          Anmelden
        </h1>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="login" class="q-gutter-md">
          <q-input
            filled
            id="privateKey"
            v-model="data.privateKey"
            type="text"
            label="Private Key"
            :error="$v.data.privateKey.$error"
            @keyup.enter="login"
          >
            <template v-slot:prepend>
              <q-icon name="vpn_key" />
            </template>
          </q-input>

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
            <router-link to="/auth/register">
              Hier registrieren
            </router-link>
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
  data() {
    return {
      data: {
        name: 'Max Mustermann',
        privateKey:
          '80acab76550a5291e414f6cba8cba4f0163e628a8f65033f4d73cca8683248f3',
        rememberMe: false,
      },
      loading: false,
    };
  },
  methods: {
    async login() {
      this.$v.data.$touch();
      if (!this.$v.data.$error) {
        this.loading = true;
        await this.$auth.login(this.data);
        this.loading = false;
        this.$router.push('/');
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
