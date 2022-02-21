import 'regenerator-runtime/runtime';
import React from 'react';
import { Modal, Button } from '@patternfly/react-core';
import axios from 'axios';
import Client from '@fnndsc/chrisapi';
import {UploadedFile} from '@fnndsc/chrisapi';
import {Feed} from '@fnndsc/chrisapi'
import {FeedFile} from '@fnndsc/chrisapi'
import {FeedFileList} from '@fnndsc/chrisapi'
import {ItemResource} from '@fnndsc/chrisapi'
import {Resource} from '@fnndsc/chrisapi'
import {Request} from '@fnndsc/chrisapi'
 import { downloadZip } from "client-zip/index.js"
import {
  CardHeader,
  Grid,
  GridItem,
  Form,
  FormGroup,
  TextInput,
  FileUpload,
  Alert,
  Card,
  CardBody,
  CodeBlock,
  CodeBlockCode,
} from '@patternfly/react-core';
import Promise from 'bluebird';
import JsZip from 'jszip';
import FileSaver from 'file-saver';
import { FileIcon, UploadIcon, ExclamationTriangleIcon } from '@patternfly/react-icons';
import cujs from './cujs'


let chrisUrl;
let user;
let pwd;
let client;
const usersUrl = chrisUrl + 'users/';

        


    

let resp;
let token;
let feedId;
var authToken = '';



var lblMsg = document.getElementById("lblMsg");
lblMsg.visible = false;
var btnDownload = document.getElementById("btnDownload");
btnDownload.visible = false;
var cu = new cujs();

async function authenticate(){
    chrisUrl = txtCubeUrl.value;
    user = txtUserName.value;
    pwd = txtPwd.value;

    var success = await cu.login(chrisUrl,user,pwd)
    
    if(success)
    {
        console.log("success");
        modal.style.display = "none";
        lblMsg.textContent = "Successfully logged in as User "+user;
        lblMsg.className = "alert-success";
        $('.toast').toast('show');
    }
    else {
        console.log("failed")
        clearForm();
        lblAuthMsg.className="alert-danger";
        lblAuthMsg.textContent = "Invalid auth details";  
        modal.style.display = "block";
        }
        

};

// Get the modal
var modal = document.getElementById("myModal");
var shareModal = document.getElementById("shareModal");
var btnSwitchAccounts = document.getElementById("btnSwitchAccounts");
var btnAuthenticate = document.getElementById("btnAuthenticate");
var btnClear = document.getElementById("btnClear");
var txtCubeUrl = document.getElementById("txtCubeUrl");
var txtUserName = document.getElementById("txtUserName");
var txtPwd = document.getElementById("txtPwd");
var lblAuthMsg = document.getElementById("lblAuthMsg");

function clearForm(){
    txtCubeUrl.value ="";
    txtUserName.value ="";
    txtPwd.value ="";
    lblAuthMsg.textContent="";
}


// Get the <span> element that closes the modal
var closeNotification = document.getElementById("closeNotification");
// Get the <span> element that closes the modal
var closeShare = document.getElementById("closeShare");
// Get the <span> element that closes the modal
var closeModal = document.getElementById("closeModal");

// When the user clicks on <span> (x), close the modal
closeNotification.onclick = function() {
  shareModal.style.display = "none";
}
// When the user clicks on <span> (x), close the modal
closeShare.onclick = function() {
  shareModal.style.display = "none";
}
// When the user clicks on <span> (x), close the modal
closeModal.onclick = function() {
  modal.style.display = "none";
}
// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == shareModal) {
    shareModal.style.display = "none";
  }
} 

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
} 

btnSwitchAccounts.onclick = function() {
    clearForm();
    modal.style.display= "block";
}

