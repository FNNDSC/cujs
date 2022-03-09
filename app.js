import 'regenerator-runtime/runtime';

import cujs from './cujs'

const upload = document.getElementById('upload');
const download = document.getElementById('download');
const zip = document.getElementById('zip');
const save = document.getElementById('save');
const submit = document.getElementById('submit');
const msg = document.getElementById('msg');
var cu = new cujs();
let feedId;

cu.login('http://localhost:8000/api/v1/','cube','cube1234');

// Upload files from local file system and Push to CUBE
submit.onclick = function(){
  console.log("Please wait while your files are being pushed to cube");
  var resp = cu.uploadFiles(upload.files);
  resp.then(data =>{
    feedId=cu.getFeedId(data);
    console.log("Your feed id is :"+feedId);
    });
};

// Download files of a recent feed as a zip
download.onclick = function(){
  cu.downloadFiles();
};

// Download files of a recent feed as a zip
zip.onclick = function(){
  cu.zipFiles(feedId);
};

// Download files of a recent feed as save directly to local file system
save.onclick = function(){
  var saveDir = "Feed_" + feedId;
  cu.saveFiles(feedId,saveDir);
};


