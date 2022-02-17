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
import cujs from './src/js/cujs'
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


let chrisUrl;
let user;
let pwd;
let client;
const usersUrl = chrisUrl + 'users/';

        


    

let resp;
let token;
let feedId;
var authToken = '';

// Step-1 : Upload local files
// Step-2 : Register files to CUBE
    // Cond-1: If authtoken is available, continue
    // Cond-2: If not, pop-up modal for authentication
// Step-3 : Authenticate by available chris-url, authToken
// Step-4 : Push to CUBE
// Step-5 : Search for pl-dircopy => get ID
// Step-6 : Run pl-dircopy on the uploaded files
// Step-7 : Get plugin Instance
// Step-8 : Display Feed-ID to user
// Step-9 : Display pop-up to share w/ collaborator
// Step-10: Share feed with user and generate a user feed-ID
// Step-11: Fetch button is available to fetch files for a particular feed



// fetch a user auth token

//var lblMsg = document.getElementById("lblMsg");
//lblMsg.visible = false;
//var btnDownload = document.getElementById("btnDownload");
//btnDownload.visible = false;


function authenticate(){
    chrisUrl = txtCubeUrl.value;
    //const authUrl = chrisUrl + 'auth-token/';
    user = txtUserName.value;
    pwd = txtPwd.value;
    //resp = Client.getAuthToken(authUrl, user,pwd);
    var cu = new cujs();
    cujs.login(chrisUrl,user,pwd);
    /*resp.then(token=>{
        client = new Client(chrisUrl,{ token });
        modal.style.display = "none";
        lblMsg.textContent = "Successfully logged in as User "+user;
        lblMsg.className = "alert-success";
        $('.toast').toast('show');
    })
    .catch(error => {
        clearForm();
        lblAuthMsg.className="alert-danger";
        lblAuthMsg.textContent = "Invalid auth details";  
        modal.style.display = "block";
        });
        */

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
    if(!client){
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
          var upload_dir = user +'/uploads/' + Date.now() + '/';
          for(var f=0;f<fu1.files.length;f++){
              resp=client.uploadFile({
              upload_path: upload_dir+fu1.files[f].name
              },{
              fname: fu1.files[f]
              });
          }
          resp = client.createPluginInstance(1,{dir:upload_dir});
          resp.then(val =>{
              getInst = client.getPluginInstances();
              getInst.then(val =>{
                  window.console.log('state:', val.collection.items[0].data[0].value);
                  feedId = val.collection.items[0].data[0].value;
                  lblMsg.textContent="All files pushed to CUBE. Your feed id is " + val.collection.items[0].data[0].value;
                  lblMsg.className = "alert-secondary";
                  $('.toast').toast('show');
                  fu1.value="";
                  btnShare.hidden="";
                  spanFile.textContent = " or drag and drop files here";
              
                  });
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
    const params = { limit: 200, offset: 0 };
    const req = new Request(client.auth, 'application/octet-stream', 30000);
    const blobUrl = url;
    return req.get(blobUrl,params).then(resp => resp.data);
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


