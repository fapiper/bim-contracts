<template>
  <q-page class="flex flex-center">
    <div class="register-card">
      <q-card-section>
        <h1 class="text-h3 text-center">
          Registrieren
        </h1>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="register" class="q-gutter-md">
          <q-select
            filled
            v-model="data.role"
            :options="options"
            label="Rolle"
            option-value="id"
            option-label="desc"
          />

          <q-checkbox
            id="rememberMe"
            v-model="data.rememberMe"
            label="Anmeldung merken"
          />

          <div>
            <q-btn
              class="full-width"
              label="Registrieren"
              type="submit"
              color="primary"
              :loading="loading"
            />
          </div>
        </q-form>
        <div class="q-mt-md">
          <p>
            Account bereits vorhanden?
            <router-link to="/auth/login">
              Hier anmelden
            </router-link>
          </p>
        </div>
      </q-card-section>
    </div>
  </q-page>
</template>

<script>
// import { required } from 'vuelidate/lib/validators';

export default {
  name: 'PageRegister',
  data() {
    return {
      options: [
        { desc: 'Bauherr', id: 0 },
        { desc: 'Generalunternehmer', id: 1 },
        { desc: 'Subunternehmer', id: 2 },
      ],
      data: {
        name: 'Max Mustermann',
        role: { desc: 'Bauherr', id: 0 },
        rememberMe: false,
      },
      loading: false,
    };
  },
  methods: {
    async register() {
      // this.$v.data.$touch();
      // if (!this.$v.data.$error) {
      this.loading = true;
      await this.$auth.register(this.data);
      this.loading = false;
      this.$router.push('/');
      // }
    },
  },
  // validations: {
  //   data: {
  //     body: {
  //       role: {
  //         required,
  //       },
  //     },
  //   },
  // },
};
</script>

<style lang="scss" scoped>
.register-card {
  width: 100%;
  max-width: 600px;
}
</style>
