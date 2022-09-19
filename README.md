# Genesys Cloux CX Groups application

## Requirements

- A Genesys Cloud CX OAuth Client id/secret. You can create one in your org under Admin/OAuth/Add Client
  - App Name: Anything you want (e.g. group app)
  - Description: not required
  - Token Duration: leave the default value (86400)
  - Grant Types: Client Credentials
  - In the Roles tab, select a role that is allowed to create and delete groups (e.g. “admin”)
  - Click on the “Save” button
  - Note the “Client ID” and “Client Secret”, you will need it later
- Download Node.js version 16 (get it here) and install it on your computer

## How to run

- Download/clone the app from this page. If you are not familiar with Github and/or git, you can download the source code using the Code/Local/Download ZIP option:
- Unzip the downloaded file (if using Windows, right-click on the zip file, select “Properties” and click on “Unblock” first)
- Open a terminal/cmd on your machine and go to the folder where you have unzipped the app files
- Run “npm i”. This will install libraries that are required to run this application
- Open the index.js file in a text or code editor and enter the correct credentials for your organization at the beginning of the file (starting at line #4)
  - environment: this is your Genesys Cloud CX environment (e.g. “mypurecloud.ie” for “Europe (Ireland)”)
  - clientId: this is the client id from the OAuth entry you have created earlier
  - clientSecret: this is the client secret from the OAuth entry you have created earlier
  - numGroups: number of groups that will be created
- Save the file

## How to use

- Run “node .” from the same folder than index.js
- Enter your group prefix. Every created group will start with that prefix.

Note: due to the Genesys Cloud CX rate limits, after creating or deleting 300 groups in a row, the app will pause for a minute and resume.
