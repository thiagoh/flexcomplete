## FlexComplete

# Usage
```
(function($) {

	$(function() {

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
					input = $(input);
					var re = new RegExp(input.val().replace($.fn.flexcomplete.reReplace, ''), "i");
					return $(line).filter(function(i) {
						return re.test(line[i].replace($.fn.flexcomplete.reReplace, ''));
					});
				}
			}),
			updateData = function() {

				var dataContainer = $('#idDataContainer').empty();
				var arr = instance.flexcomplete('staticData');
				for (var i = 0; i < arr.length; i++) {
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

	});

}(jQuery));
<<<<<<< HEAD
``` 
=======
``` 
>>>>>>> 1ef0af8c69aa882fd4096e6a5648bdc585a558ab
