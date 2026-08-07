import Vue from 'vue';
import Vuex from 'vuex';
import $ from 'jquery';

Vue.use(Vuex);

const THUMBNAIL_DATA = {
  framesByRequestId: {},
  frameCountsByRequestId: {},
  latestFrameByRequestId: {},
  thumbnailsByRequestIdAndSize: {}
};

const pendingFramesByRequestId = {};
const pendingThumbnailsByRequestIdAndSize = {};

function thumbnailKey(requestId, size) {
  return String(requestId) + ':' + size;
}

// check why this is not in order
function getLatestFrame(frames) {
  return frames[0];
}

export default {
  state: THUMBNAIL_DATA,
  mutations: {
    setFramesForRequest(state, payload) {
      let requestId = String(payload.requestId);
      Vue.set(state.framesByRequestId, requestId, payload.frames);
      Vue.set(state.frameCountsByRequestId, requestId, payload.count);
      Vue.set(state.latestFrameByRequestId, requestId, getLatestFrame(payload.frames));
    },
    setLatestFrameForRequest(state, payload) {
      Vue.set(state.latestFrameByRequestId, String(payload.requestId), payload.frame);
    },
    setThumbnailsForRequest(state, payload) {
      Vue.set(state.thumbnailsByRequestIdAndSize, thumbnailKey(payload.requestId, payload.size), payload.thumbnails);
    }
  },
  actions: {
    getFramesForRequest(storeContext, requestId) {
      let requestKey = String(requestId);
      if (requestKey in storeContext.state.framesByRequestId) {
        return Promise.resolve(storeContext.state.framesByRequestId[requestKey]);
      }
      if (pendingFramesByRequestId[requestKey]) {
        return pendingFramesByRequestId[requestKey];
      }

      pendingFramesByRequestId[requestKey] = new Promise((resolve, reject) => {
        $.ajax({
          url: storeContext.rootState.urls.archiveApi + '/frames/?exclude_configuration_type=GUIDE&request_id=' + requestId,
          dataType: 'json',
          success: function(response) {
            storeContext.commit('setFramesForRequest', {
              requestId: requestId,
              count: response.count,
              frames: response.results
            });
            resolve(response.results);
          },
          error: function(response) {
            reject(response);
          },
          complete: function() {
            delete pendingFramesByRequestId[requestKey];
          }
        });
      });

      return pendingFramesByRequestId[requestKey];
    },
    getLatestFrameForRequest(storeContext, requestId) {
      let requestKey = String(requestId);
      if (requestKey in storeContext.state.latestFrameByRequestId) {
        return Promise.resolve(storeContext.state.latestFrameByRequestId[requestKey]);
      }
      if (requestKey in storeContext.state.framesByRequestId) {
        let frame = getLatestFrame(storeContext.state.framesByRequestId[requestKey]);
        storeContext.commit('setLatestFrameForRequest', {
          requestId: requestId,
          frame: frame
        });
        return Promise.resolve(frame);
      }

      return storeContext.dispatch('getFramesForRequest', requestId).then(function(frames) {
        return getLatestFrame(frames);
      });
    },
    fetchThumbnailsByRequestId(context, payload) {
      let requestKey = thumbnailKey(payload.requestId, payload.size);
      if (requestKey in context.state.thumbnailsByRequestIdAndSize) {
        return Promise.resolve(context.state.thumbnailsByRequestIdAndSize[requestKey]);
      }
      if (pendingThumbnailsByRequestIdAndSize[requestKey]) {
        return pendingThumbnailsByRequestIdAndSize[requestKey];
      }

      pendingThumbnailsByRequestIdAndSize[requestKey] = new Promise((resolve, reject) => {
        $.ajax({
          url: context.rootState.urls.archiveApi + '/thumbnails/?request_id=' + payload.requestId + '&size=' + payload.size,
          dataType: 'json',
          success: function(response) {
            context.commit('setThumbnailsForRequest', {
              requestId: payload.requestId,
              size: payload.size,
              thumbnails: response.results
            });
            resolve(response.results);
          },
          error: function(response) {
            reject(response);
          },
          complete: function() {
            delete pendingThumbnailsByRequestIdAndSize[requestKey];
          }
        });
      });

      return pendingThumbnailsByRequestIdAndSize[requestKey];
    }
  }
};
