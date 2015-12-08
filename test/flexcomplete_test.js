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

    var PROP_INSTANCE_NAME = 'Flexcomplete.instance';
    var data = [
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

    module('jQuery#flexcomplete', {
        // This will run before each test in this module.
        setup: function() {
            this.elems = $('[flexcomplete]');
        }
    });

    test('is chainable', function() {
        //expect(1);
        // Not a bad test to run on collection methods.
        var flexcompletes = this.elems.flexcomplete({
            data: data
        });

        strictEqual(flexcompletes, this.elems, 'should be chainable');

        this.elems.get().forEach(function(item) {
            var flexcomplete = $(item).data(PROP_INSTANCE_NAME);
            notEqual(flexcomplete, undefined);
        });

        this.elems.unflexcomplete();

        this.elems.get().forEach(function(item) {
            var flexcomplete = $(item).data(PROP_INSTANCE_NAME);
            equal(flexcomplete, undefined);
        });
    });

    function testChildren(elems, searchString) {

        // Not a bad test to run on collection methods.
        function matches(item) {
            return item.indexOf(searchString) >= 0 ? true : false;
        }

        var flexcompletes = elems.flexcomplete({
                data: data,
                matches: matches,
                delay: 1
            }),
            count = data.reduce(function(previous, current, index, array) {
                return previous + (matches(array[index]) ? 1 : 0);
            }, 0);

        elems.get().forEach(function(item) {

            item = $(item);
            item.val(searchString).focus();

            var instance = item.data(PROP_INSTANCE_NAME);

            asyncTest('are children being filled correctly one by one', function(assert) {

                setTimeout(function() {

                    notEqual(instance.parentEl, undefined, "The parent div should be present at the body");

                    var children = instance.parentEl.find('.flexcomplete-line');

                    equal(children.length, count, "There should be at least one result");

                    children.get().forEach(function(child) {
                        ok(matches($(child).text()) === true);
                    });

                    start();

                }, 5);
            });
        });

        strictEqual(flexcompletes, elems, 'should be chainable');
    }

    test('are children being filled correctly [unique element]', function() {

        testChildren(this.elems, 'único');
    });

    test('are children being filled correctly [many elements]', function() {

        testChildren(this.elems, 'thiago');
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