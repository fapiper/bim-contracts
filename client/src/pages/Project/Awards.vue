<template>
  <q-page padding>
    <div class="row items-start q-gutter-md">
      <ServiceContractCard
        v-for="award in awards"
        class="full-width"
        :key="award.hash"
        :contract="award"
        type="award"
        @payAgreement="payAgreement"
      />
    </div>
  </q-page>
</template>

<script>
import ServiceContractCard from 'components/ServiceContractCard.vue';

export default {
  name: 'PageProjectAwards',
  components: { ServiceContractCard },
  data() {
    return { awards: [] };
  },
  mounted() {
    this.loadAwards();
  },
  methods: {
    payAgreement(agreement) {
      console.log('pay', agreement);
    },
    async loadAwards() {
      this.loading = true;
      this.awards = await this.$services.assignment.getAwardsByProject(
        this.$route.params.project,
        this.$auth.user().address
      );
      this.loading = false;
    },
  },
};
</script>
