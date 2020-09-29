<template>
  <q-card flat bordered>
    <template v-if="loading">Lädt</template>
    <template v-else>
      <q-card-section>
        <div class="text-overline">
          {{ assignment.stage }}
        </div>
        <div class="text-h5 q-mt-sm q-mb-xs">
          {{ assignment.service.name }}
        </div>
      </q-card-section>

      <q-card-actions>
        <q-btn flat color="primary" label="Nächste Phase" @click="next" />
        <q-btn flat label="Vergeben" @click="assign" />

        <q-space />
        <q-btn
          color="grey"
          round
          flat
          dense
          :icon="expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
          @click="loadChildren"
        />
      </q-card-actions>

      <q-slide-transition>
        <div v-show="expanded">
          <q-separator />
          <q-card-section>
            <bc-service-table
              @transition="next"
              :data="service"
              :assignment="assignment"
              :project="project.hash"
              is-root
            />
          </q-card-section>
        </div>
      </q-slide-transition>
    </template>
  </q-card>
</template>

<script>
export default {
  name: 'ComponentAssignmentCard',
  data() {
    return {
      childrenLoaded: false,
      children: [],
      service: null,
      loading: true,
      expanded: false,
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
      const services = await this.$services.boq.get(
        this.project.hash,
        this.assignment.service.hash
      );
      this.service = services;
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
    assign() {},
    next() {
      console.log('next');
      // this.$services.assignment.nextStage(this.assignment);
    },
  },
};
</script>
