var canvas;
var context;
var label;

/*
I made pixel area counter into a separate "component" since it is more reusable that way.
*/

function setupCounter(){
	console.log("Area Counter initializing...");
	setInterval(update, 100) ; 						// No need to update > 10 times/sec
	label = document.getElementById("area-label");
	window.removeEventListener("load", setupCounter);
}

function checkForCanvas(){
	var canvases = document.getElementsByTagName("canvas"); // Look for canvases until atleast one is found

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
			var temp = alphaRatio(context);
			if(label){
				label.innerHTML = "Area occupied: " + temp.area + "px^2 ( " + temp.ratio + "% )";
			}else {
				console.log("Area occupied: " + temp.area + "px^2 ( " + temp.ratio + "% )"); // alternative - no additional html elements needed
			}
			
		} else {
			console.log("2D Context is not found.")
		}
		
	}
}

// Here we count the number of opaque pixels (only context2d)
function alphaRatio(ctx) {
  var alphaPixels = 0;

  var data = ctx.getImageData(0,0, ctx.canvas.width,ctx.canvas.height).data;
  for(var i=3; i<data.length; i+=4) {
    if(data[i] > 0) alphaPixels++;
  }

  return { area: alphaPixels, ratio: Math.round((alphaPixels / (ctx.canvas.width * ctx.canvas.height))*100)};
}

window.addEventListener("load", setupCounter); // we can only have one 'onload'