btnAuthenticate.onclick = function() {
    client = null;
    authenticate();
    clearForm();
}
const fu1 = document.getElementById("myFile");
let respGetFeed;
function main(){



  fu1.value="";
  modal.style.display = "none";
  //const token = authenticate();
  var lblMsg = document.getElementById("lblMsg");



  const form = document.querySelector('form');
  var spanFile = document.getElementById('spanFile');
  document.getElementById('myFile').onchange = function() {

    event.preventDefault();
    
    spanFile.textContent = fu1.files.length + " files selected";
    //var view = new viewerjs.Viewer(viewercontainer);
    //view.init();
    //view.addData(imgFileArr);
  };
  let getInst;
  var btnShare = document.getElementById('btnShare');
  
  form.addEventListener('submit', async event => {
    event.preventDefault();
    btnShare.hidden="hidden";
    btnDownload.hidden = "hidden";
    if(!cu.getToken()){
        lblAuthMsg.className="alert-danger";
        lblAuthMsg.textContent = "Please authenticate to CUBE";
        modal.style.display= "block";
     }
     else{
      
      // fetch a user auth token
      var path = fu1.value;
      if(fu1.files.length>0){
          lblMsg.className = "alert-primary";
          lblMsg.textContent = "Please wait while your files are being pushed";
          $('.toast').toast('show');
          cu.upload(fu1.files);
          var resp = cu.runDircopy(1);
          resp.then(val =>{
              

                  window.console.log('state:',cu.getFeedId() );
                  feedId = val.collection.items[0].data[0].value;
                  lblMsg.textContent="All files pushed to CUBE. Your feed id is " + val.collection.items[0].data[0].value;
                  lblMsg.className = "alert-secondary";
                  $('.toast').toast('show');
                  fu1.value="";
                  btnShare.hidden="";
                  spanFile.textContent = " or drag and drop files here";
              

              });
      }
      else{
          lblMsg.className = "alert-danger";
          lblMsg.textContent = "Please upload files first";
          $('.toast').toast('show');
      }
      }
      


  });
  var lblStatusMsg = document.getElementById("lblStatusMsg");
  var txtShareUserName = document.getElementById("txtShareUserName");

  btnShare.onclick = function(){ 
    event.preventDefault();
    shareModal.style.display = "block";
    lblStatusMsg.visible = false;
    txtShareUserName.value = ""; 
    lblStatusMsg.visible = false;
    lblStatusMsg.textContent = "";
    };
  var btnUserShare = document.getElementById("btnUserShare"); 
  
    
  btnUserShare.onclick = function(){
    event.preventDefault();
    
    respGetFeed = client.getFeed(feedId);
    
    respGetFeed.then(feed =>{
              var putUserResp;
              
              putUserResp = feed.put({owner:txtShareUserName.value});
              putUserResp.then(user =>{
                shareModal.style.display = "none";
                lblMsg.textContent = "Feed shared with User " + txtShareUserName.value;
                lblMsg.className = "alert-success";
                $('.toast').toast('show');
                btnDownload.hidden = "";

              })
              .catch(error => {
                  shareModal.style.display = "block";
                  lblStatusMsg.textContent = "User " + txtShareUserName.value+" not available";
                  lblStatusMsg.className = "alert-danger";
                  lblStatusMsg.visible = true;
                  
                  
              });
              
              });
    
  };
  btnDownload.onclick = async() =>{            
      downloadFiles();
    };
  };
  let files;
  let fnames = [];
  async function downloadFiles(){
    let re;
    re = client.getFeed(feedId);
    re.then(file =>{
       const params = { limit: 200, offset: 0 };
       files= {FeedFileList:files} = file.getFiles(params);
       
       files.then(async(val) =>{
           const urls = [];

           

            const zip = JsZip();
            if(val.collection.items){
                for(const f of val.collection.items){
                  urls.push(f.links[0].href);
                  fnames.push(f.data[2].value);
                  const resp = download(f.links[0].href);
                  var sbx = new sandbox();
                  //sbx.writeFile(f.data[2].value, resp);
                  console.log(f.data[2].value)
                  
                  zip.file(f.data[2].value, resp);
                
                
                    
                }
                
            }
           

            
            
            

            //const blob = downloadAndZip(urls);
            const blob = await zip.generateAsync({ type: "blob" });
            //const filename = `test.zip`;
            //const url = window.URL.createObjectURL(new Blob([blob]));
            //const link = document.createElement("a");
            //link.href = url;
            //link.setAttribute("download", filename);
            //document.body.appendChild(link);
            //link.click();
            //document.body.removeChild(link);
            FileSaver.saveAs(blob, "download.zip");
           
    


    });
    });
  }
  
  const download = url => {
    const req = new Request(client.auth, 'application/octet-stream', 30000);
    const blobUrl = url;
    return req.get(blobUrl).then(resp => resp.data);
  };

  const downloadByGroup = (urls, files_per_group=5) => {
    return Promise.map(
      urls,
      async url => {
        return await download(url);
      },
      {concurrency: files_per_group}
    );
  }
  
  const exportZip = (blobs) => {
    const zip = JsZip();
    blobs.forEach((blob, i) => {
      zip.file(fnames[i], blob);
    });
    zip.generateAsync({type: 'blob'}).then(zipFile => {
      const currentDate = new Date().getTime();
      const fileName = `combined-${currentDate}.zip`;
      return FileSaver.saveAs(zipFile, fileName);
    });
  }

  const downloadAndZip = (urls) => {
    return downloadByGroup(urls, 5).then(exportZip);
  }
   


  
  main();


