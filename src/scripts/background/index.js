/*
 * name        : index.js
 * author      : Daan Mathot (dydrmntion@gmail.com)
 * license     : see LICENSE
 */

/* jshint node: true */
'use strict';


var cache = require('./cache.js'),
    hist = require('./history.js'),
    omni = require('./omni.js');



function updateHistoryCache() {
  // first find out when we last updated the cache (if ever)
  cache.getLastHistoryItemTime(
      function(startTime) {
        // now get new items based on startTime
        hist.getNewItems(
            startTime || 0,
            function(items) {
              // update cache with new items
              cache.setHistoryItems(items);
            });
        
      });

}

// update cache manually
updateHistoryCache();

// load cache and initiate omni listeners
cache.getHistoryItems(
    function(histItems) {
      omni.init(histItems);
    });
