<template>
  <div  class="container">
  <center><a href="/">Home</a></center>
  <form-wizard title="Submit a Building Control Application" subtitle="" @on-complete="onComplete()" finishButtonText="Submit Application">
    <tab-content title="Select Building Control Body">
    <b-card title="Select a Building Control Body" class="mb-2">
     <b-card-text>
      <b-form-select v-model="regulatorIdentification" :options="regulatorIdentificationOptions"></b-form-select>
      <label for="projectId">Project Id:</label><b-form-input id="projectId" v-model="projectId" placeholder="If you have a project ID Please Enter it here"></b-form-input><br/><br/>
      </b-card-text>
     </b-card>
    </tab-content>
    <tab-content title="About the Building and Works">
    <div class="row top-buffer"><b-col>
    <b-card title="Building Lifecycle Stage" class="mb-2">
      <b-card-text>
        <label for="lifecyclestage">Lifecycle stage of the application:</label><b-form-select  id="lifecyclestage" v-model="lifecyclestage" :options="lifecyclestageOptions"></b-form-select><br/><br/>
        </b-card-text>
        </b-card>
       </b-col></div> 
       <div class="row top-buffer"><b-col>
          <b-card title="About the Building" class="mb-2">
            <b-card-text>
            
                <label for="address">Address:</label><b-form-textarea id="address" v-model="address" placeholder="Please enter the address where the work is to be carried out." rows="3" max-rows="6"></b-form-textarea><br/><br/>
                <label for="uprn">URPN/Postcode:</label><b-form-input id="uprn" v-model="uprn" placeholder="Please enter the UPRN of the building considered, if you do not have a UPRN please enter the postcode."></b-form-input><br/><br/>
                <label for="description">Description:</label><b-form-textarea id="description" v-model="description" placeholder="Please enter a full description of the work. Please do not duplicate any information from the Building Model." rows="3" max-rows="6"></b-form-textarea><br/><br/>
              </b-card-text>
            </b-card>
      
      </b-col></div>
      <div class="row top-buffer"><b-col>
        <b-card title="Building Usage" class="mb-2">
          <b-card-text>
            <label for="presentUse">Current Use:</label><b-form-input id="presentUse" v-model="presentUse" placeholder="Please enter the present use of the building."></b-form-input><br/><br/>
            <label for="proposedUse">Proposed Use:</label><b-form-input id="proposedUse" v-model="proposedUse" placeholder="Please enter the proposed use of the building."></b-form-input><br/><br/>
        </b-card-text>
       </b-card>
     </b-col></div>
 </tab-content>
 <tab-content title="Applicant Details">

 <b-card title="Applicant Details" class="mb-2">
  <b-card-text>
       <label for="applicantTitle">Title:</label><b-form-input id="applicantTitle" v-model="applicantTitle" placeholder="Please enter the title of the applicant."></b-form-input><br/><br/>
       <label for="applicantName">Name:</label><b-form-input id="applicantName" v-model="applicantName" placeholder="Please enter the name of the applicant."></b-form-input><br/><br/>
       <label for="applicantCompanyName">Company Name:</label><b-form-input id="applicantCompanyName" v-model="applicantCompanyName" placeholder="Please enter the company name of the applicant."></b-form-input><br/><br/>
       <label for="applicantemail">E-Mail:</label><b-form-input id="applicantemail" v-model="applicantemail" placeholder="Please enter the email of the applicant."></b-form-input><br/><br/>
       <label for="applicantaddress">Applicant Address:</label><b-form-textarea id="applicantaddress" v-model="applicantaddress" placeholder="Please enter the address of the applicant." rows="3" max-rows="6"></b-form-textarea><br/><br/>
       <label for="applicantPostcode">Postcode:</label><b-form-input id="applicantPostcode" v-model="applicantPostcode" placeholder="Please enter the postcode of the applicant."></b-form-input><br/><br/>
       <label for="applicantphone">Tel No:</label><b-form-input id="applicantphone" v-model="applicantphone" placeholder="Please enter the phone number of the applicant."></b-form-input><br/><br/>
       <label for="applicantmobile">Mobile No:</label><b-form-input id="applicantmobile" v-model="applicantmobile" placeholder="Please enter the mobile number of the applicant."></b-form-input><br/><br/>
   </b-card-text>
  </b-card>
 </tab-content>
 <tab-content title="Agent Details">
 <b-card title="Agent Details" class="mb-2">
  <b-card-text>
     <label for="agentTitle">Title:</label><b-form-input id="agentTitle" v-model="agentTitle" placeholder="Please enter the title of the agent."></b-form-input><br/><br/>
     <label for="agentName">Name:</label><b-form-input id="agentName" v-model="agentName" placeholder="Please enter the name of the agent."></b-form-input><br/><br/>
     <label for="agentCompanyName">Company Name:</label><b-form-input id="agentCompanyName" v-model="agentCompanyName" placeholder="Please enter the company name of the agent."></b-form-input><br/><br/>
     <label for="agentemail">E-Mail:</label><b-form-input id="agentemail" v-model="agentemail" placeholder="Please enter the email of the agent."></b-form-input><br/><br/>
     <label for="agentaddress">Applicant Address:</label><b-form-textarea id="agentaddress" v-model="agentaddress" placeholder="Please enter the address of the agent." rows="3" max-rows="6"></b-form-textarea><br/><br/>
     <label for="agentPostcode">Postcode:</label><b-form-input id="agentPostcode" v-model="agentPostcode" placeholder="Please enter the postcode of the agent."></b-form-input><br/><br/>
     <label for="agentphone">Tel No:</label><b-form-input id="agentphone" v-model="agentphone" placeholder="Please enter the phone number of the agent."></b-form-input><br/><br/>
     <label for="agentmobile">Mobile No:</label><b-form-input id="agentmobile" v-model="agentmobile" placeholder="Please enter the mobile number of the agent."></b-form-input><br/><br/>
    </b-card-text>
  </b-card>
   </tab-content>
 <tab-content title="Declarations">
  <b-container fluid> 
     <div class="row top-buffer">
      <b-col>
       <b-card title="Prescribed Period" class="mb-2">
         <b-card-text>
            The Building Act allows five weeks to give a decision on a ‘full plan’ submission. Our aim is to process every submission as soon as
            possible. In some cases we may require more information from you. To allow you time to obtain this information, we suggest that
            you agree to the extension of the five week period to two months. It will not delay our processing of your application.
         </b-card-text>
         <b-form-checkbox id=conditions value="accepted" unchecked-value="not_accepted">I consent to an extension time.</b-form-checkbox>
       </b-card>
      </b-col>
     </div>
     
     <div class="row top-buffer">
      <b-col>
       <b-card title="Conditions" class="mb-2">
         <b-card-text>
          Do you consent to the plans being passed subject to conditions where appropriate?
         </b-card-text>
         <b-form-checkbox value="accepted" unchecked-value="not_accepted">I  consent to the plans being passed subject to conditions.</b-form-checkbox>
       </b-card>
      </b-col>
     </div>
     
     <div class="row top-buffer">
      <b-col>
       <b-card title="Electrical Installations" class="mb-2">
         <b-card-text>
         Will any electrical installation work be designed, constructed, inspected and tested in accordance with BS7671 or will it be undertaken by an electrician registered with a competent persons scheme?
         </b-card-text>
         <b-form-checkbox value="accepted" unchecked-value="not_accepted">I confirm that electrical installation work will be designed, constructed, inspected and tested in accordance with BS7671 or it will be undertaken by an electrician registered with a competent persons scheme.
         </b-form-checkbox>
       </b-card>
      </b-col>
     </div>
     
     <div class="row top-buffer">
      <b-col>
       <b-card title="Fire Safety" class="mb-2">
         <b-card-text>
          Is it the intention to carry out building work in relation to a building which is, or will be, within the scope of the Regulatory Reform (Fire Safety) Order 2005? 
         </b-card-text>
         <b-form-checkbox value="accepted" unchecked-value="not_accepted">It is the intention to carry out building work in relation to a building which is, or will be, within the scope of the Regulatory Reform (Fire Safety) Order 2005.</b-form-checkbox>
       </b-card>
      </b-col>
     </div>
 
