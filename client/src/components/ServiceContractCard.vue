<template>
  <q-card flat bordered>
    <q-card-section>
      <div
        class="text-overline"
        :class="contract.payed ? 'text-positive' : 'text-grey'"
      >
        {{ contract.payed ? 'Bezahlt' : 'Bezahlung ausstehend' }}
      </div>
      <div class="text-h6 q-mt-sm q-mb-xs">
        {{ contract.services[0].name }}
        <template v-if="contract.services.length > 1">
          und {{ contract.services.length - 1 }} weitere
        </template>
        <q-chip class="text-weight-regular" icon="assignment">{{
          contract.hash
        }}</q-chip>
      </div>

      <!-- <div class="q-mt-sm q-mb-xs">Auftraggeber: {{ contract.client }}</div>
      <div class="q-mt-sm q-mb-xs">
        Auftragnehmer: {{ contract.contractor }}
      </div> -->
      <div></div>
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
import STATUS from 'assets/agreement.stages.js';

export default {
  name: 'ComponentServiceContractCard',
  data() {
    return {
      service: null,
      expanded: false,
      status: STATUS,
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
        for (const service of services) {
          await this.$db.agreement.handleTransition(
            this.$auth.user().address,
            service,
            action.method
          );
        }
        services.forEach((s) => {
          s.stage = action.next;
        });
        if (
          !this.contract.payed &&
          this.contract.services.every((s) => s.stage === 4)
        ) {
          this.$emit('payAgreement', this.contract);
        }
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
