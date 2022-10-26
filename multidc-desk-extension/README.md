# MultiDC Support for Extension
Are you going through the long-yet-important process of publishing an extension in multiple data centers (DCs) one by one? Then this post is for you. 

Previously, you had to log in to individual DCs to publish an extension and its associated functions and to make changes to the extension, you had to manually update it in all the DCs where the extension has been published. Thankfully, you don't need to go through this lengthy process any more. 

Publishing your extension in multiple DCs has been made much easier. Now, you're provided with an option to publish an extension and its associated functions in all DCs simultaneously, without hassle.

## Key Features
* We can publish in one Data-Center and can be installed in any Data-Center
    Eg:- We can develop and publish a extension in US DC(.com) and can be used or also installed in 
        * IN DC
        * EU DC
        * JP DC
        * CN DC
        * AU DC

To customise the extension as per your need, please download/clone the project to your local machine and replace the values for the keys under connector object **( connectionLinkName, connectionName, sharedBy)** in pluginmanifest.json file. You can find more about creating multi-dc extension in our [help documentation](https://www.zoho.com/desk/extensions/guide/#multidc-widgets).
