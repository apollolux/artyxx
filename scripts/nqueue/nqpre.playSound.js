({
	"name":"playSound",
	"comment":"Unlooped sound playback",
	"data":{
		"start" : function ( h,s,sk,f,dur,fade ) {
			s.name = "PRE::playSound";
			s.skippable = sk>-1?sk:-1;
			s.done = false;
			s.duration = dur!==null?dur|0:0;
			s.fade = fade!==null?fade|0:0;
			s.sound = App.F.loadSound(f);
			s.sound.play(false);
			s.time = GetTime();
			s.now = GetTime();
			s.vol = 255;
		},
		"update" : function (h,s) {
			if (!s.done) {
				if (s.duration>0) {
					if (s.now>(s.time+s.duration)) {
						if (s.fade>0) s.vol = 255*(1-(s.now-(s.time+s.duration))/s.fade);
						else s.vol = 0;
					}
					if (s.vol>0) s.sound.setVolume(s.vol|0);
					else {s.done = true; s.sound.stop();}
				}
				else s.done = !s.sound.isPlaying();
				s.now = GetTime();
			}
			return !s.done;
		},
		"input":function(h,s){
			s.k = App.Keys.next; App.Keys.clear();
			if (s.skippable>-1) {if (s.k===s.skippable) s.done = true;}
		}
	}
})