<template>
  <q-table
    :hide-header="!isRoot"
    hide-bottom
    :title="title"
    :data="data"
    :columns="columns"
    row-key="hash"
    :rows-per-page-options="[0]"
    :loading="loading"
    :table-colspan="5"
    separator="none"
    table-class="bc-boq-table"
    flat
    :bordered="isRoot"
  >
    <template v-if="isRoot" v-slot:header="props">
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
            @click="loadChildren(props)"
            round
            dense
            :icon="props.expand ? 'expand_less' : 'expand_more'"
            :class="{ invisible: !hasChildren(props) }"
          />
        </q-td>
        <template>
          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            <template v-if="col.name === 'status'">
              <q-chip
                size="sm"
                :color="status[col.value].color"
                :text-color="status[col.value].textColor"
                >{{ status[col.value].text }}</q-chip
              >
            </template>
            <template v-else> {{ col.value }} </template>
          </q-td>
        </template>
        <q-td auto-width>
          <q-btn
            flat
            round
            dense
            color="grey"
            icon="more_horiz"
            :class="{ invisible: !props.row.billing_item }"
          >
            <q-menu>
              <q-list style="min-width: 200px">
                <q-item
                  v-if="props.row.status < 1"
                  clickable
                  v-close-popup
                  @click="assign(props.row)"
                >
                  <q-item-section>
                    <q-item-label>Auftrag vergeben</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="showDetails(props.row)">
                  <q-item-section>
                    <q-item-label>Auftragsdetails einsehen</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </q-td>
      </q-tr>
      <q-tr
        v-if="hasChildren(props)"
        v-show="props.expand"
        :props="props"
        no-hover
      >
        <q-td colspan="100%" style="padding: 0">
          <bc-boq-table @assign="assign" :data="children" />
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script>
const STATUS = {
  0: { text: 'Nicht vergeben' },
  1: {
    text: 'Vergeben',
    color: 'primary',
    textColor: 'white',
  },
  2: { text: 'Gestartet', color: 'teal', textColor: 'white' },
  3: {
    text: 'Beendet',
    color: 'dark',
    textColor: 'white',
  },
  4: {
    text: 'Abgenommen',
    color: 'accent',
    textColor: 'white',
  },
  5: {
    text: 'Abgelehnt',
    color: 'negative',
    textColor: 'white',
  },
};

export default {
  name: 'ComponentBoqTable',
  props: {
    isRoot: Boolean,
    items: Object,
    data: Array,
    title: String,
    loading: Boolean,
  },
  mounted() {
    // console.log('data', this.data);
  },
  methods: {
    assign(service) {
      this.$emit('assign', service);
    },
    hasChildren(props) {
      return props && props.row.children.length > 0;
    },
    getChildren(props) {
      return props.row.children.map((prop) => this.items[prop]);
    },
    async loadChildren(props) {
      if (!this.childrenLoaded) {
        this.childrenLoaded = true;
        this.children = await this.$orbitdb.boqdb.query(
          (item) => item.parent === props.row.hash
        );
      }
      props.expand = !props.expand;
    },
  },
  computed: {
    isCtgy: function () {
      return this.data && this.data.some((entry) => !entry.qty);
    },
  },
  data() {
    return {
      children: [],
      childrenLoaded: false,
      status: STATUS,
      columns: [
        {
          name: 'id',
          required: true,
          label: 'Id',
          align: 'left',
          field: (row) => row.id,
        },
        {
          name: 'short_desc',
          required: true,
          label: 'Bezeichner',
          align: 'left',
          field: (row) => row.short_desc || row.name,
        },
        {
          name: 'qty',
          required: true,
          label: 'Menge',
          align: 'left',
          field: (row) => row.qty,
          format: (val, row) => (val ? `${val} ${row.qty_unit}` : ''),
          style: 'width:200px',
        },
        {
          name: 'status',
          required: true,
          label: 'Status',
          align: 'center',
          field: (row) => row.status,
          format: (val) => val,
          style: 'width:200px',
        },
      ],
    };
  },
};
</script>
<style lang="scss">
.bc-boq-table {
  table-layout: fixed;
  .bc-boq-table tr td:first-child {
    padding-left: 32px;
  }
}
</style>
