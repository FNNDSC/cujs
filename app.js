import 'regenerator-runtime/runtime';

import cujs from './cujs'

const upload = document.getElementById('upload');
const download = document.getElementById('download');
const submit = document.getElementById('submit');
const msg = document.getElementById('msg');
var cu = new cujs();
let feedId;

cu.login('http://localhost:8000/api/v1/','cube','cube1234');

submit.onclick = function(){

  var resp = cu.uploadFiles(upload.files);
  resp.then(data =>{
    feedId=data.collection.items[0].data[0].value;
    console.log("Your feed id is :"+feedId);
    });
};

download.onclick = function(){

  cu.downloadFiles(feedId);
  };



