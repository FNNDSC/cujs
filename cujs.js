import Client from '@fnndsc/chrisapi';
export default class cujs{

  //default constructor
  constructor(){
    this.client = null;
    this.token=null;
    this.url="";
    this.user="";
    this.res=null;
    this.uploadDir="";
    this.feedId="";
  }

  
  //Login
  login= async function(url,userName,password){
    const authUrl = url + 'auth-token/';
    this.url = url;
    this.url =url;
    this.user=userName;
    Client.getAuthToken(authUrl, userName,password).then(token=>{
        this.client = new Client(url,{token});
    });
    this.res= await Client.getAuthToken(authUrl, userName,password);

    return this.res;
    
  }
  
  //Get an authentication token
  getToken(){
    
   return this.client;
  }
  
  //Upload files to CUBE
  upload(files){
   
    this.uploadDir = this.user + '/uploads/' + Date.now() + '/';
    for(var f=0;f<files.length;f++){
          this.client.uploadFile({
          upload_path: this.uploadDir+ files[f].name
          },{
          fname: files[f]
          });
      }
    
  }
  
  //Get instance of pl-dircopy
  getDircopy(){
  }
  
  //Run dircopy on uploaded files
  runDircopy(feedId){
      var upload_dir = this.uploadDir;
      var resp = this.client.createPluginInstance(feedId,{dir:upload_dir});
      return resp;
  }
  
  //Get Feed instance
  getFeedId(){
      var getInst = this.client.getPluginInstances();
      getInst.then(val =>{
        this.feedId=val.collection.items[0].data[0].value;
        });
      return this.feedId;
        
  }
  
  //Download files from CUBE
  download(){
  }
  
}
