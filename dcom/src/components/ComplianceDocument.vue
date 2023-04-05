<template>
  <div class="container">
    <div class="row top-buffer">
      <div class="col">
        <center><h3> View Compliance Documents</h3><br/><a href="/">Home</a></center>
      </div>
    </div>
    <div class="row top-buffer" v-for="(chunk,i) in documentChunks" v-bind:key="i">
      <div class="col" v-for="document in chunk" v-bind:key="document.uid">
          <b-card  style="max-width: 20rem;" class="mb-2">
            <b-card-text>{{ document.fullName }}</b-card-text>
            <template v-for="version in document.versions" >
              <b-button class="mb-2" v-bind:key="version.versionName" v-bind:href=" '../viewdocument/'+document.jurisdiction+'/'+document.documentType+'/'+document.shortName+'/'+version.versionName" variant="primary">View {{ version.versionName.replaceAll('_',' ') }}</b-button>
            </template>
          </b-card>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios"
import _ from 'lodash'

export default {
  name: 'ComplianceDocument',
  data() {
    return {
      documents:[]
    }
  },
  computed: {
      documentChunks(){
          return _.chunk(Object.values(this.documents), 3);
      }
    },
  mounted() {
     axios.get(this.$complianceDocumentService).then( (response) => {
       this.documents = response.data["documentList"];
      });
  }
}
</script>

<style>
</style>
