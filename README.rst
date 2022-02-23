cujs
----

Is a reusable JS module to upload local files to CUBE using Chris API

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

Clone from GitHub

.. code-block:: bash

 git clone https://github.com/FNNDSC/cujs
 
Parcel is a tool to bundle and serve code. Install parcel-bundler as a dev dependency:

.. code-block:: bash
 
 npm install parcel-bundler@1.12.5 --save-dev

Now, verify that your project is working : 

.. code-block:: bash

 $npm run dev
 
Then navigate to http://localhost:1234/ with your browser. Ensure you have a local `CUBE` running by following the steps here: https://github.com/FNNDSC/ChRIS_ultron_backEnd#tldr
