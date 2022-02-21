import Client from '@fnndsc/chrisapi';
import JsZip from 'jszip';
import FileSaver from 'file-saver';
import {Request} from '@fnndsc/chrisapi'

export default class cujs{

  //default constructor
  constructor(){
    this.client = null;
    this.token=null;
    this.url="";
    this.user="";
    this.res=null;
    this.uploadDir="";
    this.pluginId="";
  }

  /**
   * Login to CUBE
   *
   * @param  {String} url CUBE's url
   * @param  {String} userName User's username in CUBE
   * @param  {String} password User's password
   * @return {Promise<String>} JS Promise, resolves to a string value 
   */
  login= async function(url,userName,password){
    const authUrl = url + 'auth-token/';
    this.url = url;
    this.user=userName;
    
    Client.getAuthToken(authUrl, userName,password).then(token=>{
        this.client = new Client(url,{token});
        var searchParams = {name: "pl-dircopy"};
        var resp= this.client.getPlugins(searchParams);
        resp.then(data=>{
          this.pluginId = data.collection.items[0].data[0].value;
          })
          .catch(error=>
          {console.log("Could not find pl-dircopy. Errors" + error);});
    })
    .catch(error=>{
      console.log("Invalid login credentials. Error:"+error);});
      
    var res= await Client.getAuthToken(authUrl, userName,password);

    return res;
    
  };
  
  /**
   * Get an authentication token
   *
   * @return {Object} A Client object if available else null
   *
   */
  getToken(){
    
   return this.client;
  };
  
  /**
   * Upload files to CUBE
   *
   * @param {Array} files An array of files object
   * @return {Promise<String>}  JS Promise, resolves to a string value 
   */
  upload = async function(files){
    var self = this;
    let response;
    
    //Upload all files to CUBE
    var uploadDir = this.user + '/uploads/' + Date.now() + '/';
    for(var f=0;f<files.length;f++){
          var upload = this.client.uploadFile({
          upload_path: uploadDir+ files[f].name
          },{
          fname: files[f]
          });
      }

      response = await this.client.createPluginInstance(this.pluginId,{dir:uploadDir});
      return response;
    
  };
  
  
  /**
   * Logout from CUBE
   *
   *
   */
  logout(){
    this.client=null;
  }
  
  /**
   * Download files of a particular feed from CUBE
   *
   * @param {number} feedId Id of a particular feed in CUBE
   */
  downloadFiles(feedId){
    let re;
    re = client.getFeed(feedId);
    re.then(feed =>{
       const params = { limit: 200, offset: 0 };
       files = feed.getFiles(params);
       
       files.then(async(val) =>{
            const urls = [];
            const zip = JsZip();
            if(val.collection.items){
                for(const f of val.collection.items){
                  const resp = download(f.links[0].href);
                  zip.file(f.data[2].value, resp);
                }
            }
            const blob = await zip.generateAsync({ type: "blob" });
            FileSaver.saveAs(blob, "download.zip");

    });
    });
  };
  
  _download(url){
    const req = new Request(client.auth, 'application/octet-stream', 30000);
    const blobUrl = url;
    return req.get(blobUrl).then(resp => resp.data);
  };
  
  
}
