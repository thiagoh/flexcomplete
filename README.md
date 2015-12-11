# Flexcomplete

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

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Release History
_(Nothing yet)_
