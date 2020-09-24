<template>
  <q-page padding>
    <div class="q-pa-md">
      <bc-boq-table
        title="Leistungsverzeichnis"
        @assign="showDialog"
        :data="data"
        :loading="loading"
        :project="project.hash"
        is-root
      />
    </div>
    <q-dialog v-model="prompt">
      <q-card style="min-width: 450px">
        <q-card-section class="row items-center">
          <div class="text-h6">Auftragsvergabe</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <p>
            Geben Sie zur Auftragsvergabe
            <span class="text-weight-bold">{{
              selected && (selected.short_desc || selected.name)
            }}</span>
            bitte den gewünschten Auftragnehmer an:
          </p>
          <q-input
            filled
            dense
            placeholder="Adresse"
            hint="Blockchain Identität"
            v-model="address"
            autofocus
            @keyup.enter="prompt = false"
          />
        </q-card-section>

        <q-card-actions align="center">
          <q-btn
            unelevated
            class="full-width"
            color="primary"
            label="Auftrag vergeben"
            @click="assign"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { abi as ServiceAgreementFactoryAbi } from 'src/contracts/ServiceAgreementFactory.json';
const ServiceAgreementFactoryAddress =
  '0x852543528aF03b706b2785dFd3103898Ed256eaD';

export default {
  name: 'PageProjectBoqs',
  computed: {
    project() {
      return this.$store.getters['project/project'];
    },
  },
  mounted() {
    this.loadBoqs();
    this.factoryContract.events
      .ServiceAgreementCreated()
      .on('data', (event) => {
        console.log('created agreement', event);
      });
  },
  methods: {
    async loadBoqs(hash) {
      this.loading = true;
      this.data = await this.$services.boq.query(this.project.hash, (item) =>
        this.project.boqs[0].roots.some((hash) => hash === item.hash)
      );
      this.loading = false;
    },
    showDialog(service) {
      this.selected = service;
      this.prompt = true;
    },
    async assign() {
      // this.$q.loading.show();
      // const service = {
      //   client: this.$auth.user().address,
      //   contractor: this.address,
      //   ...this.selected,
      // };
      const nodes = await this.$services.assignment.assign(
        this.project.hash,
        this.selected
      );
      console.log('assigned', nodes);
      // const children = nodes.map((c) => c.hash);
      // const parents = nodes.map((c) => c.parent);
      // const billings = nodes.map((c) => c.billing_item !== null);
      // await this.factoryContract.methods
      //   .createServiceAgreement(
      //     this.selected.hash,
      //     this.selected.parent,
      //     this.$auth.user().address,
      //     this.address,
      //     children,
      //     parents,
      //     billings,
      //     []
      //   )
      //   .send({ from: this.$auth.user().address, gas: 2000000 });
      this.prompt = false;
      this.$q.notify({
        type: 'positive',
        message: `Der Auftrag wurde erfolgreich vergeben`,
        position: 'bottom-right',
      });
    },
  },
  data() {
    return {
      factoryContract: new this.$web3.eth.Contract(
        ServiceAgreementFactoryAbi,
        ServiceAgreementFactoryAddress
      ),
      selected: null,
      prompt: false,
      address: '0x3c63d95ad664e6ef6006f6affdd8b77eae8a8bc8',
      data: [],
      loading: true,
    };
  },
};
</script>
