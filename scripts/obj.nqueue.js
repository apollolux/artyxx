/****
APP::NQUEUE
A modified version of the Scenario cutscene system by Bruce
by NeoLogiX
****/

RequireScript("a.common.js");

App.Obj.NQueue = function() {
	var _v = {
		"nextId":1,
		"inputThread":0,
		"isRunning":false,
		"mask":App.Color.XBlack,
		"time":-1,
		"now":0
	};
	function _State(o) {
		if (!(this instanceof _State)) return new _State(o);
		this.prototype = o;
		for (var p in o) this[p] = o[p];
		//this.commandThread = o.commandThread?o.commandThread|0:0;
		//this.queue = o.queue?o.queue:[];
		//this.threads = o.threads?o.threads:[];
		//this.context = o.context?o.context:null;
		this.toString = function(){return "[Object State]";}
	}
	function _Action(o) {
		if (!(this instanceof _Action)) return new _Action(o);
		this.state = new _State("state" in o?o.state:{});	// Object
		this.argv = "argv" in o?o.argv:[];	// Array
		this.start = "start" in o?o.start:null;	// Function(host, state, ...) start
		this.update = "update" in o?o.update:null;	// Function(host, state) update
		this.render = "render" in o?o.render:null;	// Function(host, state) render
		this.input = "input" in o?o.input:null;	// Function(host, state) handleInput
	}
	function _Thread(o) {
		if (!(this instanceof _Thread)) return new _Thread(o);
		this.id = _v.nextId;
		this.state = new _State("state" in o?o.state:{});
		this.priority = "priority" in o?o.priority|0:0;
		this.updater = "updater" in o?o.updater:null;	// Function(host, state)
		this.renderer = "renderer" in o?o.renderer:null;	// Function(host, state)
		this.inputer = "inputer" in o?o.inputer:null;	// Function(host, state)
		if (!this) throw new Error("NQueue - couldn't create thread");
		else ++_v.nextId;
	}
	var _font = App.F.loadFont("galaxy.rfn");
	var _err = "";
	var _t = [], _tList = [], _q = [], _qList = [], _tInp = [];
	var _f = {};
	_f["enqueue"] = function(o){_q.push(new _Action(o));};
	_f["cmp"] = function(a,b){if(a.priority<b.priority)return -1;else if(a.priority>b.priority)return 1;else return 0;};
	_f["sort"] = function(){_t.sort(_f.cmp);};
	_f["has"] = function(i){
		if (i<1) return false;
		else {
			var t = -1; while (++t<_t.length) {if (i===_t[t].id) return true;}
			return false;
		}
	};
	_f["kill"] = function(i){
		var t = -1; while (++t<_t.length) {
			if (i===_t[t].id) {
				_t.splice(i,1);
				--i;
			}
		}
	};
	_f["render"] = function(){
		var t = -1; while (++t<_t.length) {
			if (_t[t].renderer!==null&&typeof _t[t].renderer==='function') {
				_t[t].renderer(_o, _t[t].state);
			}
		}
		if (App.Flag.debug&1) {
			_font.drawTextBox(6,6,304,200,0,_err);
		}
		//throw new Error(msg);
	};
	_f["update"] = function(){
		_err = "";
		var id, t = -1; while (++t<_t.length) {
			id = _t[t].id;
			_err += "\nT["+id+
				("name" in _t[t].state?":"+_t[t].state.name:"")+"]"+
				("threads" in _t[t].state?":has "+_t[t].state.threads.length:"")+
				("queue" in _t[t].state?":q="+_t[t].state.queue.length:"");
			if (_t[t].renderer===null||typeof _t[t].renderer!=='function') _err += ":no renderer";
			if (_t[t].updater!==null&&typeof _t[t].updater==='function') {
				if (!_t[t].updater(_o, _t[t].state)) {
					if (_v.inputThread===id) _v.inputThread = _tInp.pop();
					_t.splice(t,1);
					--t; continue;
				}
				else if (_v.inputThread===id) _t[t].inputer(_o, _t[t].state);
			}
			else _err += ":no updater";
		}
		_err = "#T="+_t.length+
			", #Qs[G]="+_qList.length+
			", Q[G][now]="+_q.length+
			"\n"+_err;
	};
	_f["create"] = function(o){
		var t = new _Thread(o);
		//if (!("name" in t.state)) Abort(t.state.toSource());
		if (t) {
			_t.push(t); _f.sort();
			if (t.inputer) {_tInp.push(_v.inputThread);_v.inputThread=t.id;}
			return t.id;
		}
		else return 0;
	};
	function _updateTimeline(host, state) {
		var i = -1; while (++i<state.threads.length) {
			if (!_f.has(state.threads[i].id)) {
				state.threads.splice(i,1);
				--i; continue;
			}
		}
		if (_f.has(state.commandThread)) return true;
		if (state.queue.length===0&&state.threads.length) return false;
		if (state.queue.length>0) {
			var act = state.queue.shift();
			if (act.start!==null&&typeof act.start==='function') {
				var args = [host, act.state];
				i = -1; while (++i<act.argv.length) args.push(act.argv[i]);
				act.start.apply(act, args);
			}
			if (act.update!==null||typeof act.update==='function') {
				var delUpd = App.F.delegate(act, act.update);
				var delRen = App.F.delegate(act, act.render);
				var delInp = App.F.delegate(act, act.input);
				state.commandThread = _f.create({
					"state":act.state,
					"updater":delUpd,
					"renderer":delRen,
					"inputer":delInp,
					"priority":0
				});
			}
			else return true;
		}
		return true;
	}
	var _preset = {};
	//throw new Error("updateTimeline - ALL YOUR BASE ARE BELONG TO US");
	//else throw new Error("updateTimeline - YOU HAVE NO CHANCE TO SURVIVE");
	var _o = {
		get empty(){return _q.length===0;},
		"fork":{
			"begin":function(){
				_tList.push(_t);
				_t = [];
				_qList.push(_q);
				_q = [];
			},
			"end":function(){
				// TODO: enqueue adding current queue as a thread
				var q = _q, ql = _qList, th = _t;
				_t = _tList.pop(); var tl = _t;
				var act = new _Action({
					"state":{},
					"argv":[tl,th,q],
					"start":function(h,s,t,st,qu){
						var fork = new _State({
							"context":h,
							"queue":qu,
							"commandThread":0,
							"threads":st
						});
						_f.create({
							"state":fork,
							"updater":_updateTimeline,
							"priority":-1
						});
					}
				});
				_q = _qList.pop();
				_f.enqueue(act);
			}
		},
		"preset":function(n,o){
			if (n in _preset) throw new Error("NQueue::preset - preset "+n+" is already in use.");
			else {
				_preset[n] = function() {
					var _a = {
						"state":{},
						"argv":arguments,
						"start":o.start,
						"update":o.update,
						"render":o.render,
						"input":o.input
					};
					_f.enqueue(new _Action(_a));
				};
			}
		},
		"loadPreset":function(f){
			var o;
			try {o = eval(App.F.readFile(f));}
			catch(e) {throw e;}
			if (o) this.preset(o.name, o.data);
			else throw new Error("NQueue::loadPreset - couldn't load preset from file "+f);
		},
		"enqueue":function(o){
			_f.enqueue(new _Action(o));
		},
		"enqueueFromPreset":function(){
			var n = arguments[0], ref = this;
			var args = []; var i = 0; while (++i<arguments.length) args.push(arguments[i]);
			_preset[n].apply(ref,args);
		},
		"synchronize":function(){
			_f.enqueue({
				"state":{},
				"argv":[_t],
				"start":function(h,s,t){s.threads = t;},
				"update":function(h,s){return s.threads.length>0;}
			});
		},
		"render":function(){
			if (IsMapEngineRunning()) RenderMap();
			_f.render();
			if (App.Flag.debug) {
				var _fx = 12, _fy = App.Screen.height-24, c = CreateColor(255,255,255,128);
				var t = (_v.now-_v.time);
				_font.setColorMask(c);
				_font.drawText(_fx+1,_fy+1,"Press Q to exit");
				if (App.Flag.debug&1) _font.drawText(201,_fy+1,((t/1000)|0)+" s");
				_font.setColorMask(App.Color.White);
				_font.drawText(_fx,_fy,"Press Q to exit");
				if (App.Flag.debug&1) _font.drawText(200,_fy,((t/1000)|0)+" s");
			}
		},
		"update":function(){
			if (IsMapEngineRunning()) UpdateMapEngine();
			_f.update();
			_v.now = GetTime();
		},
		"run":function(){
			if (!_v.isRunning) {
				var _bck = [
					_t,
					_tList,
					_q,
					_qList,
					_tInp
				];
				_v.time = GetTime();
				//this.synchronize();
				// TODO: enqueue attach camera
				// TODO: enqueue fade mask to xblack
				this.fork.begin();
					this.enqueue({
						"argv":[App.Color.XBlack,0],
						"start":function(h,s,c,d){
							if (d===null) d = 250; else d = d|0;
							s.color = {
								"to":c,
								"from":_v.mask,
								"diff":{
									"red":c.red-_v.mask.red,
									"green":c.green-_v.mask.green,
									"blue":c.blue-_v.mask.blue,
									"alpha":c.alpha-_v.mask.alpha
								},
								"now":CreateColor(_v.mask.red,_v.mask.green,_v.mask.blue,_v.mask.alpha)
							};
							s.duration = d;
							s.time = GetTime(); s.now = GetTime();
							if (s.duration<=0) _v.mask = c;
						},
						"update":function(h,s){
							s.now = GetTime();
							if (s.duration>0&&(s.now-s.time)<s.duration) {
								var tmp = (s.now-s.time)/s.duration;
								s.color.now.red = (s.color.from.red+s.diff.red*tmp)|0;
								s.color.now.green = (s.color.from.green+s.diff.green*tmp)|0;
								s.color.now.blue = (s.color.from.blue+s.diff.blue*tmp)|0;
								s.color.now.alpha = (s.color.from.alpha+s.diff.alpha*tmp)|0;
							}
							else _v.mask = s.color.now = s.color.to;
							return (s.now-s.time<s.duration)||
								s.color.now.red!=_v.mask.red||
								s.color.now.green!=_v.mask.green||
								s.color.now.blue!=_v.mask.blue||
								s.color.now.alpha!=_v.mask.alpha;
						}
					});
				this.fork.end();
				// TODO: set frame rate
				// TODO: detach input
				var st = new _State({
					"commandThread":0,
					"queue":_q,
					"threads":_t,
					"name":"PARENT"
				});
				_v.isRunning = true;
				var tFade = _f.create({	// fade renderer thread
					"state":{"name":"MASK"},
					"renderer":function(h,s){ApplyColorMask(_v.mask);},
					"priority":-1
				});
				var th = _f.create({	// timeline updater thread
					"state":st,
					"updater":_updateTimeline,
					"priority":-1
				});
				App.Keys.clear();
				while (_f.has(th)) {
					this.render();
					FlipScreen();
					this.update();
					if (App.Flag.debug) {
						if (App.Keys.get(KEY_Q)!==-1) break;
					}
				}
				App.Keys.clear();
				// TODO: restore frame rate
				// TODO: restore input
				_f.kill(tFade);	// kill fade renderer thread
				_v.isRunning = false;
				//throw new Error("updateTimeline - WHAT YOU SAY");
				/* DOES NOT WORK
				// RESTORE FOR LATER USE
				_t = _bck[0];
				_tList = _bck[1];
				_q = _bck[2];
				_qList = _bck[3];
				_tInp = _bck[4];
				*/
			}
		}
	};
	/**** SHARED PRESETS ****/
	/*_o.preset("wait",{
		"start":function(h,s,dur){
			s.name = "PRE::wait";
			s.skippable = false;
			s.end = GetTime()+(dur!==null?dur|0:2000);
		},
		"update":function(h,s){return GetTime()<s.end;}
	});*/	
	return _o;
};