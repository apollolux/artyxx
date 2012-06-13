	try {
		_s["startup"] = App.Obj.NQueue();
			_s["startup"].preset("fadeImage",{
				"start":function(h,s,sk,img,dur,xf,yf,af){
					s.name = "PRE::fadeImage";
					s.skippable = sk>-1?sk:-1;
					s.duration = dur!==null?dur|0:2000;
					s.done = false;
					s.color = {
						"img":CreateColor(255,255,255,0),
						"shadow":CreateColor(255,255,255,96),
						"font":CreateColor(255,255,255)
					};
					s.easing = af!==null&&typeof af==='function'?af:Math.sin;
					s.img = App.F.loadImage(img);
					s.o = {
						"x":typeof xf==='function'?xf:function(s){return xf;},
						"y":typeof yf==='function'?yf:function(s){return yf;},
					};
					s.f = {};
					s.f["o"] = App.F.loadFont("galaxy.rfn");
					s.f["x"] = 8;
					s.f["y"] = App.Screen.height-s.f.o.getHeight()-8;
					App.Keys.clear();
					s.time = GetTime();
					s.now = GetTime();
					s.tmp = 0;
				},
				"update":function(h,s){
					if (!s.done) {
						s.tmp = (s.now-s.time)/s.duration;
						if (s.tmp<1) s.color.img.alpha = (255*s.easing(s.tmp))|0;
						else s.done = true;
						s.now = GetTime();
					}
					return !s.done;
				},
				"render":function(h,s){
					s.img.blitMask(s.o.x(s),s.o.y(s),s.color.img);
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
					//else s.font.drawText(s.o.fx, s.o.fy, "...");
				},
				"input":function(h,s){
					s.k = App.Keys.next; App.Keys.clear();
					if (s.skippable>-1) {if (s.k===s.skippable) s.done = true;}
				}
			});
			_s["startup"].preset("textArray",{
				"start":function(h,s){},
				"update":function(h,s){},
				"input":function(h,s){
					s.k = App.Keys.next; App.Keys.clear();
					if (s.skippable>-1) {if (s.k===s.skippable) s.done = true;}
				}
			});
			_s["startup"].enqueueFromPreset("wait",50);
			_s["startup"].fork.begin();
				_s["startup"].enqueue({
					"argv":[
						8, 8, "galaxy.rfn",
						[
							{"msg":"Initializing LUX engine",'time':400},
							{"msg":"Loading common routines",'time':650},
							{"msg":"Loading ARTYXX routines",'time':1250},
							{"msg":"Loading prototype data 'Raiden'",'time':700},
							{"msg":"EXECUTE",'time':2000}
						]
					],
					"start":function(h,s,x,y,f,m){
						s.name = "MSG::STARTUP";
						s.msg = {"list":m, "i":0};
						s.len = (function(){var r=0,i=arguments.length;while(--i>-1)r+=arguments[i]['time'];return r;}).apply(null,m);
						s.o = {
							"x":x|0,
							"y":y|0,
							"w":(App.Screen.width-x)|0,
							"h":(App.Screen.height-y)|0
						};
						s.font = App.F.loadFont(f);
						s.fh = s.font.getHeight();
						s.color = s.font.getColorMask();
						s.shadow = CreateColor(255,255,255,96);
						s.time = GetTime();
						s.tmp = GetTime();
						s.now = GetTime();
					},
					"update":function(h,s){
						s.now = GetTime();
						var ret = true;
						if (s.now-s.time>s.len||s.msg.i>s.msg.list.length) ret = false;
						else if (s.now-s.tmp>s.msg.list[s.msg.i].time) {++s.msg.i; s.tmp = GetTime();}
						return ret;
					},
					"render":function(h,s){
						s.font.setColorMask(s.shadow);
						if ("speaker" in s.msg.list[s.msg.i]) s.font.drawText(s.o.x-8+1,s.o.y-s.fh+1,s.msg.list[s.msg.i].speaker+":");
						s.font.drawTextBox(s.o.x+1,s.o.y+1,s.o.w,s.o.h,0,s.msg.list[s.msg.i].msg);//+" ("+(s.now-s.time)+"/"+s.len+"ms)");
						s.font.setColorMask(s.color);
						if ("speaker" in s.msg.list[s.msg.i]) s.font.drawText(s.o.x-8,s.o.y-s.fh,s.msg.list[s.msg.i].speaker+":");
						s.font.drawTextBox(s.o.x,s.o.y,s.o.w,s.o.h,0,s.msg.list[s.msg.i].msg);//+" ("+(s.now-s.time)+"/"+s.len+"ms)");
					}
				});
			_s["startup"].fork.end();
			_s["startup"].enqueueFromPreset(
				"fadeImage", -1,
				"ages.png",5000,
				function(s){return (App.Screen.width-s.img.width)*0.5;},
				function(s){return (App.Screen.height-s.img.height)*0.5;},
				function(t){return Math.sin(t*Math.PI);}
			);
			_s["startup"].enqueueFromPreset(
				"fadeImage", KEY_Q,
				"icon.png",5000,
				function(s){return (App.Screen.width-s.img.width)*0.5;},
				function(s){return (App.Screen.height-s.img.height)*0.5;},
				function(t){return Math.sin(t*Math.PI);}
			);
			_s["startup"].enqueue({
				"argv":[
					2000,
					["about.png","choose.png"]
				],
				"start":function(h,s,dur,imgs){
					//throw new Error("Startup timeline");
					s.name = "showLogos";
					s.duration = dur?dur|0:2000;
					s.alpha = 255;
					s.color = CreateColor(255,255,255,0);
					s.img = {"list":imgs,"i":0};
					s.time = GetTime();
					s.now = GetTime();
				},
				"update":function(h,s){
					var tmp = (s.now-s.time)/s.duration;
					if (tmp<1) s.color.alpha = s.alpha*Math.sin(tmp*Math.PI);
					else {++s.img.i; s.color.alpha = 0; s.time = GetTime();}
					s.now = GetTime();
					return s.img.i<s.img.list.length;
				},
				"render":function(h,s){
					var img = App.F.loadImage(s.img.list[s.img.i]);
					img.blitMask((App.Screen.width-img.width)*0.5,(App.Screen.height-img.height)*0.5,s.color);
				}
			});
	} catch(e) {
		Abort("Couldn't create startup timeline - "+e.message);
	}
