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


    var data = [
        'thiago andrade', 'bruno henrique',
        'walmor cesar', 'breno nunes',
        'd\'alia', 'toto-tata',
        'jogo#velha', 'email@email.com',
        'antonio braga', 'carlos leite',
        'paulo amorim', 'raphael praxedes',
        'thiago souza', 'thiago leite',
        'thiago cavalcanti', 'thiago ferreira',
        'thiago braga', 'thiago castro',
        'thiago lima', 'thiago aragão',
        'thiago alencar', 'thiago assis',
        'hugo fernando', 'danilo lima',
        'ronaldo nobrega', 'kleber xavier',
        'andré barros', 'roberta almeida'
    ];

    module('jQuery#flexcomplete', {
        // This will run before each test in this module.
        setup: function() {
            this.elems = $('[flexcomplete]');
        }
    });

    test('is chainable', function() {
        expect(1);
        // Not a bad test to run on collection methods.
        var flexcompletes = this.elems.flexcomplete({
            data: data
        });
        strictEqual(flexcompletes, this.elems, 'should be chainable');
    });

    test('is awesome', function() {
        expect(1);
        strictEqual(this.elems.flexcomplete().text(), 'awesome0awesome1awesome2', 'should be awesome');
    });

    module('jQuery.flexcomplete');

    test('is awesome', function() {
        expect(2);
        strictEqual($.flexcomplete(), 'awesome.', 'should be awesome');
        strictEqual($.flexcomplete({
            punctuation: '!'
        }), 'awesome!', 'should be thoroughly awesome');
    });

    module(':flexcomplete selector', {
        // This will run before each test in this module.
        setup: function() {
            this.elems = $('#qunit-fixture').children();
        }
    });

    test('is awesome', function() {
        expect(1);
        // Use deepEqual & .get() when comparing jQuery objects.
        deepEqual(this.elems.filter(':flexcomplete').get(), this.elems.last().get(), 'knows awesome when it sees it');
    });
}(jQuery));