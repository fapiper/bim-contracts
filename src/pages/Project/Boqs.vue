<template>
  <q-page padding>
    <div class="q-pa-md">
      <bc-boq-table
        title="Leistungsverzeichnis"
        @assign="showDialog"
        :data="data"
        :loading="loading"
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
import { FlatTree } from 'src/utils/flat-tree.js';
const ServiceAgreementFactoryAddress =
  '0x852543528aF03b706b2785dFd3103898Ed256eaD';

export default {
  name: 'PageProjectBoqs',
  created() {
    this.loadBoqs();
  },
  mounted() {
    this.factoryContract.events
      .ServiceAgreementCreated()
      .on('data', (event) => {
        console.log(event);
      });
  },
  watch: {
    $route: 'loadProject',
  },
  methods: {
    async loadBoqs(hash) {
      this.loading = true;
      const boqdb = await this.$orbitdb.boqdb;
      await boqdb.load();
      const boqs = await boqdb.query(
        (boq) => boq.project_hash === this.$route.params.project
      );
      this.boqs = boqs.map((boq) => FlatTree.from(boq.children, boq.items));
      this.data = this.boqs[0];
      this.loading = false;
    },
    showDialog(service) {
      this.selected = service;
      this.prompt = true;
    },
    async assign() {
      console.log('assign', this.selected, this.address);
      const res = await this.factoryContract.methods
        .createServiceAgreement(
          this.selected.hash,
          this.selected.parent,
          this.$auth.user().account.address,
          this.address,
          [],
          [],
          [],
          []
        )
        .send({ from: this.$auth.user().account.address, gas: 2000000 });
      console.log('assigned', res);

      this.prompt = false;
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
      boqs: [],
      data: [],
      items: [],
      loading: true,
    };
  },
};
</script>
