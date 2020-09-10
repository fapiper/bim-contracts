<template>
  <q-page padding>
    <div class="q-pa-md">
      <q-table
        title="Leistungsverzeichnis"
        :data="data"
        :columns="columns"
        row-key="id"
        :rows-per-page-options="[0]"
      >
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th auto-width />
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
            <q-th auto-width />
          </q-tr>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td auto-width>
              <q-btn
                flat
                @click="props.expand = !props.expand"
                round
                dense
                :icon="props.expand ? 'expand_less' : 'expand_more'"
              />
            </q-td>
            <q-td v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.value }}
            </q-td>
            <q-td auto-width>
              <q-btn flat round dense color="grey" icon="more_horiz">
                <q-menu>
                  <q-list style="min-width: 100px">
                    <q-item
                      clickable
                      v-close-popup
                      @click="showDialog(props.row)"
                    >
                      <q-item-section>
                        <q-item-label>Auftrag vergeben</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-td>
          </q-tr>
          <q-tr v-show="props.expand" :props="props" no-hover>
            <q-td colspan="100%" style="padding: 0">
              <bc-tree-table :data="props.row.children" @assign="showDialog" />
            </q-td>
          </q-tr>
        </template>
      </q-table>
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
            Geben Sie zur Auftragsvergabe von
            <span class="text-weight-bold">{{
              selected && selected.lbl_tx.p.span
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
      const boqdb = await this.$orbitdb.boqdb;
      await boqdb.load();
      const boqs = await boqdb.query(
        (boq) => boq.project_hash === this.$route.params.project
      );
      this.boqs = boqs;
      this.data = this.boqs[0].children;
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
      address: '',
      boqs: [],
      data: [],
      columns: [
        {
          name: 'id',
          required: true,
          label: 'ID',
          align: 'left',
          field: (row) => row.id,
          format: (val) => `${val}`,
          children: (row) => row.children,
        },
        {
          name: 'label',
          required: true,
          label: 'Label',
          align: 'left',
          field: (row) => row.lbl_tx.p.span,
          format: (val) => `${val}`,
          children: (row) => row.children,
        },
        {
          name: 'amount',
          required: true,
          label: 'Menge',
          align: 'left',
          field: (row) => row.totals.total,
          format: (val) => `${val} ME`,
          children: (row) => row.children,
        },

        // { name: 'calories', align: 'center', label: 'Calories', field: 'calories', sortable: true },
        // { name: 'fat', label: 'Fat (g)', field: 'fat', sortable: true },
        // { name: 'carbs', label: 'Carbs (g)', field: 'carbs' },
        // { name: 'protein', label: 'Protein (g)', field: 'protein' },
        // { name: 'sodium', label: 'Sodium (mg)', field: 'sodium' },
        // { name: 'calcium', label: 'Calcium (%)', field: 'calcium', sortable: true, sort: (a, b) => parseInt(a, 10) - parseInt(b, 10) },
        // { name: 'iron', label: 'Iron (%)', field: 'iron', sortable: true, sort: (a, b) => parseInt(a, 10) - parseInt(b, 10) }
      ],
    };
  },
};
</script>
