import 'regenerator-runtime/runtime';
import SwiftClient from 'swift-client';
import cujs from './cujs';
import trie from './trie'
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
const txtSearch = document.getElementById('txtSearch');
const txtTrie = document.getElementById('txtTrie');
const search = document.getElementById('search');
var cu = new cujs();
let feedId;
let words = [];

cu.login('http://localhost:8000/api/v1/','cube','cube1234');

// Download files of a recent feed as save directly to local file system
save.onclick = async function(){
  //pgBar.style+="display:block;--value:0";
  //var resp = await cu.downloadFeed(parseInt(txtFeed.value),pgBar);
  
  const text = txtFeed.value;
  words = text.split(" ");
  for (var word of words){
    trie.insert(word);
  }

  
};

pgBar.onclick = async function(){
  await cu.downloadFiles();
};

txtSearch.onchange = function(){
  let results = [];
  for(var word of words){
    if(word.startsWith(txtSearch.value)){
      results.push(word)
    }
  }
 
 print(results);
 
  
};

txtTrie.onchange = function(){

 var results = trie.find(txtTrie.value);
 print(results);
 
  
};

function print(results){
  msg.textContent="";
  var mySearchString = "";
  for(var word of results){
    mySearchString += word + "\n";
  }
  mySearchString = mySearchString.join("");
  msg.textContent=mySearchString;
};

