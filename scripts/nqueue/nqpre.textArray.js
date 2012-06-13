({
	"name":"textArray",
	"comment":"Display a timed array of text messages",
	"data":{
		"start":function(h,s,sk,x,y,f,m){
			s.name = "PRE::textArray";
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
			s.f = {
				"o":App.F.loadFont(f),
				"c":CreateColor(255,255,255,255),
				"s":CreateColor(255,255,255,96)
			};
			s.f.h = s.f.o.getHeight();
			s.f["x"] = 8;
			s.f["y"] = App.Screen.height-s.f.h-8;
			s.time = GetTime();
			s.tmp = GetTime();
			s.now = GetTime();
		},
		"update":function(h,s){
			if (!s.done) {
				if (s.now-s.time>s.len||s.msg.i>s.msg.list.length) s.done = true;
				else if (s.now-s.tmp>s.msg.list[s.msg.i].time) {++s.msg.i; s.tmp = GetTime();}
				s.now = GetTime();
			}
			return !s.done;
		},
		"render":function(h,s){
			s.f.o.setColorMask(s.f.s);
			if ("speaker" in s.msg.list[s.msg.i]) s.f.o.drawText(s.o.x-8+1,s.o.y-s.f.h+1,s.msg.list[s.msg.i].speaker+":");
			s.f.o.drawTextBox(s.o.x+1,s.o.y+1,s.o.w,s.o.h,0,s.msg.list[s.msg.i].msg);//+" ("+(s.now-s.time)+"/"+s.len+"ms)");
			s.f.o.setColorMask(s.f.c);
			if ("speaker" in s.msg.list[s.msg.i]) s.f.o.drawText(s.o.x-8,s.o.y-s.f.h,s.msg.list[s.msg.i].speaker+":");
			s.f.o.drawTextBox(s.o.x,s.o.y,s.o.w,s.o.h,0,s.msg.list[s.msg.i].msg);//+" ("+(s.now-s.time)+"/"+s.len+"ms)");
			if (s.skippable>-1) {
				s.f.o.setColorMask(s.f.s);
				s.f.o.drawText(
					s.f.x+1, s.f.y+1,
					"Press "+App.Keys.string(s.skippable,true)+" to skip"
				);
				s.f.o.setColorMask(s.f.c);
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
	}
})