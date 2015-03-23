/****
COMMON
****/
RequireScript("json2.js");

Array.prototype.find = function(f, value) {
	var i = this.length; while (--i>-1) {if (f(this[i])===value) return i;}
	return -1;
};


var App = (function(){
	var _col = {
		"White":CreateColor(255,255,255,255),
		"Black":CreateColor(0,0,0,255),
		"XBlack":CreateColor(0,0,0,0),
		"XWhite":CreateColor(255,255,255,0),
		"Cyan":CreateColor(0,255,255,255),
		"Magenta":CreateColor(255,0,255,255),
		"Red":CreateColor(255,0,0,255),
		"Orange":CreateColor(255,192,0,255),
		"Yellow":CreateColor(255,255,0,255),
		"Green":CreateColor(0,255,0,255),
		"Blue":CreateColor(0,0,255,255)
	};
	var _f = {}, _fl = {"debug":0,"updatePersonList":1}, _is = {};
	var _k = {
		'm':GetPlayerKey(PLAYER_1,PLAYER_KEY_MENU),
		'u':GetPlayerKey(PLAYER_1,PLAYER_KEY_UP),
		'd':GetPlayerKey(PLAYER_1,PLAYER_KEY_DOWN),
		'l':GetPlayerKey(PLAYER_1,PLAYER_KEY_LEFT),
		'r':GetPlayerKey(PLAYER_1,PLAYER_KEY_RIGHT),
		'a':GetPlayerKey(PLAYER_1,PLAYER_KEY_A),
		'b':GetPlayerKey(PLAYER_1,PLAYER_KEY_B),
		'x':GetPlayerKey(PLAYER_1,PLAYER_KEY_X),
		'y':GetPlayerKey(PLAYER_1,PLAYER_KEY_Y)
	};
	//Abort(GetKeyString(_k['a'],false));
	var _img = {}, _fon = {}, _snd = {}, _spr = {};
	var _pl = [];	// person list
	//// IS JS TYPE?
	_is["object"] = function(o){return (o!==null&&typeof o==='object');};
	_is["null"] = function(o){return (o===null);};
	_is["undefined"] = function(o){return (typeof o==='undefined');};
	_is["function"] = function(o){return (typeof o==='function');};
	_is["array"] = function(o){return (typeof o==='array');};
	_is["string"] = function(o){return (typeof o==='string');};
	_is["number"] = function(o){return (typeof o==='number');};
	_is["boolean"] = function(o){return (typeof o==='boolean');};
	_is["regexp"] = function(o){return (o instanceof RegExp);};
	_is["int"] = function(o){return (o|0)===o;};
	_is["inty"] = function(o){return (o|0)==o;};
	//// IS SPHERE TYPE?
	_is["image"] = function(o){return _is['object'](o)&&o.toString()==='[object image]';};
	_is["surface"] = function(o){return _is['object'](o)&&o.toString()==='[object surface]';};
	_is["font"] = function(o){return _is['object'](o)&&o.toString()==='[object font]';};
	_is["sound"] = function(o){return _is['object'](o)&&o.toString()==='[object sound]';};
	_is["spriteset"] = function(o){return _is['object'](o)&&o.toString()==='[object spriteset]';};
	_is["windowstyle"] = function(o){return _is['object'](o)&&o.toString()==='[object windowstyle]';};
	_is["base"] = function(o){return _is['object'](o)&&o.toString()==='[object base]';};
	_is["socket"] = function(o){return _is['object'](o)&&o.toString()==='[object socket]';};
	_is["bytearray"] = function(o){return _is['object'](o)&&o.toString()==='[object byte_array]';};
	_is["rawfile"] = function(o){return _is['object'](o)&&o.toString()==='[object rawfile]';};
	_is["file"] = function(o){return _is['object'](o)&&o.toString()==='[object file]';};
	//// PROC
	_f["keyString"] = function(k,s){
		var r = GetKeyString(k,s!==undefined?s:false);
		if (!r) switch (k) {
			case KEY_UP: r = "[U]"; break;
			case KEY_DOWN: r = "[D]"; break;
			case KEY_LEFT: r = "[L]"; break;
			case KEY_RIGHT: r = "[R]"; break;
			case KEY_ESCAPE: r = "[ESC]"; break;
			case KEY_F1: r = "[F1]"; break;
			case KEY_F2: r = "[F2]"; break;
			case KEY_F3: r = "[F3]"; break;
			case KEY_F4: r = "[F4]"; break;
			case KEY_F5: r = "[F5]"; break;
			case KEY_F6: r = "[F6]"; break;
			case KEY_F7: r = "[F7]"; break;
			case KEY_F8: r = "[F8]"; break;
			case KEY_F9: r = "[F9]"; break;
			case KEY_F10: r = "[F10]"; break;
			case KEY_F11: r = "[F11]"; break;
			case KEY_F12: r = "[F12]"; break;
			case KEY_BACKSPACE: r = "[BKSP]"; break;
			case KEY_TAB: r = "[TAB]"; break;
			case KEY_INSERT: r = "[INS]"; break;
			case KEY_DELETE: r = "[DEL]"; break;
			case KEY_HOME: r = "[HOME]"; break;
			case KEY_END: r = "[END]"; break;
			case KEY_PAGEUP: r = "[PGUP]"; break;
			case KEY_PAGEDOWN: r = "[PGDN]"; break;
			default: break;
		}
		return r;
	};
	_f["blendToSurface"] = function(img, color, mode){
		var c = CreateSurface(img.width, img.height, color);
		c.setBlendMode(mode || BLEND);
		c.blitSurface(img.toString()==='[object image]'?img.createSurface():img, 0, 0);
		return c;
	};
	_f["fileExists"] = function(p){};
	_f["readFile"] = function(p){
		var ba, f = OpenRawFile(p);
		try {ba = f.read(f.getSize());}
		finally {f.close();}
		return CreateStringFromByteArray(ba);
	};
	_f["readJSON"] = function(p){
		var o = null, f;
		try {f = OpenRawFile(p);}
		catch(e) {throw e;}
		try {o = JSON.parse(CreateStringFromByteArray(f.read(f.getSize())));}
		catch(e) {throw e;}
		finally {f.close();}
		return o;
	};
	_f["screen"] = function(){return GrabImage(0,0,GetScreenWidth(),GetScreenHeight());};
	_f["preBlend"] = function(img){ return this.blendToSurface(img,_col.Black); };
	_f["delegate"] = function(o,m){if(typeof m==='function')return function(){return m.apply(o,arguments);};else return null;};
	_f["loadImage"] = function(f){if(!f)throw new Error("loadImage - invalid filename");else if (typeof f!=='string')throw new Error("loadImage - invalid filename");else if(!(f in _img))_img[f]=f==='ARROW'?GetSystemArrow():LoadImage(f);return _img[f];};
	_f["loadFont"] = function(f){if(!f)throw new Error("loadFont - invalid filename");else if (typeof f!=='string')throw new Error("loadFont - invalid filename");else if(!(f in _fon))_fon[f]=f==='SYSTEM'?GetSystemFont():LoadFont(f);return _fon[f];};
	_f["loadSound"] = function(f){if(!f)throw new Error("loadSound - invalid filename");else if (typeof f!=='string')throw new Error("loadSound - invalid filename");else if(!(f in _snd))_snd[f]=LoadSound(f,false);return _snd[f];};
	_f["loadSpriteset"] = function(f){if(!f)throw new Error("loadSpriteset - invalid filename");else if (typeof f!=='string')throw new Error("loadSpriteset - invalid filename");else if(!(f in _spr))_spr[f]=LoadSpriteset(f);return _spr[f];};
	//// PROC::MAP
	_f["personExists"] = function(p){
		if (typeof DoesPersonExist==='function') return DoesPersonExist(p);
		if (App.Flag.updatePersonList) {
			_pl = GetPersonList();
			App.Flag.updatePersonList = 0;
		}
		var r=false, i=_pl.length;
		if (i>0) {
			while (--i>-1) if (_pl[i]===p) r = true;
		}
		return r;
	};
	_f["enter"] = function(){
		App.Common.Time.start = GetTime();
		var __cm,__pn='artyxx',__pl=GetPersonLayer(__pn),__bl=GetPersonLayer("barrier-h_0");
		if (IsMapEngineRunning()) {
			if (__pl!==__bl) {SetPersonLayer(__pn, __bl); __pl = __bl;}
			__cm = GetCurrentMap();
			App.Common.Entities[__pn].x = MapToScreenX(__pl,GetPersonX(__pn));
			App.Common.Entities[__pn].y = MapToScreenY(__pl,GetPersonY(__pn));
			App.F.layerRenderer(__cm);
			App.Common.Camera = {
				"x":0,
				"y":GetLayerHeight(0)*GetTileHeight()
			};
		}
		App.Common.Time.last = GetTime();
		App.Common.Time.now = GetTime();
		BindKey(KEY_P, "", "var __ss=GrabSurface(0,0,App.Screen.width,App.Screen.height);if(__ss.save('screenshot-'+(++App.Common.ssIndex)+'.png'))App.Common.msgQ.push({msg:'screenshot-'+App.Common.ssIndex+'.png saved',time:333});");
		SetUpdateScript("App.F.update();");
		SetRenderScript("App.F.render();");
	};
	_f["processTriggers"] = function(){
		if (App.Common.triggerQ.length>0)
			(App.Common.triggerQ.shift())();
	};
	_f["processCamera"] = function(th){
		var SH = App.Screen.height;
		if (App.Common.Camera.y>0) {
			App.Common.Camera.y -= th;
			if (App.Common.Camera.y<SH) {
				if (!('gyrexx' in App.Common.Entities)) {
					App.Common.triggerQ.push(function(){
						App.Common.Entities['gyrexx'] = App.Obj.Entity({
							"name":"gyrexx",
							"death":function(){
								App.Common.msgQ.push({msg:this.name+" dead!",time:166});
							},
							"damage":function(){
								if (this.health.shield>0) this.sp = this.health.shield-1;
								else if (this.health.points>0) this.hp = this.health.points-1;
								App.Common.msgQ.push({msg:this.name+" hit! "+this.health.points+"+"+this.health.shield,time:166});
								if (this.dead) {
									this.death();
								}
							},
							"move":function(x,y,z){
								var t = (App.Common.Time.now-App.Common.Time.start)/1000;
								var q = Math.sin(Math.PI*t/4), m = (Math.cos(Math.PI*t/2)+1)*0.5;
								this.x = 136+q*80;
								this.y = 24+m*40;
							}
						});
						(function(en){
							en.spriteset = "gyrexx.rss";
							en.direction = "south";
							en.spriteset.loop = true;
							en.spriteset.offset = 1;
							en.hp = 9;
							en.sp = 10;
							en.x = 136; en.y = 24;
							en.addTarget('artyxx');
							en.addEmitterFromPreset("../scripts/npart/emitter.vulcan.json");
							en.emitters[0].offset = 1;
							en.emitters[0].vy = 160;
							en.emitters[0].life = [750,500];
							en.emitters[0].c = App.Color.Red;
							en.emitters[0].limit = 5;
							//en.emitters[0].rot = -Math.PI;
						})(App.Common.Entities['gyrexx']);
						//App.Common.Entities['artyxx'].addTarget('gyrexx');
						App.Common.msgQ.push({msg:"Gyrexx approaches!"/*+" Emitter "+App.Common.Entities['gyrexx'].emitters[0].name*/,time:1000});
					});
				}
				else {
					(function(en){
						//App.Common.msgQ.push({msg:"GY:"+en.mapY,time:16});
						en.x += 0;
						en.y += 0;
						SetPersonX(en.name,en.mapX);
						SetPersonY(en.name,en.mapY);
						en.emitters[0].x = en.x; en.emitters[0].y = en.y+24;
						//en.weapon.isActive = ['action'];
						en.update(['all']);	//update(['all']);
					})(App.Common.Entities['gyrexx']);
					if (App.Common.Camera.y<0.5*SH) {
						if (App.Common.Flags.waitingForGyrexx){
							if (++App.Common.Flags.waitingForGyrexx===5) {
								App.Common.msgQ.push({msg:"It's not doing anything?",time:500});
								App.Common.Flags.waitingForGyrexx = 0;
							}
						}
					}
				}
			}
			else if (App.Common.Camera.y<1.25*SH) {
				if (App.Common.Flags.waitingForGyrexx<4) {
					App.Common.msgQ.push({msg:"I'm safe...",time:500});
					++App.Common.Flags.waitingForGyrexx;
				}
			}
			else if (App.Common.Camera.y<1.5*SH) {
				if (App.Common.Flags.waitingForGyrexx<3) {
					App.Common.msgQ.push({msg:"I think...",time:500});
					++App.Common.Flags.waitingForGyrexx;
				}
			}
			else if (App.Common.Camera.y<2*SH) {
				if (App.Common.Flags.waitingForGyrexx<2) {
					App.Common.msgQ.push({msg:"Like, TOO quiet.",time:1000});
					++App.Common.Flags.waitingForGyrexx;
				}
				else if (!App.Common.Flags.instructions) {
					App.Common.msgQ.push({msg:"Press "+App.F.keyString(_k['a'])+" to fire.",time:1000});
					App.Common.Flags.instructions = 1;
				};
			}
			else if (App.Common.Camera.y<3*SH) {
				if (!App.Common.Flags.waitingForGyrexx) {
					App.Common.msgQ.push({msg:"It seems awfully quiet around here...",time:2000});
					App.Common.Flags.waitingForGyrexx = 1;
				}
			}
		}
		else {
			App.Common.Camera.y = 0;
			(function(en){
				//App.Common.msgQ.push({msg:"GY:"+en.mapY,time:16});
				en.x += 0;
				en.y += 0;
				SetPersonX(en.name,en.mapX);
				SetPersonY(en.name,en.mapY);
				en.emitters[0].x = en.x; en.emitters[0].y = en.y+24;
				var sp = []; if('artyxx' in App.Common.Entities) sp.push('action');
				en.weapon.isActive = sp;
				en.update(['all']);
			})(App.Common.Entities['gyrexx']);
		}
	};
	_f["exitToMain"] = function(){
		if (IsMapEngineRunning()) ExitMapEngine();
	};
	_f["processEntities"] = function(){
		function _exit() {
			// TODO - queue some fade-to-black timeline
			var _qexit = App.Obj.NQueue();
			//_qexit.loadPreset("../scripts/nqueue/nqpre.wait.js");
			//_qexit.enqueueFromPreset("wait",5000);
			_qexit.enqueue({
				"argv":[5000,App.Color.Black],
				"start":function(h,s,dur,c){
					s.name = "FADE::COLOR";
					s.skippable = -1;
					s.duration = dur!==null?dur|0:1000;
					s.done = false;
					s.color = c?CreateColor(c.red,c.green,c.blue,0):CreateColor(0,0,0,0);
					s.easing = function(t){return t;};
					s.time = GetTime();
					s.tmp = GetTime();
					s.now = GetTime();
				},
				"update":function(h,s){
					if (!s.done) {
						s.tmp = (s.now-s.time)/s.duration;
						if (s.tmp<1) s.color.alpha = (255*s.easing(s.tmp))|0;
						else {s.done = true; s.color.alpha = 255;}
						s.now = GetTime();
					}
					return !s.done;
				},
				"render":function(h,s){ApplyColorMask(s.color);}
			});
			_qexit.enqueue({
				"argv":[App.F.exitToMain],
				"start":function(h,s,f){f();}
			});
			_qexit.run();
			//App.F.exitToMain();
		}
		function _die(en) {
			return function(){
				(function(n){
					if (n.exists) DestroyPerson(n.name);
					n.weapon.isActive = [];
					var i = n.emitters.length; while (--i>-1) {
						while (n.emitters[i].children.length) n.emitters[i].update(['all'],[]);
					}
				})(App.Common.Entities[en]);
				delete App.Common.Entities[en];
			};
		}
		for (var p in App.Common.Entities) {
			if (App.Common.Entities[p].dead) {
				App.Common.triggerQ.push(_die(p));
				if (p==='gyrexx') {
					App.Common.msgQ.push({msg:"Gyrexx defeated!",time:2000});
					App.Common.triggerQ.push(_exit);
				}
				else if (p==='artyxx') {
					App.Common.msgQ.push({msg:"You are defeated!",time:1000});
					App.Common.triggerQ.push(_exit);
				}
			}
			//else App.Common.Entities[p].update();
		}
	};
	_f["update"] = function(){
		App.Common.Time.last = App.Common.Time.now;
		App.Common.Time.now = GetTime();
		var __cm,__th,__al,__y1,__y2,__p='artyxx';
		if (IsMapEngineRunning()) {
			__cm = GetCurrentMap(); __th = GetTileHeight()*(App.Common.Time.now-App.Common.Time.last)/1000;
			SetCameraX(App.Common.Camera.x);
			SetCameraY(App.Common.Camera.y);
			__al = App.F.personExists(__p)?GetPersonLayer(__p):0;
			__y1 = ScreenToMapY(__al,App.Screen.height);
			__y2 = ScreenToMapY(__al,0);
			var n=13;while(--n>-1){
				SetPersonY("barrier-h_"+(n+13),__y2);
				SetPersonY("barrier-h_"+(n+0),__y1);
			}
			App.Common.Scrolls[__cm].bg.offset += __th;
			App.F.processCamera(__th);
		}
		App.F.pollInput(__p);
		App.F.processEntities();
		App.F.processTriggers();
	};
	_f["render"] = function(){
		var fh = App.Common.font.getHeight(), SW = App.Screen.width, SH = App.Screen.height, __cm, __pn = 'artyxx'; if (__pn in App.Common.Entities&&App.Common.Entities[__pn]) {
			(function(en){
				en.render();
				App.Common.font.drawText(240-fh,fh+fh+fh+4,"Shield");
				var i = en.health.points; while (--i>-1)
					App.Common.Icon.hp.blit(240+i*fh,fh+fh+fh+fh+4);
				//App.Common.font.drawText(240,fh+fh+fh+fh+4,en.health.points);
				if (App.Flag.debug&4) App.Common.font.drawText(
					128,16,
						en.x+','+en.y+':'+
						GetPersonLayer(en.name)+','+
						GetPersonDirection(en.name)
				);
				/*var _pmsg = "", em = en.emitters, ep;
				var _ip, _ie = em.length; while (--_ie>-1) {
					ep = em[_ie].children; _ip = ep.length; while (--_ip>-1) {
						//
					}
				}*/
			})(App.Common.Entities[__pn]);
		}
		if (App.Common.msgQ.length>0) {
			if (!App.Common.lastMsg) {App.Common.lastMsg = App.Common.msgQ.shift(); App.Common.lastMsg.start = App.Common.Time.now;}
		}
		if (App.Common.lastMsg) {
			App.Common.font.drawTextBox(8,128,SW-8,96,0,App.Common.lastMsg.msg);
			if ((App.Common.Time.now-App.Common.lastMsg.start)>App.Common.lastMsg.time) App.Common.lastMsg = null;
		}
		//App.Common.font.drawText(128,24,SH+":"+ScreenToMapY(1,SH));
		//App.Common.font.drawText(128,24,GetPersonList().length);
		App.Common.font.drawText(240-fh,fh,"Score");
			App.Common.font.drawText(240,fh+fh,App.Common.score);
		if (IsMapEngineRunning()) {
			App.Common.font.drawText(fh,SH-fh-4,GetCameraX()+","+GetCameraY());
			__cm = GetCurrentMap(); if (__cm in App.Common.Scrolls&&App.Common.Scrolls[__cm].bg) {
				App.Common.font.drawText(240-fh,SH-fh-4,App.Common.Scrolls[__cm].name);
				if (App.Flag.debug&4) App.Common.font.drawText(
					128,32,
						(App.Common.Scrolls[__cm].bg.offset|0)+
						(App.Common.Scrolls[__cm].bg.offset>App.Common.Scrolls[__cm].bg.height?
							'!'+App.Common.Scrolls[__cm].bg.height:
							'/'+App.Common.Scrolls[__cm].bg.height
						)
				);
			}
		}
	};
	_f["blitScroll"] = function(m){
		if (m in App.Common.Scrolls) {
			(function(scr){
				if (!scr.bg.offset) scr.bg.offset = 0;
				if (!scr.bg.wallpaper) scr.bg.wallpaper = false;
				var SH = App.Screen.height, by = SH-scr.bg.height;
				var oy = (scr.bg.offset|0)%scr.bg.height;
				scr.bg.blit(16,by+oy);
				if (scr.bg.wallpaper) {
					scr.bg.blit(16-scr.bg.width,by+oy);
					scr.bg.blit(16+scr.bg.width,by+oy);
				}
				if (by+oy>0) {
					scr.bg.blit(16,by+oy-scr.bg.height);
					if (scr.bg.wallpaper) {
						scr.bg.blit(16-scr.bg.width,by+oy-scr.bg.height);
						scr.bg.blit(16+scr.bg.width,by+oy-scr.bg.height);
					}
				}
			})(App.Common.Scrolls[m]);
		}
	};
	_f["layerRenderer"] = function(m){
		if (m in App.Common.Scrolls) {
			SetLayerRenderer(0,'App.Common.bg.blit(0,0);App.F.blitScroll("'+m+'");');
		}
	};
	_f["pollInput"] = function(ent){if(ent in App.Common.Entities&&App.Common.Entities[ent]){
		try {(function(en){
			if (_f.personExists(en.name)){
				// poll direction
				var d = "", dx = 0, dy = 0;
				if (IsKeyPressed(_k['d'])) {
					++dy;
				}
				if (IsKeyPressed(_k['u'])) {
					--dy;
				}
				if (IsKeyPressed(_k['r'])) {
					++dx;
				}
				if (IsKeyPressed(_k['l'])) {
					--dx;
				}
				if (dy!==0) en.y += dy;//(en.y+dy<App.Screen.height?dy:0);
				if (dy>0) d += "south"; else d += "north";
				if (dx!==0) en.x += dx;
				if (dx>0) d += "east"; else if (dx<0) d += "west";
				en.direction = d.length>0?d:"north";
				SetPersonX(en.name,en.mapX);
				SetPersonY(en.name,en.mapY);
				// poll action
				var sp = [];
				if (IsKeyPressed(_k['a'])) {
					sp.push("action");
				}
				en.weapon.isActive = sp;
				en.update();
			}
		})(App.Common.Entities[ent]); } catch(e) {
			Abort("Couldn't poll input '"+ent+"' - "+e.message);
		}
	}};
	return {
		"Obj":{},
		"Sph":{},
		"Color":_col,
		"F":_f,
		"Is":_is,
		"Flag":_fl,
		"Keyset":{
			get down(){return _k['d'];},
			get up(){return _k['u'];},
			get right(){return _k['r'];},
			get left(){return _k['l'];},
			get action(){return _k['a'];},
			get cancel(){return _k['b'];},
			get missile(){return _k['x'];},
			get bomb(){return _k['y'];},
			get menu(){return _k['m'];}
		},
		"Common":{},
		get FPS(){var v=GetFrameRate();if(v<1)v=60;return 1/60;},
		get Screen(){return {get width(){return GetScreenWidth();},get height(){return GetScreenHeight();}};}
	};
})();

