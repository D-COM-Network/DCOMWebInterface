<script>
import { Bar } from 'vue-chartjs'

export default {
  extends: Bar,
  props:{
    complianceCheckResults : {
      type: Array
    },
  },
	data: () => ({
    chartdata: {
      labels: ['Passed', 'Failed'],
			datasets:[{ 
				label:"Current Compliance Check",
				data:[0,0],
				backgroundColor: '#f87979',
			}]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  }),
  mounted () {
    console.log(JSON.stringify(this.chartdata));
    for (let x=0; x < this.complianceCheckResults.length;x++) {
      if (this.complianceCheckResults[x].result=="PASS") this.chartdata.datasets[0].data[0]++;
      else this.chartdata.datasets[0].data[1]++;
    }
    this.renderChart(this.chartdata, this.options)
  }
}
</script>
<style>
</style>