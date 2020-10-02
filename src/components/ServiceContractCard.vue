<template>
  <q-card flat bordered>
    <q-card-section>
      <div
        class="text-overline"
        :class="'text-' + status[contract.service.stage].color"
      >
        {{ status[contract.service.stage].text }}
      </div>
      <div class="text-h5 q-mt-sm q-mb-xs">
        {{ contract.service.name || contract.service.short_desc }}
      </div>
      <div class="">
        <q-chip
          dense
          square
          :icon="isAssignment ? 'assignment' : 'assignment_ind'"
          >{{ contract.hash }}</q-chip
        >
      </div>
    </q-card-section>

    <q-card-actions>
      <q-btn
        flat
        round
        dense
        :icon="expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
        @click="expanded = !expanded"
      />

      <q-space />
    </q-card-actions>

    <q-slide-transition>
      <div v-show="expanded">
        <q-separator />
        <bc-service-table
          @transition="transition"
          @assign="assign"
          :data="[contract.service]"
          :assignment="contract"
          :project="project.hash"
          :type="type"
          is-root
        />
      </div>
    </q-slide-transition>
  </q-card>
</template>

<script>
import Assignment from 'src/models/assignment-model.js';

export default {
  name: 'ComponentServiceContractCard',
  data() {
    return {
      childrenLoaded: false,
      children: [],
      service: null,
      expanded: false,
      status: Assignment.STATUS,
    };
  },
  computed: {
    project() {
      return this.$store.getters['project/project'];
    },
    isAssignment() {
      return this.type === 'assignment';
    },
  },
  props: {
    contract: Object,
    type: String, // 'assignment' || 'award'
  },
  methods: {
    assign(service) {
      this.$emit('assign', service);
    },
    transition({ service, method }) {
      console.log('transition', service, method);
      this.$services.assignment.handleTransition(
        this.contract.address,
        this.$auth.user().address,
        service.hash,
        method
      );
    },
  },
};
</script>
