<template>
<div class="wrapper">
<nav id="sidebar">
  <center><b-button href="/" size="sm" variant="outline-primary">Home</b-button> <b-button size="sm" :pressed.sync="showRase" variant="outline-primary">Toggle Logic</b-button></center>
  <DocumentNavigator @selectedParagraph='selectParagraph' v-bind:url="url"/>
</nav>
<DocumentPane style="width:100%" :key="showRase" v-bind:rase='showRase' v-bind:url="url" v-bind:section="section" v-bind:paragraph="paragraph" v-bind:diff="diff"/>
</div>
</template>
<script>
import DocumentPane from "./DocumentPane.vue"
import DocumentNavigator from "./DocumentNavigator.vue"
export default {
  name: 'ViewDocument',
  props: ['path'],
  components: {DocumentNavigator,DocumentPane},
  data() {
    return {
      subPath:'',
      section:0,
      paragraph:0,
      showRase:false
    }
  },
  computed: {
    url: function() {
      let newPath = this.path.split("/");
      if (newPath.length > 4) {
        newPath = newPath[0]+"/"+newPath[1]+"/"+newPath[2]+"/"+newPath[3];
      } else newPath = this.path;
      
      return newPath+this.subPath;
    },
    diff: function() {
      if (typeof this.$route.query.diff != undefined) {
        return this.$route.query.diff;
      } else {
        return null;
      }
    }
  },
  mounted () {
    let newPath = this.path.split("/");
    if (newPath.length > 4) {
        this.section = newPath[4]-1;
        if (!isNaN(newPath[newPath.length-1])) this.paragraph = newPath[newPath.length-1]-1;
        for (var i=4; i < newPath.length;i++) this.subPath = this.subPath + "/" + newPath[i];
    }
  },
  methods: {
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
        this.subPath=para.replaceAll(" ","_");
      }
  }
}
</script>
<style>
.wrapper {
    display: flex;
    width: 100%;
    align-items: stretch;
}

#sidebar {
    min-width: 350px;
    max-width: 350px;
    min-height: 100vh;
}

#sidebar.active {
    margin-left: -350px;
}   

@media (max-width: 768px) {
    #sidebar {
        margin-left: -350px;
    }
    #sidebar.active {
        margin-left: 0;
    }
}
</style>