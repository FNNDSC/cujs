import 'regenerator-runtime/runtime';
import SwiftClient from 'swift-client';
import cujs from './cujs'
import {Request} from '@fnndsc/chrisapi'

const upload = document.getElementById('upload');
const share = document.getElementById('share');
const saveSwift = document.getElementById('saveSwift');
const download = document.getElementById('download');
const zip = document.getElementById('zip');
const save = document.getElementById('save');
const submit = document.getElementById('submit');
const msg = document.getElementById('msg');
var cu = new cujs();
let feedId;



cu.login('http://localhost:8000/api/v1/','cube','cube1234');

// Upload files from local file system and Push to CUBE
submit.onclick = async function(){
  console.log("Please wait while your files are being pushed to cube");
  var resp = cu.uploadFiles(upload.files,"cujs");
  resp.then(data =>{
    feedId=cu.getPluginId(data);
    cu.getFeedId(feedId);
    console.log("Your plugin id is :"+feedId);
    });
};

// Download files of a recent feed as a zip
download.onclick = async function(){
  await cu.downloadFiles();
};

// Save to swift store
saveSwift.onclick =async  function(){
  await cu.saveToSwift('http://localhost:8000/api/v1/','chris','chris1234',feedId);
};

// Download files of a recent feed as a zip
zip.onclick = async function(){
  await cu.zipFiles(feedId);
};

// Download files of a recent feed as save directly to local file system
save.onclick = async function(){
  var saveDir = "Feed_" + feedId;
  await cu.downloadFeed();
};

// Share a current feed with another user
share.onclick = async function(){
  var userName = "chris";
  await cu.shareFeed(userName);
};


