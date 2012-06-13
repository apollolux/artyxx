/****
PARTICLE
****/

/****
# Micro #
Enemy : Entity
Player : Entity
Item : Entity
Entity
Particle

## Enemies ##
Boss : Enemy
Turret : Enemy
****/


RequireScript("a.common.js");

App.Obj.Point = function(){
	var x = arguments.length>0?arguments[0]:0,
		y = arguments.length>1?arguments[1]:0,
		z = arguments.length>2?arguments[2]:0;
	var _p = App.Obj.Position(x,y,z);
	var _o = {
		"at":function(){return _p.at();},
		set x(v){_p.x = v;},
		set y(v){_p.y = v;},
		set z(v){_p.z = v;},
		get x(){return _p.x},
		get y(){return _p.y},
		get z(){return _p.z},
		get point(){return _p;}
	};
	return _o;
};

App.Obj.Particle = function(o){
	if (!("id" in App.Obj.Particle)) App.Obj.Particle.id = 0;
	++App.Obj.Particle.id;
	if (!("src" in o)) Abort("No particle source");
	//if (!(this instanceof App.Obj.Particle)) return new App.Obj.Particle(o);
	var _v = {
		"name":o.name,
		"src":o.src,
		"type":"type" in o&&o.type?o.type:"manual",
		"spriteset":App.Sph.Sprite(),
		"birth":function(){},
		"life":o.life|0,	// ms
		"pos":App.Obj.Point(o.p.x,o.p.y,o.p.z),
		"vel":App.Obj.Point(o.v.x,o.v.y,o.v.z),
		"acc":App.Obj.Point(o.a.x,o.a.y,o.a.z),
		"rot":"r" in o?o.r*1.0:0.0,
		"collisions":0,
		"angle":0.0
	};
	if (App.Common.particleIgnore.find(function(q){return q},_v.name)===-1)
		App.Common.particleIgnore.push(_v.name);
	var _ig = App.Common.particleIgnore.concat(o.__ignore());
	var _t = {
		"start":-1,
		"last":-1
	};
	var _f = {};
	_f["updateVel"] = function(dt){
		if (_v.acc.x) _v.vel.x = _v.vel.x+_v.acc.x*dt;
		if (_v.acc.y) _v.vel.y = _v.vel.y+_v.acc.y*dt;
		if (_v.acc.z) _v.vel.z = _v.vel.z+_v.acc.z*dt;
	};
	_f["updatePos"] = function(dt){
		if (_v.vel.x) _v.pos.x += _v.vel.x*dt;
		if (_v.vel.y) _v.pos.y += _v.vel.y*dt;
		if (_v.vel.z) _v.pos.z += _v.vel.z*dt;
	};
	_f["updateRot"] = function(dt){
		if (_v.rot) _v.angle += _v.rot*dt;
	};
	_f["checkTargets"] = function(tgts){
		var ret = 0;
		var mx = _o.mapX, my = _o.mapY;
		//Abort("find obs for "+_v.name+" ["+mx+","+my+"]");
		if (_o.isObstructed(mx,my)) {
			//App.Common.msgQ.push({msg:_v.name+" ["+mx+","+my+"]:"+_o.isObstructed(mx,my),time:16});
			//Abort("obs for "+_v.name+" ["+mx+","+my+"]");
			var ig = GetPersonIgnoreList(_v.name);
			var op = GetObstructingPerson(_v.name,mx,my), i = tgts.length;
			if (op) {
				if (op.indexOf("emitter")===0) {
					ig.push(op);
					SetPersonIgnoreList(_v.name, ig);
				}
				else if (op==_v.src) {
					Abort("Particle "+_v.name+" not respecting ignorelist, hitting source "+op);
				}
				else if (ig.find(function(q){return q;},op)>-1) {
					Abort("Particle "+_v.name+" not respecting ignorelist, hitting "+op);
				}
				else while (--i>-1) {
					if (op===tgts[i]||tgts[i]==='all') {
						// TODO: damage target, set as dead
						if (op in App.Common.Entities) App.Common.Entities[op].damage();
						else Abort(op+" not in entity list");
						++ret;
						//Abort("target "+op+" hit!");
					}
				}
			}
		}
		return ret;
	};
	_f["update"] = function(tgts){
		var t = GetTime()-_t.last, dt = t*0.001;
		_f.updateVel(dt);
		_f.updatePos(dt);
		_f.updateRot(dt);
		// TODO: loop tgts to see if collision happens; if true, set life to 0 and trigger tgts[i].damage(this.ap)
		// EASIER IN MAP ENGINE
		if (!(_v.collisions=_f.checkTargets(tgts))) {
			_o.x = _v.pos.x;
			_o.y = _v.pos.y;
			_o.z = _v.pos.z;
		}
		else {
			_v.pos.x = _o.x;
			_v.pos.y = _o.y;
			_v.pos.z = _o.z;
		}
		_t.last = GetTime();
		_ig = _ig.concat(o.__ignore());
	};
	_t.start = GetTime();
	_t.last = GetTime();
	var _o = {
		get name(){return _v.name;},
		get exists(){return App.F.personExists(_v.name);},
		get dead(){var r=_v.collisions>0||(GetTime()-_t.start>_v.life);if(r&&this.exists)DestroyPerson(_v.name);return r;},
		set spriteset(v){
			_v.spriteset.data = v;
			if (_v.spriteset.data) {
				if (this.exists) SetPersonSpriteset(_v.name, _v.spriteset.data);
				else {
					var _sp = _v.spriteset.data.filename.split('/');
					if (_sp[0]==='spritesets') _sp.shift();
					_sp = _sp.join('/');
					CreatePerson(_v.name, _sp, false);
					App.Flag.updatePersonList = 1;
					SetPersonLayer(_v.name, GetPersonLayer("barrier-h_0"));
					SetPersonIgnoreList(_v.name, _ig);
					IgnoreTileObstructions(_v.name, true);
					//Abort("created");
				}
			}
		},
		get spriteset(){return _v.spriteset;},
		get layer(){return this.exists?GetPersonLayer(_v.name):0;},
		"isObstructed":function(x,y){return this.exists&&IsMapEngineRunning()&&IsPersonObstructed(_v.name,x,y);},
		get mapX(){var x=(_v.pos.x+1*("origin" in this?this.origin.x:0))|0;return IsMapEngineRunning()?ScreenToMapX(this.layer,x):x;},
		get mapY(){var y=(_v.pos.y+1*("origin" in this?this.origin.y:0))|0;return IsMapEngineRunning()?ScreenToMapY(this.layer,y):y;},
		set x(v){
			var old = _v.pos.x; _v.pos.x = v;
			if (!this.isObstructed(this.mapX, this.mapY)) SetPersonX(_v.name, this.mapX);
			else if (IsMapEngineRunning()) {
				_v.pos.x = old;
			}
		},
		set y(v){
			var old = _v.pos.y; _v.pos.y = v;
			if (!this.isObstructed(this.mapX, this.mapY)) SetPersonY(_v.name, this.mapY);
			else if (IsMapEngineRunning()) {
				_v.pos.y = old;
			}
		},
		set z(v){_v.pos.z = v;},
		get x(){return _v.pos.x;},
		get y(){return _v.pos.y;},
		get z(){return _v.pos.z;},
		set birth(v){if(typeof v==='function')_v.birth=v;},
		get birth(){return _v.birth;},
		set life(v){_v.life=v|0;},
		get life(){return _v.life;},
		set rot(v){_v.rot = v*1.0;},
		get rot(){return _v.rot;},
		get angle(){return _v.angle;},
		"vel":{
			set x(v){_v.vel.x = v;},
			set y(v){_v.vel.y = v;},
			set z(v){_v.vel.z = v;},
			get x(){return _v.vel.x;},
			get y(){return _v.vel.y;},
			get z(){return _v.vel.z;}
		},
		"acc":{
			set x(v){_v.acc.x = v;},
			set y(v){_v.acc.y = v;},
			set z(v){_v.acc.z = v;},
			get x(){return _v.acc.x;},
			get y(){return _v.acc.y;},
			get z(){return _v.acc.z;}
		},
		"update":function(tgts){_v.spriteset.animate(); _f.update(tgts);},
		"render":function(x,y,c){
			if ("origin" in this) {x=this.origin.x;y=this.origin.y;}
			if (IsMapEngineRunning()&&this.exists)  {
				if (_v.rot&&_v.angle) SetPersonAngle(_v.name, _v.angle);
				SetPersonMask(_v.name, c);
			}
			else {
				var dx = x+_v.pos.x, dy = y+_v.pos.y;
				if (_v.rot&&_v.angle) {
					_v.spriteset.rotateBlitMask(dx,dy,c,_v.angle);
				}
				else {
					_v.spriteset.blitMask(dx,dy,c);
				}
			}
		}
	};
	if ("birth" in o) _o.birth = o.birth;
	if ("spriteset" in o) _o.spriteset = o.spriteset;
	_v.spriteset.offset = 1;
	_o.birth();
	return _o;
};

