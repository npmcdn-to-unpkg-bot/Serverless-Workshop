
function getFileList(){
    document.getElementById('filesRefresh').className += ' glyphicon-spin';
    var apigClient = apigClientFactory.newClient({
        accessKey: AWS.config.credentials.accessKeyId,
        secretKey: AWS.config.credentials.secretAccessKey,
        sessionToken: AWS.config.credentials.sessionToken, 
        region: 'us-east-1'
    });
    var params = {         
    }; 
    var body = { 
        owner: AppGlobals.CognitoIdentityId
    }; 
    var additionalParams = {
        headers: {}, queryParams: {}
    }; 

    var response = apigClient.getFilesPost(params,body,additionalParams)
      .then(function(response) {
        console.log(response);
        var f = '<table class="table" id="fileTable"><thead><tr><th>File</th><th>Links</th><th>State</th><th>Select</th></tr></thead><tbody>';
        for(var i = 0; i < response.data['FileList'].length; i++){
            f = f + '<tr><td>' + response.data['FileList'][i]['file'] + 
                '</td><td><a href="' + response.data['FileList'][i]['linkOrg'] + 
                '" target="_blank">org</a>';
            if(response.data['FileList'][i]['status'] == 'Complete'){
                f = f + ' <a href="' + response.data['FileList'][i]['linkEnc'] + 
                '" target="_blank">enc</a>';
            }
            f = f + '</td><td><a href="#" data-toggle="popover" data-placement="bottom" title="Detailed Status" data-content="'+response.data['FileList'][i]['statusdetail']+'">' +
                response.data['FileList'][i]['status']+
                '</a></td><td><input type="checkbox" id="item' + (i+1) + '"></td></tr>';
        }
        f = f + '</tbody></table>';
        $('#files-list').html(f);
        document.getElementById('filesRefresh').className = document.getElementById('filesRefresh').className.replace( /(?:^|\s)glyphicon-spin(?!\S)/g , '' );
        AppGlobals.Files = response.data['FileList'];
        return(response);
      }).catch(function(response) {
        console.log(response);
    });    
}

function performAction(){
    var action = $( '#fileAction option:selected' ).text();
    var selectedFiles = getSelectedFiles();
    var body = {};
    var item;
    if(action == 'Encode selected file(s)'){
        for(var i = 0; i < selectedFiles.length;i++){
            body = AppGlobals.Files[ selectedFiles[i]];
            body['size'] = '360p';
            transcodeFile(body);
        }
    }    
    if(action == 'Delete selected file(s)'){
        for(var i = 0; i < selectedFiles.length;i++){
            body = AppGlobals.Files[ selectedFiles[i]];
            deleteFile(body);
        }
    }    
}

function getSelectedFiles(){
    var table = document.getElementById('fileTable');
    var selected, item, checked;
    var fileList = [];
    for (var i = 1, row; row = table.rows[i]; i++) {
        item = 'item'+i;
        checked = document.getElementById(item).checked;
        if(checked){
            fileList.push(i-1);
        }
    }
    return fileList;
}

function transcodeFile(body){
    var apigClient = apigClientFactory.newClient({
        accessKey: AWS.config.credentials.accessKeyId,
        secretKey: AWS.config.credentials.secretAccessKey,
        sessionToken: AWS.config.credentials.sessionToken, 
        region: 'us-east-1'
    });
    var params = {      
    }; 
    var additionalParams = {
        headers: {}, queryParams: {}
    };
    var response = apigClient.transcodeFilePost(params,body,additionalParams)
      .then(function(response) {
        console.log(response);
        return(response);
      }).catch(function(response) {
        console.log(response);
    });    
}

function deleteFile(body){
    var apigClient = apigClientFactory.newClient({
        accessKey: AWS.config.credentials.accessKeyId,
        secretKey: AWS.config.credentials.secretAccessKey,
        sessionToken: AWS.config.credentials.sessionToken, 
        region: 'us-east-1'
    });
    var params = {      
    }; 
    var additionalParams = {
        headers: {}, queryParams: {}
    };
    var response = apigClient.deleteFilePost(params,body,additionalParams)
      .then(function(response) {
        console.log(response);
        return(response);
      }).catch(function(response) {
        console.log(response);
    });    
}

jQuery(document).ready(function(){
    $('#performAction').on('click', performAction);   
    $('[data-toggle="popover"]').popover('toggle');  
});
