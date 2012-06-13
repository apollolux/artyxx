// TODO: ALL
RequireScript("a.common.js");
RequireScript("obj.entity.js");
RequireScript("obj.menu.js");
RequireScript("obj.level.js");
RequireScript("obj.nqueue.js");

var Artyxx = (function(){
	var _l = [], _s = {}, _m = {};
	try {
		_s["startup"] = App.Obj.NQueue();
			_s["startup"].loadPreset("../scripts/nqueue/nqpre.wait.js");
			_s["startup"].loadPreset("../scripts/nqueue/nqpre.playSound.js");
			_s["startup"].loadPreset("../scripts/nqueue/nqpre.fadeImage.js");
			_s["startup"].loadPreset("../scripts/nqueue/nqpre.textArray.js");
			/*_s["startup"].fork.begin();
				_s["startup"].enqueueFromPreset("playSound", -1, "zedblade_21.wav", 4000, 999);
			_s["startup"].fork.end();*/
			_s["startup"].fork.begin();
				_s["startup"].enqueueFromPreset(
					"textArray", -1,
					8, 8, "galaxy.rfn",
					[
						{"msg":"Initializing LUX engine",'time':400},
						{"msg":"Loading common routines",'time':650},
						{"msg":"Loading ARTYXX routines",'time':1250},
						{"msg":"Loading prototype data 'Raiden'",'time':700},
						{"msg":"EXECUTE",'time':2000}
					]
				);
			_s["startup"].fork.end();
			_s["startup"].enqueueFromPreset("wait",50);
			_s["startup"].enqueueFromPreset(
				"fadeImage", -1,
				"ages.png",5000,
				function(s){return (App.Screen.width-s.img.width)*0.5;},
				function(s){return (App.Screen.height-s.img.height)*0.5;},
				function(t){return Math.sin(t*Math.PI);}
			);
			_s["startup"].enqueueFromPreset(
				"fadeImage", KEY_Q,
				"team.png",5000,
				function(s){return (App.Screen.width-s.img.width)*0.5;},
				function(s){return (App.Screen.height-s.img.height)*0.5;},
				function(t){return Math.sin(t*Math.PI);}
			);
			/*_s["startup"].enqueue({
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
			});*/
	} catch(e) {
		Abort("Couldn't create startup timeline - "+e.message);
	}
	try {
		_s["zerowing"] = App.Obj.NQueue();
			_s["zerowing"].enqueue({
				"argv":[
					24, 192, "galaxy.rfn",
					[
						{"msg":"In A.D. 2101",'time':500},
						{"msg":"War was Beginning.",'time':1500},
						{"msg":"What happen ?",'time':1000,"speaker":"Captain"},
						{"msg":"Somebody set up us the bomb.",'time':700,"speaker":"Mechanic"},
						{"msg":"We get signal.",'time':800,"speaker":"Operator"},
						{"msg":"What !",'time':400,"speaker":"Captain"},
						{"msg":"Main screen turn on.",'time':700,"speaker":"Operator"},
						{"msg":"It's you !!",'time':800,"speaker":"Captain"},
						{"msg":"How are you gentlemen !!",'time':1000,"speaker":"CATS"},
						{"msg":"All your base are belong to us.",'time':500,"speaker":"CATS"},
						{"msg":"You are on the way to destruction.",'time':500,"speaker":"CATS"},
						{"msg":"What you say !!",'time':800,"speaker":"Captain"},
						{"msg":"You have no chance to survive make your time.",'time':1200,"speaker":"CATS"},
						{"msg":"Ha ha ha ha ...",'time':800,"speaker":"CATS"},
						{"msg":"Captain !!",'time':700,"speaker":"Operator"},
						{"msg":"Take off every 'ZIG'!!",'time':900,"speaker":"Captain"},
						{"msg":"You know what you doing.",'time':1100,"speaker":"Captain"},
						{"msg":"Move 'ZIG'.",'time':800,"speaker":"Captain"},
						{"msg":"For great justice.",'time':1000,"speaker":"Captain"}
					]
				],
				"start":function(h,s,x,y,f,m){
					s.name = "MSG::AYB";
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
					s.font.drawTextBox(s.o.x,s.o.y,s.o.w,s.o.h,0,s.msg.list[s.msg.i].msg);
					if (App.Flag.debug&1) s.font.drawText(192,224,s.len+":"+(s.now-s.time)+"ms");
				}
			});
	} catch(e) {
		Abort("Couldn't create ZW demo timeline - "+e.message);
	}
	try {
		_s["opening"] = App.Obj.NQueue();
			_s["opening"].loadPreset("../scripts/nqueue/nqpre.textArray.js");
	} catch(e) {
		Abort("Couldn't create opening demo timeline - "+e.message);
	}
	try {
		_s["gameover"] = App.Obj.NQueue();
			_s["gameover"].loadPreset("../scripts/nqueue/nqpre.textArray.js");
			_s["gameover"].enqueueFromPreset(
				"textArray", -1,
				48, 180, "trigger.rfn",
				[
					{"msg":"(c) 2012 Apollolux Digital Designs",'time':2000,'speaker':"NeoLogiX"}
					//,{"msg":"Bye!",'time':500}
				]
			);
	} catch(e) {
		Abort("Couldn't create game over timeline - "+e.message);
	}
	try {
		_s["ending"] = App.Obj.NQueue();
	} catch(e) {
		Abort("Couldn't create ending demo timeline - "+e.message);
	}
	try {
		_s["rankings"] = App.Obj.NQueue();
	} catch(e) {
		Abort("Couldn't create ranking screen timeline - "+e.message);
	}
	try {
		_s["attract"] = App.Obj.NQueue();
	} catch(e) {
		Abort("Couldn't create attract screen timeline - "+e.message);
	}
	_m = {
		"main":App.Obj.Menu(App.F.MainMenu,["New Game","Options","Quit"],{
			"select":"zedblade_7F.ogg",
			"cancel":"fx_21_warp.ogg",
			"inc":"beep.ogg",
			"dec":"beep.ogg",
			"bg":App.F.loadImage("bg.png"),
			"logo":App.F.loadImage("artyxx.png")
		}),
		"options":App.Obj.Menu(App.F.OptionsMenu,["Input","Sound","Exit"]),
		"pause":App.Obj.Menu(App.F.PauseMenu,["Resume","Quit to Title Screen"]),
		"choosePlayer":App.Obj.Menu(App.F.ChooseMenu,["Artyxx Gold"],{"mode":"complex"})
	};
	_m["main"].h = 0.5; _m["main"].v = 0.65;
	_m["main"].font = "galaxy.rfn"; _m["main"].arrow = "choose.png";
	var _app = {
		"run":function(){
			//_s["startup"].run();
			var i; do {
				i = _m["main"].run();
				if (i===0) {
					if (_s["opening"].empty)
						_s["opening"].enqueueFromPreset(
							"textArray", -1,
							24, 192, "galaxy.rfn",
							[
								{"msg":"The Gyrexx has taken control!",'time':1500,'speaker':"NeoLogiX"},
								{"msg":"Pilot the Artyxx Raiden prototype and defeat the Gyrexx!",'time':1500,'speaker':"NeoLogiX"},
								{"msg":"For great justice!",'time':500}
							]
						);
					_s["opening"].run();
					_newgame();
				}
			} while (i<2);
			_s["gameover"].run();
		}
	};
	return _app;
})();