App.Obj.Emitter = function(o){
	if (!("id" in App.Obj.Emitter)) App.Obj.Emitter.id = 0;
	++App.Obj.Emitter.id;
	if (!("src" in o)) Abort("No emitter source");
	function _Ranged(n,r) {
		var _v = {"base":n*1.0,"range":r*1.0};
		var _q = {
			set base(v){_v.base=v*1.0;},
			set range(v){_v.range=v*1.0;},
			get base(){return _v.base;},
			get range(){return _v.range;},
			get value(){return _v.base+(Math.random()-0.5)*_v.range;},
			"valueOf":function(){return this.value;}
		};
		return _q;
	}
	var __name = "name" in o&&o.name?o.name:'manual';
	var _v = {
		"name":"emitter"+App.Obj.Emitter.id+'_'+__name,
		"type":"type" in o&&o.type?o.type:"manual",
		"src":o.src,
		"pos":App.Obj.Point(o.p.x,o.p.y,o.p.z),
		"posIsOffset":0,
		"spriteset":App.Sph.Sprite(),
		"col":CreateColor(255,255,255,255),
		"children":[],
		"nextId":0
	};
	_v.spriteset.offset = 1;
	var _t = {
		"start":GetTime(),
		"last":GetTime(),
		"now":GetTime()
	};
	var _p = {
		/*"size":{	// px
			"w":0,
			"h":0
		},*/
		"birth":function(p){
			_v.children.push(p);
		},
		"limit":0,
		"size":{
			"x":_Ranged(o.s.x,o.s.rx),
			"y":_Ranged(o.s.y,o.s.ry),
			"z":_Ranged(o.s.z,o.s.rz)
		},
		"life":_Ranged(0,0),	// ms
		"rate":_Ranged(0,0),	// ms per spawn
		"spawn":_Ranged(0,0),	// # per spawn
		"vel":App.Obj.Point(o.v.x,o.v.y,o.v.z),
		"vvel":{
			"x":_Ranged(0,o.v.rx),
			"y":_Ranged(0,o.v.ry),
			"z":_Ranged(0,o.v.rz)
		},
		"acc":App.Obj.Point(o.a.x,o.a.y,o.a.z),
		"vacc":{
			"x":_Ranged(0,o.a.rx),
			"y":_Ranged(0,o.a.ry),
			"z":_Ranged(0,o.a.rz)
		},
		"rot":_Ranged(0,0)
	};
	var _ig = [].concat(_v.src);
	var _dbg = {f:App.F.loadFont("trigger.rfn")};
	var _f = {}, o;
	_f["ignores"] = function(){return _ig;};
	_f["cmp"] = function(a,b){return a.z<b.z?-1:(a.z>b.z?1:0);};
	_f["sort"] = function(){_v.children.sort(_f.cmp);};
	_f["spawn"] = function(){
		var _sp = _v.spriteset.data.filename.split('/');
		if (_sp[0]==='spritesets') _sp.shift();
		_sp = _sp.join('/');
		var src = _v.src, __sl = GetPersonLayer(src), n = _p.spawn.valueOf(); while (--n>-1) {
			if (_p.limit===0||_v.children.length<_p.limit) {
				//Abort("spawning ("+_p.vel.x+")");
				var nam = _v.name+"_"+(++_v.nextId),
					px = _v.pos.x+_p.size.x.valueOf(),
					py = _v.pos.y+_p.size.y.valueOf();
				_ig.push(nam);
				_p.birth(App.Obj.Particle({
					"name":nam,
					"type":__name,
					"src":src,
					"__ignore":_f.ignores,
					"spriteset":_sp,
					"birth":function(){
						//CreatePerson(nam, _sp, false);
						//App.Common.msgQ.push({msg:nam+":offset["+ScreenToMapX(__sl,px)+","+ScreenToMapY(__sl,py)+"]",time:166});
						if (__name in App.Common.Sound) {
							if (App.Common.Sound[__name].isPlaying()) App.Common.Sound[__name].stop();
							App.Common.Sound[__name].play(false);
						}
					},
					"life":_p.life.valueOf(),
					"p":{
						"x":px,
						"y":py,
						"z":_v.pos.z+_p.size.z.valueOf()
					},
					"v":{
						"x":_p.vel.x+_p.vvel.x.valueOf(),
						"y":_p.vel.y+_p.vvel.y.valueOf(),
						"z":_p.vel.z+_p.vvel.z.valueOf()
					},
					"a":{
						"x":_p.acc.x+_p.vacc.x.valueOf(),
						"y":_p.acc.y+_p.vacc.y.valueOf(),
						"z":_p.acc.z+_p.vacc.z.valueOf()
					},
					"r":_p.rot.valueOf()
				}));
			}
		}
		_f.sort();
		//Abort(_v.children.length);
		_t.last = GetTime();
	};
	_f["systemCallback"] = function(p){var i=-1;while(++i<_v.children.length)_v.children[i][p]();};
	_f["render"] = function(x,y){
		var i = -1; while (++i<_v.children.length) {
			if (!("origin" in _v.children[i])) _v.children[i].origin = {"x":x,"y":y};
			_v.children[i].render(0,0,_v.col);
		}
		//_f.systemCallback("render");
		//_dbg.f.drawText(12,12,"#P="+_v.children.length+", L="+_p.life.valueOf()+" "+_p.spawn.valueOf()+" every "+_p.rate.valueOf()+"ms");
	};
	_f["update"] = function(tgts,sp){
		var dt = GetTime()-_t.last;
		if (sp.find(function(q){return q===_v.type||q==='all';},true)>-1&&dt>_p.rate.valueOf()) _f.spawn();
		var i = -1; while (++i<_v.children.length) {
			_v.children[i].update(tgts);
			if (_v.children[i].dead) {
				if (_v.children[i].exists) DestroyPerson(_v.children[i].name);
				_v.children.splice(i,1);
				--i;
			}
		}
		_t.now = GetTime();
	};
	_o = {
		get name(){return _v.name;},
		get type(){return _v.type;},
		set spriteset(v){
			_v.spriteset.data = v;
			var i = _v.children.length; while (--i>-1) {
				_v.children[i].spriteset = v;
			}
		},
		get spriteset(){return _v.spriteset;},
		set offset(v){_v.posIsOffset=v?true:false;},
		set c(v){_v.col.red=v.red;_v.col.green=v.green;_v.col.blue=v.blue;_v.col.alpha=v.alpha;},
		set x(v){_v.pos.x = v;},
		set y(v){_v.pos.y = v;},
		set z(v){_v.pos.z = v;},
		get x(){return _v.pos.x;},
		get y(){return _v.pos.y;},
		get z(){return _v.pos.z;},
		set vx(v){_p.vel.x = v;},
		set vy(v){_p.vel.y = v;},
		set vz(v){_p.vel.z = v;},
		get vx(){return _p.vel.x;},
		get vy(){return _p.vel.y;},
		get vz(){return _p.vel.z;},
		set ax(v){_p.acc.x = v;},
		set ay(v){_p.acc.y = v;},
		set az(v){_p.acc.z = v;},
		get ax(){return _p.acc.x;},
		get ay(){return _p.acc.y;},
		get az(){return _p.acc.z;},
		get ignores(){return _f.ignores();},
		get children(){return _v.children;},
		set limit(v){_p.limit = v>0?v|0:0;},
		get limit(){return _p.limit;},
		set life(v){if(typeof v==='array'||typeof v==='object'){_p.life.base=v[0];_p.life.range=v[1];}else{_p.life.base=v;_p.life.range=0;}},
		set rate(v){if(typeof v==='array'||typeof v==='object'){_p.rate.base=v[0];_p.rate.range=v[1];}else{_p.rate.base=v;_p.rate.range=0;}},
		set spawn(v){if(typeof v==='array'||typeof v==='object'){_p.spawn.base=v[0];_p.spawn.range=v[1];}else{_p.spawn.base=v;_p.spawn.range=0;}},
		set rot(v){if(typeof v==='array'||typeof v==='object'){_p.rot.base=v[0];_p.rot.range=v[1];}else{_p.rot.base=v;_p.rot.range=0;}},
		"update":function(tgts,sp){_f.update(tgts,sp);},
		"render":function(x,y){_f.render(x,y);}
	};
	if ("spriteset" in o) _o.spriteset = o.spriteset;
	if ("offset" in o) _o.offset = o.offset;
	if ("limit" in o) _o.limit = o.limit;
	if ("life" in o) _o.life = o.life;
	if ("rate" in o) _o.rate = o.rate;
	if ("spawn" in o) _o.spawn = o.spawn;
	if ("r" in o) _o.rot = o.r;
	return _o;
};

/*App.Obj.ParticleSwarm = function(s,img,x,y){
	var _P = CreateParticleSystemChild(s);
	_P.body.x = x|0; _P.body.y = y|0;
	_P.swarm.renderer.texture = img;
	_P.swarm.renderer.blend_mode = ADD;
	_P.initializer.setAgingParams({min:0.05,max:0.09});
	return _P;
};
App.Obj.ParticleSystem = function(x,y){
	var _P = CreateParticleSystemParent();
	_P.body.x = x|0; _P.body.y = y|0;
	return _P;
};*/
