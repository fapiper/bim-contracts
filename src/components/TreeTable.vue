<template>
  <q-table
    :hide-header="!isRoot"
    :hide-bottom="!isRoot"
    :title="title"
    flat
    :data="data"
    :columns="columns"
    row-key="hash"
    :rows-per-page-options="[0]"
    :loading="loading"
    separator="cell"
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
            @click="props.expand = !props.expand"
            round
            dense
            :icon="props.expand ? 'expand_less' : 'expand_more'"
            v-if="hasChildren(props)"
          />
        </q-td>
        <template v-if="isCtgy">
          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            <b v-if="col.name === 'short_desc'">{{ props.row.name }}</b>
          </q-td>
        </template>
        <template v-else>
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
            v-if="props.row.billing_item"
          >
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
      <q-tr
        v-if="hasChildren(props)"
        v-show="props.expand"
        :props="props"
        no-hover
      >
        <q-td colspan="100%" style="padding: 0">
          <bc-tree-table
            @assign="assign"
            :items="items"
            :data="getChildren(props)"
            :columns="columns"
          />
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script>
export default {
  name: 'ComponentTreeTable',
  props: {
    isRoot: Boolean,
    items: Object,
    data: Array,
    title: String,
    columns: Array,
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
  },
  computed: {
    isCtgy: function () {
      return this.data && this.data.some((entry) => !entry.qty);
    },
  },
};
</script>
<style lang="scss" scoped>
td:first-child {
  // width: 10%;
}
</style>
