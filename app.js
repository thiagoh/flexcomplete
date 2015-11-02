(function($) {
	
	'use strict';

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

	$('input[flexcomplete]').flexcomplete({
		width: 300,
		showTooltip: true,
		data: data,
		onSelect: function(val, input) {

			var self = this;

			var item = $("<span class='item'>" + val + "<span class='remove-item'>x</span></span>")
				.find('.remove-item').click(function() {
					item.remove();
				}).end();

			$('#container').append(item);

			input.value = '';
		},
		getLine: function(data) {
			return data;
		},
		filter: function(data, input) {
			input = $(input);
			var re = new RegExp(input.val().replace($.fn.flexcomplete.reReplace, ''), "i");
			return $(data).filter(function(i) {
				return re.test(data[i].replace($.fn.flexcomplete.reReplace, ''));
			});
		}
	});

	var dataContainer = $('#idDataContainer').empty();

	var arr = instance.flexcomplete('staticData');
	for (var i = 0; i < arr.length; i++) {
		dataContainer.append('<div>' + arr[i] + '</div>');
	}

	$('#textbox').click(function() {
		$('#id').focus();
	});
	
}(jQuery));