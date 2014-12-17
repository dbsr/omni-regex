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

/*
 * Escape illegal xml entities
 */
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

/*
 * Creates suggestions based on regex 
 */
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

/*
 * Loads url chosen by user
 */
function onInputEntered(url) {
  tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.update(tabs[0].id, {url: url});
  });
}

/*
 * set up event listeners for the omnibox
 */
exports.init = function(itemsString) {
  urls = itemsString;
  omni.onInputChanged.addListener(onInputChanged);
  omni.onInputEntered.addListener(onInputEntered);
};
