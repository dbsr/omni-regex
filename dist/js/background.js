(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
  console.log(stor);
  storage.set(stor);
};

},{}],2:[function(require,module,exports){
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

},{"./cache.js":1,"./history.js":3,"./omni.js":4}],3:[function(require,module,exports){
/*
 * name        : history.js
 * author      : Daan Mathot (dydrmntion@gmail.com)
 * license     : see LICENSE
 */

/* jshint node: true */
'use strict';


var hist = chrome.history;


exports.getNewItems = function(startTime, getCb) {
  var qOpts = {
    text: '',
    startTime: startTime
  };
  hist.search(
      qOpts,
      getCb);
};

},{}],4:[function(require,module,exports){
/*
 * name        : omni.js
 * author      : Daan Mathot (dydrmntion@gmail.com)
 * license     : see LICENSE
 */

/* jshint node: true */
'use strict';

var omni = chrome.omnibox,
    tabs = chrome.tabs,
    urls = null,
    prevTextLength = 0,
    curMatches = null;


var MIN_TEXT_LENGTH = 3;


function escapeXml(url) {
  var xmlCharMap = {
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
      '"': '&quot;',
      "'": '&apos;'
  };

  return url.replace(/[<>&"']/g, function (ch) {
      return xmlCharMap[ch];
      });
}

function onInputChanged(text, suggest) {
  var suggestions = [],
  textLength = text.length;


  if(textLength >= MIN_TEXT_LENGTH) {
    if(prevTextLength === 0 || textLength < prevTextLength) {
      curMatches = urls;
    }
    // find matches for current text
    text = text.replace(/ /g, '.');
    var qRegex = new RegExp('@[^@]*' + text + '[^@]*', 'gi'),
    matches = curMatches.match(qRegex);

    if(matches) {

      // create suggestions
      matches.forEach(
          function(m) {
            var url = m.slice(1, m.length);
            suggestions.push({
              content: url,
              description: '<url>' + escapeXml(url) + '</url>'
            });
          });

      // and update curMatches
      curMatches = matches.join('@');
    }
  }
  suggest(suggestions);
}

function onInputEntered(url) {
  tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.update(tabs[0].id, {url: url});
  });
}

exports.init = function(itemsString) {
  urls = itemsString;
  omni.onInputChanged.addListener(onInputChanged);
  omni.onInputEntered.addListener(onInputEntered);
};

},{}]},{},[2])