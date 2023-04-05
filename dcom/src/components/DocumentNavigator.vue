<template>
  <div style="max-height: inherit;  overflow-y: auto;">
    <template v-if="showTitle==true">
      <b-card style='width:98%;text-align:center;'>{{title}} <i @click="help()" class="fas fa-question-circle fa-1x"></i></b-card>
    </template>
    <span v-if="this.treeData.length==0">Loading Compliance Document...</span>
    <b-tree-view v-if="this.treeData.length!=0 && projectId != undefined" @contextMenuItemSelect="menuItemSelected" :contextMenuItems="[{ code: 'VIEW_RESULT', label: 'View Clause Results' },{ code: 'SUBMIT_RESULT', label: 'Submit Manual Result' }]" :contextMenu="true" :renameNodeOnDblClick="false" prependIconClass="fas" :showIcons="true" :data="treeData"  @nodeSelect="nodeSelect" ></b-tree-view>
    <b-tree-view v-if="this.treeData.length!=0 && projectId == undefined" @contextMenuItemSelect="getLink" :contextMenuItems="[{ code: 'VIEW_LINK', label: 'Get Direct Link' }]" :contextMenu="true" :renameNodeOnDblClick="false" prependIconClass="fas" :showIcons="true" :data="treeData"  @nodeSelect="nodeSelect" ></b-tree-view>
  </div>
</template>

<script>
import axios from "axios"
import Swal from 'sweetalert2'

