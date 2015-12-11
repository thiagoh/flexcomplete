/*
 * flexcomplete
 * https://github.com/thiago/flexcomplete
 *
 * Copyright (c) 2015 Thiago Andrade
 * Licensed under the MIT license.
 */

(function($) {

    'use strict';

    var pInstance = 'Flexcomplete.instance',
        pData = 'Flexcomplete.data',
        KEY_DO_SEARCH = 11111,
        KEY_ENTER = 13,
        KEY_TO_LEFT = 37,
        KEY_TO_RIGHT = 39,
        KEY_TO_UP = 38,
        KEY_TO_DOWN = 40,
        KEY_BACKSPACE = 8,
        KEY_INSERT = 45,
        KEY_DELETE = 46,
        KEY_SHIFT = 16,
        KEY_CTRL = 17,
        KEY_PAGE_UP = 33,
        KEY_PAGE_DOWN = 34,
        KEY_ESC = 27,
        KEY_TAB = 9,
        KEY_HOME = 36,
        KEY_END = 35,
        choosingClick = function(event) {

            event = createEvent(event);

            var el = $(event.target);

            // if (!el.hasClass("flexcomplete-line-common")) {
            //     el = el.parents("div.flexcomplete-line-common");
            // }

            var inst = el.data(pInstance);

            if (typeof inst !== 'undefined') {

                inst.onSelect(el.data(pData), inst.input.get(0));

                if (inst.isOpened()) {
                    inst.close();
                }
            }
        },
        mouseOver = function(event) {

            var el = $(event.target);

            el = el.is('.flexcomplete-line') ? el : el.find('.flexcomplete-line:first');

            el.addClass("active");
        },
        mouseOut = function(event) {

            var el = $(event.target);

            el = el.is('.flexcomplete-line') ? el : el.find('.flexcomplete-line:first');

            el.removeClass("active");
        },
        gainFocus = function(inst, event) {

            schedule(inst, createEvent(event));
        },
        looseFocus = function(inst, event) {

            if (inst.isOpened()) {
                if (inst._debug !== true) {
                    inst.close(createEvent(event));
                }
            }
        },
        isNavigation = function(e) {

            var k = e.ascii;
            return k === KEY_TO_UP || k === KEY_TO_DOWN || k === KEY_TO_LEFT ||
                k === KEY_TO_RIGHT || k === KEY_ENTER || k === KEY_PAGE_UP ||
                k === KEY_PAGE_DOWN || k === KEY_ESC || k === KEY_HOME || k === KEY_END;
        },
        drawChilds = function(inst, filteredDataArray) {

            inst.parentEl.empty();

            for (var i = 0; i < filteredDataArray.length; i++) {

                var data = filteredDataArray[i];
                var line = inst.getLine(data);
                var divLine = $("<li class='flexcomplete-line list-group-item'></li>").append(line);

                inst.children[i] = divLine //$("<div align='left' class='flexcomplete-line-common'></div>")
                    .data(pData, data)
                    .data(pInstance, inst)
                    .append(divLine)
                    .mousedown(choosingClick)
                    .mouseover(mouseOver)
                    .mouseout(mouseOut);

                inst.parentEl.append(inst.children[i]);
            }

            return inst;
        },
        drawFather = function(inst, filteredDataArray) {

            var position = inst.input.offset();
            var altura = inst.input.outerHeight();

            inst.children = [];
            inst.parentIndex = -1;

            if (typeof inst.parentEl !== 'undefined') {
                inst.parentEl.remove();
            }

            inst.parentEl = $('<div class="flexcomplete-parent list-group"></div>')
                .css({
                    display: 'none',
                    top: (position.top + altura) + 'px',
                    left: position.left + 'px',
                    width: inst.width + 'px'
                });

            $('body').append(inst.parentEl);

            if (filteredDataArray && filteredDataArray.length) {

                for (var i = 0, leni = filteredDataArray.length; i < leni; i++) {
                    inst.children.push(filteredDataArray[i]);
                }

                inst.parentEl.show();

                drawChilds(inst, filteredDataArray).open();

            } else {

                inst.parentEl.hide();
            }

            if (inst.children.length === 1 && inst.selectIfOneResult === true) {

                inst.onSelect(inst.children[0].data(pData), inst.input.get(0));

                if (inst.isOpened()) {
                    inst.close();
                }
            }
        },
        search = function(inst, event) {

            if (typeof inst.interval !== 'undefined') {
                clearInterval(inst.interval);
            }

            if (inst.scheduler.executed !== true) {

                if ($.trim(inst.input.val()).length === 0 || $.trim(inst.input.val()).length < inst.startIn) {

                    if (inst.isOpened()) {
                        inst.close();
                    }

                    return false;
                }

                var extraParamsTemp = {};
                extraParamsTemp[inst.queryVar] = inst.processInput(inst.input.val());

                if (typeof inst.extraParams === 'object') {

                    $.each(inst.extraParams, function(key, param) {
                        extraParamsTemp[key] = $.isFunction(param) ? param() : param;
                    });

                } else if (typeof inst.extraParams === 'function') {

                    $.each(inst.extraParams(), function(key, param) {
                        extraParamsTemp[key] = $.isFunction(param) ? param() : param;
                    });

                } else {
                    throw new Error("Extra params should be an object or a function");
                }

                if (inst.staticDataSearch === true) {

                    var arrData = inst.filter(inst.data, inst.input.get(0));

                    drawFather(inst, arrData);

                    inst.scheduler.executed = true;

                } else {

                    $.ajax({
                        type: inst.method,
                        dataType: 'json',
                        url: inst.url,
                        async: true,
                        data: extraParamsTemp,
                        success: function(data, status) {

                            drawFather(inst, data);

                            inst.scheduler.executed = true;
                        },
                        error: function(result) {
                            throw new Error(result);
                        }
                    });
                }
            }
        },
        navigate = function(inst, event) {

            var key = event.ascii;

            if (key === KEY_ESC) {
                inst.close();
                return;
            }

            var oldIx = inst.parentIndex;

            if (inst.children.length >= 1) {

                if (key === KEY_TO_UP || key === KEY_TO_DOWN || key === KEY_PAGE_UP || key === KEY_PAGE_DOWN) {

                    if (key === KEY_TO_UP) {

                        inst.parentIndex = (inst.parentIndex >= 1) ? inst.parentIndex - 1 : inst.children.length - 1;

                    } else if (key === KEY_TO_DOWN) {

                        inst.parentIndex = (inst.parentIndex < inst.children.length - 1) ? inst.parentIndex + 1 : 0;

                    } else if (key === KEY_PAGE_UP) {

                        inst.parentIndex = ((inst.parentIndex - inst.jump) >= 0) ? inst.parentIndex - inst.jump : 0;

                    } else if (key === KEY_PAGE_DOWN) {

                        inst.parentIndex = ((inst.parentIndex + inst.jump) < inst.children.length) ? inst.parentIndex + inst.jump : (inst.children.length - 1);
                    }

                    hover(inst, oldIx, inst.parentIndex);

                } else if (key === KEY_ENTER) {

                    if (inst.parentIndex >= 0) {
                        inst.onSelect(inst.children[inst.parentIndex].data(pData), inst.input.get(0));
                    }
                    if (inst.isOpened()) {
                        inst.close();
                    }

                    return;
                }
            }

            if (inst.autoReplacing === true && inst.parentIndex >= 0 && inst.children.length >= 1) {
                inst.input.val(inst.getInputValue(inst.children[inst.parentIndex].data(pData)));
            }

            inst.open();
        },
        forwardNavigation = function(inst, event) {

            event = createEvent(event);

            if (isNavigation(event) !== false) {
                navigate(inst, event);
            }
        },
        hover = function(inst, oldIx, newIx) {

            if (oldIx >= 0) {
                inst.children[oldIx]
                    .removeClass('active');
            }

            if (newIx >= 0) {
                inst.children[newIx]
                    .addClass('active');
            }
        },
        schedule = function(inst, event) {

            event = createEvent(event);

            if (isNavigation(event) !== false) {
                return;
            }

            if ($.trim(inst.input.val()).length === 0 || $.trim(inst.input.val()).length < inst.startIn) {

                if (inst.isOpened()) {
                    inst.close();
                }

                return;
            }

            var now = (new Date()).getTime();

            if (inst.scheduler && inst.scheduler.executed === true && inst.scheduler.timestamp + inst.delay < now) {

                inst.scheduler.executed = false;
                inst.scheduler.timestamp = now;

            } else {

                inst.scheduler = {
                    executed: false,
                    timestamp: now
                };
            }

            /** se for um evento de foco nao esperar tempo nenhum */
            if (event.type.toLowerCase() === "focus") {
                search(inst, event);
                return;
            }

            if (inst.interval) {
                clearInterval(inst.interval);
            }

            inst.interval = setInterval(function() {
                search(inst, event);
            }, inst.delay);
        },
        createEvent = function(event) {

            if (event.ascii) {
                return event;
            }

            event = $.event.fix(event || window.event);

            return {
                type: event.type,
                ascii: (event.keyCode ? event.keyCode : event.which),
                target: $(event.target).get(0)
            };
        };

    function Flexcomplete() {
        return this;
    }

    $.extend(Flexcomplete.prototype, {

        extend: function() {

            $.extend.apply(this, [].prototype.slice.call(arguments));
        },

        load: function(o) {

            var inst = this;

            o = $.extend({}, $.flexcomplete.options, o);

            for (var i in o) {
                this[i] = o[i] || null;
            }

            this._debug = false;
            this.staticDataSearch = typeof this.data !== 'undefined';

            if (!this.staticDataSearch && (!this.url || $.trim(this.url) === '')) {
                throw new Error("No database set. Please, set the offline data or an url");
            }

            this.width = typeof this.width !== 'undefined' && this.width !== null ? this.width : this.input.outerWidth();

            this.children = [];
            this.parentIndex = -1;

            if (typeof this.input.data(pInstance) === 'undefined') {
                this.input.data(pInstance, this);
            }

            this.input.attr('autocomplete', 'off');

            this.input
                .bind('keyup.Flexcomplete', function(e) {
                    schedule(inst, e);
                })
                .bind('keydown.Flexcomplete', function(e) {
                    forwardNavigation(inst, e);
                })
                .bind('focus.Flexcomplete', function(e) {
                    gainFocus(inst, e);
                })
                .bind('blur.Flexcomplete', function(e) {
                    looseFocus(inst, e);
                });

            return this;
        },

        select: function(obj) {

            this.onSelect(obj, this.input.get(0));
        },

        close: function(event) {

            if (typeof this.parentEl !== 'undefined') {
                this.parentEl.hide();
            }

            this.opened = false;
        },

        open: function() {

            this.opened = true;

            if (typeof this.parentEl !== 'undefined') {
                this.parentEl.show();
            }
        },

        isOpened: function() {

            return this.opened;
        },

        search: function() {

            return schedule(this, {
                type: 'keyup',
                target: this.input,
                ascii: KEY_DO_SEARCH
            });
        },

        staticData: function(d) {

            if (typeof d !== 'undefined') {
                this.data = d;
            }

            return this.data;
        },

        sdata: function(d) {
            return this.staticData(d);
        },

        debug: function(enable) {
            this._debug = enable;
        },

        unload: function() {

            this.close();
            this.input.unbind('keyup.Flexcomplete', schedule);
            this.input.unbind('keydown.Flexcomplete', forwardNavigation);
            this.input.unbind('focus.Flexcomplete', gainFocus);
            this.input.unbind('blur.Flexcomplete', looseFocus);

            if (typeof this.parentEl !== 'undefined') {
                this.parentEl.empty();
                this.parentEl.remove();
            }

            this.input.removeData(pInstance);
        }
    });

    $.fn.flexcomplete = function(options) {

        //this.reReplace = /([\]^\${}|!@#\*\-+()\'.\[\\])/g;

        var inst = $(this).data(pInstance),
            opt, flex;

        var args = Array.prototype.slice.call(arguments, 1);

        if (typeof options === 'string') {

            if (/open|close|search|select|unload|staticData|extend|sdata|debug/.test(options)) {

                return inst[options].apply(inst, args);

            } else {

                if (console) {
                    console.warn('No such ' + options + ' command found');
                }
            }
        } else {

            return this.each(function(i, item) {

                if (typeof $(this).data(pInstance) === 'undefined') {

                    if (typeof options === 'object') {

                        flex = new Flexcomplete();
                        opt = {};

                        $.each(options, function(i, item) {
                            opt[i] = item;
                        });
                        opt.input = $(this);

                        flex.load(opt);
                        $(this).data(pInstance, flex);
                    }
                }

                return this;
            });
        }
    };

    $.fn.unflexcomplete = function() {

        return this.each(function() {

            var instance = $(this).data(pInstance);

            if (typeof instance === 'object') {
                instance.unload();
            }

            return this;
        });
    };

    // Static method.
    $.flexcomplete = function(options) {
        // Override default options with passed-in options.
        options = $.extend({}, $.flexcomplete.options, options);
        // Return something awesome.
        return 'awesome' + options.punctuation;
    };

    // Static method default options.
    $.flexcomplete.options = {
        queryVar: "q",
        method: "GET",
        processInput: function(value) {
            return value;
        },
        onSelect: function(value, input) {
            input.value = value;
        },
        getLine: function(line) {
            return line;
        },
        getFullText: function(obj) {
            return obj;
        },
        getInputValue: function(value) {
            return value;
        },
        matches: function(value, userSearch, re) {

            if (typeof re === 'undefined') {
                re = new RegExp(userSearch.replace($.fn.flexcomplete.reReplace, ''), "i");
            }

            return re.test(value);
        },
        filter: function(arr, userSearch) {

            var inst = this;
            userSearch = userSearch.tagName === 'INPUT' ? $(userSearch).val() : userSearch;

            var re = new RegExp(userSearch.replace($.fn.flexcomplete.reReplace, ''), "i");

            return arr.filter(function(item) {
                return this.matches(item, userSearch, re);
            }, this);
        },
        delay: 100,
        jump: 6,
        startIn: 1,
        width: null,
        selectIfOneResult: false,
        staticDataSearch: false,
        extraParams: {},
        autoReplacing: false
    };

    // Custom selector.
    $.expr[':'].flexcomplete = function(elem) {
        // Is this element awesome?
        return $(elem).text().indexOf('awesome') !== -1;
    };

}(jQuery));