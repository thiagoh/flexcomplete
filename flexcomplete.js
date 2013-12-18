(function($) {
	
	var PROP_NAME = 'jAutoComplete.instance';
	var DIV_CONTEUDO_NAME = 'jAutoComplete.instance.divConteudo';
	
	function jAutoComplete() {
		
		var inst = this;
		
		this._input = null;
		this._showTooltip = false;
		this._getFulltext = null;
		this._processInput = null;
		this._onLoad = null;
		this._onUnload = null;
		this._onSelect = null;
		this._onClose = null;
		this._processLine = null;
		this._posProcessLine = null;
		this._processLineRight = null;
		this._getInputValue = null;
		this._filter = null; //
		/*
		 *	Here is an example of how a _filter function should be
			_filter : 
				function(data, input) {
					input = jQuery(input);
					var re = new RegExp(input.val().replace($.fn.flexcomplete.reReplace, ''), "i");
					return jQuery(data).filter(function(i) {
							return re.test(data[i].replace($.fn.flexcomplete.reReplace, ''));
						}); 
				},
		*/
		this._onFilter = null;
		this._queryVar = null;
		this._method = null;
		this._url = null;
		this._data = null;
		this._staticDataSearch = null;
		this._status = null;
		this._delay = null;
		this._selectIfOneResult = null;
		this._showDefaultResults = null;
		this._extraParams = null;
		this._opened = null;
		this._father = null;
		this._jump = null;
		this._startIn = null;
		this._arrayFather = [];
		this._autoReplacing = null;
		this._width = null;
		this._scheduler = null;
		this._interval = null;
		
		this._defaults = {
			
			_queryVar : "q",
			_method : "GET",
			_getFulltext : 
				function() { return ''},  
			_processInput : 
				function(value) { return value },
			_onSelect : 
				function(value, input) { input.value = value; },
			_onFilter :
				function(data) {},
			_onLoad :
				function() {},
			_onUnload :
				function() {},
			_onClose :
				function() {},
			_processLine : 
				function(value) { return value },
			_posProcessLine : 
					function(elem, value) {  },
			_processLineRight : 
				function(value) { return ""},
			_getInputValue : 
				function(value) { return value },
			_status : $.fn.flexcomplete._variables.RUNNABLE,
			_delay : 600,
			_jump : 6,
			_startIn : 3,
			_width : null,
			_selectIfOneResult : false,
			_showDefaultResults : true,
			_staticDataSearch : false,
			_extraParams : {},
			_autoReplacing : false
		}
	};
	
	var createEvent = function(event) {

		if (event.ascii) 
			return event;
			
		event = arguments[0] = $.event.fix( event || window.event );
		
		return new jAutoCompleteEvent({
							type:event.type,
							ascii: (event.keyCode ? event.keyCode : event.which),
							target:$(event.target).get(0)
						});
	};
	
	var DivConteudo = function(map, classe) {

		this.classe = classe;
		this.map = map;
	};
	
	var jAutoCompleteEvent = function(map) {
		
		this.type = map.type;
		this.ascii = map.ascii;	
		this.target = map.target;	
	};
	
	$.extend(jAutoComplete.prototype, {
		
		extend : function(o) {
			
			$.extend(this, this, o);
		},
		
		load : function(o) {
		
			$.extend(this, this._defaults, o);
			
			var inst = this;
			
			var position = this._input.offset();
			var altura = this._input.outerHeight();
			
			inst._width = inst._width != null ? inst._width : inst._input.outerWidth();
			
			inst._arrayFather = [];
			inst._fatherIndex = -1;
			
			if (inst._input.data(PROP_NAME) == undefined )
				inst._input.data(PROP_NAME, this);
			
			inst._input
				.keyup(
					function(e) {
						$.jAutoComplete._schedule.apply(inst, [e]);
					})
				.keydown(
					function(e) {
						$.jAutoComplete._forwardNavigation.apply(inst, [e]);
					})
				.focus(
					function(e) {
						$.jAutoComplete._gainFocus.apply(inst, [e]);
					})
				.blur(
					function(e) {
						$.jAutoComplete._looseFocus.apply(inst, [e]);
					});
			
			inst._staticDataSearch = inst._data != null;
			
			if (!inst._staticDataSearch && (inst._url == null || $.trim(inst._url) == ''))
				throw new Error("No database set"); 
			
			inst._onLoad();
			
			return inst;
		},
		
		_forwardNavigation : function(event) {
			
			event = createEvent(event);
			
			if (this._isNavigation(event))
				this._navigate(event);
		},
		
		_schedule : function(event) {
			
			var inst = this;
			
			event = createEvent(event);
			
			if (inst._isNavigation(event))
				return;
		
			if ($.trim(inst._input.val()).length == 0 
				|| $.trim(inst._input.val()).length < inst._startIn) {
				
				if (inst.isOpened())
					inst.close();
				
				return;
			}

			var now = (new Date()).getTime();
			
			if (inst._scheduler && inst._scheduler.executed == true 
				&& inst._scheduler.timestamp + inst._delay < now) {
				
				inst._scheduler.executed = false;
				inst._scheduler.timestamp = now;
					
			} else{
							
				inst._scheduler = {
						executed : false,
						timestamp : now
					};
			}
			
			/**	se for um evento de foco nao esperar tempo nenhum */
			if (event.type.toLowerCase() == "focus") {
				inst._search.apply(inst, [event]);
				return;
			}
			
			if (inst._interval)
				clearInterval(inst._interval);
			
			inst._interval = setInterval( 
					function() { 
						inst._search.apply(inst, [event]); 
					}, 
					inst._delay
				);
		},
		
		_search : function(event) {
		
			var inst = this;
			
			clearInterval(inst._interval);
			
			if (inst._scheduler.executed == false) {
				
				if ($.trim(inst._input.val()).length == 0 
					|| $.trim(inst._input.val()).length < inst._startIn) {
					
					if (inst.isOpened())
						inst.close();
					
					return;
				}
				
				if (inst.status == $.fn.flexcomplete._variables.STOPPED)
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
							type		: inst._method,
							dataType	: 'json',
							url			: inst._url,
							async		: true,
							data		: extraParamsTemp,
							success 	: 
								function(data, status) { 
								
									inst._onFilter(data);
								
									if (inst._showDefaultResults)
										inst._drawFather(data); 
										
									inst._scheduler.executed = true;
								},
							error 		: 
								function(xmlHttpRequest) {
									throw new Error(xmlHttpRequest);
								}
						});
				}
			}
		},
		
		_drawFather : function(filteredData) {

			var inst = this;
			var position = inst._input.offset();
			var altura = inst._input.outerHeight();
			
			inst._arrayFather = [];
			inst._fatherIndex = -1;

			if (inst._father)
				inst._father.remove();
			
			inst._father = $('<div class="flexcomplete-father"></div>')
				.css({	visibility : 'hidden',
						top : (position.top + altura) + 'px',
						left : position.left + 'px',
						width: inst._width + 'px'});
			
			$('body').append(inst._father);
			
			if (filteredData && filteredData.length) {
				
				for(var i = 0, leni = filteredData.length; i < leni; i++)
					inst._arrayFather.push(new DivConteudo(filteredData[i], "flexcomplete-line"));
				
				inst._father.css({visibility : "visible"});
				
			} else 
				inst._father.css({visibility : "hidden"});
			
			inst._drawChilds().open();
			
			if (inst._arrayFather.length == 1 && inst._selectIfOneResult == true) {
				
				inst._onSelect(inst._arrayFather[0].data(DIV_CONTEUDO_NAME).map, inst._input.get(0));
				
				if (inst.isOpened())
					inst.close();
			}
		},
		
		_drawChilds : function() {
			
			var inst = this;
			inst._father.html('');
			
			var val = inst._input.val();
			
			var re = new RegExp("(" + val.replace(/([\]^\${}|+().\[\\])/g, '\\$1') + ")", "ig");
			
			for(var i = 0; i < inst._arrayFather.length; i++) {
			
				var map = inst._arrayFather[i].map;
			
				var l1 = $("<div class='flexcomplete-line-left'>" + inst._processLine(map, val).replace(re, "<span class='flexcomplete-filtro'>$1</span>") + "</div>");
				
				inst._posProcessLine(l1, map, val);
				
				var l2 = $("<div class='flexcomplete-line-right'>" + inst._processLineRight(map, val) + "</div>");
				
				if (inst._showTooltip && $.tooltip) 
					l1.attr('title', inst._getFulltext(map, val)).tooltip({showURL: false, delay : 80});
				
				inst._arrayFather[i] = $("<div align='left' class='flexcomplete-line-common "+ inst._arrayFather[i].classe +"'></div>")
					.data(DIV_CONTEUDO_NAME, inst._arrayFather[i])
					.data(PROP_NAME, inst)
					.append(l1)
					.append(l2)
					.append("<br style='clear:both;'/>")
					.mousedown(inst.choosingClick)
					.mouseover(inst.mouseOver)
					.mouseout(inst.mouseOut);
					
				inst._father.append(inst._arrayFather[i]);
			}
			
			return inst;
		},
		
		_isNavigation : function(e) {
			
			var k = e.ascii, v = $.fn.flexcomplete._variables;

			return k == v.KEY_TO_UP		||	k == v.KEY_TO_DOWN	||
					k == v.KEY_TO_LEFT	||	k == v.KEY_TO_RIGHT	||
					k == v.KEY_ENTER		||	k == v.KEY_PAGE_UP	||
					/* k == v.KEY_DELETE		||	k == v.KEY_BACKSPACE || 	*/
					k == v.KEY_PAGE_DOWN	||	k == v.KEY_ESC		||
					k == v.KEY_HOME		||	k == v.KEY_END;
		},
		
		_navigate : function(evt) {
	
			var inst = this;
			var key = evt.ascii;
			var v = $.fn.flexcomplete._variables;
			
			if (inst._arrayFather.length >= 1) {
		
				if (key == v.KEY_TO_UP) {
					
					if (inst._fatherIndex >= 1)
						inst._fatherIndex--;
					else
						inst._fatherIndex = inst._arrayFather.length-1;
					
					inst._father.children('div.flexcomplete-line-hover').removeClass('flexcomplete-line-hover');

					inst._arrayFather[inst._fatherIndex].addClass('flexcomplete-line-hover');
					
				} else if (key == v.KEY_TO_DOWN) { 
		
					if (inst._fatherIndex < inst._arrayFather.length - 1)
						inst._fatherIndex++;
					else
						inst._fatherIndex = 0;
		
					inst._father.children('div.flexcomplete-line-hover').removeClass('flexcomplete-line-hover');

					inst._arrayFather[inst._fatherIndex].addClass('flexcomplete-line-hover');
		
				} else if (key == v.KEY_PAGE_UP) {
					
					if ((inst._fatherIndex - inst._jump) >= 0)
						inst._fatherIndex = inst._fatherIndex - inst._jump;
					else
						inst._fatherIndex = 0;
					
					inst._father.children('div.flexcomplete-line-hover').removeClass('flexcomplete-line-hover');

					inst._arrayFather[inst._fatherIndex].addClass('flexcomplete-line-hover');
					
				} else if (key == v.KEY_PAGE_DOWN) {
		
					if ((inst._fatherIndex + inst._jump) < inst._arrayFather.length)
						inst._fatherIndex = inst._fatherIndex + inst._jump;
					else
						inst._fatherIndex = (inst._arrayFather.length-1);
						
					inst._father.children('div.flexcomplete-line-hover').removeClass('flexcomplete-line-hover');

					inst._arrayFather[inst._fatherIndex].addClass('flexcomplete-line-hover');
		
				} else if (key == v.KEY_ENTER) { 
		
					if (inst._fatherIndex >= 0)
						inst._onSelect(inst._arrayFather[inst._fatherIndex].data(DIV_CONTEUDO_NAME).map, inst._input.get(0)); 
					
					if (inst.isOpened())
						inst.close();
					
					return;
					
				}
			}
			
			if (key == v.KEY_ESC) {  
				
				inst.close();
				return;
			}
			
			if (inst._autoReplacing == true && inst._fatherIndex >= 0 && inst._arrayFather.length >= 1)
				inst._input.val(inst._getInputValue(inst._arrayFather[inst._fatherIndex].data(DIV_CONTEUDO_NAME).map));
		
			inst.open();
		},
		
		choosingClick : function(event) {
			
			event = createEvent(event);
			
			var el = $(event.target);
			
			if (!el.hasClass("flexcomplete-line-common"))
				el = el.parents("div.flexcomplete-line-common");
			
			var inst = el.data(PROP_NAME);
		
			inst._onSelect(el.data(DIV_CONTEUDO_NAME).map, inst._input.get(0));
			
			if (inst.isOpened())
				inst.close();
		},
		
		mouseOver : function(event) {
		
			var el = $(createEvent(event).target);
			
			if (!el.hasClass("flexcomplete-line-common"))
				el = el.parents("div.flexcomplete-line-common:first");
		
			el.removeClass("flexcomplete-line").addClass("flexcomplete-line-hover");
		},
		
		mouseOut : function(event) {
		
			var el = $(createEvent(event).target);
			
			if (!el.hasClass("flexcomplete-line-common"))
				el = el.parents("div.flexcomplete-line-common:first");
		
			el.removeClass("flexcomplete-line-hover").addClass("flexcomplete-line");
		},
		
		_looseFocus : function(event) {
			
			if (this.isOpened())
				this.close(createEvent(event));
		},
		
		_gainFocus : function(event) {
		
			this._schedule(createEvent(event));
		},
		
		data : function(d) {
			
			if (d) this._data = d;				

			return this._data;
		},
		
		setStatus : function(status) {
		
			if (status != $.fn.flexcomplete._variables.STOPPED 
				&& status != $.fn.flexcomplete._variables.RUNNABLE)
				status = $.fn.flexcomplete._variables.STOPPED;
				
			this.status = status;
		},
		
		select : function(obj) {
			
			this._onSelect(obj, this._input.get(0));
		},
		
		close : function(event) {
			if(this._father!=null)
			this._father.css({visibility : "hidden"}).remove();
			this._arrayFather = [];
			this.opened = false;
			this._onClose();
		},
		
		open : function() {
		
			this.opened = true;
		},
		
		isOpened : function() {
		
			return this.opened;
		},
		
		search : function() {
			
			var inst = this;
			
			return inst._schedule(new jAutoCompleteEvent({
									type : 'keyup',
									target : inst._input,
									ascii : $.fn.flexcomplete._variables.KEY_DO_SEARCH
							}));
		},
		
		unload : function() {
			
			var inst = this;
			
			try {
				
				inst.close();
				inst.setStatus($.fn.flexcomplete._variables.STOPPED);
				inst._input.unbind('keyup', inst._schedule);
				inst._input.unbind('keydown', inst._forwardNavigation);
				inst._input.unbind('focus', inst._gainFocus);
				inst._input.unbind('blur', inst._looseFocus);
				inst._father.remove();
				inst._input.removeData(PROP_NAME);
				
			} catch(e) {}
			
			inst._onUnload();
		}
	});		
	
	$.fn.flexcomplete = function(options) {
		
		if ( $.isFunction(this.each) ) {
		
			var inst = $(this).data(PROP_NAME);
			
			if (typeof options == 'string' && inst != undefined) {
				
				var otherArgs = Array.prototype.slice.call(arguments, 1);
				
				if (options == 'close' || options == 'search' || options == 'select' || options == 'unload') {
					
					return $.jAutoComplete[options].apply($(this).data(PROP_NAME), otherArgs);
					
				} else if (options == 'extend') {
					
					otherArgs = otherArgs[0];
					
					var opt = {};
										
					$.each(otherArgs, function(i, item) {
						opt["_" + i] = item; 
					});					
					
					return $.jAutoComplete[options].apply($(this).data(PROP_NAME), [opt]);
				}
			} 
					
			return this.each(function() {
				
				if ( $(this).data(PROP_NAME) == undefined ) {
				
					var inst = new jAutoComplete();
					
					inst._input = $(this);
					
					var opt = {};
										
					$.each(options, function(i, item) {
						opt["_" + i] = item; 
					});					
					
					inst.load(opt);
					
					$(this).data(PROP_NAME, inst);
				}
				
				return this;
			});
		}
	};
	
	$.fn.unflexcomplete = function() {
		
		if ( $.isFunction(this.each) ) {
		
			return this.each(function() {
			
				if ($(this).data(PROP_NAME)) 
					$(this).data(PROP_NAME).unload();
					
				return this;
			});
		}
	};
	
	$.fn.flexcomplete.reReplace = /([\]^\${}|!@#\*\-+()\'.\[\\])/g;
			
	$.fn.flexcomplete._variables = {
			KEY_DO_SEARCH : 11111,
			KEY_ENTER : 13,
			KEY_TO_LEFT : 37,
			KEY_TO_RIGHT : 39,
			KEY_TO_UP : 38,
			KEY_TO_DOWN : 40,
			KEY_BACKSPACE : 8,
			KEY_INSERT : 45,
			KEY_DELETE : 46,
			KEY_SHIFT : 16,
			KEY_CTRL : 17,
			KEY_PAGE_UP : 33,
			KEY_PAGE_DOWN : 34,
			KEY_ESC : 27,
			KEY_TAB: 9,
			KEY_HOME: 36,
			KEY_END: 35,
			STOPPED : 0,
			RUNNABLE : 1
	};
	
	$.jAutoComplete = new jAutoComplete();
	
})(jQuery);