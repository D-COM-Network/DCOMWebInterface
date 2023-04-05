<template>
<div class="container-fluid vh-100">
    <b-navbar fixed="top" type="dark" variant="primary">
      <a href="/"><img src="../assets/dcom2.png" height="50"/></a> &nbsp;
        <b-navbar-brand href="#">DCOM Application Viewer</b-navbar-brand>
          <b-navbar-nav>
          <b-dropdown id="documentDrop" text="Compliance Document" left>
            <b-dropdown-item @click="viewAllDocuments()" >View All Documents</b-dropdown-item>
            <template v-for="(value, key) in documents">
              <b-dropdown-item v-bind:key="value" @click="selectApprovedDoc($event,value)" > {{ key }}</b-dropdown-item>
            </template>
            <b-dropdown-item @click="viewSummaryGraph()" >View Overall Sumamry</b-dropdown-item>
            
          </b-dropdown>
          <b-tooltip target="documentDrop" triggers="hover">
            Click here to select which document results you wish to view
          </b-tooltip>
           &nbsp;
          <b-dropdown id="filter" text="Filter">
          <b-dropdown-item @click="filter('none')">No Filter</b-dropdown-item>
            <b-dropdown-item @click="filter('fa-check-circle')"> <i class="fas fa-check-circle"/></b-dropdown-item>
            <b-dropdown-item @click="filter('fa-times-circle')"><i class="fas fa-times-circle"/></b-dropdown-item>
            <b-dropdown-item @click="filter('fa-info-circle')"><i class="fas fa-info-circle"/></b-dropdown-item>
            <b-dropdown-item @click="filter('fa-minus-circle')"><i class="fas fa-minus-circle"/></b-dropdown-item>
            <b-dropdown-item @click="filter('fa-question-circle')"><i class="fas fa-question-circle"/></b-dropdown-item>
        </b-dropdown>&nbsp;
        <b-tooltip target="filter" triggers="hover">
          Click here to filter the compliance results that you see
        </b-tooltip>
          <b-dropdown id="disciplineDrop" split text="Discipline" right >
            <b-dropdown-item @click="selectDiscipline($event,item.split(':')[0])" v-for="item in disciplines" v-bind:key="item">{{ item.split(":")[1] }}</b-dropdown-item>
          </b-dropdown>
          <b-tooltip target="disciplineDrop" triggers="hover">
            Click here to select which model discipline you wish to view.
          </b-tooltip>
        </b-navbar-nav>
        <b-navbar-nav class="ml-auto">
          <b-nav-item id="complianceTools" v-if="buildingControlMode" @click="selectComplianceTools()" href="#" right>Select Tools</b-nav-item>
          <b-nav-item id="complianceLog" @click="viewComplianceLog()" href="#" right>Log</b-nav-item>
          <b-nav-item id="messages" @click="$bvModal.show('messageModal')" href="#" right>Messages</b-nav-item>
          <b-nav-item id="submission" @click="submission()" href="#" right>Submission</b-nav-item>
          <b-nav-item right disabled>Application No: {{ this.$route.query.uid }}</b-nav-item>
          <b-nav-item right @click="help()" ><i class="fas fa-question-circle fa-2x"></i></b-nav-item>
        </b-navbar-nav>
        <b-tooltip target="complianceLog" triggers="hover">
          Click here to view a log of rule engine activity
        </b-tooltip>
        <b-tooltip target="complianceTools" triggers="hover">
          Click here to select which tools to use as part of the compliance check
        </b-tooltip>
        <b-tooltip target="complianceLog" triggers="hover">
          Click here to view a log of rule engine activity
        </b-tooltip>
        <b-tooltip target="messages" triggers="hover">
          Click here to view a list of messages between the project team and building control officer.
        </b-tooltip>
        <b-tooltip target="submission" triggers="hover">
          Click here to submit this application to building control.
        </b-tooltip>
      </b-navbar> 
  <div style="margin-top:66px" class="row no-gutters h-80">
    <div class="no-gutters col-2" style="max-height:100%;">
      <center><b-button size="sm" :pressed.sync="showRase" v-if="!this.allDocuments && !this.viewSummary" variant="outline-primary">Toggle Logic</b-button></center>
      <DocumentNavigator v-on:updateresults="updateResults" v-if="!this.allDocuments && !this.viewSummary" v-bind:buildingControlMode="this.buildingControlMode" v-bind:showIcons="true" v-bind:showTitle="false" @selectedRASENodes='updateSelectedRaseIds' @selectedParagraph='selectParagraph' :key="url+filterType" v-bind:url="url" v-bind:token="this.$keycloak.token" v-bind:filterType="filterType" v-bind:complianceCheckResults="complianceCheckResults" v-bind:projectId="this.$route.query.uid"/>
      <template v-if="this.allDocuments">
        <template v-for="(value, key) in documentsFullNames">
          <div v-bind:key="value"><i v-bind:class="getIcon(lookupResult(value))"/>{{ key }}</div>
        </template>
      </template>
      <template v-if="this.viewSummary">
        Summary of Compliance Results
        <SummaryGraph v-bind:complianceCheckResults="complianceCheckResults" style="background-color:white; width:95%; height:80%;"/>
      </template>
    </div>
    <div class="no-gutters col-10">
      <CUIFCSingleBuildingRenderer v-bind:isolateId="isolateId" :key="this.discipline" v-bind:modelURL="this.modelURL" v-bind:token="this.$keycloak.token" />
    </div>
  </div>
  <div class="row h-20 no-gutters">
    <div class="col-2 no-gutters">
      <ComplianceStatus v-bind:token="this.$keycloak.token" v-bind:projectId="this.$route.query.uid"/>
    </div>
    <div class="col-10 no-gutters" style="max-height:100%;color:black;background-color:white">
      <DataPane v-on:isolate="isolate" v-bind:buildingControlMode="this.buildingControlMode" v-bind:complianceCheckData="complianceCheckData" v-bind:token="this.$keycloak.token" v-bind:projectId="this.$route.query.uid" v-bind:url="url" v-bind:targetUrl="pageUrl" v-bind:raseIds="selectedRaseIds" />
    </div>
  </div>
  <b-sidebar width="500px" id="documentview"  shadow right v-on:change="onSideBarChange">
    <DocumentPane v-bind:rase='showRase' v-bind:url="pageUrl" v-bind:section="section" v-bind:paragraph="paragraph"/>
  </b-sidebar>
  <b-modal size="xl" id="messageModal" title="View Messages">
    <div class="d-block" v-for="item in complianceCheckData.messages" v-bind:key="item">
      <hr>
      <span v-html=item></span><br/>
      <b-button @click="email(item)">Respond</b-button>
      <hr>
    </div>
  </b-modal>
