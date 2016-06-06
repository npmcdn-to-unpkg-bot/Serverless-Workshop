/**
 * Grabs AWS credentials for an authenticated user.
 */
$(function() {
    var assumeRoleWithWebIdentity = function(params) {
        AppGlobals.idToken = params.idToken || AppGlobals.idToken;
        AWS.config.region = AppGlobals.CognitoRegion;
        var creds = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: AppGlobals.CognitoIdentityPoolId,                
            Logins: {
                'graph.facebook.com': AppGlobals.idToken
            }});
        AWS.config.update({
            region: AppGlobals.CognitoRegion,
            credentials: creds
        });
        AWS.config.credentials.get(function(err) {
            if (err) console.log(err);
            else{
                AppGlobals.updateCredentials(null,AWS.config);
                AppGlobals.CognitoIdentityId = AWS.config.credentials.identityId;
                getFileList();
            };
        });


    },
    getFuCredentials = function(data) {
        return {
            accessKey: data.credentials.accessKeyId,
            secretKey: data.credentials.secretAccessKey,
            sessionToken: data.credentials.sessionToken,
            expiration: data.credentials.expireTime,
            region:  AppGlobals.BucketRegion,
            version: 4,
            bucket: AppGlobals.Bucket
        };
    };
    AppGlobals.assumeRoleWithWebIdentity = assumeRoleWithWebIdentity;
    AppGlobals.getFuCredentials = getFuCredentials;
}());
