/****
MENU
****/

RequireScript("a.common.js");

App.Obj.Menu = function(cb, items){
	var _v = {
		"align":{"h":0.0,"v":0.0},
		"font":GetSystemFont(),
		"arrow":GetSystemArrow(),
		"mask":CreateColor(255,255,255,255),
		"selected":0,
		"sound":{
			"inc":null,
			"dec":null,
			"ok":null,
			"cancel":null
		},
		"isRunning":false
	};
	var _k = {
		"cancel":KEY_ESCAPE,
		"ok":KEY_ENTER,
		"inc":KEY_DOWN,
		"dec":KEY_UP
	};
	var _d = {
		"mode":"simple"
	};
	if (arguments.length>2) {
		for (var z in arguments[2]) _d[z] = arguments[2][z];
	}
	var _m = {
		"callback":cb&&typeof cb==='function'?cb:function(i){return i;},
		"items":items?items:[],
		"data":_d
	};
	var SW = App.Screen.width, SH = App.Screen.height;
	var _f = {};
	_f["play"] = function(s){
		if (s in _v.sound && _v.sound[s]) {
			if (_v.sound[s].isPlaying()) _v.sound[s].stop();
			_v.sound[s].play(false);
		}
	};
	_f["inc"] = function(){_f.play("inc"); _v.selected = (_v.selected+1)%_m.items.length;};
	_f["dec"] = function(){_f.play("dec"); _v.selected = (_m.items.length+_v.selected-1)%_m.items.length;};
	_f["sel"] = function(){_f.play("ok"); _v.isRunning = false;};
	_f["can"] = function(){_f.play("cancel"); _v.selected = -1; _v.isRunning = false;};
	_f["render"] = {
		"pre":function(){
			if ("bg" in _m.data) _m.data["bg"].blit(0,0);
			if ("logo" in _m.data) _m.data["logo"].blit((SW-_m.data.logo.width)*0.5,(SH*_v.align.v-_m.data.logo.height)*0.5);
		},
		"inter":function(w,h){
			var x = (_v.align.h*SW)|0,
				y = (_v.align.v*SH)|0,
				fh = _v.font.getHeight();
			var i = -1; while (++i<_m.items.length) {
				_v.font.drawText(x-_v.align.h*_v.font.getStringWidth(_m.items[i]),y+i*fh,_m.items[i]);
			}
			_v.arrow.blitMask(x-_v.align.h*_v.arrow.width,y+_v.selected*fh+(fh-_v.arrow.height)*0.5,_v.mask);
		},
		"post":function(){
			//_v.font.drawText(0,SH-12,_v.selected+" / "+_m.items.length);
		}
	};
	_f["update"] = function(){
		var k = App.Keys.next;
		if (k>-1) {
			switch (k) {
				case _k.inc: _f.inc(); break;
				case _k.dec: _f.dec(); break;
				case _k.cancel: _f.can(); break;
				case _k.ok: _f.sel(); break;
			}
		}
		App.Keys.clear();
		_v.mask.alpha = (255*(0.5+0.5*Math.cos((GetTime()%2000)*0.001*Math.PI)))|0;
	};
	var _o = {
		set font(v){_v.font = App.F.loadFont(v);},
		set arrow(v){_v.arrow = App.F.loadImage(v);},
		set select(v){_v.sound.ok = App.F.loadSound(v);},
		set cancel(v){_v.sound.cancel = App.F.loadSound(v);},
		set inc(v){_v.sound.inc = App.F.loadSound(v);},
		set dec(v){_v.sound.dec = App.F.loadSound(v);},
		set h(v){_v.align['h'] = Math.max(0.0,Math.min(1.0,v));},
		set v(v){_v.align['v'] = Math.max(0.0,Math.min(1.0,v));}
	};
	_o["run"] = _o["execute"] = function(){
		if (!_v.isRunning) {
			var mw = 0, mh = 0, i;
			_v.isRunning = true;
			if (_m.data.mode==='simple') {
				mh = _v.font.getHeight()*_m.items.length;
				i = _m.items.length; while (--i>-1) {
					if (_v.font.getStringWidth(_m.items[i])>mw) mw = _v.font.getStringWidth(_m.items[i]);
				}
				App.Keys.clear();
				while (_v.isRunning) {
					_f.render.pre();
					_f.render.inter(mw,mh);
					_f.render.post();
					FlipScreen();
					_f.update();
				}
				App.Keys.clear();
				_v.isRunning = false;
				if (_v.selected>-1) return _m.callback(_v.selected);
			}
			else throw new Error("NMenu - complex mode not yet supported");
		}
	};
	if ("inc" in _d) _o.inc = _d.inc;
	if ("dec" in _d) _o.dec = _d.dec;
	if ("select" in _d) _o.select = _d.select;
	if ("cancel" in _d) _o.cancel = _d.cancel;
	return _o;
};

