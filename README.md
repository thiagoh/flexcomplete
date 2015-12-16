# Flexcomplete

A flexible autocomplete plugin for jQuery. It works with online and offline data.

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
  $.flexcomplete({
        url: 'http://localhost:8080/search', // <-- your_search_url_here
        onSelect: function(value, input) {
            input.value = value;
            console.log('You selected the value:' + value);
        }
  }); 
});
</script>
```

## API

_comming soon_
```js
$('#myObject').flexcomplete('search');
```

_comming soon_
```js
$('#myObject').flexcomplete('destroy');
```

To change flexcomplete behaviour globally you must override the `$.flexcomplete.options` object. See below the option keys, their default values and their description.

```js
// the parameter key with your search query
queryVar: "q"

// Http method
method: "GET"

// executed before flexcomplete sends your data to server, so you can process the input and change it anyway
processInput: function(value) { 
    return value;
}

// executed when the user selects an item from the list
onSelect: function(value, input) {
    input.value = value;
}

// if you want to process the input's value when the autoreplacing options is enabled override this function
getAutoreplacingInputValue: function(value) {
    return value;
}

// if you want to process the value that comes from the server to fulfill the items override this function
getLine: function(value) {
    return value;
}

// if you want to filter your data when staticDataSearch is enabled override this function
filter: function(arr, userSearch) {
    return arr; // you can filter arr here (check examples how to do it)
}

// delay between typing and sending the request to the server
delay: 100

// how many items are skipped on triggering an `page up` or `page down` when navigating the list
jump: 6

// how many chars are needed before send the first request to the server
startIn: 1

// select the result if there is only one item in the list
selectIfOneResult: false

// any extra parameters you want to send to the server
// can be an object or a function that returns an object
extraParams: {} | function(instance){
    return {};
}

// enable this option if you want to replace the input content when navigating through list items
autoReplacing: false
```

## Examples
To see more examples of how to use Flexcomplete please check the demo directory.

## Release History

* 0.1.0 first release
