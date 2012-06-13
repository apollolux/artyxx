({
	"name":"fadeImage",
	"comment":"Image fade in/out",
	"data":{
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
	}
})