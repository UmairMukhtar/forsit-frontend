<template>
  <div class="dashboard">
    <div class="filter-bar">
      <button v-for="f in filters" :key="f" :class="{ active: currentFilter === f }" @click="applyFilter(f)">
        {{ f.charAt(0).toUpperCase() + f.slice(1) }}
      </button>

      <select v-model="selectedCategory" @change="applyFilter(currentFilter)">
        <option value="">All Categories</option>
        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
      </select>
    </div>
    <div style="display: flex; align-items: center; justify-content: space-evenly">
      <ChartComponent ref="barChartRef" :type="'bar'" :data="trendData" :options="chartOptions" />
      <ChartComponent ref="lineChartRef" :type="'line'" :data="trendData" :options="chartOptions" />
    </div>
    <div style="display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 10px">
      <button @click="showProductDialog = true" class="btn">Add Product</button>
      <button @click="showSalesDialog = true" class="btn">Add Sales</button>
    </div>

    <div v-if="showProductDialog" class="modal-overlay">
  <div class="modal">
    <h3>Add New Product</h3>
    <form @submit.prevent="submitNewProduct">
      <input v-model="newProduct.id" placeholder="Product ID" required />
      <input v-model="newProduct.name" placeholder="Name" required />
      <input v-model="newProduct.description" placeholder="Description" required />
      <input v-model.number="newProduct.price" placeholder="Price" required type="number" />
      <input v-model.number="newProduct.stock_level" placeholder="Stock Level" required type="number" />
      <input v-model.number="newProduct.low_stock_threshold" placeholder="Low Stock Threshold" required type="number" />
      <input type="file" @change="handleProductImage" />
      <div class="dialog-buttons">
        <button type="submit">Submit</button>
        <button type="button" @click="showProductDialog = false">Cancel</button>
      </div>
    </form>
  </div>
</div>

<div v-if="showSalesDialog" class="modal-overlay">
  <div class="modal">
    <h3>Add New Sale</h3>
    <form @submit.prevent="submitNewSale">
      <input v-model="newSale.productId" placeholder="Product ID" required />
      <input v-model="newSale.saleDate" placeholder="Sale Date (YYYY-MM-DD)" required />
      <input v-model.number="newSale.saleCount" placeholder="Sale Count" type="number" required />
      <input v-model.number="newSale.price" placeholder="Price" type="number" required />
      <input v-model="newSale.category" placeholder="Category" required />
      <div class="dialog-buttons">
        <button type="submit">Submit</button>
        <button type="button" @click="showSalesDialog = false">Cancel</button>
      </div>
    </form>
  </div>
</div>

    <div style="padding: 20px; background-color: #f9fafb; border-radius: 10px">
      <input type="text" placeholder="Search..." @input="onQuickFilterChanged" style="
          margin-bottom: 10px;
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
        " :disabled="!gridApi" />
      <ag-grid-vue ref="agGrid" class="ag-theme-alpine custom-grid" style="width: 100%; height: 500px"
        :rowData="rowData" :columnDefs="columnDefs" :defaultColDef="defaultColDef" :animateRows="true"
        @grid-ready="onGridReady" :isExternalFilterPresent="isExternalFilterPresent"
        :doesExternalFilterPass="doesExternalFilterPass" />
    </div>
  </div>
</template>

<style scoped></style>

