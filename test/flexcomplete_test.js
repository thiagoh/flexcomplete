(function($) {

    /*
      ======== A Handy Little QUnit Reference ========
      http://api.qunitjs.com/

      Test methods:
        module(name, {[setup][ ,teardown]})
        test(name, callback)
        expect(numberOfAssertions)
        stop(increment)
        start(decrement)
      Test assertions:
        ok(value, [message])
        equal(actual, expected, [message])
        notEqual(actual, expected, [message])
        deepEqual(actual, expected, [message])
        notDeepEqual(actual, expected, [message])
        strictEqual(actual, expected, [message])
        notStrictEqual(actual, expected, [message])
        throws(block, [expected], [message])
    */

    function matches(item, searchString) {
        return item.indexOf(searchString) >= 0 ? true : false;
    }

    var pInstance = 'Flexcomplete.instance';

    module('jQuery#flexcomplete', {
        // This will run before each test in this module.
        setup: function() {
            this.elems = $('[flexcomplete]');
            this.data = [
                'sujeito único',
                'antonio braga',
                'bruno henrique',
                'bruno braga',
                'walmor cesar',
                'breno nunes',
                'd\'alia',
                'toto-tata',
                'jogo#velha',
                'email@email.com',
                'carlos leite',
                'paulo amorim',
                'raphael praxedes',
                'thiago andrade',
                'thiago amaral',
                'thiago souza',
                'thiago leite',
                'thiago cavalcanti',
                'thiago ferreira',
                'thiago braga',
                'thiago castro',
                'thiago lima',
                'thiago aragão',
                'thiago alencar',
                'thiago assis',
                'hugo fernando',
                'danilo lima',
                'ronaldo nobrega',
                'kleber xavier',
                'andré barros',
                'roberta almeida'
            ];
        }
    });

    test('is chainable', function() {
        //expect(1);

        var flexcompletes = this.elems.flexcomplete({
            data: this.data
        });

        strictEqual(flexcompletes, this.elems, 'should be chainable');

        this.elems.get().forEach(function(item) {
            var flexcomplete = $(item).data(pInstance);
            notEqual(flexcomplete, undefined);
        });

        this.elems.unflexcomplete();

        this.elems.get().forEach(function(item) {
            var flexcomplete = $(item).data(pInstance);
            equal(flexcomplete, undefined);
        });
    });

    function test_by_input_val(elems, searchString, count) {

        elems.get().forEach(function(item) {

            item = $(item);
            item.val(searchString).focus();

            var instance = item.data(pInstance);

            asyncTest('are children being filled correctly one by one', function(assert) {

                setTimeout(function() {

                    ok(typeof instance.parentEl !== 'undefined', "The parent div should be present at the body");

                    var children = instance.parentEl.find('.flexcomplete-line');

                    if (typeof count !== 'undefined') {
                        equal(children.length, count, "There should be at least one result");
                    }

                    children.get().forEach(function(child) {
                        ok(matches($(child).text(), searchString) === true);
                    });

                    start();

                }, 5);
            });
        });
    }

    function test_search_function(elems, searchString, count) {

        elems.get().forEach(function(item) {

            var instance = $(item).data(pInstance);

            asyncTest('are children being filled correctly one by one', function(assert) {

                $(item).flexcomplete('search', searchString)
                    .then(function() {

                        notEqual(instance.parentEl, undefined, "The parent div should be present at the body");

                        var children = instance.parentEl.find('.flexcomplete-line');

                        if (typeof count !== 'undefined') {
                            equal(children.length, count, "There should be at least one result");
                        }

                        children.get().forEach(function(child) {
                            ok(matches($(child).text(), searchString) === true);
                        });

                        start();
                    });
            });
        });
    }

    function test_select_function(elems, searchString) {

        elems.get().forEach(function(item) {

            var instance = $(item).data(pInstance);

            asyncTest('are children being filled correctly one by one', function(assert) {

                $(item).flexcomplete('search', searchString)
                    .then(function() {

                        var arr = [].slice.call(instance.children);

                        for (var i = 0; i < arr.length; i++) {

                            $(item).flexcomplete('select', i);

                            equal(instance.$input.val(), arr[i], "The input value should be " + arr[i] + " but is " + instance.$input.val());
                        }

                        start();
                    });
            });
        });
    }

    test('STATIC DATA - are children being filled correctly (input value) [unique element]', function() {

        var searchString = 'único',
            flexcompletes = this.elems.flexcomplete({
                data: this.data,
                matches: matches,
                delay: 1
            }),
            count = this.data.reduce(function(previous, current, index, array) {
                return previous + (matches(array[index], searchString) ? 1 : 0);
            }, 0);

        test_by_input_val(this.elems, searchString, count);

        strictEqual(flexcompletes, this.elems, 'should be chainable');
    });

    test('STATIC DATA - are children being filled correctly (input value) [many elements]', function() {

        var searchString = 'thiago',
            flexcompletes = this.elems.flexcomplete({
                data: this.data,
                matches: matches,
                delay: 1
            }),
            count = this.data.reduce(function(previous, current, index, array) {
                return previous + (matches(array[index], searchString) ? 1 : 0);
            }, 0);

        test_by_input_val(this.elems, searchString, count);

        strictEqual(flexcompletes, this.elems, 'should be chainable');
    });

    test('STATIC DATA - are children being filled correctly search function [unique element]', function() {

        var searchString = 'único',
            flexcompletes = this.elems.flexcomplete({
                data: this.data,
                matches: matches,
                delay: 1
            }),
            count = this.data.reduce(function(previous, current, index, array) {
                return previous + (matches(array[index], searchString) ? 1 : 0);
            }, 0);

        test_search_function(this.elems, searchString, count);

        strictEqual(flexcompletes, this.elems, 'should be chainable');
    });

    test('STATIC DATA - are children being filled correctly search function [many elements]', function() {

        var searchString = 'thiago',
            flexcompletes = this.elems.flexcomplete({
                data: this.data,
                matches: matches,
                delay: 1
            }),
            count = this.data.reduce(function(previous, current, index, array) {
                return previous + (matches(array[index], searchString) ? 1 : 0);
            }, 0);

        test_search_function(this.elems, searchString, count);

        strictEqual(flexcompletes, this.elems, 'should be chainable');
    });

    test('STATIC DATA - are children being filled correctly select function [many elements]', function() {

        var searchString = "an",
            flexcompletes = this.elems.flexcomplete({
                data: this.data,
                matches: matches,
                delay: 1
            }),
            count = this.data.reduce(function(previous, current, index, array) {
                return previous + (matches(array[index], searchString) ? 1 : 0);
            }, 0);

        test_select_function(this.elems, searchString, count);
        strictEqual(flexcompletes, this.elems, 'should be chainable');
    });

    test('DYNAMIC DATA - are children being filled correctly select function [many elements]', function() {

        var searchString = "an",
            flexcompletes = this.elems.flexcomplete({
                url: 'http://localhost:3000/data/super-heroes'
            });

        test_select_function(this.elems, searchString);
        strictEqual(flexcompletes, this.elems, 'should be chainable');
    });

    // test('is awesome', function() {
    //     expect(1);
    //     strictEqual(this.elems.flexcomplete().text(), 'awesome0awesome1awesome2', 'should be awesome');
    // });

    // module('jQuery.flexcomplete');

    // test('is awesome', function() {
    //     expect(2);
    //     strictEqual($.flexcomplete(), 'awesome.', 'should be awesome');
    //     strictEqual($.flexcomplete({
    //         punctuation: '!'
    //     }), 'awesome!', 'should be thoroughly awesome');
    // });

    // module(':flexcomplete selector', {
    //     // This will run before each test in this module.
    //     setup: function() {
    //         this.elems = $('#qunit-fixture').children();
    //     }
    // });

    // test('is awesome', function() {
    //     expect(1);
    //     // Use deepEqual & .get() when comparing jQuery objects.
    //     deepEqual(this.elems.filter(':flexcomplete').get(), this.elems.last().get(), 'knows awesome when it sees it');
    // });

}(jQuery));