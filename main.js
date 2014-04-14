
// jshint -W085: Don't use 'with'

define({

  main: function (global, module, exports, require) {

    var electron = require('electron'), _electron = electron, kit = electron.toolkit;

    with (kit) electron()
    .pipe(TextInput('input[name="title"]'))
    .pipe(Bypass, ObjectWriter(document, { title: 'text' }))
    .attach()
    .activate();

    _electron()
    .pipe(kit.TextInput('input[name="title"]'))
    .pipe(kit.Bypass, kit.ObjectWriter($('h1').get(0), {
      innerHTML: function (___) {
        return (___.text) ? 'MVVM Demonstration - ' + ___.text : 'MVVM Demonstration';
      }
    }))
    .attach()
    .activate();

  }

});

