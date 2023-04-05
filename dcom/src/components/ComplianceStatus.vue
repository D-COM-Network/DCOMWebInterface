<template>
  <div><img  src="../assets/tbc.png"/></div>
</template>

<script>
export default {
  name: 'ComplianceStatus',
  props:["token","projectId"],
  data() {
    return {
    
    }
  },
  methods: { 
  },
  mounted() {
  }
}
</script>
<style scoped>
img {
    width: 100%;
    height: 100%; 
    object-fit: contain;
    background-color:#000000; 
    position: absolute;
    bottom: 0;
    left: 0;
}
</style>