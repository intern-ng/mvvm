
define({

  main: function (global, module, exports, require) {

    // import electron
    var electron = require('electron'), _electron = electron, kit = electron.toolkit;

    // polling data source provider {{{

    var HttpGet = function (url, data) {
      return function () {
        var _this = this;
        return ajax.get(url, data, {
          cache: false
        }, ajax.handler({
          200: function (data) {
            return _this.resolve(data);
          },
          ___: function (data) {
            return _this.failure(data);
          }
        }));
      };
    };

    // }}}

    // assign `value` to object by calling function in object with name indicated by `attr` {{{

    var CallAssigner = function (attr, value) {
      this[attr].call(this, value);
    };

    // }}}

    // single binding from $title to document.title and $h1.text {{{

    _electron()

    // `electron.pipe` creates a section and append converter initiators to the created section
    .pipe([
          kit.TextInput('input[name="title"]', 'tail'),
          //        ^ event inlet

          kit.Polling(HttpGet('/bower.json'), 2000, 'data'),
    ])

    .pipe(kit.Bypass, kit.Manipulate(function (data) { return data; }))

    .pipe([
          kit.Bypass,                      // pass values from previous section to the next
          kit.Manipulate(function (name, tail) { // apply transformation
            //                     ^ capture `text` property from input values

            return {
              title: tail,
              header: (tail) ?
                name + ': ' + tail :
                name
            }; // yield `title` and `header`
          })
    ])

    .pipe(

      // Write `title` value to document.title
      kit.ObjectWriter(document , { title: 'title' }),

      // Write `header` value to $h1 using
      // CallAssigner: $h1.text.call($h1, header);
      kit.ObjectWriter('h1'     , { text: 'header' }      , CallAssigner),

      // Write `title` value to document.title
      kit.ObjectWriter('h4'     , { text: 'description' } , CallAssigner)

    )

    // notify converter(inlet, outlet) to attach their external environment
    .attach()

    // activate the reaction
    .activate();

    // }}} single way binding

    // another assigner check $obj.val() first before call $obj.val(value) {{{

    var Assigner$Val = function (attr, value) {
      // avoid indirect recursion
      if (this.val() != value) {
        this.val(value);
        this.trigger('input');
      }
    };

    // }}}

    // dual binding between $title and $mirror {{{

    _electron()

    // write content of title input to mirror input
    .pipe(kit.TextInput('input[name="title"]'))
    .pipe(kit.ObjectWriter('input[name="mirror"]', { val: 'text' }, Assigner$Val))

    // write content of mirror input to title input
    .pipe(kit.TextInput('input[name="mirror"]'))
    .pipe(kit.ObjectWriter('input[name="title"]' , { val: 'text' }, Assigner$Val))

    // attach external environment
    .attach()

    // activate reaction
    .activate();

    // }}}

  }

});

