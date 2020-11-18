# ASVZ Sniper

Chrome extension to automate asvz signup

## Requirements
1. Chromium based web browser
2. Access to a server running the ASVZ bot python server or your own machine to run it. If you are running the server on a Raspberry Pi inside the ETH network and want to use the extension outside the network, you'll need to make sure that the server is publicly accessible. 

## Installation:
### Server Folder:

Create a virtualenv and run the wsgi.py script. Add whitelisted ids to the `whitelist.yml` file.

### Extension:
Edit popup.js file and change the SERVER variable to match the url of your server.  
Open chrome based browser and open extensions tabs. Activate developer mode and load the extension folder. 
