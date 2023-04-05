<template>
  <div style="max-height: inherit;  overflow-y: auto;">
  <span v-if="url==targetUrl || targetUrl==''">Please select a clause from the document navigator</span> 
  <template v-if="url!=targetUrl && tableItems!=null"> 
    <template v-for="objectType in Object.keys(tableItems)">
      <b v-bind:key="objectType+'Name'"> {{ objectType }} </b>
      <b-table :bordered="true" :dark="true" style="width:95%" v-bind:key="objectType" striped fixed hover   :items="tableItems[objectType]">
        <template #cell(id)="data">
          <span><button :id="'LocateinModel'+data.value" @click="isolateElement(data.value)" type='button' class='btn btn-primary btn-sm'><i class="fas fa-building"></i></button></span>
          <span><button :id="'SendMessage'+data.value" @click="email(data.value)" type='button' class='btn btn-primary btn-sm'><i class="fas fa-envelope-open-text"></i></button></span>
          <b-tooltip :target="'LocateinModel'+data.value" triggers="hover">
            Locate this item in the model.
          </b-tooltip>
          <b-tooltip :target="'SendMessage'+data.value" triggers="hover">
            Send a message about this item
          </b-tooltip>
        </template>
        <template #cell()="data">
            <span>
            <i v-if="data.value[0]=='true'" class='far fa-check-circle'/>
            <i v-else-if="data.value[0]=='false'" class='far fa-times-circle'/> 
            <i v-else class='fas fa-question-circle'/>
            &nbsp;</span>
            <span><button :id="'ViewData'+data.value[1]+data.value[3]" v-if="data.value[2]!=null" @click="viewData(data.value[2])" type='button' class='btn btn-primary btn-sm'><i class='fas fa-search'></i></button>&nbsp;</span>
            <span><button v-if="buildingControlMode" :id="'SubmitAssessment'+data.value[1]+data.value[3]" @click="submitResult(data.value[1],data.value[3],data.value[4])" type='button' class='btn btn-primary btn-sm'><i class="fas fa-pen"></i></button>&nbsp;</span>
            <span><button v-if="!buildingControlMode" :id="'SubmitClaim'+data.value[1]+data.value[3]" @click="submitResult(data.value[1],data.value[3],data.value[4])" type='button' class='btn btn-primary btn-sm'><i class="fas fa-pen"></i></button></span>
            <b-tooltip :target="'ViewData'+data.value[1]+data.value[3]" triggers="hover">
              View data about this item
            </b-tooltip>
            
            <b-tooltip v-if="!buildingControlMode" :target="'SubmitClaim'+data.value[1]+data.value[3]" triggers="hover">
              Submit a claim that this element complies/does not comply with the building regulations
            </b-tooltip>
            <b-tooltip v-if="buildingControlMode" :target="'SubmitAssessment'+data.value[1]+data.value[3]" triggers="hover">
              Submit your assessment of this item.
            </b-tooltip>
        </template>
      </b-table>
    </template>
  </template>
  </div>
</template>

<script>
import axios from "axios"
import Swal from 'sweetalert2'
import Download from 'downloadjs'

