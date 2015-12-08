/*
 * flexcomplete
 * https://github.com/thiago/flexcomplete
 *
 * Copyright (c) 2015 Thiago Andrade
 * Licensed under the MIT license.
 */

(function($) {

    'use strict';

    var PROP_INSTANCE_NAME = 'Flexcomplete.instance',
        PROP_DATA_NAME = 'Flexcomplete.data',
        _variables = {
            KEY_DO_SEARCH: 11111,
            KEY_ENTER: 13,
            KEY_TO_LEFT: 37,
            KEY_TO_RIGHT: 39,
            KEY_TO_UP: 38,
            KEY_TO_DOWN: 40,
            KEY_BACKSPACE: 8,
            KEY_INSERT: 45,
            KEY_DELETE: 46,
            KEY_SHIFT: 16,
            KEY_CTRL: 17,
            KEY_PAGE_UP: 33,
            KEY_PAGE_DOWN: 34,
            KEY_ESC: 27,
            KEY_TAB: 9,
            KEY_HOME: 36,
            KEY_END: 35,
            STOPPED: 0,
            RUNNABLE: 1
        };

    function createEvent(event) {

        if (event.ascii) {
            return event;
        }

        event = $.event.fix(event || window.event);

        return {
            type: event.type,
            ascii: (event.keyCode ? event.keyCode : event.which),
            target: $(event.target).get(0)
        };
    }

    function Flexcomplete() {
        return this;
    }

    $.extend(Flexcomplete.prototype, {

        extend: function(o) {

            $.extend(this, this, o);
        },

        load: function(o) {

            var inst = this;

            o = $.extend({}, $.flexcomplete.options, o);

            for (var i in o) {
                this[i[0] === '_' ? i : "_" + i] = o[i] || null;
            }

            this._staticDataSearch = typeof this._data !== 'undefined';

            if (!this._staticDataSearch && (!this._url || $.trim(this._url) === '')) {
                throw new Error("No database set. Please, set the offline data or an url");
            }

            this._width = typeof this._width !== 'undefined' && this._width !== null ? this._width : this._input.outerWidth();

            this._arrayFather = [];
            this._fatherIndex = -1;

            if (typeof this._input.data(PROP_INSTANCE_NAME) === 'undefined') {
                this._input.data(PROP_INSTANCE_NAME, this);
            }

            this._input
                .keyup(function(e) {
                    Flexcomplete.prototype._schedule.call(inst, e);
                })
                .keydown(function(e) {
                    Flexcomplete.prototype._forwardNavigation.call(inst, e);
                })
                .focus(function(e) {
                    Flexcomplete.prototype._gainFocus.call(inst, e);
                })
                .blur(function(e) {
                    Flexcomplete.prototype._looseFocus.call(inst, e);
                });

            this._onLoad();

            return this;
        },

        _forwardNavigation: function(event) {

            event = createEvent(event);

            if (this._isNavigation(event)) {
                this._navigate(event);
            }
        },

        _schedule: function(event) {

            var inst = this;

            event = createEvent(event);

            if (inst._isNavigation(event)) {
                return;
            }

            if ($.trim(inst._input.val()).length === 0 || $.trim(inst._input.val()).length < inst._startIn) {

                if (inst.isOpened()) {
                    inst.close();
                }

                return;
            }

            var now = (new Date()).getTime();

            if (inst._scheduler && inst._scheduler.executed === true && inst._scheduler.timestamp + inst._delay < now) {

                inst._scheduler.executed = false;
                inst._scheduler.timestamp = now;

            } else {

                inst._scheduler = {
                    executed: false,
                    timestamp: now
                };
            }

            /** se for um evento de foco nao esperar tempo nenhum */
            if (event.type.toLowerCase() === "focus") {
                inst._search.call(inst, event);
                return;
            }

            if (inst._interval) {
                clearInterval(inst._interval);
            }

            inst._interval = setInterval(function() {
                inst._search.call(inst, event);
            }, inst._delay);
        },

        _search: function(event) {

            var inst = this;

            clearInterval(inst._interval);

            if (inst._scheduler.executed === false) {

                if ($.trim(inst._input.val()).length === 0 || $.trim(inst._input.val()).length < inst._startIn) {

                    if (inst.isOpened()) {
                        inst.close();
                    }

                    return false;
                }

                if (inst.status === _variables.STOPPED) {
                    return false;
                }

                var extraParamsTemp = {};
                extraParamsTemp[inst._queryVar] = inst._processInput(inst._input.val());

                if ($.isPlainObject(inst._extraParams)) {

                    $.each(inst._extraParams, function(key, param) {
                        extraParamsTemp[key] = $.isFunction(param) ? param() : param;
                    });

                } else if ($.isFunction(inst._extraParams)) {

                    $.each(inst._extraParams(), function(key, param) {
                        extraParamsTemp[key] = $.isFunction(param) ? param() : param;
                    });
                }

                if (inst._staticDataSearch) {

                    var arrData = inst._filter(inst._data, inst._input.get(0));

                    inst._onFilter(arrData);

                    if (inst._showDefaultResults) {
                        inst._drawFather(arrData);
                    }

                    inst._scheduler.executed = true;

                } else {

                    $.ajax({
                        type: inst._method,
                        dataType: 'json',
                        url: inst._url,
                        async: true,
                        data: extraParamsTemp,
                        success: function(data, status) {

                            inst._onFilter(data);

                            if (inst._showDefaultResults) {
                                inst._drawFather(data);
                            }

                            inst._scheduler.executed = true;
                        },
                        error: function(result) {
                            throw new Error(result);
                        }
                    });
                }
            }
        },

        _drawFather: function(filteredData) {

            var inst = this;
            var position = inst._input.offset();
            var altura = inst._input.outerHeight();

            inst._arrayFather = [];
            inst._fatherIndex = -1;

            if (inst._father) {
                inst._father.remove();
            }

            inst._father = $('<div class="flexcomplete-father"></div>')
                .css({
                    visibility: 'hidden',
                    top: (position.top + altura) + 'px',
                    left: position.left + 'px',
                    width: inst._width + 'px'
                });

            $('body').append(inst._father);

            if (filteredData && filteredData.length) {

                for (var i = 0, leni = filteredData.length; i < leni; i++) {
                    inst._arrayFather.push(filteredData[i]);
                }

                inst._father.css({
                    visibility: "visible"
                });

            } else {
                inst._father.css({
                    visibility: "hidden"
                });
            }

            inst._drawChilds().open();

            if (inst._arrayFather.length === 1 && inst._selectIfOneResult === true) {

                inst._onSelect(inst._arrayFather[0].data(PROP_DATA_NAME), inst._input.get(0));

                if (inst.isOpened()) {
                    inst.close();
                }
            }
        },

        reMap: {},

        _matchText: function(re, inputValue) {

            var inst = this;

            if (!inputValue || $.trim(inputValue) === '') {
                return inst._getFullText(inputValue);
            }

            if (!inst.reMap[inputValue]) {
                inst.reMap[inputValue] = new RegExp("(" + inputValue.replace(/([\]^\${}|+().\[\\])/g, '\\$1') + ")", "ig");
            }

            return inst._getFullText(inputValue).replace(inst.reMap[inputValue], "<span class='flexcomplete-matched'>$1</span>");
        },

        _drawChilds: function() {

            var inst = this;
            inst._father.html('');

            for (var i = 0; i < inst._arrayFather.length; i++) {

                var obj = inst._arrayFather[i];

                var line = inst._getLine(obj);

                var divLine = $("<div class='flexcomplete-line'></div>").append(line);

                inst._arrayFather[i] = $("<div align='left' class='flexcomplete-line-common'></div>")
                    .data(PROP_DATA_NAME, obj)
                    .data(PROP_INSTANCE_NAME, inst)
                    .append(divLine)
                    .mousedown(inst.choosingClick)
                    .mouseover(inst.mouseOver)
                    .mouseout(inst.mouseOut);

                inst._father.append(inst._arrayFather[i]);
            }

            return inst;
        },

        _isNavigation: function(e) {

            var k = e.ascii,
                v = _variables;

            return k === v.KEY_TO_UP || k === v.KEY_TO_DOWN ||
                k === v.KEY_TO_LEFT || k === v.KEY_TO_RIGHT ||
                k === v.KEY_ENTER || k === v.KEY_PAGE_UP ||
                /*
                k === v.KEY_DELETE || k === v.KEY_BACKSPACE || 
                */
                k === v.KEY_PAGE_DOWN || k === v.KEY_ESC ||
                k === v.KEY_HOME || k === v.KEY_END;
        },

        _hover: function(oldIx, newIx) {

            var inst = this;

            if (oldIx >= 0) {
                inst._arrayFather[oldIx].find('.flexcomplete-line:first').removeClass('flexcomplete-line-hover');
            }

            if (newIx >= 0) {
                inst._arrayFather[newIx].find('.flexcomplete-line:first').addClass('flexcomplete-line-hover');
            }
        },

        _navigate: function(evt) {

            var inst = this;
            var key = evt.ascii;
            var v = _variables;

            if (key === v.KEY_ESC) {
                inst.close();
                return;
            }

            var oldIx = inst._fatherIndex;

            if (inst._arrayFather.length >= 1) {

                if (key === v.KEY_TO_UP || key === v.KEY_TO_DOWN || key === v.KEY_PAGE_UP || key === v.KEY_PAGE_DOWN) {

                    if (key === v.KEY_TO_UP) {

                        inst._fatherIndex = (inst._fatherIndex >= 1) ? inst._fatherIndex - 1 : inst._arrayFather.length - 1;

                    } else if (key === v.KEY_TO_DOWN) {

                        inst._fatherIndex = (inst._fatherIndex < inst._arrayFather.length - 1) ? inst._fatherIndex + 1 : 0;

                    } else if (key === v.KEY_PAGE_UP) {

                        inst._fatherIndex = ((inst._fatherIndex - inst._jump) >= 0) ? inst._fatherIndex - inst._jump : 0;

                    } else if (key === v.KEY_PAGE_DOWN) {

                        inst._fatherIndex = ((inst._fatherIndex + inst._jump) < inst._arrayFather.length) ? inst._fatherIndex + inst._jump : (inst._arrayFather.length - 1);
                    }

                    inst._hover(oldIx, inst._fatherIndex);

                } else if (key === v.KEY_ENTER) {

                    if (inst._fatherIndex >= 0) {
                        inst._onSelect(inst._arrayFather[inst._fatherIndex].data(PROP_DATA_NAME), inst._input.get(0));
                    }
                    if (inst.isOpened()) {
                        inst.close();
                    }

                    return;
                }
            }

            if (inst._autoReplacing === true && inst._fatherIndex >= 0 && inst._arrayFather.length >= 1) {
                inst._input.val(inst._getInputValue(inst._arrayFather[inst._fatherIndex].data(PROP_DATA_NAME)));
            }

            inst.open();
        },

        choosingClick: function(event) {

            event = createEvent(event);

            var el = $(event.target);

            if (!el.hasClass("flexcomplete-line-common")) {
                el = el.parents("div.flexcomplete-line-common");
            }

            var inst = el.data(PROP_INSTANCE_NAME);

            inst._onSelect(el.data(PROP_DATA_NAME), inst._input.get(0));

            if (inst.isOpened()) {
                inst.close();
            }
        },

        mouseOver: function(event) {

            var el = $(event.target);

            el = el.is('.flexcomplete-line') ? el : el.find('.flexcomplete-line:first');

            el.addClass("flexcomplete-line-hover");
        },

        mouseOut: function(event) {

            var el = $(event.target);

            el = el.is('.flexcomplete-line') ? el : el.find('.flexcomplete-line:first');

            el.removeClass("flexcomplete-line-hover");
        },

        _looseFocus: function(event) {

            if (this.isOpened()) {
                this.close(createEvent(event));
            }
        },

        _gainFocus: function(event) {

            this._schedule(createEvent(event));
        },

        setStatus: function(status) {

            if (status !== _variables.STOPPED && status !== _variables.RUNNABLE) {
                status = _variables.STOPPED;
            }

            this.status = status;
        },

        select: function(obj) {

            this._onSelect(obj, this._input.get(0));
        },

        close: function(event) {

            if (typeof this._father !== 'undefined') {
                this._father.css({
                    visibility: "hidden"
                }).remove();
            }

            this._arrayFather = [];
            this.opened = false;
            this._onClose();
        },

        open: function() {

            this.opened = true;
        },

        isOpened: function() {

            return this.opened;
        },

        search: function() {

            var inst = this;

            return inst._schedule({
                type: 'keyup',
                target: inst._input,
                ascii: _variables.KEY_DO_SEARCH
            });
        },

        staticData: function(d) {

            if (typeof d !== 'undefined') {
                this._data = d;
            }

            return this._data;
        },

        sdata: function(d) {
            return this.staticData(d);
        },

        unload: function() {

            var inst = this;

            try {

                inst.close();
                inst.setStatus(_variables.STOPPED);
                inst._input.unbind('keyup', inst._schedule);
                inst._input.unbind('keydown', inst._forwardNavigation);
                inst._input.unbind('focus', inst._gainFocus);
                inst._input.unbind('blur', inst._looseFocus);
                inst._father.remove();
                inst._input.removeData(PROP_INSTANCE_NAME);

            } catch (e) {}

            inst._onUnload();
        }
    });

    $.fn.flexcomplete = function(options) {

        //this.reReplace = /([\]^\${}|!@#\*\-+()\'.\[\\])/g;

        var inst = $(this).data(PROP_INSTANCE_NAME),
            opt, flex;

        var args = Array.prototype.slice.call(arguments, 1);

        if (typeof options === 'string') {

            if (options === 'close' || options === 'search' || options === 'select' || options === 'unload' || options === 'staticData' || options === 'sdata') {

                var v = inst[options].apply(inst, args);

                return v;

            } else if (options === 'extend') {

                args = args[0];
                opt = {};

                $.each(args, function(i, item) {
                    opt["_" + i] = item;
                });

                return inst[options].call(inst, opt);
            }
        } else {

            return this.each(function() {

                if (typeof $(this).data(PROP_INSTANCE_NAME) === 'undefined') {

                    if (typeof options === 'object') {

                        flex = new Flexcomplete();
                        opt = {};

                        $.each(options, function(i, item) {
                            opt["_" + i] = item;
                        });
                        opt._input = $(this);

                        flex.load(opt);
                        $(this).data(PROP_INSTANCE_NAME, flex);

                    }
                }

                return this;
            });
        }
    };

    $.fn.unflexcomplete = function() {

        return this.each(function() {

            if ($(this).data(PROP_INSTANCE_NAME)) {
                $(this).data(PROP_INSTANCE_NAME).unload();
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
        onFilter: function() {},
        onLoad: function() {},
        onUnload: function() {},
        onClose: function() {},
        getFullText: function(obj) {
            return obj;
        },
        getInputValue: function(value) {
            return value;
        },
        status: _variables.RUNNABLE,
        filter: function(line, input) {

            var re = new RegExp($(input).val().replace($.fn.flexcomplete.reReplace, ''), "i");

            return $(line).filter(function(i) {
                return re.test(line[i].replace($.fn.flexcomplete.reReplace, ''));
            });
        },
        delay: 300,
        jump: 6,
        startIn: 3,
        width: null,
        selectIfOneResult: false,
        showDefaultResults: true,
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