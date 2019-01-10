(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{120:function(t,e,n){t.exports={overlayCanvas:"_1VTjcrIdjUewwZ-qVkXQxP",videoimage:"_27P8rrrUDhjUTuQVCNHvHs"}},254:function(t,e,n){t.exports=n(777)},259:function(t,e,n){},264:function(t,e){},266:function(t,e){},298:function(t,e){},299:function(t,e){},777:function(t,e,n){"use strict";n.r(e);var a=n(12),s=n.n(a),i=n(252),o=n.n(i),r=(n(259),n(41)),c=n(42),u=n(44),h=n(43),l=n(45),v=n(34),p=n(71),d=n(253),f=n.n(d),y=n(37),m=n.n(y),g=n(72),w=(n(770),function(t,e,n){var a=t.getContext("2d");a.fillStyle=n||"#0ff",a.fillRect(e.x,e.y,4,4)}),b=function(t){function e(t){var n;return Object(r.a)(this,e),(n=Object(u.a)(this,Object(h.a)(e).call(this,t))).canvas=null,n.pointlog=null,n.net=new v.FaceLandmark68TinyNet,n.state={faceDetect:{}},n}return Object(l.a)(e,t),Object(c.a)(e,[{key:"componentDidMount",value:function(){var t=Object(g.a)(m.a.mark(function t(){var e=this;return m.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,v.nets.tinyFaceDetector.load("models/face/");case 2:return t.next=4,v.loadFaceLandmarkModel("models/face/");case 4:console.log("load models"),setInterval(Object(g.a)(m.a.mark(function t(){return m.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,e.predict();case 2:case"end":return t.stop()}},t,this)})),this.props.interval);case 6:case"end":return t.stop()}},t,this)}));return function(){return t.apply(this,arguments)}}()},{key:"predict",value:function(){var t=Object(g.a)(m.a.mark(function t(){var e,n;return m.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:if(this.props.canvas){t.next=2;break}return t.abrupt("return");case 2:return 128,.5,e=new v.TinyFaceDetectorOptions({inputSize:128,scoreThreshold:.5}),t.next=7,v.detectSingleFace(this.props.video,e).withFaceLandmarks();case 7:(n=t.sent)&&(this.setState({faceDetect:n}),this.props.result(n));case 9:case"end":return t.stop()}},t,this)}));return function(){return t.apply(this,arguments)}}()},{key:"render",value:function(){return s.a.createElement("div",null)}}]),e}(a.Component),k=n(120),x=n.n(k),O={width:640,height:480},j=Math.floor(1e3/30),M=38,C=44,E=function(t){function e(t){var n;return Object(r.a)(this,e),(n=Object(u.a)(this,Object(h.a)(e).call(this,t))).media=null,n.selfRef=null,n}return Object(l.a)(e,t),Object(c.a)(e,[{key:"componentDidMount",value:function(){var t=Object(g.a)(m.a.mark(function t(){return m.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,this.initCam();case 2:console.log("detect init");case 3:case"end":return t.stop()}},t,this)}));return function(){return t.apply(this,arguments)}}()},{key:"initCam",value:function(){var t=Object(g.a)(m.a.mark(function t(){var e,n=this;return m.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return this.media=navigator.mediaDevices.getUserMedia({audio:!1,video:{facingMode:"environment",width:this.props.size.width}}),e=new Promise(function(t){n.media.then(function(e){n.selfRef.srcObject=e,n.selfRef.onloadedmetadata=function(e){console.log("Onload video",e),t()}}),n.media.catch(function(t){alert(t)})}),t.abrupt("return",e);case 3:case"end":return t.stop()}},t,this)}));return function(){return t.apply(this,arguments)}}()},{key:"render",value:function(){var t=this;return s.a.createElement("video",{ref:function(e){t.selfRef=e,t.props.setSelf(e)},className:"video",autoPlay:!0,playsInline:!0,width:O.width,height:O.height})}}]),e}(a.Component),P=function(t){function e(t){var n;return Object(r.a)(this,e),(n=Object(u.a)(this,Object(h.a)(e).call(this,t))).canvas=null,n}return Object(l.a)(e,t),Object(c.a)(e,[{key:"componentDidMount",value:function(){var t=this;setInterval(function(){t.draw()},this.props.interval)}},{key:"draw",value:function(){if(this.props.video&&this.props.canvas){this.props.video.getBoundingClientRect();var t=this.canvas.getContext("2d");this.canvas.width=this.props.size.width,this.canvas.height=this.props.size.height,t.drawImage(this.props.video,0,0,this.props.size.width,this.props.size.height)}}},{key:"render",value:function(){var t=this;return s.a.createElement("canvas",{ref:function(e){t.canvas=e,t.props.set(e)},id:"canvas",className:"canvas"})}}]),e}(a.Component),S=function(t){function e(t){var n;return Object(r.a)(this,e),(n=Object(u.a)(this,Object(h.a)(e).call(this,t))).state={video:null,canvas:null},n}return Object(l.a)(e,t),Object(c.a)(e,[{key:"setVideo",value:function(t){this.state.video!==t&&t&&(this.setState({video:t}),this.props.video(t))}},{key:"setCanvas",value:function(t){this.state.canvas!==t&&t&&(this.setState({canvas:t}),this.props.canvas(t))}},{key:"render",value:function(){var t=this;return s.a.createElement("div",{className:x.a.videoimage},s.a.createElement(E,{size:this.props.size,setSelf:function(e){t.setVideo(e)}}),s.a.createElement(P,{size:this.props.size,video:this.state.video,set:function(e){t.setCanvas(e)},interval:this.props.interval}))}}]),e}(a.Component),I=function(t,e){return{x:(e.x-t.x).toFixed(2),y:(e.y-t.y).toFixed(2)}},R=function(t){return Math.sqrt(t.x*t.x+t.y*t.y)},z=function(t,e){return t.x*e.x+t.y*e.y},D=function(t,e){return t.x*e.y-e.x*t.y},F=function(t,e){return Math.sqrt(Math.pow(t.x-e.x,2)+Math.pow(t.y-e.y,2))},B=(n(776),function(t){function e(t){var n;return Object(r.a)(this,e),(n=Object(u.a)(this,Object(h.a)(e).call(this,t))).state={done:!1,progress:0,images:[]},p.map(t.assets,function(t){n.loadImage(t)}),n}return Object(l.a)(e,t),Object(c.a)(e,[{key:"loadImage",value:function(t){var e=this,n=new Image;n.onload=function(a){var s=e.state.images;s.push({id:t.id,image:n,type:"image"}),e.setState({progress:e.state.progress+1,images:s}),e.props.assets.length==e.state.progress&&(e.props.setImages(e.state.images),e.setState({done:!0}))},n.src=t.src}},{key:"show",value:function(){return this.state.done?s.a.createElement("div",null,this.props.children):null}},{key:"render",value:function(){return s.a.createElement(s.a.Fragment,null,this.show())}}]),e}(a.Component)),N=M,T=C,V=function(t){function e(t){var n;return Object(r.a)(this,e),(n=Object(u.a)(this,Object(h.a)(e).call(this,t))).assets=[{id:1,src:"/images/glasses_01.png",type:"image"}],n.state={video:null,canvas:null,overlay:null,result:null,landmarks:null,positions:null,assets:[]},n.overlay=null,n}return Object(l.a)(e,t),Object(c.a)(e,[{key:"setCanvas",value:function(t){this.state.canvas!==t&&t&&this.setState({canvas:t})}},{key:"setVideo",value:function(t){this.state.video!==t&&t&&(this.setState({video:t}),console.log("setVideo "))}},{key:"setOverlay",value:function(t){this.state.overlay!==t&&t&&(this.setState({overlay:t}),this.initCanvas(),console.log("setOverlay "))}},{key:"initCanvas",value:function(){this.state.canvas&&this.state.overlay&&this.setState({width:O.width,height:O.height})}},{key:"render",value:function(){var t=this;return s.a.createElement("div",{className:"App"},s.a.createElement(S,{size:O,interval:j,video:function(e){t.setVideo(e)},canvas:function(e){t.setCanvas(e)}}),s.a.createElement(b,{canvas:this.state.canvas,video:this.state.video,interval:j,result:function(e){var n=v.getMediaDimensions(t.state.video),a=n.width,s=n.height,i=[e].map(function(t){return t.forSize(a,s)}),o=function(t){var e=t.getJawOutline();return{nose:t.getNose(),mouth:t.getMouth(),leftEye:t.getLeftEye(),rightEye:t.getRightEye(),leftEyeBrow:t.getLeftEyeBrow(),rightEyeBrow:t.getRightEyeBrow(),jawOutline:e}}(i[0].faceLandmarks);t.setState({landmarks:o,positions:i[0].landmarks.positions})}}),s.a.createElement(B,{assets:this.assets,setImages:function(e){t.setState({assets:e})}},s.a.createElement(L,{video:this.state.video,landmarks:this.state.landmarks,positions:this.state.positions,showEyes:!0,showPoints:!1,setRef:function(e){t.setOverlay(e)},assets:this.state.assets})))}}]),e}(a.Component),L=function(t){function e(t){var n;return Object(r.a)(this,e),(n=Object(u.a)(this,Object(h.a)(e).call(this,t))).canvas=null,n.tilt=null,n.state={points:[],tilt:null},n}return Object(l.a)(e,t),Object(c.a)(e,[{key:"componentWillReceiveProps",value:function(t){var e=this;t.landmarks&&(this.clearCanvas(),this.detectTilt(t.positions[T],t.positions[N]),this.props.showEyes&&this.drawPoints(),this.props.showPoints&&this.drawParts(),this.state.points.length&&p.each(this.state.points,function(n,a){e.initPointRate(n,a,t.positions[N],t.positions[T]),e.setPoint(n,a,t.positions[N],t.positions[T])}))}},{key:"setCanvas",value:function(t){this.canvas=t,this.props.setRef(t)}},{key:"detectTilt",value:function(t,e){var n,a=I(t,e),s=D(a,{x:100,y:0}),i=Math.acos((n=a).x/R(n)),o=i*(180/Math.PI);this.tilt=s<0?i:-o*(Math.PI/180)}},{key:"setPoint",value:function(t,e,n,a){var s={x:0,y:0},i=I(n,a),o=R(i),r=F(s,i),c=r*t.rate.dot,u=s.x+i.x/o*c+n.x,h=s.y+i.y/o*c+n.y,l=r*t.rate.cross,v=(t.bool.cross?270:90)*Math.PI/180,p={x:l*Math.cos(v)+u,y:l*Math.sin(v)+h};if(this.props.assets[0].image){var d=this.props.assets[0].image,f=p.x-d.width/2,y=p.y-d.height/2;!function(t,e,n,a){var s=t.getContext("2d");s.save();var i=n,o=e.x+a.width/2,r=e.y+a.height/2;s.setTransform(Math.cos(i),Math.sin(i),-Math.sin(i),Math.cos(i),o-o*Math.cos(i)+r*Math.sin(i),r-o*Math.sin(i)-r*Math.cos(i)),s.drawImage(a,e.x,e.y),s.restore()}(this.canvas,{x:f,y:y},this.tilt,d)}w(this.canvas,{x:p.x,y:p.y},"rgba(255,255,255)")}},{key:"initPointRate",value:function(t,e,n,a){if(!t.rate){var s={x:0,y:0},i=I(n,a),o=I(n,t.vector),r=D(i,o),c=Math.abs(r/F(s,i)),u=z(i,o),h=function(t,e){var n=R(t),a=R(e);return Math.cos(z(t,e)/(n*a))}(i,o),l=f.a.acos(h)*R(o),v=F(s,i),p=l/v,d=c/v,y=this.state.points;y[e].bool={dot:!(u<0),cross:r<0},y[e].rate={dot:u<0?-p:p,cross:d},this.setState({points:y})}}},{key:"clearCanvas",value:function(){this.canvas.getContext("2d").clearRect(0,0,O.width,O.height)}},{key:"drawPoints",value:function(){var t=this,e=0;p.each(this.props.positions,function(n){e==N&&w(t.canvas,{x:n.x,y:n.y},"rgba(255,0,0)"),e==T&&w(t.canvas,{x:n.x,y:n.y},"rgba(0,255,0)"),e++})}},{key:"drawParts",value:function(){var t=this,e=this.props.landmarks,n=0,a=0,s=Math.floor(25.5);p.each(e,function(e,i){n++,a=0,e.map(function(e){a++,w(t.canvas,{x:e.x,y:e.y},function(t,e){return["rgb(255,".concat(e,",").concat(e,")"),"rgb(".concat(e,",255,").concat(e,")"),"rgb(".concat(e,",").concat(e,",255)"),"rgb(255,255,".concat(e,")"),"rgb(".concat(e,",255,255)"),"rgb(255,".concat(e,",255)"),"rgb(".concat(e,",").concat(e,",").concat(e,")")][t]}(n,a*s))})})}},{key:"addPoint",value:function(t){var e=this.canvas.getBoundingClientRect(),n=t.clientX-e.left,a=t.clientY-e.top,s=this.state.points;s.push({vector:{x:n,y:a},rate:null}),this.setState({points:s}),console.log("points ",s)}},{key:"render",value:function(){var t=this;return s.a.createElement("canvas",{ref:function(e){t.setCanvas(e)},width:O.width,height:O.height,className:x.a.overlayCanvas,onClick:function(e){t.addPoint(e)}})}}]),e}(a.Component);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));o.a.render(s.a.createElement(V,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(t){t.unregister()})}},[[254,2,1]]]);
//# sourceMappingURL=main.c89f9a77.chunk.js.map