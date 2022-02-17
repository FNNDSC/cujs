import Client from '@fnndsc/chrisapi';
export default class cujs{

  //default constructor
  constructor(){
    this.client = null;
  }
  
  //Login
  login(url,userName,password){
    var self = this;
    const authUrl = chrisUrl + 'auth-token/';
    var resp = Client.getAuthToken(authUrl, user,pwd);
    resp.then(token=>{
        self.client = new Client(url,{token});
        });
  }
  
  //Get an authentication token
  getToken(){
    return this.client.auth;
  }
  
  //Upload files to CUBE
  upload(){
  }
  
  //Get instance of pl-dircopy
  getDircopy(){
  }
  
  //Run dircopy on uploaded files
  runDircopy(){
  }
  
  //Get Feed instance
  getFeedId(){
  }
  
  //Download files from CUBE
  download(){
  }
  
}
