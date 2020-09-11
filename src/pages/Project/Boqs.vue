<template>
  <q-page padding>
    <div class="q-pa-md">
      <bc-tree-table
        title="Leistungsverzeichnis"
        @assign="showDialog"
        :columns="columns"
        :data="data"
        :items="items"
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
export default {
  name: 'PageProjectBoqs',
  created() {
    this.loadBoqs();
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
      this.boqs = boqs;
      this.items = this.boqs[0].items;
      this.data = this.boqs[0].children.map((item) => this.items[item]);
      this.loading = false;
    },
    showDialog(service) {
      this.selected = service;
      this.prompt = true;
    },
    assign() {
      console.log('assign', this.selected, this.address);
      this.prompt = false;
    },
  },
  data() {
    return {
      selected: null,
      prompt: false,
      address: '0x3c63d95ad664e6ef6006f6affdd8b77eae8a8bc8',
      boqs: [],
      data: [],
      items: [],
      loading: true,
      columns: [
        {
          name: 'r_no_part',
          required: true,
          label: 'Index',
          align: 'left',
          field: (row) => row.r_no_part,
        },
        {
          name: 'short_desc',
          required: true,
          label: 'Bezeichnung',
          align: 'left',
          field: (row) => row.short_desc,
        },
        {
          name: 'long_desc',
          required: true,
          label: 'Beschreibung',
          align: 'left',
          field: (row) => row.long_desc,
        },
        {
          name: 'qty',
          required: true,
          label: 'Menge',
          align: 'left',
          field: (row) => row.qty,
          format: (val) => `${val}`,
        },
        {
          name: 'qty_unit',
          required: true,
          label: 'Einheit',
          align: 'left',
          field: (row) => row.qty_unit,
        },
      ],
    };
  },
};
</script>
