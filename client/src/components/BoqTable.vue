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
            {{ col.value }}
          </q-td>
        </template>
        <q-td auto-width>
          <q-btn
            flat
            round
            dense
            color="grey"
            icon="more_horiz"
            v-if="isRoot && isCtgy"
          >
            <q-menu>
              <q-list style="min-width: 200px">
                <!-- v-if="props.row.status < 1" -->

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
      <q-tr
        v-if="hasChildren(props)"
        v-show="props.expand"
        :props="props"
        no-hover
      >
        <q-td colspan="100%" style="padding: 0">
          <bc-boq-table @assign="assign" :data="children" :project="project" />
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
    data: Array,
    title: String,
    project: String,
    loading: Boolean,
  },
  mounted() {},
  methods: {
    assign(service) {
      this.$emit('assign', service);
    },
    hasChildren(props) {
      return props && props.row.children.length > 0;
    },
    async loadChildren(props) {
      if (!this.childrenLoaded[props.row.hash]) {
        this.childrenLoaded[props.row.hash] = true;
        this.children = await this.$services.boq.query(
          this.project,
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
      childrenLoaded: {},
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