<template>
  <q-table
    :hide-header="!isRoot"
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
          <template v-if="!isCtgy">
            <template v-for="(action, index) in status[props.row.stage].action">
              <q-btn
                v-if="action.type === type"
                :key="index"
                round
                :disable="!verifyAction(props.row)"
                :color="
                  isReject(props.row.stage, action)
                    ? status[5].color
                    : status[action.next].color
                "
                dense
                outline
                class="q-mr-xs"
                :icon="
                  isReject(props.row.stage, action)
                    ? status[5].icon
                    : status[action.next].icon
                "
                @click="transition({ services: [props.row], action })"
              >
                <q-tooltip>
                  {{ action.text }}
                </q-tooltip>
              </q-btn>
            </template>
          </template>
          <q-btn flat round dense color="grey" icon="more_horiz">
            <q-menu>
              <q-list style="min-width: 200px">
                <q-item
                  clickable
                  v-close-popup
                  @click="assign(props.row)"
                  v-if="
                    isAssignment &&
                    isCtgy &&
                    props.row.billing_item &&
                    isContractor(props.row)
                  "
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
      <q-tr
        v-if="hasChildren(props)"
        v-show="props.expand"
        :props="props"
        no-hover
      >
        <q-td colspan="100%" style="padding: 0">
          <template v-if="childrenLoaded(props.row.children)">
            <bc-service-table
              @assign="assign"
              @transition="transition"
              :data="props.row.children"
              :project="project"
              :assignment="assignment"
              :type="type"
              ref="service-table"
          /></template>
          <template v-else>
            <div class="row justify-center">
              <q-spinner color="grey-6" size="2em" />
            </div>
          </template>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script>
import STATUS from 'assets/agreement.stages.js';

export default {
  name: 'ComponentServiceTable',
  props: {
    isRoot: Boolean,
    data: Array,
    project: String,
    assignment: Object,
    type: String,
  },
  methods: {
    verifyAction(service) {
      if (this.type === 'assignment') {
        return this.isContractor(service);
      } else {
        return service.client === this.$auth.user().address;
      }
    },
    isContractor(service) {
      return service.contractor === this.$auth.user().address;
    },
    assign(service) {
      this.$emit('assign', service);
    },
    showDetails(service) {
      this.$emit('showDetails', service);
    },
    transition({ services, action }) {
      const node = services[services.length - 1];
      const parent = this.data.find((s) => {
        return s.children.some((child) => child.hash === node.hash);
      });

      if (parent && action.checkForUpdate(node, parent, parent.children)) {
        services.push(parent);
      }
      this.$emit('transition', { services, action });
    },
    hasChildren(props) {
      return props && props.row.children.length > 0;
    },
    childrenLoaded(children) {
      return children.some((child) => typeof child !== 'string');
    },
    isReject(stage, action) {
      return stage === 3 && action.next === 2;
    },
    async loadChildren(props) {
      props.expand = !props.expand;
      if (!this.childrenLoaded(props.row.children)) {
        props.row.children = await this.$db.agreement.getChildren(
          this.project,
          props.row.hash
        );
      }
    },
    addZeroes(num) {
      const dec = String(num).split('.')[1];
      const len = dec && dec.length > 2 ? dec.length : 2;
      return Number(num).toFixed(len);
    },
  },
  computed: {
    isCtgy: function () {
      return this.data && this.data.some((entry) => !entry.qty);
    },
    isAssignment() {
      return this.type === 'assignment';
    },
  },
  data() {
    return {
      children: {},
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
          name: 'price',
          required: true,
          label: 'Preis',
          align: 'left',
          field: (row) => row.billing_item,
          format: (val, row) => {
            if (val) {
              const price = this.addZeroes(
                val.total_price || val.price
              ).replace('.', ',');
              return (
                price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €'
              );
            }
          },
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