function game() {
	App.Flag.debug = 0;
	//_g0();
	try {
		Artyxx.run();
	} catch(e) {
		Abort(e.name+": "+e.message);
	}
}

/****
[]	variable-length array
?	optional

# Macro #
Game
`	Menu menus{mnMain, mnOptions, mnChoose, mnPause}
	Level levels[]
	Cutscene opening
	Cutscene gameOver
	Cutscene ending
	Cutscene rankings
	Cutscene attract
	Replay demo

Cutscene
Menu (use NMenu?)
Level
	Map map
	Music bgm[]
	Entity:Enemy enemies[]
	Script timeline
	?Cutscene prologue
	Cutscene epilogue (stage clear screen)
Map (use Sphere's map format?)
Tileset (use Sphere's tileset format?)
Replay
Script (use JS interpreter?)

****/

function _newgame() {
	var curmap = "w1-skyline.rmp";
	App.Common.bg = App.F.loadImage("bg.png");
	App.Common.ssIndex = 0;
	App.Common.msgQ = [];
	App.Common.lastMsg = null;
	App.Common.triggerQ = [];
	App.Common.font = App.F.loadFont("galaxy.rfn");
	App.Common.Icon = {
		"hp":App.F.loadImage("hp.png")
	};
	App.Common.Sound = {
		//"explode":App.F.loadSound("27568__suonho__memorymoon-space-blaster-plays.wav"),
		"beam":App.F.loadSound("111877__candlegravity__zipper-1.ogg"),
		"vulcan":App.F.loadSound("18381__inferno__hvyelec.ogg")
	};
	App.Common.score = 0;
	App.Common.Flags = {
		"waitingForGyrexx":0,
		"instructions":0
	};
	App.Common.Time = {"start":-1,"last":-1,"now":-1};
	App.Common.Scrolls = {};
	App.Common.Scrolls["w1-skyline.rmp"] = {
		"name":"Skyline",
		"bg":App.F.loadImage("bg/1.png")
	};
	App.Common.particleIgnore = [
		"barrier-h_0", "barrier-h_13",
		"barrier-h_1", "barrier-h_14",
		"barrier-h_2", "barrier-h_15",
		"barrier-h_3", "barrier-h_16",
		"barrier-h_4", "barrier-h_17",
		"barrier-h_5", "barrier-h_18",
		"barrier-h_6", "barrier-h_19",
		"barrier-h_7", "barrier-h_20",
		"barrier-h_8", "barrier-h_21",
		"barrier-h_9", "barrier-h_22",
		"barrier-h_10", "barrier-h_23",
		"barrier-h_11", "barrier-h_24",
		"barrier-h_12", "barrier-h_25"
	];
	App.Common.Entities = {};
	App.Common.Entities['artyxx'] = App.Obj.Entity({
		"name":"artyxx",
		"death":function(){
			App.Common.msgQ.push({msg:this.name+" dead!",time:166});
		},
		"damage":function(){
			App.Common.msgQ.push({msg:this.name+" hit!",time:166});
			if (this.health.shield>0) --this.sp;
			else if (this.health.points>0) --this.hp;
			if (this.dead) {
				this.death();
			}
		}
	});
	(function(en){
		en.spriteset = "artyxx-r.rss";
		en.direction = "north";
		en.spriteset.loop = true;
		en.hp = 3;
		en.spriteset.offset = 1;
		en.addTarget("all");
		en.addEmitterFromPreset("../scripts/npart/emitter.beam.json");
		en.emitters[0].x = 0; en.emitters[0].y = -34;
		en.emitters[0].vy = -140;
		en.emitters[0].c = App.Color.Cyan;
		en.emitters[0].life = 1500;
		//en.emitters[0].rot = -Math.PI;
		//en.x = 200; en.y = 220;
	})(App.Common.Entities['artyxx']);
	//AttachInput("artyxx");
	//Abort(App.F.keyString(App.Keyset.action,true));
	//SetUpdateScript();
	App.Common.msgQ.push({msg:"Take off every Artyxx!",time:2000});
	SetDefaultMapScript(SCRIPT_ON_ENTER_MAP,"App.F.enter();");
	MapEngine(curmap,60);
}