App.Obj.Position = function(x,y){
	var _ = {
		x:x*1.0,
		y:y*1.0,
		z:arguments.length>2?arguments[2]*1.0:0.0
	};
	//if (!(this instanceof App.Obj.Position)) return new App.Obj.Position(_.x,_.y,_.z);
	var _o = {
		get x(){return _.x;},
		set x(v){_.x=v*1.0;},
		get y(){return _.y;},
		set y(v){_.y=v*1.0;},
		get z(){return _.z;},
		set z(v){_.z=v*1.0;},
		at:function(){return {"x":_.x,"y":_.y,"z":_.z};}
	};
	//Abort("{"+_o.x+","+_o.y+","+_o.z+"}");
	return _o;
};


App.Keys = (function(){
	var _kq = [];
	var _k = {
		get queued(){return AreKeysLeft();},
		get next(){return AreKeysLeft()?GetKey():-1;},
		"string":function(k,s){return GetKeyString(k,s);}
	};
	_k["clear"] = function(){_kq=[];while(_k.queued)_kq.push(_k.next);};
	_k["poll"] = function(k){var r=-1;while(_k.queued){if(_k.next===k)r=k;}return r;};
	return _k;
})();

App.Sph.Sprite = function(){
	var _d = {
		"data":null,
		"dir":-1,
		"i":0,
		"loop":false,
		"base":false
	};
	var _t = {
		"start":-2,
		"last":-1,
		"now":0
	};
	var _f = {
		get dir(){var r=null;if(_d.data&&_d.dir>-1&&_d.dir<_d.data.directions.length)r=_d.data.directions[_d.dir];return r;},
		get fr(){var r=null,d=this.dir;if(d&&_d.i>-1&&_d.i<d.frames.length)r=d.frames[_d.i];return r;},
		get delay(){var r=-1,f=this.fr;if(f)r=f.delay;return r;},
		get img(){var r=null,f=this.fr;if(f&&f.index>-1&&f.index<_d.data.images.length)r=_d.data.images[f.index];return r;},
		get canUpdate(){return _d.loop||(_d.i>-1&&_d.i<_d.data.directions[_d.dir].frames.length-1);},
		get frameElapsed(){return(_t.now-_t.last)>(1000*this.delay*App.FPS);}
	};
	_f["direction"] = function(n){
		var ret = -1, i;
		if (_d.data) {
			i = _d.data.directions.length; while (--i>-1) {if (_d.data.directions[i].name===n) return i;}
		}
		return ret;
	};
	_f["frame"] = function(i){
		var ret = null;
		if (_d.data&&_d.dir>-1) {
			if (i>=0&&i<_d.data.directions[_d.dir].frames.length) {
				var f = _d.data.directions[_d.dir].frames[i];
				ret = _d.data.images[f.index];
				if (ret) ret.delay = f.delay;
			}
			else throw new RangeError("Spriteset::_frame -  frame "+v+" out of range in direction "+_d.dir);
		}
		return ret;
	};
	_f["animate"] = function(){if(_t.start<0)_t.start=_t.last=GetTime();_t.now=GetTime();};
	_f["update"] = function(){
		_f.animate();
		if (_f.canUpdate&&_f.frameElapsed) {
			_d.i = (_d.i+1)%_f.dir.frames.length;
			_t.last = GetTime();
		}
	};
	_f["render"] = function(x,y){
		var img = _f.img,
			c = arguments.length>2?arguments[2]:CreateColor(255,255,255,255),
			r = arguments.length>3?arguments[3]:0;
		if (img) {
			var dx = x-_d.base*(_d.data.base.x1+0.5*(_d.data.base.x2-_d.data.base.x1)),
				dy = y-_d.base*(_d.data.base.y1+0.5*(_d.data.base.y2-_d.data.base.y1));
			if (dx+img.width<0||dx-img.width>App.Screen.width||
				dy+img.height<0||dy-img.height>App.Screen.height) ;
			else if (r) img.rotateBlitMask(dx,dy,r,c);
			else img.blitMask(dx,dy,c);
		}
		else throw new Error ("Spriteset::_render - no spriteset data");
	};
	var _o = {
		get data(){return _d.data;},
		set loop(v){_d.loop=v?true:false;},
		set offset(v){_d.base=v?1:0;},
		get offset(){return _d.base;},
		set frame(v){
			if (_d.data&&_d.dir>-1) {
				if (v>=0&&v<_d.data.directions[_d.dir].frames.length) _d.i = v|0;
				else throw new RangeError("Spriteset::frame - frame "+v+" out of range in direction "+_d.dir);
			}
			else throw new Error("Spriteset::frame - invalid data");
		},
		get direction(){return _d.data.directions[_d.dir].name;},
		set direction(v){
			if (_d.data) {
				if (App.Is.inty(v)) {
					if (v>=0&&v<_d.data.directions.length) {_d.dir = v|0; this.frame = 0;}
					else throw new RangeError("Spriteset::direction - direction "+v+" out of range");
				}
				else {
					v = _f.direction(v);
					if (v>-1) {_d.dir = v; this.frame = 0;}
					else throw new RangeError("Spriteset::direction - direction "+v+" doesn't exist");
				}
			}
			else throw new Error("Spriteset::direction - invalid data");
		},
		set data(v){_d.data = App.F.loadSpriteset(v); if (_d.data) this.direction = 0; else throw new Error("Spriteset - invalid data");},
		"animate":function(){_f.update();},
		"blit":function(x,y){_f.render(x,y);},
		"blitMask":function(x,y,c){_f.render(x,y,c);},
		"rotateBlitMask":function(x,y,c,r){_f.render(x,y,c,r);}
	};
	return _o;
};

