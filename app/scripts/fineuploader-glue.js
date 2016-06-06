/**
 * Sets up a Fine Uploader S3 jQuery UI instance, ensures files are saved under a "directory" in the bucket
 * bearing the logged-in user's name, provides a link to view the uploaded file after it has reached the bucket
 * and asks AWS for new credentials before those expire.
 */
$(function() {
    var bucketUrl = AppGlobals.BucketUrl,
        updateCredentials = function(error, data) {
            if (!error) {
                $('#uploader').fineUploaderS3('setCredentials', AppGlobals.getFuCredentials(data));
            }
        },
        hideUploader = function() {
            $('#hiddenItems').hide();
        };

    $('#uploader').fineUploaderS3({
        request: {
            endpoint: bucketUrl
        },
        objectProperties: {
            // Since we want all items to be publicly accessible w/out a server to return a signed URL
            acl: 'public-read',

            // The key for each file will follow this format: {USER_NAME}/{UUID}.{FILE_EXTENSION}
            key: function(id) {
                var filename = this.getName(id),
                    uuid = this.getUuid(id);
                return qq.format('{}/input/{}', AppGlobals.CognitoIdentityId, filename);
            }
        },
        chunking: {
            enabled: true
        },
        resume: {
            enabled: true
        },
        // Restrict files to 15 MB and 5 net files per session
        validation: {
            allowedExtensions: ['mpeg', 'mov', 'mp4', 'avi', 'mkv'],
            itemLimit: 15,
            sizeLimit: 1500000000
        },
        thumbnails: {
            placeholders: {
                notAvailablePath: 'images/not_available-generic.png',
                waitingPath: 'images/waiting-generic.png'
            }
        }
    })
        .on('complete', function(event, id, name, response, xhr) {
            var $fileEl = $(this).fineUploaderS3('getItemByFileId', id),
                $viewBtn = $fileEl.find('.view-btn'),
                key = $(this).fineUploaderS3('getKey', id);

            // Add a "view" button to access the uploaded file in S3 if the upload is successful
            if (response.success) {
                $viewBtn.show();
                $viewBtn.attr('href', bucketUrl + '/' + key);
                // record in dynamodb
                //var apigClient = apigClientFactory.newClient({});                
             var apigClient = apigClientFactory.newClient({
                    accessKey: AWS.config.credentials.accessKeyId,
                    secretKey: AWS.config.credentials.secretAccessKey,
                    sessionToken: AWS.config.credentials.sessionToken, 
                    region: 'us-east-1'
                });
                var params = { 
                    // This is where any modeled request parameters should be added. 
                    // The key is the parameter name, as it is defined in the API in API Gateway. 
                }; 
                var body = { 
                    // This is where you define the body of the request, 
                    owner: AppGlobals.CognitoIdentityId,
                    key: key                    
                }; 
                var additionalParams = { 
                    // If there are any unmodeled query parameters or headers that must be 
                    // sent with the request, add them here. 
                    headers: {
                    }, 
                    queryParams: {}
                };                             
                apigClient.addFilePost(params,body,additionalParams)
                  .then(function(response) {
                    console.log(response);
                    getFileList();
                  }).catch(function(response) {
                    console.log(response);
                });
                }
            }
        )
        .on('credentialsExpired', function() {
            var promise = new qq.Promise();

            // Grab new credentials
            AppGlobals.assumeRoleWithWebIdentity({
                callback: function(error, data) {
                    if (error) {
                        promise.failure('Failed to assume role');
                    }
                    else {
                        promise.success(AppGlobals.getFuCredentials(data));
                    }
                }
            });

            return promise;
        });

    AppGlobals.updateCredentials = updateCredentials;

    $(document).on('tokenExpired.s3', hideUploader);
    $(document).on('tokenReceived.s3', function() {
        $('#hiddenItems').show();
    });
    $(document).trigger('tokenExpired.s3');
});
