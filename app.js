import 'regenerator-runtime/runtime';
import Client from '@fnndsc/chrisapi'

const authUrl = "http://localhost:8000/api/v1/";
const authToken = "test";
var client = new Client(authUrl, authToken);

const chris_uploader = document.getElementById('chris-uploader');
let btn = document.createElement("button");
btn.innerHTML = "Submit";
btn.type = "submit";
btn.name = "formBtn";
document.body.appendChild(btn);

