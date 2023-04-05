/*
Copyright (C) 2022 Cardiff University

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

*/

import Vue from 'vue'
import Router from'vue-router'
import DCOMHome from "./components/DCOMHome.vue"
import Root from "./components/Root.vue"
import ComplianceDocument from "./components/ComplianceDocument.vue"
import ApplicationView from "./components/ApplicationView.vue"
import BuildingControlApplication from "./components/BuildingControlApplication.vue"
import ViewDocument from "./components/ViewDocument.vue"
import VueKeyCloak from '@dsb-norge/vue-keycloak-js'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'
import BootstrapVueTreeview from 'bootstrap-vue-treeview'
import '@forevolve/bootstrap-dark/dist/css/bootstrap-dark.min.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import VueFormWizard from 'vue-form-wizard'
import 'vue-form-wizard/dist/vue-form-wizard.min.css'
import AsyncComputed from 'vue-async-computed'
import Swal from 'sweetalert2'
import axios from "axios"
import CUIFCRenderer from "@tbeach/cuifcrenderer"
import '@tbeach/cuifcrenderer/dist/cuifcrenderer.css'
import VueClipboard from 'vue-clipboard2'

Vue.config.productionTip = false

Vue.use(BootstrapVue)
Vue.use(BootstrapVueIcons)
Vue.use(Router)
Vue.use(VueFormWizard)
Vue.use(BootstrapVueTreeview)
Vue.use(AsyncComputed)
Vue.use(CUIFCRenderer)
Vue.use(VueClipboard);

import setPathVariables from "./serviceurls.js"

setPathVariables(Vue);

//validate the path variables have trailing / 
if (Vue.prototype.$complianceDocumentService.substr(Vue.prototype.$complianceDocumentService.length - 1) != '/') Vue.prototype.$complianceDocumentService += "/";
if (Vue.prototype.$ruleEngine.substr(Vue.prototype.$ruleEngine.length - 1) != '/') Vue.prototype.$ruleEngine += "/";
if (Vue.prototype.$serviceLookup.substr(Vue.prototype.$serviceLookup.length - 1) != '/') Vue.prototype.$serviceLookup += "/";
if (Vue.prototype.$solibri.substr(Vue.prototype.$solibri.length - 1) != '/') Vue.prototype.$solibri += "/";



const router=new Router( {   mode: 'history',
  routes:[
    {
      path:'/compliancedocument/',
      component:ComplianceDocument
    },
    {
      path:'/application/',
      component:BuildingControlApplication,
      props:true
    },
    {
      path:'/buildingcontrol/',
      component:ApplicationView,
      props:true
    },
    {
      path:'/projectteam/',
      component:ApplicationView,
      props:true
    },
    {
      path:'/',
      component:DCOMHome
    },
    {
      path:'/viewdocument/:path*',
      component:ViewDocument,
      props:true
    }
  ]
})

router.beforeEach(async(to, from, next) => {
    if (to.path=="/buildingcontrol" || to.path=="/projectteam") {
      var id=to.query.uid;
      var response={};
      try {
        response= await axios.get("https://engine.dcom.org.uk/"+id);
      } catch (err) {
        Swal.fire({icon: 'error', title: 'Oops...', text: 'That project ID is invalid'});
        next({name:""});
        return;
      }
      if (to.path == "/buildingcontrol") {
        Vue.use(VueKeyCloak, {
          init: {
            onLoad: 'login-required',
            checkLoginIframe : false
          },  
          onReady: () => {
              next();
          },
          config: {
            url: 'https://security.cuspplatform.com/',
            clientId: 'DCOMAPI',
            realm: 'DCOM-BuildingControl'
          }
        })
      
      }else if (to.path == "/projectteam") {
        var team=response.data.securityServiceURI;
        var teamUrl=team.substring(0,team.lastIndexOf("/"));
        var teamRealm=team.substring(team.lastIndexOf("/")+1);
        alert(teamRealm);
        alert(teamUrl);
        Vue.use(VueKeyCloak, {
          init: {
            onLoad: 'login-required',
            checkLoginIframe : false
          },
          onReady: () => {
            next();
          },
          config: {
            url: teamUrl,
            clientId: 'DCOMAPI',
            realm: teamRealm,
          }
        })
      }
    }else if (to.path == "/application") {
      team=to.query.team;
      teamUrl=team.substring(0,team.lastIndexOf("/"));
      teamRealm=team.substring(team.lastIndexOf("/")+1);
      Vue.use(VueKeyCloak, {
        init: {
          onLoad: 'login-required',
          checkLoginIframe : false
        },
        onReady: () => {
          next();
        },
        config: {
          url: 'https://'+teamUrl,
          clientId: 'DCOMAPI',
          realm: teamRealm
        }
      })
    } else {
      next();
    }
});

new Vue({render:h=>h(Root),router}).$mount('#app')