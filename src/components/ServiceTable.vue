<template>
  <q-table
    hide-header
    hide-bottom
    :data="data"
    :columns="columns"
    row-key="hash"
    :rows-per-page-options="[0]"
    :table-colspan="5"
    separator="none"
    table-class="bc-service-table"
    flat
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
                <!-- v-if="props.row.status < 1" -->

                <q-item clickable v-close-popup @click="assign(props.row)">
                  <q-item-section>
                    <q-item-label>Auftrag weiter vergeben</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item
                  v-if="status[props.row.stage].action"
                  clickable
                  v-close-popup
                  @click="transition(props.row)"
                >
                  <q-item-section>
                    <q-item-label>{{
                      status[props.row.stage].action
                    }}</q-item-label>
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
          <bc-service-table
            @assign="assign"
            :data="children"
            :project="project"
            :assignment="assignment"
          />
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script>
import Assignment from 'src/models/assignment-model.js';

export default {
  name: 'ComponentServiceTable',
  props: {
    isRoot: Boolean,
    data: Array,
    project: String,
    assignment: Object,
  },
  mounted() {
    console.log('data', this.data);
  },
  methods: {
    assign(service) {
      this.$emit('assign', service);
    },
    transition(service) {
      this.$emit('transition', service);
    },
    hasChildren(props) {
      return props && props.row.children.length > 0;
    },
    async loadChildren(props) {
      if (!this.childrenLoaded[props.row.hash]) {
        this.childrenLoaded[props.row.hash] = true;
        const children = await this.$services.assignment.getChildren(
          this.project,
          this.assignment
        );
        console.log('loaded children in service table', children);
        this.children = children;
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
      status: Assignment.STATUS,
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
          field: (row) => row.stage,
          format: (val) => val,
          style: 'width:200px',
        },
      ],
    };
  },
};
</script>
<style lang="scss">
.bc-service-table {
  table-layout: fixed;
  .bc-service-table tr td:first-child {
    padding-left: 32px;
  }
}
</style>