export default {
  name: 'DataPane',
  props:['token','projectId','url','targetUrl','complianceCheckData','buildingControlMode','raseIds'],
  methods: { 
    provideInformation: function (info) {
      Swal.fire({ title: info, input: 'text', showCancelButton: true, confirmButtonText: 'Submit', showLoaderOnConfirm: true});
    },
    scrollIntoView(id) {
      var elmnt = document.querySelectorAll("[data-raseproperty='"+id+"']");
      elmnt.scrollIntoView();
    },
    isolateElement(id) {
      this.$emit('isolate',id)
    },
    viewData(result){
        var html="<b>Result</b>:"+result.result+"</br><b>Reasons</b>:<ol>";
        if (result.reasons!=null) {
          for (var i=0; i < result.reasons.length;i++) {
            html+="<li>"+result.reasons[i]+"</li>";
          }
        }
        html+="</ol>";
        html+="<b>Attribution:</b>"+result.attributation+"</br><b>Supporting Evidence:</b></br>";
        if (result.supportingFileContentType == "png" || result.supportingFileContentType == "PNG") {
          html+="<img src=\"data:image/png;base64, "+result.supportingFileData+"\"/>";
        }
        else if (result.supportingFileContentType =="pdf" || result.supportingFileContentType =="PDF") {
          Download("data:application/pdf;base64,"+result.supportingFileData, "data.pdf", "application/pdf");
        }
  
        Swal.fire({title: '<strong>Clause Results</strong>',html:html,width:'80%',showCloseButton: true,showConfirmButton:false }); 

    },
    email(object){
        Swal.fire({
          title: 'Send Query',
          input: 'textarea',
          width:'80%',
          inputValue: "Building Control Query Regarding Object ID:"+object,
          showCancelButton: true
          }).then((result) => {
            if (result.isConfirmed) {
              axios.put( this.$ruleEngine+this.projectId+'/messaging', {'message':result.value},{headers: { Authorization: `Bearer ${this.$keycloak.token}` }}).then(function() {
                Swal.fire('Message Submitted','Message Submitted','success');
              });
            }
          });      
    },
    submitResult(property,object){
      //<span id="LocateClause"><button @click="this.scrollIntoView(data.value[1])" type='button' class='btn btn-primary btn-sm'><i class='far fa-file-word'></i></button>&nbsp;&nbsp;</span>
      
      const outervue=this;
      var title="Submit Assessment";
      if (!this.buildingControlMode) title="Submit Result Claim";
      Swal.fire({title: title,
        html: 'Result:<select name="result" id="result"><option value="True">True</option><option value="False">False</option></select>',
        confirmButtonText: 'Submit Result',
        focusConfirm: false,
        showCancelButton: true,
        preConfirm: () => {
          const result = Swal.getPopup().querySelector('#result').value;
          return { result: result }
        }
      }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire({
                title: 'Upload Evidence',
                input: 'file',
                showCancelButton: true,
                inputAttributes: {
                  'accept': '*',
                  'aria-label': 'Upload your Evidence'
                }
              }).then((innerResult) => {
                  if (innerResult.isConfirmed) {
                    const reader = new FileReader();
                    const fileType = innerResult.value.type;
                    reader.onload = function(evt) {
                      var submission={};
                      submission.propertyId=property;
                      submission.id=object;
                      submission.result=result.value.result;
                      submission.missValue="";
                      submission.supportingFileContentType =fileType;
                      submission.supportingFileData =evt.target.result;
                      var realSubmission={}
                      realSubmission.answers=[submission];
                      axios.post( this.$ruleEngine+outervue.projectId+'/answers', realSubmission,{headers: { Authorization: `Bearer ${outervue.$keycloak.token}` }}).then(function() {
                        Swal.fire('Result Submitted','Result Submitted','success');
                        outervue.$emit('updateresults')
                      });
                    };
                    reader.readAsDataURL(innerResult.value);
                  } else {
                      var submission={};
                      submission.propertyId=property;
                      submission.id=object;
                      submission.result=result.value.result;
                      submission.missValue="";
                      submission.supportingFileContentType ="";
                      submission.supportingFileData ="";
                      var realSubmission={}
                      realSubmission.answers=[submission];
                      axios.post( this.$ruleEngine+outervue.projectId+'/answers', realSubmission,{headers: { Authorization: `Bearer ${outervue.$keycloak.token}` }}).then(function() {
                        Swal.fire('Result Submitted','Result Submitted','success');
                        outervue.$emit('updateresults')
                      });
                  } 
              });
          }
    });
    
  }
},
  asyncComputed : {
    async tableItems() {
      if (this.url==this.targetUrl || this.targetUrl=='') return {};
      //load objects from this clause
      var objectData={};
      for (let j=0; j < this.raseIds.length;j++) {
        
        var url = this.$ruleEngine+this.projectId+"/"+this.raseIds[j];
        if (this.raseIds[j].includes("Table")) {
          var splitted = this.raseIds[j].split("/");
          url=this.$ruleEngine+this.projectId;
          for (let i=0; i < splitted.length;i++) {
            url=url+"/"+splitted[i]
            if (splitted[i].includes("Table")) {
              url=url+"/"+splitted[i+1];
              break;
            }
          }
          url=url+"/"+splitted[splitted.length-1];
        }
        var response= await axios.get(url,{headers: { Authorization: `Bearer ${this.$keycloak.token}` }});
        if (!("entities" in response.data)) continue;
        for (var i=0; i < response.data.entities.length;i++) {
          var eId=response.data.entities[i];
          for (var x=0; x <this.complianceCheckData.idSet.length;x++) {
            if (this.complianceCheckData.idSet[x].id==eId) {
            
              if ( !(this.complianceCheckData.idSet[x].type in objectData)) objectData[this.complianceCheckData.idSet[x].type]=[];
              var sizeOD = 0;
              let found=false;
              for (let n=0; n < objectData[this.complianceCheckData.idSet[x].type].length;n++) {
                if (objectData[this.complianceCheckData.idSet[x].type][n].id==eId) {
                  found=true;
                  sizeOD=n;
                }
              }
              if (!found) {
                objectData[this.complianceCheckData.idSet[x].type].push({});
                sizeOD=objectData[this.complianceCheckData.idSet[x].type].length-1;
              }
            
              objectData[this.complianceCheckData.idSet[x].type][sizeOD].id=this.complianceCheckData.idSet[x].id;
              for (var z=0; z < response.data.complianceResults[i].length; z++ ) {
                var propertyName=response.data.complianceResults[i][z].reference.split(":")[0];
                var result=response.data.complianceResults[i][z].result;
                objectData[this.complianceCheckData.idSet[x].type][sizeOD][propertyName]=[result,propertyName,response.data.complianceResults[i][z],eId,this.targetUrl];         
              }
              
            }
          }
        }
      }

      var usedTags=[];
      response= await axios.get(this.$complianceDocumentService+this.targetUrl,{responseType: 'text',  headers: { 'Accept': 'application/xml'}});
      var parser = new DOMParser();
      var doc = parser.parseFromString(response.data, "text/html");
      var raseTags=doc.getElementsByTagName("span");
      for (x=0; x < raseTags.length;x++) {
        var title=raseTags[x].getAttribute("data-raseproperty");
        if (title==null) continue;
        if (!usedTags.includes(title)) {
          for (i=0; i < this.complianceCheckData.idSet.length;i++) {
            for (var j=0; j<this.complianceCheckData.idSet[i].requiredData.length;j++) {
              if (this.complianceCheckData.idSet[i].requiredData[j] == title) {
                sizeOD=objectData[this.complianceCheckData.idSet[i].type].length-1;
                objectData[this.complianceCheckData.idSet[i].type][sizeOD][title]=["null",propertyName,null,this.complianceCheckData.idSet[i].id,this.targetUrl];         
              }
            }
          }
          usedTags.push(title);
        }
      }
      
      return objectData;
    }
  } 
}
</script>
<style scoped>
li:not(:last-child) { 
   margin-bottom: 10px;  
}

.fa-check-circle {
color:green;
}

.fa-times-circle {
  color:red;
}

.fa-question-circle {
  color:orange;
}
</style>