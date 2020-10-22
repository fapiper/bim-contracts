<template>
  <q-card flat bordered>
    <q-card-section>
      <div
        class="text-overline"
        :class="'text-' + status[contract.stage].color"
      >
        {{ status[contract.stage].text }}
      </div>
      <div class="text-h5 q-mt-sm q-mb-xs">
        {{ contract.name }}
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

    <q-card-actions v-if="contract.services.length > 0">
      <q-btn
        flat
        round
        dense
        :icon="expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
        @click="expanded = !expanded"
      />

      <q-space />
    </q-card-actions>

    <q-slide-transition v-if="contract.services.length > 0">
      <div v-show="expanded">
        <q-separator />
        <bc-service-table
          @transition="transition"
          @assign="assign"
          :data="contract.services"
          :assignment="contract"
          :project="project._id"
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
    async transition({ services, action }) {
      this.$q.loading.show();
      const next = this.status[action.next];
      try {
        console.log('transition services', services);
        await this.$services.assignment.handleTransition(
          this.$auth.user().address,
          this.contract.hash,
          services[services.length - 1],
          action.method
        );
        services.forEach((s) => (s.stage = action.next));
        this.$q.notify({
          textColor: next.textColor,
          color: next.color,
          icon: next.icon,
          message: `${action.text} war erfolgreich.`,
          position: 'bottom-right',
        });
      } catch (error) {
        console.error(error);
        this.$q.notify({
          type: 'negative',
          message: `Ein Fehler ist aufgetreten.`,
          position: 'bottom-right',
        });
      }
      this.$q.loading.hide();
    },
  },
};
</script>
