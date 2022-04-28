import Client from '@fnndsc/chrisapi';
import FileSaver from 'file-saver';
import { Request } from '@fnndsc/chrisapi';


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
    this.feedId="";
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
   * @param {String} feedName name of the 'pl-dircopy' instance in CUBE
   *
   * @return {Promise<String>}  JS Promise, resolves to a string value 
   */
  uploadFiles = async function(files,feedName){
    if(files.length==0){
      console.log("Please upload files!");
    }
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

      response = await this.client.createPluginInstance(this.pluginId,{dir:uploadDir,previous_id: 0,title:feedName});
      return response;
    
  };
  
  /**
   * Utility method to return a plugin instance id from a response object
   * 
   * @param {Object} response An array of files object
   *
   */
  getPluginId(response){
    return response.collection.items[0].data[0].value;
  };
  
  /**
   * Utility method to get a feed id from a plugin instance id
   *
   * @param {number} pluginInstId An array of files object
   *
   */
  getFeedId(pluginInstId){
    var resp = this.client.getPluginInstance(pluginInstId);
    resp.then(plug=>{
      var feed = plug.getFeed();
      feed.then(feedData=>{
        this.feedId = feedData.collection.items[0].data[0].value;
        console.log("Feed id is :"+ this.feedId);
      });
    });
    
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
            var status = "started";
            await this.pollPluginInstance(url);
            // Print msg once polling is complete
            console.log("Your zipped files are ready to download");
            this.downloadFiles();
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
           console.log(status);           

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
                    FileSaver.saveAs(resp, "parent_"+instId+".zip");
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
   * @param  {number} instId  User's password
   * @param  {String} cubeUrl CUBE's url
   * @param  {String} userName User's username in CUBE
   * @param  {String} password User's password
   * @param  {String} files User's password
   * @param  {String} fileNames User's password
   *
   */
   _saveToSwift= async function(instId,cubeUrl,userName,password,files,fileNames){
     const authUrl = cubeUrl + 'auth-token/';

     // Login to local CUBE
     Client.getAuthToken(authUrl, userName,password).then(async token=>{
        var swiftClient = new Client(cubeUrl,{token});
        
        // upload files to swift
        var uploadDir = userName + '/uploads/download/Feed_'+instId+'/';
        for(var f=0;f<files.length;f++){
          var upload = await swiftClient.uploadFile({
          upload_path: uploadDir+ fileNames[f]
          },{
          fname: files[f]
          });
          console.log("uploaded "+ fileNames[f] + "to swift");
      }
      })
      .catch(error=>{
        console.log("Invalid login credentials. Error:"+error);});
   };
  
  /**
   * Download files of a particular feed from CUBE and save directory on user's disk
   *
   * @param {number} instId  Id of a particular feed in CUBE
   * @param {string} dirName Name of the directory to store the downloaded files inside users disk
   */
  saveFiles= async function(instId,dirName){

    var re = this.client.getPluginInstance(instId);
    re.then( async  feed =>{
       const params = { limit: 200, offset: 0 };
       var files = feed.getFiles(params);
       const existingDirectoryHandle = await window.showDirectoryPicker();
       // In an existing directory, create a new directory named as dirName
       const newDirectoryHandle = await existingDirectoryHandle.getDirectoryHandle(dirName, {
        create: true,
       });
       files.then(async(val) =>{
            if(val.collection.items.length>0){
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
                      console.log("writing to disk")
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
    })
    .catch(error =>
    {console.log(error);});
  };
  
  /**
   * Download files of a particular feed from CUBE and save directory on user's disk
   *
   * @param {number} instId  Id of a particular feed in CUBE
   * @param {string} dirName Name of the directory to store the downloaded files inside users disk
   */
  downloadFeed= async function(instId,feedName){
  
    var dirName = "cube/feed_"+instId+'/';
  
    var re = await this.client.createPluginInstance(this.pluginId,{dir:dirName,previous_id: 0,title:feedName});
   
    
    var dircopyInstId=this.getPluginId(re);
    
    await this.zipFiles(dircopyInstId);

    
  };
  
  /**
   * Get a list of filenames from CUBE given the instance id
   *
   * @param {number} instId  Id of a particular feed in CUBE
   *
   * @return {Array} fileNames
   */
  viewFiles= async function(instId){
    var fileNames = [];
    var re = this.client.getPluginInstance(instId);
    re.then( async  feed =>{
       const params = { limit: 200, offset: 0 };
       var files = feed.getFiles(params);
       files.then(async(val) =>{
            if(val.collection.items.length>0){
                for(const f of val.collection.items){
                  var filePath = f.data[2].value;
                  var paths = filePath.split('/');
                  var fileName = paths[paths.length-1];
                  fileNames.push(f.links[0].href);

                } 
            }
            else
            { console.log("Zero files found!!");}
    })
    .catch(error=>{
      console.log(error);});
    })
    .catch(error =>
    {console.log(error);});
    return fileNames.sort();
  };
  
  /**
   * Download a nodes files and save them to a local swift store
   *
   * @param  {String} cubeUrl  local CUBE's url
   * @param  {String} userName local CUBES's username
   * @param  {String} password local CUBES's password
   * @param  {number} instId   Plugin instance id in remote CUBE
   */
  saveToSwift= async function(cubeUrl,userName,password,instId){
    let re;
    re = this.client.getPluginInstance(instId);
    re.then(async feed =>{
       const params = { limit: 200, offset: 0 };
       var files = feed.getFiles(params);
       var downLoadedFiles = [];
       var fileNames = [];
       files.then(async(val) =>{
            if(val.collection.items.length>0){
                for(const f of val.collection.items){
                  var filePath = f.data[2].value;
                  var paths = filePath.split('/');
                  var fileName = paths[paths.length-1];
                  const resp = await this._download(f.links[0].href);
                  downLoadedFiles.push(resp);
                  fileNames.push(fileName);
                } 
                // save to swift
                this._saveToSwift(instId,cubeUrl,userName,password,downLoadedFiles,fileNames);
            }
            else
            { console.log("Zero files found!!");}
    })
    .catch(error=>{
      console.log("Zero files found!!"+error);});
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
  
  /**
   * Share a particular feed with another user in CUBE
   *
   * @param {String} userName username in CUBE
   * @param {number} feedId Feed id in CUBE
   */
  shareFeed = function(userName,feedId){
    
    var respGetFeed = this.client.getFeed(feedId);
    
    respGetFeed.then(feed =>{
              var putUserResp;
              
              putUserResp = feed.put({owner:userName});
              putUserResp.then(user =>{
                console.log("feed shared with "+userName);
              })
              .catch(error => {
                console.log(error);

              });
              
              });
    
  };
  
  /**
   * Delete a feed in CUBE
   *
   * @param {number} feedId feedId in CUBE
   *
   */
   deleteFeed = function(feedId){
     var respGetFeed = this.client.getFeed(feedId);
    
     respGetFeed.then(feed =>{
              feed.delete();
              });
   };
   
   /**
    *
    *
    */
    setClient=async function(client){
      const delay = ms => new Promise(res => setTimeout(res, ms));
      this.client=client;
      var searchParams = {name: "pl-dircopy"};
      var resp= this.client.getPlugins(searchParams);
      resp.then(data=>{
          this.pluginId = data.collection.items[0].data[0].value;
      })
      .catch(error=>
      {console.log("Could not find pl-dircopy. Errors" + error);});
      await delay(500);
    }

  
}