</div>
</template>

<script>
import DocumentNavigator from "./DocumentNavigator.vue"
import SummaryGraph from "./SummaryGraph.vue"
import DocumentPane from "./DocumentPane.vue"
import ComplianceStatus from "./ComplianceStatus.vue"
import DataPane from "./DataPane.vue"
import Swal from 'sweetalert2'
import axios from "axios"

export default {
  name: 'ApplicationView',
  data() {
     return {
        buildingControlMode:false,
        url:"GB-ENG/3/AD_PartL2A/2013_edition_with_2016_amendments",
        pageUrl:"GB-ENG/3/AD_PartL2A/2013_edition_with_2016_amendments",
        section:0,
        paragraph:0,
        sideBarVisible:false,
        discipline:0,
        datasources:[],
        documents:{},
        documentsFullNames:{},
        allDocuments:true,
        viewSummary:false,
        complianceCheckData:{},
        complianceCheckResults:{},
        filterType:'none',
        isolateId:null,
        rootName:'',
        selectedRaseIds:[],
        showRase:false
     }
  },
  asyncComputed : {
    async disciplines() {
      var response= await axios.get(this.$solibri+this.$route.query.uid+"/ifcdata",{headers: { Authorization: `Bearer ${this.$keycloak.token}` }});
      return response.data.disciplines;
    }
  },
  computed: {
    // a computed getter
    modelURL: function () {
      return this.$solibri+this.$route.query.uid+"/ifcdata/"+this.discipline;
    }
  },
  components: {DocumentNavigator,DataPane,DocumentPane,ComplianceStatus,SummaryGraph},
  mounted() {
    
    if ( this.$router.currentRoute.path == "/buildingcontrol" ) this.buildingControlMode=true;
    axios.get(this.$serviceLookup+"/eureka/apps/DATASOURCE").then( (response) => {
       var datasources=JSON.parse(response.data).application.instance;
       for (var i=0; i < datasources.length;i++) {
         var datasource=datasources[i];
         this.datasources.push(datasource.vipAddress);
       }
     });
     
     axios.get(this.$ruleEngine+this.$route.query.uid,{headers: { Authorization: `Bearer ${this.$keycloak.token}` }}).then( (response) => {
        this.complianceCheckData=response.data;
      });
      
      axios.get(this.$ruleEngine+this.$route.query.uid+"/results",{headers: { Authorization: `Bearer ${this.$keycloak.token}` }}).then( (response) => {
         this.complianceCheckResults=response.data.results;
       });
       
       this.documents["Approved Document L2A"]="GB-ENG/3/AD_PartL2A/2013_edition_with_2016_amendments";
       this.documents["Approved Document M2"]="GB-ENG/3/AD_PartM2/2015";
       this.documents["Building Bulletin 100"]="GB-ENG/3/BB100/2021";
       this.documentsFullNames["Approved Document L2A"]="GB-ENG/3/ApprovedDocumentLVol.2A/2013_edition_with_2016_amendments";
       this.documentsFullNames["Approved Document M2"]="GB-ENG/3/ApprovedDocumentMVol.2/2015";
       this.documentsFullNames["Building Bulletin 100"]="GB-ENG/3/BB100/2021";
       
  },
  
  methods: {
        updateSelectedRaseIds(ids) {
          this.selectedRaseIds = ids;
        },
        help: function () {
          var helpHtml = "To start navigating the compliance data, please select a document from the compliance document drop down on the top bar. Then click on a clause from the navigation bar on the right hand side.";
          Swal.fire({title:'Help',html:helpHtml,icon:'question'});
        },
        isolate: function(data){
          this.isolateId=data;
        },
        updateResults: function() {
          var oldUrl=this.url;
          this.url="";
          this.url=oldUrl;
        },
        email:function (respondingEmail){
            respondingEmail=respondingEmail.replaceAll("<br/>","\n");
            Swal.fire({
              title: 'Send Response',
              input: 'textarea',
              width:'80%',
              inputValue: "Project Team Response to: \n "+respondingEmail+"\n",
              showCancelButton: true
              }).then((result) => {
                if (result.isConfirmed) {
                  axios.put( this.$ruleEngine+this.projectId+'/messaging', {'message':result.value},{headers: { Authorization: `Bearer ${this.$keycloak.token}` }}).then(function() {
                    Swal.fire('Message Submitted','Message Submitted','success');
                  });
                }
              });      
      },
      submission:function() {
        if (this.buildingControlMode) {
        Swal.fire({title: 'Approval',
          html: 'Status:<select name="mode" id="mode"><option value="Approved">Approved</option><option value="Rejected">Rejected</option></select> <br/>Conditions:<br/> <textarea id="conditions" name="conditions" rows="10"></textarea>',
          confirmButtonText: 'Submit Approval',
          showCancelButton: true
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire('Approval Submitted','Approval Submitted','success');
          }
        });
        } else {
        Swal.fire({title: 'Submit for Approval',
          html: 'Comments:<br/> <textarea id="conditions" name="conditions" rows="10"></textarea>',
          confirmButtonText: 'Submit For Approval',
          showCancelButton: true
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire('Application Submitted','Application Submitted','success');
          }
        });
        }
      },
      filter:function(type) {
        this.filterType=type;
      },
      getIcon:function(result) {
        if (result=="true") {
          return "fas fa-check-circle";
        } else if (result=="false"){
          return "fas fa-times-circle";
        } else {
          return "fas fa-question-circle";
        }
      },
      lookupResult: function(name) {
        let result="null";
        for (var i=0; i < this.complianceCheckResults.length;i++) {
          if (this.complianceCheckResults[i].reference.startsWith(name)) {
            if (this.complianceCheckResults[i].result=="PASS") result = "true";
            if (this.complianceCheckResults[i].result=="FAIL")  return "false";
          }
        }
        return result;
      },
      viewSummaryGraph:function() {
        this.viewSummary=true;
        this.allDocuments=false;
      },
      viewAllDocuments: function () {
        this.allDocuments=true;
        this.viewSummary=false;
      },
     async viewComplianceLog() {  
         var text="";
         for (var i=0; i < this.complianceCheckData.log.length;i++) text+=this.complianceCheckData.log[i]+"</br>";
         Swal.fire({title: '<strong>Compliance Log</strong>',html:"<div style='text-align:left;overflow:scroll'>"+text+"</div>",width:'80%',showCloseButton: true,showConfirmButton:false }); 
     },
     selectComplianceTools: function () {
        var toolHtmlContent="<div class='form-group' label='Please select the compliance tools you wish to use:'>";
        for (var i=0; i < this.datasources.length;i++) {
          toolHtmlContent+="<input type='checkbox' value=\""+this.datasources[i]+"\" checked>"+this.datasources[i]+"</input> ";
        }
        toolHtmlContent+="</div>";
     
        Swal.fire({title: '<strong>Compliance Ecosystem Components</strong>',html:toolHtmlContent,width:'80%',showCloseButton: true,showConfirmButton:true }); 
     },
     onSideBarChange: function () {
      if (this.sideBarVisible==false) this.sideBarVisible=true;
      else this.sideBarVisible=false;
     },
     selectParagraph: function (para) {
        const components = para.split('/');
        if (components.length > 1) {
          this.section=components[1]-1;
          if (components.length > 2) {
            for (var i=2; i < components.length;i++) {
              if (!isNaN(components[i])) {
                this.paragraph=components[i]-1;
                break;
              }
            }
          } else {
            this.paragraph=0;
          }
        }
        this.pageUrl=this.url+para
        if (!this.sideBarVisible) this.$root.$emit('bv::toggle::collapse', 'documentview')
     },
     selectApprovedDoc: function(e,url) {
      this.allDocuments=false;
      this.viewSummary=false;
      e.preventDefault();
      e.stopPropagation(); 
      this.url=url;
     },
     selectDiscipline: function(e,discipline) {
      e.preventDefault();
      e.stopPropagation(); 
      this.discipline=discipline;
     }
  }
}
</script>
<style>
#appsidebar.active {
    margin-left: -250px;
}   

@media (max-width: 768px) {
    #appsidebar {
        margin-left: -250px;
    }
    #appsidebar.active {
        margin-left: 0;
    }
}

.vh-100 {
    min-height: 100vh;
}

.h-20 {
  height:35% !important;
  min-height:35% !important;
}

.h-80 {
  min-height:65% !important;
  height:65% !important;
}

.fa-check-circle {
color:green;
}

.fa-times-circle {
  color:red;
}

.fa-info-circle {
  color:white;
}

.fa-question-circle {
  color:orange;
}

.fa-minus-circle {
  color:grey;
}
</style>