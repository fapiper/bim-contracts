<template>
  <q-page padding>
    <q-banner
      class="bg-primary text-white"
      rounded
      inline-actions
      v-if="newAssignments.length > 0"
    >
      <template v-slot:avatar>
        <q-icon name="assignment" color="white" />
      </template>
      Sie haben {{ newAssignments.length }} neue{{
        newAssignments.length > 1 ? ' Aufträge' : 'n Auftrag'
      }}
      <template v-slot:action>
        <q-btn flat color="white" label="Ansehen" />
      </template>
    </q-banner>

    <div class="q-pa-md row q-col-gutter-sm"></div>
  </q-page>
</template>

<script>
export default {
  name: 'PageProjectOverview',
  computed: {
    newAssignments() {
      return this.$store.getters['project/newAssignments'];
    },
  },
  data() {
    return {};
  },
};
</script>
