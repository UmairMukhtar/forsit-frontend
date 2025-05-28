<template>
  <div>
    <canvas ref="canvas" height="300px" width="500px"></canvas>
  </div>
</template>

<script>
import {
  Chart,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  PieController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js'

Chart.register(
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  PieController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
)

export default {
  name: 'ChartComponent',
  props: {
    type: { type: String, required: true },
    data: { type: Object, required: true },
    options: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      chartInstance: null,
    }
  },
  mounted() {
    this.$nextTick(() => {
  setTimeout(() => {
    this.renderChart(this.data)
  }, 1000)
})
  },
  methods: {
    renderChart(chartData) {
  const ctx = this.$refs.canvas?.getContext('2d')
  if (!ctx) {
    console.error('Canvas context is null — chart not rendered.')
    return
  }

  this.chartInstance = new Chart(ctx, {
    type: this.type,
    data: chartData,
    options: this.options,
  })
},
    destroyChart() {
      if (this.chartInstance) {
        this.chartInstance.destroy()
        this.chartInstance = null
      }
    },
    updateChartData(newData) {
  this.destroyChart()
  this.$nextTick(() => {
    const canvas = this.$refs.canvas
    if (canvas && canvas.getContext) {
      this.renderChart(newData)
    } else {
      console.warn('Canvas is not available yet.')
    }
  })
},
    getChartInstance() {
      return this.chartInstance
    },
  },
  beforeUnmount() {
    this.destroyChart()
  }
}
</script>
