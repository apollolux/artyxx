({
	"name":"wait",
	"comment":"General timed wait",
	"data":{
		"start" : function ( h,s,dur ) {
			s.name = "PRE::wait";
			s.skippable = false;
			s.end = GetTime()+(dur!==null?dur|0:2000);
		},
		"update" : function (h,s) { return GetTime()<s.end; }
	}
})