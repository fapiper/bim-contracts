<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-overline">
        {{ assignment.client.name }}
      </div>
      <div class="text-h5 q-mt-sm q-mb-xs">
        {{ assignment.service.short_desc }}
      </div>
      <div class="text-caption text-grey">
        {{ assignment.service.qty }} {{ assignment.service.qty_unit }}
      </div>
    </q-card-section>

    <q-card-actions>
      <q-btn flat color="primary" label="Annehmen" @click="next" />
      <q-btn flat label="Vergeben" @click="assign" />

      <q-space />
      <q-btn
        color="grey"
        round
        flat
        dense
        :icon="expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
        @click="expanded = !expanded"
      />
    </q-card-actions>

    <q-slide-transition>
      <div v-show="expanded">
        <q-separator />
        <q-card-section>
          <q-separator />
          <q-form class="q-gutter-y-md">
            <q-input
              dense
              filled
              v-model="assignment.service.status"
              readonly
              label="Status"
            />
            <q-input
              dense
              filled
              v-model="assignment.service.id"
              readonly
              label="Id"
            />
            <q-input
              dense
              filled
              v-model="assignment.service.hash"
              readonly
              label="Hash"
            />
          </q-form>
          <pre>{{ assignment.service }}</pre>
        </q-card-section>
      </div>
    </q-slide-transition>
  </q-card>
</template>

<script>
export default {
  name: 'ComponentAssignmentCard',
  data() {
    return {
      tab: 'info',
      expanded: false,
    };
  },
  props: {
    assignment: null,
  },
  methods: {
    assign() {},
    next() {
      this.$services.assignment.transitionNext(this.assignment);
    },
  },
};
</script>
