<template>
  <q-card flat bordered>
    <template v-if="loading">Lädt</template>
    <template v-else>
      <q-card-section>
        <div
          class="text-overline"
          :class="'text-' + status[assignment.service.stage].color"
        >
          {{ status[assignment.service.stage].text }}
        </div>
        <div class="text-h5 q-mt-sm q-mb-xs">
          {{ assignment.service.name }}
        </div>
        <div class="">
          <q-chip dense square icon="assignment">{{
            assignment.address
          }}</q-chip>
        </div>
      </q-card-section>

      <q-card-actions>
        <q-btn
          flat
          round
          dense
          :icon="expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
          @click="loadChildren"
        />

        <q-space />
      </q-card-actions>

      <q-slide-transition>
        <div v-show="expanded">
          <q-separator />
          <bc-service-table
            @transition="transition"
            @assign="assign"
            :data="[assignment.service]"
            :assignment="assignment"
            :project="project.hash"
            is-root
          />
        </div>
      </q-slide-transition>
    </template>
  </q-card>
</template>

<script>
import Assignment from 'src/models/assignment-model.js';

export default {
  name: 'ComponentAssignmentCard',
  data() {
    return {
      childrenLoaded: false,
      children: [],
      service: null,
      loading: true,
      expanded: false,
      status: Assignment.STATUS,
    };
  },
  async mounted() {
    this.loadAssignment();
  },
  computed: {
    project() {
      return this.$store.getters['project/project'];
    },
  },
  props: {
    assignment: null,
  },
  methods: {
    async loadAssignment() {
      this.loading = true;
      this.loading = false;
    },
    async loadChildren(assignment) {
      // if (!this.childrenLoaded) {
      //   this.children = await this.$services.assignment.getChildren(
      //     this.project.hash,
      //     this.assignment
      //   );
      // }
      this.expanded = !this.expanded;
    },
    assign() {
      console.log('next');
    },
    transition(service) {
      console.log('next');
      this.$services.assignment.nextStage(this.assignment, service);
    },
  },
};
</script>
