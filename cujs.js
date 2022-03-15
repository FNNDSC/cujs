import Client from '@fnndsc/chrisapi';
import JsZip from 'jszip';
import FileSaver from 'file-saver';
import {Request} from '@fnndsc/chrisapi'
import sandbox from 'sanboxjs'

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
  uploadFiles = async function(files){
    var self = this;
    let response;
    
    //Upload all files to CUBE
    var uploadDir = this.user + '/uploads/' + Date.now() + '/';
    for(var f=0;f<files.length;f++){
          var upload = await this.client.uploadFile({
          upload_path: uploadDir+ files[f].name
          },{
          fname: files[f]
          });
      }

      response = await this.client.createPluginInstance(this.pluginId,{dir:uploadDir,previous_id: 0});
      return response;
    
  };
  //
  //
  getFeedId(response){
    return response.collection.items[0].data[0].value;
  };
  /**
   * Create a zip of the contents of a plugin node
   *
   * @param  {String} previousPluginId Plugin instance id in CUBE
   *
   */
   zipFiles(previousPluginId){
     const plPfdoRunArgs = {
       title: "zip_files",
       previous_id: previousPluginId,
       inputFile: "input.meta.json",
       noJobLogging: true,
       exec: "'zip -r %outputDir/parent.zip %inputDir'"
      };
      var resp= this.client.getPlugins({name: "pl-pfdorun"});
      resp.then(async data=>{
          var pfdoId = data.collection.items[0].data[0].value;
          var response = this.client.createPluginInstance(pfdoId,plPfdoRunArgs);
          const delay = ms => new Promise(res => setTimeout(res, ms));
          response.then(async data=>{
            this.pfdoInstId = data.collection.items[0].data[0].value;
            console.log("Preparing your files. Please wait ..");
            const url = data.collection.items[0].href;
            await this.pollPluginInstance(url);
            // Print msg once polling is complete
            console.log("Your zipped files are ready to download");
          })
          .catch(error=>
          {console.log("Please push files before zipping");});

          })
          .catch(error=>
          {console.log("Could not find pl-pfdorun. Errors" + error);});
      
   };
   /**
    * Poll to CUBE for a status on current plugin's url
    *
    * @param  {String} url URL of a plugin instance in CUBE
    *
    */
    pollPluginInstance = async function(url){
      //polling
      const delay = ms => new Promise(res => setTimeout(res, ms));
      const req = new Request(this.client.auth, 'application/vnd.collection+json', 30000000);
      const blobUrl = url;
      var status = 'started';
      do {
           await delay(5000);
           status = await req.get(blobUrl).then(resp=>resp.data.collection.items[0].data[12].value);
           console.log(status)
      }
      while (status !== 'finishedSuccessfully');
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
  downloadFiles(instId=this.pfdoInstId){
    let re;
    re = this.client.getPluginInstance(instId);
    re.then(feed =>{
       const params = { limit: 200, offset: 0 };
       var files = feed.getFiles(params);
       files.then(async(val) =>{
            if(val.collection.items){
                var fileFound = false;
                for(const f of val.collection.items){
                  var filePath = f.data[2].value;
                  var paths = filePath.split('/');
                  var fileName = paths[paths.length-1];
                  if(fileName=='parent.zip'){
                    fileFound = true;
                    const resp = await this._download(f.links[0].href);
                    FileSaver.saveAs(resp, fileName);
                  } 
                }
            }
            if(!fileFound){
              console.log("No zipped file found to download");
            }
    });
    })
    .catch(error=>
          {console.log("Nothing to download.Please prepare a zip. Errors" + error);});
  };
  
  /**
   * Save the contents of a feed in local swift
   *
   *
   *
   */
   saveToSwift(){
   };
  
  /**
   * Download files of a particular feed from CUBE and save directory on user's disk
   *
   * @param {number} instId  Id of a particular feed in CUBE
   * @param {string} dirName Name of the directory to store the downloaded files inside users disk
   */
  saveFiles= async function(instId,dirName){
    let re;
    var sbx = new sandbox();
    re = this.client.getPluginInstance(instId);
    re.then(async feed =>{
       const params = { limit: 200, offset: 0 };
       var files = feed.getFiles(params);
       const existingDirectoryHandle = await window.showDirectoryPicker();
       // In an existing directory, create a new directory named as dirName
       const newDirectoryHandle = await existingDirectoryHandle.getDirectoryHandle(dirName, {
        create: true,
       });
       files.then(async(val) =>{
            if(val.collection.items){
                for(const f of val.collection.items){
                  var filePath = f.data[2].value;
                  var paths = filePath.split('/');
                  var fileName = paths[paths.length-1];
                  const newFileHandle = await newDirectoryHandle.getFileHandle(fileName, { create: true });
                  const writable = await newFileHandle.createWritable();
                  const req = new Request(this.client.auth, 'application/octet-stream', 3000000);
                  const blobUrl = f.links[0].href;
                  const resp = req.get(blobUrl);
                  resp.then(async blob=>{
                      console.log("writing t0 disk")
                      // Write the contents of the file to the stream.
                      await writable.write(blob.data);
                      // Close the file and write the contents to disk.
                      await writable.close();
                    });
                } 
            }
            else
            { console.log("Zero files found!!");}
    })
    .catch(error=>{
      console.log("Zero files found!!");});
    });
  };
  
  /**
   * Private method to download a blob/file/stream from CUBE 
   *
   * @param {String} url API endpoint to a particular resource in CUBE
   * @response {Promise} JS promise, resolves to a string value
   */
    _download(url){
    const req = new Request(this.client.auth, 'application/octet-stream', 30000000);
    const blobUrl = url;
    return req.get(blobUrl).then(resp => resp.data);
  };

  
}
