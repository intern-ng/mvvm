
// jshint -W085: Don't use 'with'

define({

  main: function (global, module, exports, require) {

    var electron = require('electron'), _electron = electron, kit = electron.toolkit;

    var CallAssigner = function (attr, value) {
      this[attr].call(this, value);
    };

    var Assigner$Val = function (attr, value) {
      this.val(value);
      this.trigger('input');
    };

    with (kit) electron()
    .pipe(TextInput('input[name="title"]'))
    .pipe(Bypass,
          ObjectWriter(document, { title: 'text' }),
          ObjectWriter($('input[name="mirror"]'), {
            val: 'text'
          }, CallAssigner))
    .attach()
    .activate();

    _electron()
    .pipe(kit.TextInput('input[name="title"]'))
    .pipe(kit.Bypass, kit.ObjectWriter($('h1').get(0), {
      innerHTML: function (text) {
        return (text) ? 'MVVM Demonstration - ' + text : 'MVVM Demonstration';
      }
    }))
    .attach()
    .activate();

    _electron()
    .pipe(kit.TextInput('input[name="mirror"]'))
    .pipe(kit.ObjectWriter($('input[name="title"]'), {
      val: 'text'
    }, Assigner$Val))
    .attach()
    .activate();

  }

});