App.Easing = (function(){
	var _ease = {};
	_ease["linear"] = {
		"easeNone":function(k){return k;}
	};
	_ease["quadratic"] = {
		"easeIn":function(k){return k*k;},
		"easeOut":function(k){return -k*(k-2);},
		"easeInOut":function(k){if((k*=2)<1)return 0.5*k*k;else return -0.5*(--k*(k-2)-1);}
	};
	_ease["cubic"] = {
		"easeIn":function(k){return k*k*k;},
		"easeOut":function(k){return --k*k*k+1;},
		"easeInOut":function(k){if((k*=2)<1)return 0.5*k*k*k;else return 0.5*((k-=2)*k*k+2);}
	};
	_ease["quartic"] = {
		/*"easeIn":function(k){},
		"easeOut":function(k){},
		"easeInOut":function(k){}*/
	};
	_ease["quintic"] = {
		/*"easeIn":function(k){},
		"easeOut":function(k){},
		"easeInOut":function(k){}*/
	};
	_ease["sinus"] = {
		/*"easeIn":function(k){},
		"easeOut":function(k){},
		"easeInOut":function(k){}*/
	};
	_ease["exp"] = {
		/*"easeIn":function(k){},
		"easeOut":function(k){},
		"easeInOut":function(k){}*/
	};
	_ease["circ"] = {
		/*"easeIn":function(k){},
		"easeOut":function(k){},
		"easeInOut":function(k){}*/
	};
	_ease["elastic"] = {
		"easeIn":function(k){
			var s, a = 0.1, p = 0.4;
			if ( k == 0 ) return 0; if ( k == 1 ) return 1; if ( !p ) p = 0.3;
			if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p / ( 2 * Math.PI ) * Math.asin( 1 / a );
			return - ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
		},
		"easeOut":function(k){
			var s, a = 0.1, p = 0.4;
			if ( k == 0 ) return 0; if ( k == 1 ) return 1; if ( !p ) p = 0.3;
			if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p / ( 2 * Math.PI ) * Math.asin( 1 / a );
			return ( a * Math.pow( 2, - 10 * k) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) + 1 );
		},
		"easeInOut":function(k){
			var s, a = 0.1, p = 0.4;
			if ( k == 0 ) return 0; if ( k == 1 ) return 1; if ( !p ) p = 0.3;
			if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p / ( 2 * Math.PI ) * Math.asin( 1 / a );
			if ( ( k *= 2 ) < 1 ) return - 0.5 * ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
			return a * Math.pow( 2, -10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) * 0.5 + 1;
		}
	};
	_ease["back"] = {
		"easeIn":function(k){var s=1.70158;return k*k*((s+1)*k-s);},
		"easeOut":function(k){var s=1.70158;return(k=k-1)*k*((s+1)*k+s)+1;},
		"easeInOut":function(k){
			var s = 1.70158 * 1.525;
			if ( ( k *= 2 ) < 1 ) return 0.5 * ( k * k * ( ( s + 1 ) * k - s ) );
			return 0.5 * ( ( k -= 2 ) * k * ( ( s + 1 ) * k + s ) + 2 );
		}
	};
	_ease["bounce"] = {};
	_ease["bounce"]["easeOut"] = function(k){
		if ( ( k /= 1 ) < ( 1 / 2.75 ) ) return 7.5625 * k * k;
		else if ( k < ( 2 / 2.75 ) ) return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;
		else if ( k < ( 2.5 / 2.75 ) ) return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;
		else return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;
	};
	_ease["bounce"]["easeIn"] = function(k){return 1-_ease["bounce"].easeOut(1-k);};
	_ease["bounce"]["easeInOut"] = function(k){if(k<0.5)return _ease["bounce"].easeIn(k*2)*0.5;else return _ease["bounce"].easeOut(k*2-1)*0.5+0.5;};
	return _ease;
})();