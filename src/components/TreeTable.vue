<template>
  <q-table
    hide-header
    hide-bottom
    flat
    :data="data"
    :columns="columns"
    row-key="id"
    :rows-per-page-options="[0]"
    selection="single"
    :selected.sync="selected"
  >
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td auto-width>
          <q-btn
            class="q-ml-md"
            flat
            @click="props.expand = !props.expand"
            round
            dense
            :icon="props.expand ? 'expand_less' : 'expand_more'"
            v-if="hasChildren"
          />
        </q-td>
        <q-td auto-width>
          <q-checkbox size="xs" v-model="selected" :val="props.row" />
        </q-td>
        <q-td v-for="col in props.cols" :key="col.name" :props="props">
          {{ col.value }}
        </q-td>
      </q-tr>
      <q-tr v-if="hasChildren" v-show="props.expand" :props="props" no-hover>
        <q-td colspan="100%" style="padding: 0">
          <bc-tree-table :data="props.row.children" />
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script>
export default {
  name: 'ComponentTreeTable',
  props: {
    data: Array,
  },
  mounted() {
    console.log('data', this.data);
  },
  computed: {
    hasChildren: function () {
      return true;
      // props.row.children && props.row.children.length;
    },
  },
  data() {
    return {
      selected: [],
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
      ],
    };
  },
};
</script>
