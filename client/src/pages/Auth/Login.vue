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
            id="email"
            v-model.trim="data.body.email"
            type="email"
            label="Email-Adresse"
            :error="this.$v.data.body.email.$error"
            autofocus
          />

          <q-input
            filled
            id="password"
            v-model="data.body.password"
            type="password"
            label="Passwort"
            :error="$v.data.body.password.$error"
            @keyup.enter="login"
          />

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
      </q-card-section>
    </div>
  </q-page>
</template>

<script>
import { email, required } from 'vuelidate/lib/validators';

export default {
  name: 'PageLogin',
  data() {
    return {
      data: {
        body: {
          email: '',
          password: '',
        },
        rememberMe: false,
      },
      loading: false,
    };
  },
  methods: {
    login() {
      this.$v.data.$touch();
      if (!this.$v.data.$error) {
        this.loading = true;
        this.$auth.login(this.data);
        this.loading = false;
        this.$router.push('/');
      }
    },
  },
  validations: {
    data: {
      body: {
        email: {
          required,
          email,
        },
        password: {
          required,
        },
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
