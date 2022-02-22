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
  cu.login(CUBEurl,username,password);
  
  // Upload files
  cu.uploadFiles(files);
  
  // Download files
  cu.downloadFiles(feedId);
  
  // Logout
  cu.logout();



TLDR: To run this app:
----------------------

.. code-block:: bash

 $npm run dev
