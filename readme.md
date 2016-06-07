# Serverless Workshop
This is a project for a workshop.
## Build
1. Install node
2. Install Yeoman, this should also install Bower and Gulp.
3. All variables will be inside the index.html file set in an AppGlobals variable. Configure the following:
    1. Facebook Configuration
    Create a website application in facebook and get the AppId and set this in index.html.  You must also set the website in your facebook application configuration.  If you are testing locally, use http://localhost:9000. 
    2. AWS Configuration
        Use the AWS Cli script to create your environment.
4. Build using:
```
gulp
```
5. Test using:
```
gulp serve
```
6. Upload to S3 bucket using:
```
gulp upload
```
You will need to configure the upload bucket in gulpfile.js.  You also need credentials in your environment that allow you to upload to the stated bucket.
