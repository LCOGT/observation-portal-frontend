import $ from 'jquery';
import 'jquery-file-download';

export { downloadZip, downloadAll, getLatestFrame };

function downloadZip(frameIds, archiveRoot, archiveToken) {
  let postData = {};
  // The jquery fileDownload plugin downloads files using a hidden HTML form. Our backend currently disables
  // lists from being submitted as HTML input (https://github.com/encode/django-rest-framework/pull/5702).
  // Submitting the frame IDs like this is a workaround to this limitation, allowing the IDs to ultimately be
  // parsed out as a list (https://github.com/encode/django-rest-framework/blob/master/rest_framework/utils/html.py#L15).
  for (let i = 0; i < frameIds.length; i++) {
    postData['frame_ids[' + i + ']'] = frameIds[i];
  }
  postData['auth_token'] = archiveToken;
  $.fileDownload(archiveRoot + '/frames/zip/', {
    httpMethod: 'POST',
    data: postData
  });
}

function downloadAll(requestId, archiveRoot, archiveClientUrl, archiveToken) {
  $.getJSON(archiveRoot + '/frames/?limit=1000&REQNUM=' + requestId, function(data) {
    if (data.count > 1000) {
      alert('Over 1000 products found. Please use ' + archiveClientUrl + ' to download your data');
      return false;
    }
    let frameIds = [];
    for (let i = 0; i < data.results.length; i++) {
      frameIds.push(data.results[i].id);
    }
    downloadZip(frameIds, archiveRoot, archiveToken);
  });
}

function getLatestFrame(requestId, archiveRoot, callback) {
  $.ajax({
    url: archiveRoot + '/frames/?ordering=-id&limit=1&REQNUM=' + requestId,
    dataType: 'json'
  }).done(function(response) {
    callback(response.results[0]);
  });
}
