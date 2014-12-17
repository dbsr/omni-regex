/*
 * name        : storage.js
 * author      : Daan Mathot (dydrmntion@gmail.com)
 * license     : see LICENSE
 */

/* jshint node: true */
'use strict';


var storage = chrome.storage.local;


var HISTORY_ITEMS = 'history_items',
    LAST_HISTORY_ITEM_TIME = 'last_history_item_time';


//storage.remove(HISTORY_ITEMS);
//storage.remove(LAST_HISTORY_ITEM_TIME);


exports.getLastHistoryItemTime = function(getCb) {
  storage.get(LAST_HISTORY_ITEM_TIME, function(result) {
    result = result[LAST_HISTORY_ITEM_TIME];
    getCb(result);
  });
};

function setLastHistoryItemTime(time) {
  var stor = {};
  stor[LAST_HISTORY_ITEM_TIME] = time;
  storage.set(stor);
}


exports.getHistoryItems = function(getCb) {
  storage.get(HISTORY_ITEMS, function(result) {
    result = result[HISTORY_ITEMS];
    getCb(result);
  });
};

exports.setHistoryItems = function(items) {
  var newStartTime = items[items.length - 1].lastVisitTime,
      stor = {};

  // save newest item
  setLastHistoryItemTime(newStartTime);

  // get relevant parts of the history item objects and make sure we dont
  // store duplicate urls
  var unique = {};
  items
    .map(
      function(item) {
        return item.url;
      })
    .forEach(
        function(item) {
          unique[item] = 0;
        });

  stor[HISTORY_ITEMS] = Object
    .keys(unique)
    .join('@');
  storage.set(stor);
};
