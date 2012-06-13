/****
ENTITY
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
RequireScript("obj.particle.js");

App.Obj.Entity = function(o){
	var _v = {
		"name":o.name,
		"spriteset":App.Sph.Sprite(),
		"health":{
			"hp":1,
			"sp":0
		},
		"pos":App.Obj.Point(),
		"emitters":[],
		"targets":[]
	};
	var _f = {}, _s = {}, _o;
	var _ig = [];
	var _h = {
		get points(){return _v.health.hp;},
		get shield(){return _v.health.sp;}
	};
	_f["move"] = function(){
		_o["move"](_o.x,_o.y,_o.z);
	};
	_f["update"] = function(){
		_v.spriteset.animate();
		_f.move();
		var i = _v.emitters.length; while (--i>-1) _v.emitters[i].update(_v.targets,_o.weapon.isActive);
	};
	_f["render"] = function(){
		var i = -1; while (++i<_v.emitters.length) _v.emitters[i].render(_v.pos.x,_v.pos.y);
		if (!IsMapEngineRunning()) _v.spriteset.blit(_v.pos.x,_v.pos.y);
	};
	_o = {
		get name(){return _v.name;},
		get exists(){return App.F.personExists(_v.name);},
		get dead(){return _v.health.hp<=0;},
		set direction(d){if (_v.spriteset) {_v.spriteset.direction = d; if (this.exists) SetPersonDirection(_v.name, _v.spriteset.direction);}},
		set spriteset(v){
			_v.spriteset.data = v;
			if (_v.spriteset.data) {
				if (this.exists) SetPersonSpriteset(_v.name, _v.spriteset.data);
				else {
					var _sp = _v.spriteset.data.filename.split('/');
					if (_sp[0]==='spritesets') _sp.shift();
					_sp = _sp.join('/');
					CreatePerson(_v.name, _sp, false);
				}
			}
		},
		get spriteset(){return _v.spriteset;},
		get layer(){return this.exists?GetPersonLayer(_v.name):0;},
		"isObstructed":function(x,y){return this.exists&&IsMapEngineRunning()&&IsPersonObstructed(_v.name,x,y);},
		get mapX(){return IsMapEngineRunning()?ScreenToMapX(this.layer, _v.pos.x|0):_v.pos.x|0;},
		get mapY(){return IsMapEngineRunning()?ScreenToMapY(this.layer, _v.pos.y|0):_v.pos.y|0;},
		set x(v){var old = _v.pos.x; _v.pos.x = v; if (!this.isObstructed(this.mapX, this.mapY)) SetPersonX(_v.name, this.mapX); else if (IsMapEngineRunning()) _v.pos.x = old;},
		set y(v){var old = _v.pos.y; if (v>0&&v<App.Screen.height) {_v.pos.y = v; if (!this.isObstructed(this.mapX, this.mapY)) SetPersonY(_v.name, this.mapY); else if (IsMapEngineRunning()) _v.pos.y = old;}},
		set z(v){_v.pos.z = v;},
		get x(){return _v.pos.x;},
		get y(){return _v.pos.y;},
		get z(){return _v.pos.z;},
		get pos(){return _v.pos;},
		get targets(){return _v.targets;},
		get emitters(){return _v.emitters;},
		get health(){return _h;},
		set hp(v){_v.health.hp = v>0?v|0:0;},
		set sp(v){_v.health.sp = v>0?v|0:0;},
		"emitter":function(i){return _v.emitters[i];},
		"addTarget":function(v){_v.targets.push(v);},
		"addEmitter":function(o){o.src=_v.name;var m=App.Obj.Emitter(o);_v.emitters.push(m);},
		"addEmitterFromPreset":function(f){var o,m;try{o=App.F.readJSON(f);o.src=_v.name;}catch(e){Abort(e.name+": Couldn't load emitter preset - "+e.message);}m=App.Obj.Emitter(o);_v.emitters.push(m);},
		"update":function(){_f.update();},
		"render":function(){_f.render();}
	};
	_o["weapon"] = {
		"isActive":[]
	};
	_o["damage"] = ("damage" in o)?o.damage:function(){};
	_o["death"] = ("death" in o)?o.death:function(){};
	_o["move"] = ("move" in o)?o.move:function(x,y,z){};
	return _o;
};
