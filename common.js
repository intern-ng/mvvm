
// NOOP Utility {{{

// Function that do nothing
var noop = function () { };

// Function that do nothing but callback if last parameter is a function
var noopa = function () {
  var cb = Array.prototype.slice.call(arguments, -1);
  if (typeof cb == 'function') return cb();
};

// }}}

// Figure out type of `obj'
var typeid = function (obj) {
  return Object.prototype.toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
};

// Get query component parameter by name
var qscomponent = function (name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
  results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

var signatureof = function (func) {
  var s = func.toString();
  var m = s.match(/^\s*function\s*([^(]*)\s*\(([^)]*)\)\s*\x7b/i);
  if (m) {
    return {
      name: m[1] || null,
      param: m[2] && m[2].split(/\s*,\s*/) || []
    };
  } else {
    return null;
  }
};

var uuid = function () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
};

// AJAX Utility {{{

var ajax = function (method, url, data, options, handler) {
  if (typeid(options) == 'function') {
    handler = options; options = {};
  }

  _(options).extend({
    method: method,
    url: url,
    data: data,
    complete: function (xhr, statusText) {
      if (typeid(handler) == 'function') {
        return handler(xhr.responseJSON || xhr.responseXML || xhr.responseText, xhr.status, xhr);
      }
    }
  });

  return $.ajax(options);
};

_(ajax).extend({

  ///
  // ajax.handler([Object]);
  // ajax.handler([Array]);
  // ajax.handler([String status | Array], [Function handler | Array]);
  // ajax.handler([Function matcher], [Function handler | Array]);
  ///
  handler: function (matcher, handler, _collection) {
    if (!handler) {
      handler = matcher;
      if (typeid(handler) == 'object') {
        handler = _.map(handler,  function (handler, matcher, _collection) {
          return ajax.handler(matcher, handler, _collection);
        });
      }
      if (typeid(handler) == 'array') {
        return function (data, status, xhr) {
          _.each(handler, function (handler) { handler(data, status, xhr); });
        };
      }
    } else {
      if (matcher == '*') {
        matcher = function () { return true; };
      }
      if (matcher == '___') {
        matcher = function (data, status, xhr) {
          return !~Object.keys(_collection).indexOf('' + status);
        };
      }
      if (typeid(matcher) == 'string') {
        matcher = [ matcher ];
      }
      if (typeid(matcher) == 'array') {
        matcher = function (matcher) {
          return function (data, status, xhr) {
            return !!~matcher.indexOf('' + status);
          };
        }(matcher);
      }
      if (typeid(handler) == 'array') {
        handler = function (handler) {
          return function (data, status, xhr) {
            _.each(handler, function (handler) { handler(data, status, xhr); });
          };
        }(handler);
      }
      if (typeid(matcher) == 'function') {
        return function (data, status, xhr) {
          return matcher(data, status, xhr) && handler(data, status, xhr);
        };
      }
    }
  }

});

_.each(['post', 'get'], function (method) {
  ajax[method] = ajax.bind(null, method);
});

// }}}

var closewindow = window.close;

// Wechat Internal Browser Support {{{

(function () {

  // Configure for Wechat
  document.addEventListener('WeixinJSBridgeReady', function onBridgeReady() {
    // WeixinJSBridge.call('hideOptionMenu');
    // WeixinJSBridge.call('hideToolbar');
    closewindow = WeixinJSBridge.call.bind(WeixinJSBridge, 'closeWindow');
  });

})();

// }}}

