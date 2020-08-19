import $ from 'jquery';
import 'jquery-file-download';

export { downloadZip, downloadAll, getLatestFrame };

function downloadZip(frameIds, archiveRoot, archiveToken) {
  let postData = {};
  for (let i = 0; i < frameIds.length; i++) {
    postData['frame_ids[' + i + ']'] = frameIds[i];
  }
  postData['auth_token'] = archiveToken;
  $.fileDownload(archiveRoot + 'frames/zip/', {
    httpMethod: 'POST',
    data: postData,
  });
}

function downloadAll(requestId, archiveRoot, archiveClientUrl, archiveToken) {
  $.getJSON(archiveRoot + 'frames/?limit=1000&REQNUM=' + requestId, function(data) {
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
  $.getJSON(archiveRoot + 'frames/?ordering=-id&limit=1&REQNUM=' + requestId, function(data) {
    callback(data.results[0]);
  });
}
