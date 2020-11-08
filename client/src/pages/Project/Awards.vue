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
    <q-dialog v-model="payAlert">
      <q-card>
        <q-card-section>
          <div class="text-h6">Leistungsvertrag abgeschlossen</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Eine Zahlung in Höhe von {{ price }} € wurde initiiert.
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Okay" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import ServiceContractCard from 'components/ServiceContractCard.vue';

export default {
  name: 'PageProjectAwards',
  components: { ServiceContractCard },
  data() {
    return { awards: [], payAlert: false, price: 0 };
  },
  mounted() {
    this.loadAwards();
  },
  methods: {
    async payAgreement(agreement) {
      let totalPrice = 0;
      agreement.services.forEach((service) => {
        totalPrice += service.billing_item ? service.billing_item.price : 0;
      });
      console.log('pay', agreement, totalPrice);
      this.$q.loading.show();
      await this.$db.agreement.pay(agreement);

      this.price = totalPrice;
      this.$q.loading.hide();
      this.payAlert = true;
      agreement.payed = true;
    },
    async loadAwards() {
      this.loading = true;
      this.awards = await this.$db.agreement.getAwardsByProject(
        this.$route.params.project,
        this.$auth.user().address
      );
      this.loading = false;
    },
  },
};
</script>
