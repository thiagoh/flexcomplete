/*!
 * FlexComplete JavaScript Library v1.1.0
 * https://github.com/thiagoh/flexcomplete
 *
 * Copyright 2015, Thiago Andrade
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Requires jQuery 1.7+.js
 *
 * Date: Wed Apr 16 16:48:34 2014 -0300
 */
(function($) {

	'use strict';

	var PROP_INSTANCE_NAME = '_flexcomplete.instance',
		PROP_DATA_NAME = '_flexcomplete.data',
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
		},
		_flexcomplete = function _flexcomplete() {

			this._defaults = {

				_queryVar: "q",
				_method: "GET",
				_processInput: function(value) {
					return value;
				},
				_onSelect: function(value, input) {
					input.value = value;
				},
				_onFilter: function(data) {},
				_onLoad: function() {},
				_onUnload: function() {},
				_onClose: function() {},
				_getFullText: function(obj) {
					return obj;
				},
				_getInputValue: function(value) {
					return value;
				},
				_status: _variables.RUNNABLE,
				_delay: 300,
				_jump: 6,
				_startIn: 3,
				_width: null,
				_selectIfOneResult: false,
				_showDefaultResults: true,
				_staticDataSearch: false,
				_extraParams: {},
				_autoReplacing: false
			};

			return this;
		},

		createEvent = function(event) {

			if (event.ascii)
				return event;

			event = $.event.fix(event || window.event);

			return {
				type: event.type,
				ascii: (event.keyCode ? event.keyCode : event.which),
				target: $(event.target).get(0)
			};
		};

	$.extend(_flexcomplete.prototype, {

		extend: function(o) {

			$.extend(this, this, o);
		},

		load: function(o) {

			var inst = this;

			o = $.extend({}, this._defaults, o);

			this._input = o._input || null;
			this._showTooltip = o._showTooltip || false;
			this._processInput = o._processInput || null;
			this._getLine = o._getLine || null;
			this._getFullText = o._getFullText || null;
			this._onLoad = o._onLoad || null;
			this._onUnload = o._onUnload || null;
			this._onSelect = o._onSelect || null;
			this._onClose = o._onClose || null;
			this._getInputValue = o._getInputValue || null;
			this._filter = o._filter || null; //
			this._onFilter = o._onFilter || null;
			this._queryVar = o._queryVar || null;
			this._method = o._method || null;
			this._url = o._url || null;
			this._data = o._data || null;
			this._status = o._status || null;
			this._delay = o._delay || null;
			this._selectIfOneResult = o._selectIfOneResult || null;
			this._showDefaultResults = o._showDefaultResults || null;
			this._extraParams = o._extraParams || null;
			this._opened = o._opened || null;
			this._father = o._father || null;
			this._jump = o._jump || null;
			this._startIn = o._startIn || null;
			this._arrayFather = o._arrayFather || [];
			this._autoReplacing = o._autoReplacing || null;
			this._width = o._width || null;
			this._scheduler = o._scheduler || null;
			this._interval = o._interval || null;

			if (!this._getLine) {
				throw new Error("You must provide a getLine implementation");
			}

			this._staticDataSearch = typeof this._data !== 'undefined';

			if (!this._staticDataSearch && (!this._url || $.trim(this._url) === '')) {
				throw new Error("No database set");
			}

			this._width = typeof this._width !== 'undefined' && this._width !== null ? this._width : this._input.outerWidth();

			this._arrayFather = [];
			this._fatherIndex = -1;

			if (typeof this._input.data(PROP_INSTANCE_NAME) === 'undefined') {
				this._input.data(PROP_INSTANCE_NAME, this);
			}

			this._input
				.keyup(function(e) {
					_flexcomplete.prototype._schedule.call(inst, e);
				})
				.keydown(function(e) {
					_flexcomplete.prototype._forwardNavigation.call(inst, e);
				})
				.focus(function(e) {
					_flexcomplete.prototype._gainFocus.call(inst, e);
				})
				.blur(function(e) {
					_flexcomplete.prototype._looseFocus.call(inst, e);
				});

			this._onLoad();

			return this;
		},

		_forwardNavigation: function(event) {

			event = createEvent(event);

			if (this._isNavigation(event))
				this._navigate(event);
		},

		_schedule: function(event) {

			var inst = this;

			event = createEvent(event);

			if (inst._isNavigation(event))
				return;

			if ($.trim(inst._input.val()).length === 0 || $.trim(inst._input.val()).length < inst._startIn) {

				if (inst.isOpened())
					inst.close();

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

			/**	se for um evento de foco nao esperar tempo nenhum */
			if (event.type.toLowerCase() == "focus") {
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

					return;
				}

				if (inst.status == _variables.STOPPED)
					return false;

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

					if (inst._showDefaultResults)
						inst._drawFather(arrData);

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

			if (inst._father)
				inst._father.remove();

			inst._father = $('<div class="flexcomplete-father"></div>')
				.css({
					visibility: 'hidden',
					top: (position.top + altura) + 'px',
					left: position.left + 'px',
					width: inst._width + 'px'
				});

			$('body').append(inst._father);

			if (filteredData && filteredData.length) {

				for (var i = 0, leni = filteredData.length; i < leni; i++)
					inst._arrayFather.push(filteredData[i]);

				inst._father.css({
					visibility: "visible"
				});

			} else
				inst._father.css({
					visibility: "hidden"
				});

			inst._drawChilds().open();

			if (inst._arrayFather.length === 1 && inst._selectIfOneResult === true) {

				inst._onSelect(inst._arrayFather[0].data(PROP_DATA_NAME), inst._input.get(0));

				if (inst.isOpened())
					inst.close();
			}
		},

		reMap: {},

		_matchText: function(re, inputValue) {

			var inst = this;

			if (!inputValue || $.trim(inputValue) === '') {
				return inst._getFullText(obj);
			}

			if (!inst.reMap[inputValue]) {
				inst.reMap[inputValue] = new RegExp("(" + inputValue.replace(/([\]^\${}|+().\[\\])/g, '\\$1') + ")", "ig");
			}

			return inst._getFullText(obj).replace(inst.reMap[inputValue], "<span class='flexcomplete-matched'>$1</span>");
		},

		_drawChilds: function() {

			var inst = this;
			inst._father.html('');

			var val = inst._input.val();

			for (var i = 0; i < inst._arrayFather.length; i++) {

				var obj = inst._arrayFather[i];

				var line = inst._getLine(obj);

				var divLine = $("<div class='flexcomplete-line'></div>").append(line);

				if (inst._showTooltip && $.tooltip)
					divLine.attr('title', inst._getFullText(obj)).tooltip({
						showURL: false,
						delay: 80
					});

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

			return k == v.KEY_TO_UP || k === v.KEY_TO_DOWN ||
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

			if (oldIx >= 0)
				inst._arrayFather[oldIx].find('.flexcomplete-line:first').removeClass('flexcomplete-line-hover');

			if (newIx >= 0)
				inst._arrayFather[newIx].find('.flexcomplete-line:first').addClass('flexcomplete-line-hover');
		},

		_navigate: function(evt) {

			var inst = this;
			var key = evt.ascii;
			var v = _variables;

			if (key == v.KEY_ESC) {

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

					if (inst._fatherIndex >= 0)
						inst._onSelect(inst._arrayFather[inst._fatherIndex].data(PROP_DATA_NAME), inst._input.get(0));

					if (inst.isOpened())
						inst.close();

					return;
				}
			}

			if (inst._autoReplacing === true && inst._fatherIndex >= 0 && inst._arrayFather.length >= 1)
				inst._input.val(inst._getInputValue(inst._arrayFather[inst._fatherIndex].data(PROP_DATA_NAME)));

			inst.open();
		},

		choosingClick: function(event) {

			event = createEvent(event);

			var el = $(event.target);

			if (!el.hasClass("flexcomplete-line-common"))
				el = el.parents("div.flexcomplete-line-common");

			var inst = el.data(PROP_INSTANCE_NAME);

			inst._onSelect(el.data(PROP_DATA_NAME), inst._input.get(0));

			if (inst.isOpened())
				inst.close();
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

			if (this.isOpened())
				this.close(createEvent(event));
		},

		_gainFocus: function(event) {

			this._schedule(createEvent(event));
		},

		setStatus: function(status) {

			if (status != _variables.STOPPED && status != _variables.RUNNABLE)
				status = _variables.STOPPED;

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

			if (options === 'close' || options === 'search' || options === 'select' || options === 'unload' || options === 'staticData' || options == 'sdata') {

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

						flex = new _flexcomplete();
						opt = {};

						$.each(options, function(i, item) {
							opt["_" + i] = item;
						});
						opt._input = $(this);

						flex.load(opt);
						$(this).data(PROP_INSTANCE_NAME, flex);

						return this;
					}
				}
			});
		}
	};

	$.fn.unflexcomplete = function() {

		return this.each(function() {

			if ($(this).data(PROP_INSTANCE_NAME))
				$(this).data(PROP_INSTANCE_NAME).unload();

			return this;
		});
	};

}(jQuery));