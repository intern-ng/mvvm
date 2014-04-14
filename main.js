
define({

  main: function (global, module, exports, require) {

    var mvvm = require('electron');
    var $ = require('jquery');

    var A = function (opt) {
      return function (use) {
        var $textbox = $('input');
        var _this = this;
        var handler = function () {
          _this.resolve({ m: $textbox.val() });
        };
        this
        .on('attach', function () {
          $('input').keyup(handler);
        }).on('detach', function () {
          $('input').off('keyup', handler);
        });
      };
    }, B = function (use) {
      return use(function () {
        this.resolve({ n: 2 });
      });
    }, H = function (use) {
      return use(function (m, n) {
        document.title = m;
        this.resolve({ a: m, b: n });
      });
    }, F = function (use) {
      return use(function (___) {
        this.resolve(___);
      });
    };

    mvvm()
    .pipe(A(), B)
    .pipe(H)
    .pipe(F)
    .attach()
    .exec();

  }

});

