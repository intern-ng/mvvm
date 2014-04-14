
// jshint -W085: Don't use 'with'

define({

  main: function (global, module, exports, require) {

    var electron = require('electron'), kit = electron.toolkit;

    with (kit) electron()
    .pipe(TextInput('input[name="title"]'))
    .pipe(Bypass, ObjectWriter(document, { title: 'text' }))
    .attach()
    .activate();

  }

});

