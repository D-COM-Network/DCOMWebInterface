<template>
<div v-bind:class="{raseBody: rase}" v-html=documentData class='documentBody' :style="'--paragraph-start: '+this.paragraph+'; --section-start: '+this.actualSection+';'" id="content">
</div>
</template>
<script>
import axios from "axios"
import Swal from 'sweetalert2'

export default {
  name: 'DocumentPane',
  props: ['url','section','paragraph','diff','rase'],
  data() {
     return {
        actualSection:this.section,
      }
  },
  asyncComputed: {  
    async documentData() {
      this.actualSection=this.section;
      var response= '';
      if (typeof this.diff != "undefined") response = await axios.get( this.$complianceDocumentService+this.url+"?diff="+this.diff,{responseType: 'text',  headers: { 'Accept': 'application/xml'}});
      else response = await axios.get( this.$complianceDocumentService+this.url,{responseType: 'text',  headers: { 'Accept': 'application/xml'}});
      var parser = new DOMParser();
      var doc = parser.parseFromString(response.data, "text/html");
      var mTags=doc.getElementsByTagName("meta");
      var titleTag=doc.getElementsByTagName("title");
      this.title=titleTag[0].textContent;
      
      var styleTags=doc.getElementsByTagName("link");
      for (var i=0; i < styleTags.length;i++) styleTags[i].remove();
      
      
      var definitions=[];
      var definitionsTags=doc.getElementsByTagName("dt");
      for (i=0; i < definitionsTags.length;i++) { 
        definitionsTags[i].setAttribute("id",definitionsTags[i].textContent);
        definitions[i]=definitionsTags[i].textContent;
      }
        
      if (this.url.split("/").length <=4) {
  
        for (i=0; i < mTags.length;i++) {
          if (mTags[i].getAttribute('name')=="dcom:startSectionNumber") {
            this.actualSection=mTags[i].getAttribute('content')-1;
          }
        }
      }
      var sTags=doc.getElementsByTagName("section");
      for (i=0; i < sTags.length;i++) {
        let numbered = sTags[i].getAttribute('data-numbered');
        if (numbered!=null && numbered=="global") {
          sTags[i].className += "numbered";
        }
        if (sTags[i].parentElement.nodeName=="SECTION" && sTags[i].parentElement.parentElement.nodeName=="BODY") {
           sTags[i].className += " bigtitle";
        }
        sTags[i].className += " production";
      }
      var pTags=doc.getElementsByTagName("p");
      for ( i=0; i < pTags.length;i++) {
        let numbered = pTags[i].getAttribute('data-numbered');
        if (pTags[i].parentElement.nodeName=="LI") {
          pTags[i].className += "production";
        } else {
          if (numbered!=null && numbered=="global" && !isNaN(this.actualSection)) {
            pTags[i].className += "numbered production";
          } else {
            pTags[i].className += "production";
          }
        }
        // add in cross references
        for (var x=0; x < definitions.length;x++) {
          pTags[i].innerHTML=pTags[i].innerHTML.replace(definitions[x],"<a title='Click here to view this definition' href='#"+definitions[x]+"' target=_blank>"+definitions[x]+"</a>");
        }
        
      }
      var docText = new XMLSerializer().serializeToString(doc);
      var currentUrl=window.location.href;
      if (currentUrl.includes("#")) {
        var h = currentUrl.substring(currentUrl.indexOf("#")+1);
        var matcher="<dt id=\""+h+"\"";
        docText = docText.substring(docText.indexOf(matcher));
       
      }
      return docText;
    }
  },
  methods: {
     clickElement: function (event) {
      var element=event.srcElement;
      if (element.getAttribute("data-raseproperty")!=null) {
        Swal.fire({ title: element.getAttribute("data-raseproperty"), input: 'text', showCancelButton: true, confirmButtonText: 'Submit', showLoaderOnConfirm: true});
      }
     }
  }
}
</script>
<style scoped>
.documentBody {
  counter-set:section var(--section-start) paragraph 0 table 0 figure 0;
  background-color: white;
  color:black !important;
  text-align:left;
  font-family:"verdana";
  font-size:15px;
}

>>> p[title]:before {
  content:attr(title);
  font-weight: bold;
  color: #3d763d;
}

>>> section.bigtitle:before {
  content:attr(title);
  font-weight:bold;
  font-size:large;
}

>>> section[title]:before {
  content:attr(title);
  font-weight: bold;
  color: #3d763d;
}

>>> table > caption {
  caption-side:top;
}

>>> table > caption::before {
  counter-increment:table;
  content:"Table " counter(table) ": ";
}


>>> figure > caption::before {
  counter-increment:figure;
  content:"Figure " counter(figure) ": ";
}

>>> a {
    color: #3d763d;
}

>>> img {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 50%;
}

>>> span[title]:hover:after {
 content: " ( "attr(title)" ) ";	
}

>>> span[title] {
 color:#3d763d;
}

>>> [class="italic"] {
  font-style: italic;
  color: grey;
}


>>> [class="bold"] {
  font-weight: bold;
}

>>> [class="non-normative-note"] {
  color: grey;
}

>>> mark {
  background-color:#dfdfdf;
}

>>> section {  
  border-top: 2px solid #000000;
  border-bottom: 2px solid #000000;
  border-left: 2px solid #000000;
  border-right: 2px solid #000000;
  padding:0px;
}

>>> section.numbered:before {
  counter-increment:section;
  content:"Section " counter(section) ": " attr(title);
  font-weight:bold;
  font-size:x-large;
  counter-set:paragraph var(--paragraph-start);
}

