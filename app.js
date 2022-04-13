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
const pgBar = document.getElementById('pgBar');
const txtFeed = document.getElementById('txtFeed');
var cu = new cujs();
let feedId;

cu.login('http://localhost:8000/api/v1/','cube','cube1234');

// Download files of a recent feed as save directly to local file system
save.onclick = async function(){
  pgBar.style+="display:block;--value:0";
  var resp = await cu.downloadFeed(parseInt(txtFeed.value),pgBar);

};

pgBar.onclick = async function(){
  await cu.downloadFiles();
};


