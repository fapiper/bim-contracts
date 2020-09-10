<template>
  <q-table
    hide-header
    hide-bottom
    flat
    :data="data"
    :columns="columns"
    row-key="id"
    :rows-per-page-options="[0]"
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
        <q-td v-for="col in props.cols" :key="col.name" :props="props">
          {{ col.value }}
        </q-td>
        <q-td auto-width>
          <q-btn flat round dense color="grey" icon="more_horiz">
            <q-menu>
              <q-list style="min-width: 100px">
                <q-item clickable v-close-popup @click="assign(props.row)">
                  <q-item-section>
                    <q-item-label>Auftrag vergeben</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </q-td>
      </q-tr>
      <q-tr v-if="hasChildren" v-show="props.expand" :props="props" no-hover>
        <q-td colspan="100%" style="padding: 0">
          <bc-tree-table @assign="assign" :data="props.row.children" />
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
    // console.log('data', this.data);
  },
  methods: {
    assign(service) {
      this.$emit('assign', service);
    },
  },
  computed: {
    hasChildren: function () {
      return this.data && Array.isArray(this.data.children);
      // props.row.children && props.row.children.length;
    },
  },
  data() {
    return {
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