function _g0() {
	var SW = App.Screen.width, SH = App.Screen.height;
	var fo = App.F.loadFont("trigger.rfn");
	// ENEMY
	var em = App.Obj.Entity({});
	em.spriteset = "bluelink.rss";
	em.spriteset.direction = "south";
	em.spriteset.loop = true;
	em.spriteset.offset = 1;
	em.x = 200; em.y = 40;
	em.addEmitterFromPreset("../scripts/npart/emitter.vulcan.json");
	em.emitters[0].c = App.Color.Orange;
	// PLAYER
	var en = App.Obj.Entity({});
	en.spriteset = "artyxx-r.rss";
	en.direction = "north";
	en.spriteset.loop = true;
	en.spriteset.offset = 1;
	en.x = 200; en.y = 220;
	//Abort("["+en.x+","+en.y+"]");
	en.addEmitterFromPreset("../scripts/npart/emitter.beam.json");
	en.emitters[0].x = -8; en.emitters[0].y = -24;
	en.emitters[0].vy = -128; en.emitters[0].c = App.Color.Cyan;
	en.emitters[0].rot = -Math.PI;
	en.addEmitterFromPreset("../scripts/npart/emitter.beam.json");
	en.emitters[1].x = 8; en.emitters[1].y = -24;
	en.emitters[1].vy = -128; en.emitters[1].c = App.Color.Cyan;
	en.emitters[1].rot = Math.PI;
	en.addEmitterFromPreset("../scripts/npart/emitter.vulcan.json");
	en.emitters[2].x = -24;
	en.emitters[2].vy = -128; en.emitters[2].c = App.Color.Cyan;
	en.addEmitterFromPreset("../scripts/npart/emitter.vulcan.json");
	en.emitters[3].x = 24;
	en.emitters[3].vy = -128; en.emitters[3].c = App.Color.Cyan;
	var t = GetTime();
	while(!IsKeyPressed(KEY_Q)){
		//o1.render();
		//o2.render();
		em.render();
		en.render();
		fo.drawText(160,16,"["+en.pos.x+","+en.pos.y+"]");
		FlipScreen();
		//o1.update();
		//o2.update();
		em.update();
		en.update();
		em.x = (SW+Math.sin(Math.PI*(GetTime()-t)*0.001)*SW)*0.5;
		if (IsKeyPressed(KEY_RIGHT)) {en.x = en.pos.x+1;}
		if (IsKeyPressed(KEY_LEFT)) {en.x = en.pos.x-1;}
		if (IsKeyPressed(KEY_UP)&&en.y>200) {en.y = en.pos.y-1;}
		if (IsKeyPressed(KEY_DOWN)&&en.y<240) {en.y = en.pos.y+1;}
	}
	Abort("emit");
	/*try {
		var en = App.Obj.Entity();
		en.spriteset = "bluelink.rss";
		en.spriteset.direction = "east";
		en.spriteset.loop = true;
		while(!IsKeyPressed(KEY_Q)){en.render();FlipScreen();en.spriteset.animate();}
	} catch(e) {
		Abort(e.name+": "+e.message);
	};*/
}