>>> p.numbered:before {
    counter-increment:paragraph;
    content: counter(section) "." counter(paragraph) " ";
    font-weight:bold;
}

>>> p {
  border-top: 1px solid #000000;
  border-bottom: 1px solid #000000;
  border-left: 1px solid #000000;
  border-right: 1px solid #000000;
  padding:0px;
}

>>> p.production {
  border: 0px !important;
}

>>> section.production {
  border: 0px !important;
}

>>> table, th, td {
  border: 1px solid black;
  font-weight: normal;
}

>>> dl {
  width: 100%;
  overflow: hidden;
  padding: 0;
  margin: 0
}
>>> dt {
  float: left;
  width: 20%;
  padding: 0;
  margin: 0
}
>>> dd {
  float: left;
  width: 80%;
  padding: 0;
  margin: 0
}

>>> ins {
  border-top: 1px solid #000000;
  border-bottom: 1px solid #000000;
  border-left: 1px solid #000000;
  border-right: 1px solid #000000;
  padding:0px;
  background-color: yellow;  
}

.raseBody>>>[data-raseType="RequirementSection"] {
  background-color:#dfdfdf;
  border-top: 2px solid #696ff6;
  border-bottom: 2px solid #696ff6;
  border-left: 2px solid #696ff6;
  border-right: 2px solid #696ff6;
  padding:0px;
  margin-top:1px;
  margin-bottom:1px;
  margin-right:1px;
  margin-left:24px;
  text-align:left;
  text-indent:5px;
  direction:ltr;
  display:block;
}

.raseBody>>>[data-raseType="ApplicationSection"] {
  background-color:#77dd77;
  border-top: 2px dashed #00aa00;
  border-bottom: 2px dashed #00aa00;
  border-left: 2px dashed #00aa00;
  border-right: 2px dashed #00aa00;
  padding:0px;
  margin-top:1px;
  margin-bottom:1px;
  margin-right:1px;
  margin-left:24px;
  text-align:left;
  text-indent:5px;
  direction:ltr;
  display:block;
}

.raseBody>>>[data-raseType="SelectionSection"] {
  background-color:#ff99ff;
  border-top: 2px dotted #550055;
  border-bottom: 2px dotted #550055;
  border-left: 2px dotted #550055;
  border-right: 2px dotted #550055;
  padding:0px;
  margin-top:1px;
  margin-bottom:1px;
  margin-right:1px;
  margin-left:24px;
  text-align:left;
  text-indent:5px;
  direction:ltr;
  display:block;
}

.raseBody>>[data-raseType="ExceptionSection"] {
  background-color:#fdfd82;
  border-top: 2px double #da8d02;
  border-bottom: 2px double #da8d02;
  border-left: 2px double #da8d02;
  border-right: 2px double #da8d02;
  padding:0px;
  margin-top:1px;
  margin-bottom:1px;
  margin-right:1px;
  margin-left:24px;
  text-align:left;
  text-indent:5px;
  direction:ltr;
  display:block;
}

.raseBody>>>[data-raseType="Requirement"] {
  color:#252dd2;
  text-decoration: underline;
  text-align:left;
  text-indent:0px;
  direction:ltr;
}

.raseBody>>>[data-raseType="Application"] {
  color:#00aa00;
  text-decoration:underline;
  text-decoration-style:dashed;
  text-align:left;
  text-indent:0px;
  direction:ltr;
}

.raseBody>>>[data-raseType="Selection"] {
  color:#550055;
  text-decoration:underline;
  text-decoration-style:dotted;
  text-align:left;
  text-indent:0px;
  direction:ltr;
}

.raseBody>>>[data-raseType="Exception"] {
  color:#da8d02;
  text-decoration:underline;
  text-decoration-style:double;
  text-align:left;
  text-indent:0px;
  direction:ltr;
}

.raseBody>>>[data-raseType="RequirementSection"]:after, [data-raseType="ApplicationSection"]:after, [data-raseType="SelectionSection"]:after, [data-raseType="ExceptionSection"]:after {
  content: " "attr(id)" ";
  padding:1px;
  display:none;
  position:relative;
  float:right;
  bottom:0%;
  right:0%;
  width:30px;
  text-align:left;
  font-family:"verdana";
  font-size:9px;
  font-weight:bold;
  background-color:#ffffff;
  border-radius:2px;
  border:2px solid#000000;
  border-color:lightgray black black lightgray;
}

.raseBody >>>[data-raseType="RequirementSection"]:hover:after, [data-raseType="ApplicationSection"]:hover:after, [data-raseType="SelectionSection"]:hover:after, [data-raseType="ExceptionSection"]:hover:after {
  display:block;
}

.raseBody >>>[data-raseType="Requirement"]:after, [data-raseType="Application"]:after, [data-raseType="Selection"]:after, [data-raseType="Exception"]:after {
  padding:1px;
  display:none;
  position:absolute;
  text-align:left;
  font-family:"verdana";
  font-size:10px;
  font-weight:bold;
  background-color:#ffffff;
  border-radius:2px;
  border:1px solid#000000;
}

.raseBody >>>[data-raseType="Requirement"]:hover:after, [data-raseType="Application"]:hover:after, [data-raseType="Selection"]:hover:after, [data-raseType="Exception"]:hover:after {
  display:inline;
}

.raseBody >>>[data-raseType="Requirement"]:after, [data-raseType="Application"]:after, [data-raseType="Selection"]:after, [data-raseType="Exception"]:after {
  content: " "attr(id)" "attr(data-raseProperty)" "attr(data-raseComparator)" "attr(data-raseTarget)" "attr(data-raseUnit)" ";
}
</style>