</b-container> 
 </tab-content>
</form-wizard>
  </div>
</template>

<script>
import Swal from 'sweetalert2'
import axios from "axios"

export default {
  name: 'BuildingControlApplication',
  components: {
  },
  data() {
     return {
       regulatorIdentification: 'null',
       lifecyclestage: 'null',
       address:'',
       description:'',
       presentUse:'',
       proposedUse:'',
       uprn:'',
       applicantTitle:'',
       applicantName:'',
       applicantCompanyName:'',
       applicantemail:'',
       applicantaddress:'',
       applicantPostcode:'',
       applicantphone:'',
       applicantmobile:'',
       agentTitle:'',
       agentName:'',
       agentCompanyName:'',
       agentemail:'',
       agentaddress:'',
       agentPostcode:'',
       agentphone:'',
       agentmobile:'',
       consentToExtension:'',
       consentToConditions:'',
       projectId:'',
       electricalSafetyConfirmation:'',
       fireSafetyOrder:'',
       regulatorIdentificationOptions: [
          { value: null, text: 'Please select a building control body to submit your application' },
        ],
        lifecyclestageOptions: [
          { value: null, text: 'Please select the lifecycle stage of the application' },
          { value: '0', text: 'Strategic definition' },
          { value: '1', text: 'Preparation and briefing' },
          { value: '2', text: 'Concept design' },
          { value: '3', text: 'Spatial coordination' },
          { value: '4', text: 'Technical design' },
          { value: '5', text: 'Manufacturing and construction' },
          { value: '6', text: 'Handover' },
          { value: '7', text: 'Use' }
        ],
     modelServerTypeOptions:[
          { value: null, text: 'Please select a modelserver type' },
          { value: 'SMC', text: 'Solibri Model Checker' }
        ]
      }
   },
   methods: { 
    async onComplete() {
      var submission={};
      submission.operationMode="forassessment";
      submission.lifecyclestage=this.lifecyclestage;
      submission.projectSecurityServiceType="Keycloak";
      submission.projectSecurityServiceURI="https://"+this.$route.query.team; 
      submission.complianceDocumentReference=[this.$complianceDocumentService+"GB-ENG/3/AD_PartL2A/2013_edition_with_2016_amendments", this.$complianceDocumentService+"GB-ENG/3/AD_PartM2/2015",this.$complianceDocumentService+"GB-ENG/3/BB100/2021_Consultation"]; 
      submission.modelServerType="Solibri";
      submission.modelServerURL=this.$solibri; 
      submission.UPRN=this.uprn;
      submission.regulatorIdentification=this.regulatorIdentification;
      var agent={};
      agent.title=this.agentTitle;
      agent.name=this.agentName;
      agent.companyName=this.agentCompanyName;
      agent.email=this.agentemail;
      agent.address=this.agentaddress;
      agent.postcode=this.agentPostcode;
      agent.fax="";
      agent.phone=this.agentphone;
      agent.mobile=this.agentmobile;
      agent.position="agent";
      var applicant={};
      applicant.title=this.applicantTitle;
      applicant.name=this.applicantName;
      applicant.companyName=this.applicantCompanyName;
      applicant.email=this.applicantemail;
      applicant.address=this.applicantaddress;
      applicant.postcode=this.applicantPostcode;
      applicant.fax="";
      applicant.phone=this.pplicantphone;
      applicant.mobile=this.applicantmobile;
      applicant.position="applicant";
      submission.individuals=[applicant,agent];
      
      submission.address=this.address;
      submission.description=this.description;
      submission.presentUse=this.presentUse;
      submission.proposedUse=this.proposedUse;
      submission.fireSafetyOrder=this.fireSafetyOrder;
      submission.consentToExtension=this.consentToExtension;
      submission.consentToConditions=this.consentToConditions;
      submission.electricalSafetyConfirmation=this.electricalSafetyConfirmation;
      if (this.projectId != '') await axios.put(this.$ruleEngine+"?id="+this.projectId, submission);
      else await axios.put(this.$ruleEngine, submission);
      Swal.fire({ position: 'center', icon: 'success', title: 'Your application has been submitted', showConfirmButton: true, timer: 1500}).then((result) => {
          if (result.isConfirmed)     window.location="/";
        });
    }
   },
   mounted() {
     axios.get( this.$serviceLookup+"eureka/apps/RESULTSERVICE").then( (response) => {
        var regulators=JSON.parse(response.data).application.instance;
        for (var i=0; i < regulators.length;i++) {
          var regulator=regulators[i];
          this.regulatorIdentificationOptions.push({ value:regulator.hostName,text:regulator.vipAddress});
        }
      });
   }
}
</script>
<style>
</style>