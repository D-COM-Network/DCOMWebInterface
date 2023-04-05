<template>
  <div id="dcom" class="container">
  <div class="row top-buffer">
    <div class="col">
      <img alt="DCOM Logo" height=75px src="../assets/dcom.png">
    </div>
    <div class="col">
      <img alt="CIH logo" height=75px  src="../assets/cih.png">
    </div>
  </div>
  <div class="row top-buffer">
    <div class="col">
      <H3>DCOM Compliance Ecosystem Demonstration Web Interface</H3>
    </div>
  </div>
  <div class="row top-buffer">
    <div class="col">
    <b-card title="View Compliance Documents" class="mb-2">
      <b-card-text>View the contents of a compliance document</b-card-text>
      <b-button href="compliancedocument/" variant="primary">View Compliance Documents</b-button>
    </b-card>
    </div>
    <div class="col">
    <b-card title="Submit a Building Control Application" class="mb-2">
      <b-card-text>Submit a building control application</b-card-text>    
      <b-form-select v-model="projectTeamIdentifier" :options="projectTeamIdentifierOptions"></b-form-select>
      <b-form-invalid-feedback :state="applicationValidation">Please select your project team</b-form-invalid-feedback>
      <b-button class='top-buffer2' variant="primary" v-on:click="submitApplication">Submit a full plans building control application</b-button>
     </b-card>
    </div>
    <div class="col">
    <b-card title="View Results of Compliance Checking"  class="mb-2">
      <b-card-text>View and submit results of compliance checking here</b-card-text>
      <b-form-input v-model="applicationReference" placeholder="Enter your application reference"></b-form-input>
      <b-form-invalid-feedback :state="viewApplicationValidation">Please enter an application Id</b-form-invalid-feedback>
      <b-button class="top-buffer2" variant="primary" v-on:click="submitViewApplicationTeam">I am a project team member</b-button>
      <b-button class="top-buffer2" variant="primary" v-on:click="submitViewApplicationBC">I am a building control officer</b-button>
    </b-card>
    </div>
  </div>
  <div class="row top-buffer">
  <div class="col">
    <b-card class="mb-2">
    Allowing <b>Users of Construction Guidance Documents</b> to view, navigate and explore guidance documents.
    </b-card>
  </div>
  <div class="col">
    <b-card class="mb-2">
    Allowing <b>Building Control Bodies</b> to review, assess and determine submitted applications. 
    </b-card>
  </div>
  <div class="col">
    <b-card class="mb-2">
    Allowing <b>building design teams</b> to submit models for automated checking, provide manual assessments where necessary, and self-check their models.
    </b-card>
  </div>
  </div>
  <div class="row top-buffer">
  <div class="col">
    <b-card class="mb-2">
    <small>DCOM Demonstration Web Interface. Developed by <a href="http://www.cardiff.ac.uk" target="_blank">Cardiff University</a>, with contributions from <a href="http://www.aec3.eu/" target="_blank">AEC3</a>, <a href="https://www.solibri.com/" target="_blank">Solibri UK</a>, <a href="https://www.thepif.org/" target="_blank">Innovation Factory</a>. This work was funded by the <a href="https://constructioninnovationhub.org.uk/" target="_blank">Construction Innovation Hub</a></small>
    </b-card>
  </div>
  </div>
  </div>
</template>

<script>
import axios from "axios"

export default {
  name: 'DCOMHome',
  components: {
  },
  methods: {
      submitApplication: function () {
        if (this.projectTeamIdentifier=='default') {
          this.applicationValidation=false;
        } else {
          this.applicationValidation=true;
          window.location="/application?team="+this.projectTeamIdentifier;
        }
      },
      submitViewApplicationTeam: function () {
        if (this.applicationReference==null || this.applicationReference==="") {
          this.viewApplicationValidation=false;
        } else {
          this.viewApplicationValidation=true;
          window.location="/projectteam?uid="+this.applicationReference;
        }
      },
        submitViewApplicationBC: function () {
          if (this.applicationReference==null || this.applicationReference==="") {
            this.viewApplicationValidation=false;
          } else {
            this.viewApplicationValidation=true;
            window.location="/buildingcontrol?uid="+this.applicationReference;
          } 
      }
  },
  data() {
     return {
       applicationReference: null,
       applicationValidation : true,
       viewApplicationValidation : true,
       projectTeamIdentifier:'default',
       projectTeamIdentifierOptions : [
          { value: 'default', text: 'Please select your organisation' }
       ]
     }
   },
   mounted() {
     axios.get(this.$serviceLookup+"eureka/apps/PROJECTTEAM").then( (response) => {
        var projectTeams=JSON.parse(response.data).application.instance;
        for (var i=0; i < projectTeams.length;i++) {
          var projectTeam=projectTeams[i];
          this.projectTeamIdentifierOptions.push({ value:projectTeam.hostName,text:projectTeam.vipAddress});
        }
      });
   }
}
</script>

<style>
#dcom {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color:#adadad;
  margin-top: 60px;

}

img {
 background-color: #FFFFFF;
 border: 2px solid #000000 !important;
}

.wizard-title {
color:#adadad !important;
}

.stepTitle {
color:#adadad !important;
}

a {
  color:white !imporant;
}

.top-buffer { margin-top:60px; }
.top-buffer2 { margin-top:30px; }
</style>
