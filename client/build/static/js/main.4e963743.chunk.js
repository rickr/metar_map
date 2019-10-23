(this.webpackJsonpmetar_map=this.webpackJsonpmetar_map||[]).push([[0],{19:function(e,t,a){},24:function(e,t,a){e.exports=a(35)},29:function(e,t,a){},35:function(e,t,a){"use strict";a.r(t);var r=a(0),n=a.n(r),s=a(21),i=a.n(s),o=(a(29),a(6)),c=a(4),l=a(13),p=a(5),u=a(2),m=(a(19),a(8)),d=function(e){function t(e){var a;return Object(u.a)(this,t),(a=Object(o.a)(this,Object(c.a)(t).call(this,e))).airportsPerRow=7,a.cycleDelay=1e4,a.afterClickCycleDelay=2e4,a.updateSelectedAirport=function(e){clearTimeout(a.state.airportCycleTimer);var t=setTimeout(a.cycleAirports,a.afterClickCycleDelay);a.setState({airportCycleTimer:t,selectedAirport:e})},a.cycleAirports=function(){if(!a.state.selectedAirport&&!a.props.metars)return setTimeout(a.cycleAirports,100),!1;var e=a.state.currentIndex>=a.props.metars.length-1?0:a.state.currentIndex+1;a.setState({currentIndex:e});var t=setTimeout(a.cycleAirports,a.cycleDelay);a.setState({airportCycleTimer:t,selectedAirport:a.props.metars[a.state.currentIndex]})},a.componentWillUnmount=function(){},a.state={selectedAirport:null,airportComponents:[],currentIndex:0,airportCycleTimer:null},a}return Object(p.a)(t,e),Object(m.a)(t,[{key:"componentDidMount",value:function(){this.cycleAirports()}},{key:"render",value:function(){return n.a.createElement("div",null,n.a.createElement(h,{metars:this.props.metars,airportRows:this.props.metarCount/this.airportsPerRow,airportsPerRow:this.airportsPerRow,updateSelectedAirport:this.updateSelectedAirport}),n.a.createElement(v,{last_updated:new Date(this.props.lastUpdated)}),n.a.createElement(y,{selectedAirport:this.state.selectedAirport,airports:this.props.airports}))}}]),t}(n.a.Component),h=function(e){function t(){return Object(u.a)(this,t),Object(o.a)(this,Object(c.a)(t).apply(this,arguments))}return Object(p.a)(t,e),Object(m.a)(t,[{key:"flightCategoryToCSS",value:function(e){return"VFR"===e?"is-success":"MVFR"===e?"is-info":"IFR"===e?"is-danger":"LIFR"===e?"is-lifr":"unknown-"+e}},{key:"render",value:function(){var e=this,t=[];if(0===this.props.metars.length)return!1;this.props.metars.forEach((function(a,r){if(a){var s=Object.values(a.station_id),i=a.flight_category?e.flightCategoryToCSS(a.flight_category._text):"unknown-category",o=Object.values(a.raw_text),c=n.a.createElement(b,{key:s,id:s,flight_category:i,raw_text:o,updateSelectedAirport:e.props.updateSelectedAirport,metar:a});t.push(c)}}));for(var a=[],r=0;r<this.props.airportRows;r++){var s=r*this.props.airportsPerRow,i=s+this.props.airportsPerRow;a.push(t.slice(s,i))}return a.map((function(e,t){return n.a.createElement(f,{key:t},e)}))}}]),t}(n.a.Component),f=function(e){function t(){return Object(u.a)(this,t),Object(o.a)(this,Object(c.a)(t).apply(this,arguments))}return Object(p.a)(t,e),Object(m.a)(t,[{key:"render",value:function(){return n.a.createElement("div",{className:"tile is-ancestor"},this.props.children)}}]),t}(n.a.Component),b=function(e){function t(){var e,a;Object(u.a)(this,t);for(var r=arguments.length,n=new Array(r),s=0;s<r;s++)n[s]=arguments[s];return(a=Object(o.a)(this,(e=Object(c.a)(t)).call.apply(e,[this].concat(n)))).sendAirportData=function(){a.props.updateSelectedAirport(a.props.metar)},a}return Object(p.a)(t,e),Object(m.a)(t,[{key:"render",value:function(){return n.a.createElement("div",{className:"tile is-parent has-text-centered",onClick:this.sendAirportData},n.a.createElement("article",{className:"tile is-child box notification ".concat(this.props.flight_category),style:{padding:"0 5px 5px 0"}},n.a.createElement("p",{className:"title is-4 has-text-centered",style:{marginBottom:"5px"}}," ",this.props.id," "),n.a.createElement(g,{metar:this.props.metar})))}}]),t}(n.a.Component),g=function(e){function t(){return Object(u.a)(this,t),Object(o.a)(this,Object(c.a)(t).apply(this,arguments))}return Object(p.a)(t,e),Object(m.a)(t,[{key:"render",value:function(){var e=[],t=Date.now();return this.props.metar.wind_speed_kt&&this.props.metar.wind_speed_kt._text>20&&e.push(n.a.createElement("i",{key:t,className:"fas fa-exclamation-triangle"})),this.props.metar.wind_gust_kt&&this.props.metar.wind_gust_kt._text>20&&e.push(n.a.createElement("i",{key:t+1,className:"fas fa-exclamation-triangle"})),this.props.metar.wind_gust_kt&&this.props.metar.wind_gust_kt._text>30&&e.push(n.a.createElement("i",{key:t+2,className:"fas fa-exclamation-triangle"})),n.a.createElement("p",{id:this.props.metar.station_id,className:"icon is-small has-text-warning"},e)}}]),t}(n.a.Component),y=function(e){function t(){return Object(u.a)(this,t),Object(o.a)(this,Object(c.a)(t).apply(this,arguments))}return Object(p.a)(t,e),Object(m.a)(t,[{key:"render",value:function(){var e=null,t=[];if(this.props.selectedAirport){var a=this.props.selectedAirport.station_id._text;e=this.props.selectedAirport.raw_text._text;var r=this.props.airports[a].taf;r&&(t=r.raw_text._text.split(/(?=TEMPO|BECMG|FM|PROB)/))}else e="";return n.a.createElement("div",{className:"has-text-centered"},n.a.createElement("pre",null,n.a.createElement("p",null,e),n.a.createElement("p",null,t.join("\n"))))}}]),t}(n.a.Component),v=function(e){function t(e){var a;return Object(u.a)(this,t),(a=Object(o.a)(this,Object(c.a)(t).call(this,e))).metarAgeTime=function(){var e=Math.floor((a.state.currentTime-a.props.last_updated)/1e3);return Math.floor(e/60)+":"+Math.floor(e%60).toString().padStart(2,"0")},a.state={currentTime:(new Date).toLocaleString()},a}return Object(p.a)(t,e),Object(m.a)(t,[{key:"componentDidMount",value:function(){var e=this;setInterval((function(){e.setState({currentTime:new Date})}),1e3)}},{key:"render",value:function(){return n.a.createElement("div",{className:"tile is-ancenstor"},n.a.createElement("div",{className:"tile is-parent is-12 has-text-grey-lighter",style:{marginTop:"0px",paddingTop:"0px"}},n.a.createElement("div",{className:"tile is-child"},n.a.createElement("div",{className:"is-pulled-right"},this.metarAgeTime()," old"))))}}]),t}(n.a.Component),O=d,j=function(e){function t(){var e,a;Object(u.a)(this,t);for(var r=arguments.length,n=new Array(r),s=0;s<r;s++)n[s]=arguments[s];return(a=Object(o.a)(this,(e=Object(c.a)(t)).call.apply(e,[this].concat(n)))).componentDidMount=function(){console.log("Fetching logs")},a}return Object(p.a)(t,e),Object(m.a)(t,[{key:"render",value:function(){return n.a.createElement("div",null,n.a.createElement("pre",null,this.props.logLines.values))}}]),t}(n.a.Component),w=a(14),E=a(10),k=function e(t){var a=this;Object(u.a)(this,e),this.connect=function(){console.log("Opening WS to "+window.location.host),a.ws=new WebSocket("ws://"+window.location.host+"/metar.ws")},this.subscribe=function(){a.ws.onopen=function(){console.log("Connected"),a.messageTypes.forEach((function(e){a.ws.send(e)}))},a.ws.onmessage=function(e){a.handleMessage(JSON.parse(e.data))}},this.handleMessage=function(e){switch(e.type){case"metars":console.log("RX METAR"),a.App.setState({airports:e.payload,metars:e.payload.metars.airports,metarCount:e.payload.metars.airports.length,lastUpdated:e.payload.metars.lastUpdated});break;case"logs":console.log("RX LOG"),a.App.setState({logLines:e.payload});break;default:console.log("Unknown message type: "+JSON.stringify(e))}},this.App=t,this.messageTypes=["metars","logs"],this.connect()},A=function(e){function t(e){var a;return Object(u.a)(this,t),(a=Object(o.a)(this,Object(c.a)(t).call(this,e))).componentDidMount=function(){var e=new k(Object(l.a)(a));a.setState({ws:e,activeTab:"dashboard"}),e.subscribe()},a.isActive=function(e){if(e===a.state.activeTab)return"is-active"},a.makeActive=function(e){a.setState({activeTab:e})},a.render=function(){return n.a.createElement(w.a,null,n.a.createElement("div",{className:"tabs"},n.a.createElement("ul",null,n.a.createElement("li",{className:a.isActive("dashboard")},n.a.createElement(w.b,{onClick:function(){return a.makeActive("dashboard")},to:"/"},"Dashboard")),n.a.createElement("li",{className:a.isActive("logs")},n.a.createElement(w.b,{onClick:function(){return a.makeActive("logs")},to:"/logs"},"Logs")))),n.a.createElement(E.c,null,n.a.createElement(E.a,{exact:!0,path:"/",render:function(e){return n.a.createElement(O,{ws:a.state.ws,airports:a.state.airports,metars:a.state.metars,metarCount:a.state.metarCount,lastUpdated:a.state.lastUpdated})}}),n.a.createElement(E.a,{path:"/logs"},n.a.createElement(j,{logLines:a.state.logLines}))))},a.state={ws:null,airports:[],metars:[],metarCount:null,lastUpdated:null,logLines:[]},a}return Object(p.a)(t,e),t}(n.a.Component);i.a.render(n.a.createElement(A,null),document.getElementById("root"))}},[[24,1,2]]]);
//# sourceMappingURL=main.4e963743.chunk.js.map