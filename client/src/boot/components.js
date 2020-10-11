import BoqTable from 'components/BoqTable.vue';
import ServiceTable from 'components/ServiceTable.vue';

export default async ({ Vue }) => {
  Vue.component('bc-boq-table', BoqTable);
  Vue.component('bc-service-table', ServiceTable);
};