export default {
  name: 'DocumentNavigator',
  props:{
    url : {
      type:String
    },
    showTitle : {
      type:Boolean,
      default:true
    },
    token : {
      type:String
    },
    projectId: {
      type:String
    },
    showIcons :{
      type:Boolean,
      default:false
    },
    complianceCheckResults : {
      type: Array
    },
    filterType: {
      type: String
    },
    buildingControlMode: {
      type: Boolean,
      default:false
    }
  },
  data() {
    return {
      treeData:[],
      title:'',
      rootName:'',
      raseIds:{},
      tableNo:0,
      localTableNo:0
    }
  },
  methods: {
      help() {
        var helpHtml = "To start navigating the compliance document, please select a paragraph from the tree below.";
        Swal.fire({title:'Help',html:helpHtml,icon:'question'});
      },
      getLink() {
       this.$copyText("https://interface.dcom.org.uk/viewdocument/"+this.url);
      },
      menuItemSelected(item, node) {
        if (item.code === 'VIEW_RESULT') {
          var result=this.lookupResult(node.data.id);
          if (result==null) {
            Swal.fire('No Results Available for this Clause');
            return;
          }
  
          var html="<b>Result</b>:"+result.result+"</br><b>Reasons</b>:<ol>";
          for (var i=0; i < result.reasons.length;i++) {
            html+="<li>"+result.reasons[i]+"</li>";
          }
          html+="</ol>";
          html+="<b>Attribution:</b>"+result.attributation+"</br><b>Supporting Evidence:</b></br>";
          if (result.supportingFileContentType == "png" || result.supportingFileContentType == "PNG") {
            html+="<img src=\"data:image/png;base64, "+result.supportingFileData+"\"/>";
          }
    
          Swal.fire({title: '<strong>Clause Results</strong>',html:html,width:'80%',showCloseButton: true,showConfirmButton:false }); 

        } else if (item.code == "SUBMIT_RESULT") {
            var resultCheck=this.lookupResult(node.data.id);
            if (resultCheck!=null) {
              Swal.fire('A result has already been determined for this clause');
              return;
            }
            var title='Submit Assessment';
            if (!this.buildingControlMode) title="Submit Result Claim";
            Swal.fire({title: title,
              html: 'Result:<select name="result" id="result"><option value="True">True</option><option value="False">False</option></select> <br/>Reasons:<br/> <textarea id="reasons" name="reasons" rows="10"></textarea>',
              confirmButtonText: 'Submit Result',
              focusConfirm: false,
              showCancelButton: true,
              preConfirm: () => {
                const result = Swal.getPopup().querySelector('#result').value;
                const reasons = Swal.getPopup().querySelector('#reasons').value.split('\n');
                return { reasons: reasons, result: result }
              }
            }).then((result) => {
                  if (result.isConfirmed) {
                      var submission={};
                      submission.complianceDocumentReference=this.url+node.data.id;
                      submission.reasons=result.value.reasons;
                      submission.result=result.value.result;
                      var realSubmission={}
                      realSubmission.dataItems=[submission];
                      var outervue=this;
                      axios.post( this.$ruleEngine+this.projectId+'/results', realSubmission,{headers: { Authorization: `Bearer ${this.$keycloak.token}` }}).then(function() {
                        Swal.fire('Result Submitted','Result Submitted','success');
                        outervue.$emit('updateresults')
                      });
                      
                      
                  }
            });
        }
      },
      lookupResult: function(inputName) {
        var newName=this.rootName+inputName ;
        for (var i=0; i < this.complianceCheckResults.length;i++) {
          if (this.complianceCheckResults[i].reference==newName || this.complianceCheckResults[i].reference==newName+"/") return this.complianceCheckResults[i];
        }
        if (!(inputName in this.raseIds)) return null;
        let currentRes=null;
        for (var x=0; x < this.raseIds[inputName].length;x++) {
          let innerName = this.sanitiseName(inputName+"/"+this.raseIds[inputName][x]);
          var myRes = this.lookupResult(innerName)
          //now try a more relaxed checkId
          if (myRes==null) {
              let splitter = innerName.split("/");
              for (var z=0; z < this.complianceCheckResults.length;z++) {
                if (this.complianceCheckResults[z].reference.startsWith(this.rootName+"/"+splitter[1]) && this.complianceCheckResults[z].reference.endsWith(splitter[splitter.length-1])) {
                  myRes=this.complianceCheckResults[z];
                }
              }
          }
          if (myRes!=null && myRes.result=="FAIL") return myRes;
          if (myRes!=null && myRes.result=="") return myRes;
          currentRes=myRes;
          
        }
        return currentRes;
      },
      getIcon:function(resultData,hasRase) {
        var result="unknown";
        if (resultData!=null) {
          if (resultData.result.toLowerCase()=="pass") result="true";
          if (resultData.result.toLowerCase()=="fail") result="false";
        }
        if (result=="true") {
          return "fa-check-circle";
        } else if (result=="false"){
          return "fa-times-circle";
        } else if (result=="na") {
          return "fa-minus-circle";
        } else {
          if (hasRase) return "fa-question-circle";
          else return "fa-info-circle";
        }
      },
     randomIcon: function () {
        var num=Math.floor(Math.random() * 5);
        if (num==0) {
          return "fa-check-circle";
        } else if (num==1) {
          return "fa-times-circle";
        } else if (num==2) {
          return "fa-info-circle"
        } else if (num==3) {
          return "fa-question-circle";
        } else if (num==4) {
          return "fa-minus-circle";
        }
     },
     getRASEId: function (body) {
      let out = [];
      var parser = new DOMParser();
      var document = parser.parseFromString(body, "text/html");
      var elements = document.getElementsByTagName('span');
      for (let i=0; i < elements.length;i++) {
        let element = elements.item(i);
        if (element.hasAttribute("data-raseType") && element.getAttribute("data-raseType").includes("Section")) {
          out.push(element.getAttribute("id"))
        }
      }
      var divs = document.getElementsByTagName('div');
      for (let i=0; i < divs.length;i++) {
        let element = divs.item(i);
        if (element.hasAttribute("data-raseType") && element.getAttribute("data-raseType").includes("Section")) {
          out.push(element.getAttribute("id"))
        }
      }
      return out;
     },
     detectRase(body) {
      if (body==null) return false;
      if (body.includes("RequirementSection")) return true;
      if (body.includes("ExceptionSection")) return true;
      if (body.includes("SelectionSection")) return true;
      if (body.includes("ApplicationSection")) return true;
      return false;
     },
     rollUpRASE: function(subPara) {
      let output=[];
      if (typeof subPara =="undefined") return output;
      for (let i=0; i < subPara.length;i++) {
        if (typeof subPara[i].raseType !="undefined") output.push(subPara[i].raseId);
        output.push(...this.getRASEId(subPara[i]["body"]));
        output.push(...this.rollUpRASE(subPara.paragraphs));
      }
      return output;
     },
     findTable: function(item,sectionNo) {
      let tableList = []
      if (typeof item.paragraphs != "undefined") {
        for (var x=0; x < item.paragraphs.length;x++) tableList.push( ...this.findTable(item.paragraphs[x]));
      }
      if (typeof item.inserts != "undefined") {
        for (x=0; x < item.inserts.length;x++) {
          if (typeof item.inserts[x].imageData =="undefined") {
            this.tableNo=this.tableNo+1;
            this.localTableNo=this.localTableNo+1;
            let tableObj ={};
            tableObj.id="/"+sectionNo+"/Table/"+this.localTableNo;
            tableObj.lookupId="/Table/"+this.tableNo;
            tableObj.name="Table "+this.tableNo;
            tableObj.children=[];
            tableList.push(tableObj);
            if (typeof this.complianceCheckResults !="undefined") {
              let pass=false;
              let fail=false;
              for (var z=0; z < this.complianceCheckResults.length;z++) {
                if (this.complianceCheckResults[z].reference.startsWith(this.rootName+tableObj.id)) {
                  if (this.complianceCheckResults[z].result=="PASS") pass=true;
                  if (this.complianceCheckResults[z].result=="FAIL") {
                    fail=true;
                    break;
                  }
                  if (this.complianceCheckResults[z].result=="") {
                    fail=false;
                    pass=false;
                    break;
                  }
                  if (typeof this.raseIds[tableObj.id] == "undefined") this.raseIds[tableObj.id]=[];
                  this.raseIds[tableObj.id].push(this.complianceCheckResults[z].reference);
                }
              }
              if (fail) tableObj.icon="fa-times-circle";
              else if (pass) tableObj.icon="fa-check-circle";
              else tableObj.icon="fa-info-circle";
            }
            
          }
        }
      }
      return tableList;
     },
     parseSection: function (dataObj,sectionTitle,id,sectionNo,paraNo) {
        var childObj=[];
        var i=0;
        var hasRase=false;
        if (typeof dataObj.paragraphs != "undefined") {
          for (i=0; i < dataObj.paragraphs.length;i++) {
              childObj.push(...this.findTable(dataObj.paragraphs[i],sectionNo));
              if (typeof dataObj.paragraphs[i]["numbered"] !="undefined" && dataObj.paragraphs[i]["numbered"]=="global"){
                var paraObj={};
                paraObj.id=id+paraNo;
                var paraHasRase = this.detectRase(dataObj.paragraphs[i]["body"]);
                if (typeof dataObj.raseType !="undefined") paraHasRase=true;
                hasRase= paraHasRase;
                if (hasRase && typeof dataObj.raseType =="undefined") this.raseIds[id+paraNo] = this.getRASEId(dataObj.paragraphs[i]["body"]);
                else if (hasRase && typeof dataObj.raseType !="undefined") {
                  this.raseIds[id+paraNo] = [dataObj.raseId];
                  this.raseIds[id+paraNo].push(...this.getRASEId(dataObj.paragraphs[i]["body"]));
                }
                if (paraHasRase) this.raseIds[id+paraNo].push(...this.rollUpRASE(dataObj.paragraphs[i].paragraphs));
                if (this.showIcons)  paraObj.icon=this.getIcon(this.lookupResult(paraObj.id),paraHasRase);
                paraObj.name=sectionTitle+paraNo;
                paraNo++;
                if (this.filterType!="none" && this.showIcons) {
                  if (paraObj.icon==this.filterType) childObj.push(paraObj);
                } else childObj.push(paraObj);
              }
          }
        }
        
        if (typeof dataObj.sections != "undefined") {
          //let charCode = "a".charCodeAt(0);
          for (i=0; i < dataObj.sections.length;i++) {
            var sectionObj={};
            if (typeof dataObj.sections[i]["numbered"] =="undefined" || dataObj.sections[i]["numbered"]!="global"){
                  if (typeof dataObj.sections[i]["dcterms:title"] != "undefined") {
                  //  dataObj.sections[i]["dcterms:title"]=String.fromCharCode(charCode);
                  //  charCode++;
                  //}
                  sectionObj.id=id+dataObj.sections[i]["dcterms:title"];
                  sectionObj.name=dataObj.sections[i]["dcterms:title"];
                  [sectionObj.children,paraNo]=this.parseSection(dataObj.sections[i],sectionTitle,sectionObj.id+"/",sectionNo,paraNo);
                  if (this.showIcons)  sectionObj.icon=this.getSectionIcon(sectionObj.children,sectionObj.id);
               } else {
                
                var children = [];
                [children,paraNo]=this.parseSection(dataObj.sections[i],sectionTitle,id,sectionNo,paraNo);
                childObj = childObj.concat(children);
              }
            } else {
              sectionObj.id=id+sectionNo;
              sectionObj.name=sectionTitle+sectionNo+": "+dataObj.sections[i]["dcterms:title"];
              [sectionObj.children,paraNo]=this.parseSection(dataObj.sections[i],sectionTitle+sectionNo+".",sectionObj.id+"/",sectionNo,1);
              if (this.showIcons)  sectionObj.icon=this.getSectionIcon(sectionObj.children,sectionObj.id);
              sectionNo++;
              this.localTableNo=0;
            } 
            if (this.filterType!="none" && this.showIcons) {
              if (typeof sectionObj.icon != "undefined" && sectionObj.icon==this.filterType) childObj.push(sectionObj);
              else if (typeof sectionObj.children != "undefined" && sectionObj.children.length>0) childObj.push(sectionObj);
            } else if (Object.keys(sectionObj).length > 0) childObj.push(sectionObj);
          }
        }
        return [childObj,paraNo];
     },
     getSectionIcon(sectionObjChildren,id) {
       let lookup = this.lookupResult(id);
       if (lookup!=null) return this.getIcon(lookup,false);
       let icon='fa-info-circle';
       for (let x=0; x < sectionObjChildren.length;x++) {
         if (sectionObjChildren[x].icon == 'fa-times-circle')  {
           icon='fa-times-circle';
           break;
         } else if (sectionObjChildren[x].icon == 'fa-check-circle')  {
           icon='fa-check-circle';
         } else if (sectionObjChildren[x].icon == 'fa-minus-circle')  {
           if (icon!='fa-check-circle')  icon='fa-minus-circle';
         } else if (sectionObjChildren[x].icon == 'fa-question-circle')  {
            icon='fa-question-circle';
            break;
         }
       }
       return icon;
     },
     nodeSelect(item,selected) {
        if (selected) {
          var id = item.data.id;
            if (typeof item.data.lookupId!="undefined") this.$emit('selectedParagraph',item.data.lookupId);
            else this.$emit('selectedParagraph',id);
            let fullRaseId=[];
            if (typeof this.raseIds[id] !="undefined") {
              for (let x=0; x < this.raseIds[id].length;x++) {
                fullRaseId.push(this.rootName+this.sanitiseName(id)+"/"+this.raseIds[id][x]);
              }
              this.$emit('selectedRASENodes',fullRaseId);
            }
        }
    },
    sanitiseName(name) {
      let data = name.split(" ");
      name="";
      for (let i=0; i < data.length;i++) {
          let d = data[i];
          let cap = d.trim().substring(0, 1).toUpperCase() + d.substring(1);
          name=name+cap
      }
      name = name.replace(/[^a-zA-Z0-9 -/_]/i, "");
      return name;
    }
  },
  mounted() {
    axios.get( this.$complianceDocumentService+this.url).then( (response) => {
      this.document = response.data;
      var sectionNo=this.document["dcom:startSectionNumber"];
      if (typeof sectionNo == "undefined") sectionNo=1;
      this.treeData=[{'id':'','name':this.document["dcterms:title"]}];
      this.title=this.document["dcterms:title"];
      this.rootName = this.sanitiseName(this.document["dcterms:coverage.spatial"]+"/"+this.document["dcterms:type"]+"/"+this.document["dcterms:title"]+"/"+this.document["dcterms:version"]);
      this.treeData[0].children=this.parseSection(this.document,"","/",sectionNo,1,1)[0];
    });
  }
}
</script>
<style>
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