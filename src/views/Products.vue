<template>
  <div class="dashboard">
    <h2>Product Management</h2>
    <ag-grid-vue
      class="ag-theme-alpine"
      style="width: 100%; height: 400px;"
      :rowData="rowData"
      :columnDefs="columnDefs"
      :defaultColDef="defaultColDef"
      :animateRows="true"
    ></ag-grid-vue>
  </div>
</template>

<script>
import { ModuleRegistry } from 'ag-grid-community'
import { ClientSideRowModelModule } from 'ag-grid-community'
import { AgGridVue } from 'ag-grid-vue3'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
ModuleRegistry.registerModules([ClientSideRowModelModule]) 
export default {
  name: 'Dashboard',
  components: {
    AgGridVue,
  },
  data() {
    return {
      rowData: [],
      columnDefs: [
        { headerName: 'ID', field: 'id' },
        { headerName: 'Name', field: 'name' },
        { headerName: 'Description', field: 'description' },
        { headerName: 'Price', field: 'price' },
        { headerName: 'Stock Level', field: 'stock_level' },
        { headerName: 'Low Stock', field: 'low_stock_threshold' },
      ],
      defaultColDef: {
        sortable: true,
        filter: true,
        resizable: true,
      },
    }
  },
  methods: {
    async fetchData() {
          const requestOptions = {
      method: "GET",
      redirect: "follow"
    };
    console.log(BACKEND_URL)
    fetch(`${BACKEND_URL}/view-all-products`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log(result)
        this.rowData = result.products || [];
      })
      .catch((error) => console.error(error));
        }
  },
  mounted() {
    this.fetchData()
  },
}
</script>
