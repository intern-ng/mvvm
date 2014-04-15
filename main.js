
// jshint -W085: Don't use 'with'

define({

  main: function (global, module, exports, require) {

    var electron = require('electron'), _electron = electron, kit = electron.toolkit;

    var CallAssigner = function (attr, value) {
      this[attr].call(this, value);
    };

    _electron()
    .pipe(kit.TextInput('input[name="title"]'))
    .pipe(kit.Manipulate(function (text) {
      return {
        title: text || 'MVVM Demonstration',
        header: (text) ? 'MVVM Demonstration - ' + text : 'MVVM Demonstration'
      };
    }))
    .pipe(
      kit.Bypass,
      kit.ObjectWriter(document, { title: 'title' }),
      kit.ObjectWriter('h1', { text: 'header' }, CallAssigner)
    )
    .attach()
    .activate();

    var Assigner$Val = function (attr, value) {
      if (this.val() != value) {
        this.val(value);
        this.trigger('input');
      }
    };

    _electron()
    .pipe(kit.TextInput('input[name="title"]'))
    .pipe(kit.ObjectWriter('input[name="mirror"]', { val: 'text' }, Assigner$Val))
    .pipe(kit.TextInput('input[name="mirror"]'))
    .pipe(kit.ObjectWriter('input[name="title"]', { val: 'text' }, Assigner$Val))
    .attach()
    .activate();

  }

});

