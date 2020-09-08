<template>
  <q-page padding>
    <div class="q-pa-md">
      <q-table
        title="Leistungsverzeichnis"
        :data="data"
        :columns="columns"
        row-key="name"
        :rows-per-page-options="[0]"
      >
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th auto-width />

            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td auto-width>
              <q-toggle
                v-model="props.expand"
                checked-icon="add"
                unchecked-icon="remove"
              />
            </q-td>

            <q-td v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.value }}
            </q-td>
          </q-tr>
          <q-tr v-show="props.expand" :props="props" no-hover>
            <q-td colspan="100%" style="padding: 0">
              <q-table
                hide-header
                hide-bottom
                flat
                :data="props.row.children"
                :columns="columns"
                row-key="name"
                :rows-per-page-options="[0]"
              >
              </q-table>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
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
      console.log('boqs', boqs);
    },
  },

  data() {
    return {
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