/**** MENU CALLBACKS ****/
App.F.MainMenu = function(i) {
	var sc = App.Obj.NQueue();
	sc.preset("textArray",{
		"start":function(h,s,sk,x,y,f,m){
			s.name = "PRE::TEXTARRAY";
			s.skippable = sk>-1?sk:-1;
			s.done = false;
			s.msg = {"list":m, "i":0};
			s.len = (function(){var r=0,i=arguments.length;while(--i>-1)r+=arguments[i]['time'];return r;}).apply(null,m);
			s.o = {
				"x":x|0,
				"y":y|0,
				"w":(App.Screen.width-x)|0,
				"h":(App.Screen.height-y)|0
			};
			s.f = {};
			s.f["o"] = App.F.loadFont(f);
			s.f["x"] = 8;
			s.f["y"] = App.Screen.height-s.f.o.getHeight()-8;
			s.f["h"] = s.f.o.getHeight();
			s.color = {
				"shadow":CreateColor(255,255,255,96),
				"font":s.f.o.getColorMask()
			};
			s.time = GetTime();
			s.tmp = GetTime();
			s.now = GetTime();
		},
		"update":function(h,s){
			if (!s.done) {
				s.now = GetTime();
				if (s.now-s.time>s.len||s.msg.i>s.msg.list.length) s.done = true;
				else if (s.now-s.tmp>s.msg.list[s.msg.i].time) {++s.msg.i; s.tmp = GetTime();}
			}
			return !s.done;
		},
		"render":function(h,s){
			s.f.o.setColorMask(s.color.shadow);
			if ("speaker" in s.msg.list[s.msg.i]) s.f.o.drawText(s.o.x-8+1,s.o.y-s.f.h+1,s.msg.list[s.msg.i].speaker+":");
			s.f.o.drawTextBox(s.o.x+1,s.o.y+1,s.o.w,s.o.h,0,s.msg.list[s.msg.i].msg);//+" ("+(s.now-s.time)+"/"+s.len+"ms)");
			s.f.o.setColorMask(s.color.font);
			if ("speaker" in s.msg.list[s.msg.i]) s.f.o.drawText(s.o.x-8,s.o.y-s.f.h,s.msg.list[s.msg.i].speaker+":");
			s.f.o.drawTextBox(s.o.x,s.o.y,s.o.w,s.o.h,0,s.msg.list[s.msg.i].msg);//+" ("+(s.now-s.time)+"/"+s.len+"ms)");
			//s.f.o.drawText(0,0,(s.now-s.time)+" / "+s.len);
			if (s.skippable>-1) {
				s.f.o.setColorMask(s.color.shadow);
				s.f.o.drawText(
					s.f.x+1, s.f.y+1,
					"Press "+App.Keys.string(s.skippable,true)+" to skip"
				);
				s.f.o.setColorMask(s.color.font);
				s.f.o.drawText(
					s.f.x, s.f.y,
					"Press "+App.Keys.string(s.skippable,true)+" to skip"
				);
			}
		},
		"input":function(h,s){
			s.k = App.Keys.next; App.Keys.clear();
			if (s.skippable>-1) {if (s.k===s.skippable) s.done = true;}
		}
	});
	switch (i) {
		case 0:
			sc.enqueueFromPreset(
				"textArray",
				KEY_Q, 48, 180, "trigger.rfn",
				[
					{"msg":"\"START NEW GAME\" not yet implemented, but here's a one-on-one showdown!",'time':2000,'speaker':"NeoLogiX"},
				]
			);
			break;
		case 1:
			sc.enqueueFromPreset(
				"textArray",
				KEY_Q, 96, 180, "trigger.rfn",
				[
					{"msg":"\"OPTIONS MENU\" not yet implemented!",'time':5000,'speaker':"NeoLogiX"},
				]
			);
			break;
		case 2:
			sc.enqueueFromPreset(
				"textArray",
				KEY_Q, 96, 180, "trigger.rfn",
				[
					{"msg":"\"QUIT GAME\" not fully implemented!",'time':1000,'speaker':"NeoLogiX"},
				]
			);
			break;
		default: return i;
	}
	sc.run();
	return i;
};

App.F.OptionsMenu = function(i) {
	switch (i) {
		default: return i;
	}
	return i;
};

App.F.PauseMenu = function(i) {
	switch (i) {
		default: return i;
	}
	return i;
};

App.F.ChooseMenu = function(i) {
	switch (i) {
		default: return i;
	}
	return i;
};