<script>
import {
  ClientSideRowModelModule,
  ModuleRegistry,
  QuickFilterModule,
  NumberFilterModule,
  TextFilterModule,
  ValidationModule,
} from "ag-grid-community";
import { AgGridVue } from "ag-grid-vue3";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "../styles/dashboard.css";
import ChartComponent from "@/components/ChartComponent.vue";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
ModuleRegistry.registerModules([
  QuickFilterModule,
  TextFilterModule,
  NumberFilterModule,
  ClientSideRowModelModule,
  ...(process.env.NODE_ENV !== "production" ? [ValidationModule] : []),
]);
export default {
  name: "Dashboard",
  components: {
    AgGridVue,
    ChartComponent,
  },
  data() {
    return {
      chartOptions: {
        responsive: true,
        maintainAspectRatio: true,
      },
      trendData: {
        labels: ["Jan", "Feb", "Mar"],
        datasets: [
          {
            label: "Sales",
            data: [100, 200, 150],
            backgroundColor: ["#42a5f5", "#66bb6a", "#ffa726"],
          },
        ],
      },
      rowData: [],
      columnDefs: [
        { headerName: "Product ID", field: "id" },
        { headerName: "Name", field: "name" },
        { headerName: "Description", field: "description" },
        { headerName: "Price", field: "price" },
        { headerName: "Stock Level", field: "stock_level" },
        { headerName: "Low Stock", field: "low_stock_threshold" },
        {
          headerName: "Image", field: "image_url", cellRenderer: params => {
            return `<img src="${params.value}" alt="Product Image" style="width: 25px; height: 25px; border-radius: 5px;" />`;
          },
        },
      ],
      defaultColDef: {
        sortable: true,
        filter: true,
        resizable: true,
      },
      barChartInstance: null,
      lineChartInstance: null,
      gridApi: null,
      columnApi: null,
      filters: ["all", "daily", "weekly", "monthly", "annually"],
      currentFilter: "all",
      selectedCategory: "",
      categories: ["Electronics", "Books", "Beauty", "Toys", "Home"],
      showProductDialog: false,
      showSalesDialog: false,
      newProduct: {
        id: "",
        name: "",
        description: "",
        price: null,
        stock_level: null,
        low_stock_threshold: null,
        image_url: "",
      },
      newSale: {
        productId: "",
        saleDate: "",
        saleCount: null,
        category: "",
        price: null,
      },
      productImageFile: null,
    };
  },
  methods: {
    goToProducts() {
      this.$router.push("/products");
    },
    async fetchData() {
      const requestOptions = {
        method: "GET",
        redirect: "follow",
      };
      fetch(`${BACKEND_URL}/view-all-products`, requestOptions)
        .then((response) => response.json())
        .then((result) => {
          console.log(result);
          this.rowData = result.products || [];
        })
        .catch((error) => console.error(error));
    },
    applyFilter(filter) {
      this.currentFilter = filter;
      this.fetchSalesData(filter, this.selectedCategory);
    },

    async fetchSalesData(filter = "all", category = "") {
      const query = new URLSearchParams();
      if (filter && filter !== "all") query.append("filter", filter);
      if (category) query.append("category", category);

      try {
        const response = await fetch(`${BACKEND_URL}/view-all-sales?${query.toString()}`);
        const result = await response.json();
        this.trendData = result || [];
        this.$refs.barChartRef.updateChartData(result);
        this.$refs.lineChartRef.updateChartData(result);
      } catch (error) {
        console.error("Error fetching sales data:", error);
      }
    },
    onGridReady(params) {
      this.gridApi = params.api;
      this.columnApi = params.columnApi;
      console.log('Grid API ready:', this.gridApi);
    },
    onQuickFilterChanged(event) {
      const searchText = event.target.value.toLowerCase();
      const filterModel = {};
      this.columnDefs.forEach((colDef) => {
        if (colDef.field) {
          console.log(colDef.field)
          filterModel[colDef.field] = {
            type: "contains",
            filter: searchText,
          };
        }
      });
      console.log(filterModel)
      this.gridApi.setFilterModel(filterModel);
      this.gridApi.onFilterChanged();
    },
    onQuickFilterChanged(event) {
      this.quickSearchText = event.target.value.toLowerCase();
      this.gridApi.onFilterChanged();
    },
    isExternalFilterPresent() {
      return !!this.quickSearchText;
    },
    doesExternalFilterPass(node) {
      const rowString = Object.values(node.data)
        .join(" ")
        .toLowerCase();
      return rowString.includes(this.quickSearchText);
    },

    async submitNewProduct() {
    try {
      let imageUrl = "";
      if (this.productImageFile) {
        const formData = new FormData();
        formData.append("file", this.productImageFile);
        const uploadRes = await fetch(`${BACKEND_URL}/upload-file`, {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.imageUrl;
      }

      const productData = { ...this.newProduct, image_url: imageUrl };
      const res = await fetch(`${BACKEND_URL}/add-new-product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      const data = await res.json();
      console.log("Product added:", data);
      this.showProductDialog = false;
      this.fetchData();
    } catch (err) {
      console.error("Error adding product:", err);
    }
  },

  handleProductImage(event) {
    this.productImageFile = event.target.files[0];
  },

  async submitNewSale() {
    try {
      const res = await fetch(`${BACKEND_URL}/add-new-sale`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.newSale),
      });
      const data = await res.json();
      console.log("Sale added:", data);
      this.showSalesDialog = false;
      this.fetchSalesData();
    } catch (err) {
      console.error("Error adding sale:", err);
    }
  },

  },
  mounted() {
    this.fetchData(),
      this.fetchSalesData()
    // this.applyFilter(this.currentFilter)
  },
};
</script>
