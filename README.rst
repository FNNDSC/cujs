# cujs
A reusable JS module to upload local files to CUBE using Chris API

Install in your project using npm
---------------------------------

.. code-block:: bash
 
 $npm install chris-upload@1.1.0
 
Import and use in your JS app
-----------------------------

.. code-block:: bash

  import cujs from 'chris-upload';
  
  // Create an object
  var cu = new cujs();
  
  // Login to CUBE
  // Example:
  //         -- CUBEurl : http://localhost:8000/api/v1/
  //         -- username: <user_name_in_CUBE>
  //         -- password: <user_pwd_in_CUBE>
  cu.login(CUBEurl,username,password);
  
  // Upload files
  cu.uploadFiles(files);
  
  // Download files as zip
  cu.downloadFiles(feedId);
  
  // Save files to disk
  cu.saveFiles(feedId,saveDir);
  
  // Logout
  cu.logout();



TLDR: To run this app:
----------------------

.. code-block:: bash

 $npm run dev
