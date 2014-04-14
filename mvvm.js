///
// MVVM/Reactive Draft Module
///

// Simple CMD Implementation {{{

var define = (function () {

  var require = window.require = function (name) {
    return require.registry[name];
  };

  _(require).extend({
    registry: {},
    metadata: {}
  });

  return function (name, module) {
    if (typeid(name) == 'function') {
      return function (global, module, exports, require) {
        module.exports = name;
      };
    }
    if (typeid(name) == 'object') {
      _.each(name, function (v, k) { define(k, v); });
      return;
    }
    var metadata = require.metadata[name] = {
      name: name
    };
    module.call(null, window,
                metadata,
                require.registry[name] = metadata.exports = {},
                require);
                return null, require.registry[name] = metadata.exports;
  };

})();

// }}}

// Import 3rd Party Library {{{

define({

  jquery: define($),

  lodash: define(_),

});

// }}}

define({

  event: function (global, module, exports, require) { // {{{

    var _ = require('lodash');

    module.exports = function () {

      var registry = {}, _s;

      return null, _s = {
        on: function (event, handler, context) {
          if (typeid(event) == 'array') {
            _.each(event, function (name) { _s.on(name, handler); });
            return _s;
          }
          registry[event] = registry[event] || [];
          registry[event].push(handler.bind(context || global));
          return _s;
        },
        emit: function (event) {
          var args = Array.prototype.slice.call(arguments, 1);
          _.each(registry[event], function (handler) {
            Function.prototype.apply.call(handler, global, args);
          });
          var argv = Array.prototype.slice.call(arguments, 0);
          _.each(registry['*'], function (handler) {
            Function.prototype.apply.call(handler, global, argv);
          });
          return _s;
        }
      };

    };

  }, // }}}

  electron: function (global, module, exports, require) { // {{{

    var _ = require('lodash');
    var EventEmitter = require('event');

    // Electron Core {{{

    var electron = module.exports = function (option) {

      // option {{{

      var opt = _.defaults(option || {}, {
        name: 'unknown'
      });

      // }}} option

      // circut {{{

      var circut = function (use) {

        electron.log('Initializing converter...');

        // Event Cascade
        //    `this` points to the upperlevel circut instance
        this.on('attach', circut.attach);
        this.on('detach', circut.detach);

        electron.log('Events connected');

        // converter {{{

        return use(function (___) {
          //                 ^ Capture all input (cascade)
          //   ^ Configure converter

          var connect = function (section, data) {
            _.each(section, function (initiator) {
              var converter = converts[initiator.key];
              if (!converter) return;
              if (_.all(converter.capture, function (name) {
                return data.hasOwnProperty(name) || name == '___';
              })) {
                converter.apply(section, _.map(converter.capture, function (name) {
                  return (name == '___') ? data : data[name];
                }));
              }
            });
          };

          var _this = this;

          _.each(sections, function (section, i, sections) {
            section.on('change', sections[i + 1] ? connect.bind(null, sections[i + 1]) : function (___) {
              return _this.resolve(___);
            });
          });

          // Start reaction
          return connect(sections[0], ___);

        });

        // }}} converter

      };

      // }}} circut

      // variable {{{

      // Section vector registry
      var sections = circut._sects = [];
      // SECTIONS := [ SECTION, ... ]
      // SECTION  := [ INITIATOR, ... ]
      // INITIATOR:= function (use) {
      //              ...
      //              return use(CONVERTER);
      //             }
      // CONVERTER:= function (*CAPTURE) {
      //              ...
      //              this.resolv(OUT);
      //              this.except(ERR);
      //             }
      // OUT      := { <channel>: <value>, ... }
      // ERR      := [Error Object]

      // Converter function instance registry
      var converts = circut._convs = {};

      // }}} variable

      // pipe - add reaction section {{{

      circut.pipe = function () {

        var section = _.flatten(
          Array.prototype.slice.call(arguments, 0)
        );

        sectionify(section);

        _.each(section, function (initiator) {

          // Assign initiator key
          initiator.key = uuid();

          // Initialize converter
          initiator.call(section, useof(initiator.key));

        });

        sections.push(section);

        return circut;

      };

      // (private) useof - help register converter initiated by `initiator` {{{

      var useof = function (key) {

        // Register converter to registry (`use` function)
        return function (converter) {
          if (typeid(converter) != 'function') {
            throw new TypeError('converter must be function');
          }
          // If capture is not provided by function object
          if (!converter.capture) {
            electron.info('Trying capture detection on converter', key, 'with function siguature.');
            // Find capture with function signature
            var capture = signatureof(converter).param;
            if (capture.length) {
              converter.capture = capture;
            }
          }
          electron.info('Converter', key, 'captures:', converter.capture);
          converts[key] = converter;
          electron.info('Converter', key, 'registered.');
        };

      };

      // }}} useof

      // }}} pipe

      // attach/detach - enable/disable external bindings {{{

      // Broadcast `attach` event to section-level
      circut.attach = function () {
        circut.emit('attach');
        return circut;
      };

      // Broadcast `detach` event to section-level
      circut.detach = function () {
        circut.emit('detach');
        return circut;
      };

      // }}}

      // activate - start reaction in section sandbox {{{

      var activate = circut.activate = function () {
        var sandbox = sectionify([]);
        circut.call(sandbox, function (converter) {
          return converter.call(sandbox, {});
        });
        sandbox.on('change', function (data) {
          electron.log('Sandbox data changed:', data);
        });
        return sandbox;
      };

      // }}}

      // eventify - attach object with EventEmitter {{{

      var eventify = circut.eventify = function (object) {
        object._event = new EventEmitter();
        object.on = object._event.on.bind(object._event);
        object.emit = object._event.emit.bind(object._event);
        return object;
      };

      // }}}

      // sectionify - configure section properties {{{

      var sectionify = circut.sectionify = function (section) {

        section.data = {};

        section.resolve = function (data) {
          _.extend(section.data, data);
          section.emit('change', section.data, data);
          return section;
        };

        section.failure = function (err) {
          section.emit('error', err);
          return section;
        };

        eventify(section);

        return section;

      };

      // }}}

      // Configure circut broadcasting events to section {{{

      eventify(circut)
      .on('*', function () {
        // Passthrough all event to section level
        var args = Array.prototype.slice.call(arguments, 0);
        _.each(sections, function (section) {
          section.emit.apply(section, args);
        });
      });

      // }}}

      return circut;

    };

    // }}} Electron Core

    // Log {{{

    electron.LOG_LEVEL = 1;

    _.each({
      warn: 1,
      debug: 2,
      info: 3,
      log: 4
    }, function (v, k) {
      electron[k] = function () {
        if (electron.LOG_LEVEL >= v) {
          console[k].apply(console, arguments);
        }
      };
    });

    // }}} Log

  }, // }}}

});

