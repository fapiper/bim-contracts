<template>
  <q-page class="flex flex-center">
    <div class="register-card">
      <q-card-section>
        <h1 class="text-h3 text-center">Registrieren</h1>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="register" class="q-gutter-md">
          <q-input filled v-model="data.name" label="Name" />
          <q-input filled v-model="data.iban" :options="options" label="Iban" />

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
            <router-link to="/auth/login"> Hier anmelden </router-link>
          </p>
        </div>
      </q-card-section>
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'PageRegister',
  data() {
    return {
      data: {
        name: 'Max Mustermann',
        iban: '1234567890',
        rememberMe: false,
      },
      loading: false,
    };
  },
  methods: {
    async register() {
      this.loading = true;
      await this.$auth.register(this.data);
      this.loading = false;
      this.$router.push('/projects');
    },
  },
};
</script>

<style lang="scss" scoped>
.register-card {
  width: 100%;
  max-width: 600px;
}
</style>
