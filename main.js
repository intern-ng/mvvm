
define({

  main: function (global, module, exports, require) {

    var electron = require('electron'), kit = electron.toolkit;

    electron()
    .pipe(kit.TextInput('input[name="title"]'))
    .pipe(kit.Bypass, kit.ObjectWriter(document, { title: 'text' }))
    .attach()
    .activate();

  }

});

