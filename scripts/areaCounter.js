var canvas;
var context;
var label;

function setupCounter(){
	console.log("Area Counter initializing...");
	setInterval(update, 100) ; 						// Незачем обновлять чаще, чем 10 раз в секунду
	label = document.getElementById("area-label");
	window.removeEventListener("load", setupCounter);
}

function checkForCanvas(){
	var canvases = document.getElementsByTagName("canvas");

	if(canvases.length > 0){
		console.log("Canvas found");
		canvas = canvases[0];
		context = canvas.getContext('2d');
	} else {
		console.log("Canvas NOT found");
	}
}

function update(){
	if(canvas == null){
		checkForCanvas();
	} else {
		if(context != null){
			var temp = alphaRatio(context)
			label.innerHTML = "Area occupied: " + temp.area + "px^2 ( " + temp.ratio + "% )";
		} else {

		}
		
	}
}

// Считаем количество непрозрачных пикселей (только контекст2д)
function alphaRatio(ctx) {
  var alphaPixels = 0;

  var data = ctx.getImageData(0,0, ctx.canvas.width,ctx.canvas.height).data;
  for(var i=3; i<data.length; i+=4) {
    if(data[i] > 0) alphaPixels++;
  }

  return { area: alphaPixels, ratio: Math.round((alphaPixels / (ctx.canvas.width * ctx.canvas.height))*100)};
}

window.addEventListener("load", setupCounter);

//window.onload = setupCounter;
