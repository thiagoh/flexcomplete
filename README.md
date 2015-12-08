# Flexcomplete

<<<<<<< HEAD
A flexible autocomplete plugin for jQuery

## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/thiago/flexcomplete/master/dist/flexcomplete.min.js
[max]: https://raw.github.com/thiago/flexcomplete/master/dist/flexcomplete.js

In your web page:

```html
<script src="jquery.js"></script>
<script src="dist/flexcomplete.min.js"></script>
<script>
jQuery(function($) {
  $.awesome(); // "awesome"
});
</script>
```

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Release History
_(Nothing yet)_
=======
# Usage
```

(function($) {

    var data = [
            'thiago andrade', 'bruno henrique', 'walmor cesar', 'breno nunes',
            'd\'alia', 'toto-tata', 'jogo#velha', 'email@email.com', 'antonio braga',
            'carlos leite', 'paulo amorim', 'raphael praxedes', 'thiago souza',
            'thiago leite', 'thiago cavalcanti', 'thiago ferreira', 'thiago braga',
            'thiago castro', 'thiago lima', 'thiago aragão', 'thiago alencar',
            'thiago assis', 'hugo fernando', 'danilo lima', 'ronaldo nobrega',
            'kleber xavier', 'andré barros', 'roberta almeida'
        ],
        remove = function(event) {

            $(this).parent('.item').remove();
        },
        instance = $('input[flexcomplete]').flexcomplete({
            data: data,
            onSelect: function(val, input) {

                $("<span class='item'>" + val + "<span class='remove-item'>x</span></span>")
                    .on('click', '.remove-item', remove).appendTo($('#container'));

                input.value = '';
            },
            getLine: function(line) {
                return line;
            },
            filter: function(line, input) {

                var re = new RegExp($(input).val().replace($.fn.flexcomplete.reReplace, ''), "i");

                return $(line).filter(function(i) {
                    return re.test(line[i].replace($.fn.flexcomplete.reReplace, ''));
                });
            }
        }),
        updateData = function() {

            var dataContainer = $('#idDataContainer').empty(),
                arr = instance.flexcomplete('staticData'),
                i = 0;

            for (; i < arr.length; i++) {
                dataContainer.append('<div>' + arr[i] + '</div>');
            }
        };

    $('#idAddDataButton').click(function() {

        var v = $('#idAddData').val();

        if ($.trim(v) === '') {
            return;
        }

        $('#idAddData').val('');
        updateData();
    });

    updateData();
    
    $('#textbox').click(function() {
        $('#id').focus();
    });


}(jQuery));
>>>>>>> 6cd95fee14f673750b64eef3e83b7215393639f3
