PIXI.utils.sayHello();

var app = new PIXI.Application(800, 600, { antialias: true, transparent: true , forceCanvas:true});
var shapesArray = [];
var gravityInput;
var generationSpeedInput;
var shapeCountLabel;
var gravity = 0.5;
var shapesPerSec = 10;
var shapeInterval = 100;
var removedShapeFrame = false;
var lastShapeSpawn = Date.now();

window.onload = setup;
app.ticker.add(update);

//------------------------------------------------------------------------------------------------------
// WARNING: NOT MVC for now.
//------------------------------------------------------------------------------------------------------
// Updates

function update(){	

	generateShapes();
	updateShapes() ;
	
   shapeCountLabel.innerHTML = "Shapes onstage: " + shapesArray.length;
}

function generateShapes(){
	var now = Date.now();
    while(lastShapeSpawn < now){ // compare last shape generation timestamp to current time, add a shape along with interval, repeat until the demand is satisfied.
    	addShape();
    	lastShapeSpawn += shapeInterval;
    }
}



function updateShapes() {
	for(var i=0;i<shapesArray.length;i++){
		shapesArray[i].dy += gravity; 			// increase the falling speed due to gravity
		shapesArray[i].y += shapesArray[i].dy;	// change position

		if(shapesArray[i].y > 800){   			// remove the shape if it's below screen
			app.stage.removeChild(shapesArray[i]);
			shapesArray.splice(i,1);
			removeShape(shapesArray[i],i);
			i--;
		}
	}
}


function updateGravity(){
	gravity = parseFloat(gravityInput.value);
}

function updateGenerationSpeed(){
	shapesPerSec = parseInt(generationSpeedInput.value);
	if(shapesPerSec != shapesPerSec){
		return; // shapesPerSec isNaN 
	}
	shapeInterval = 1000/shapesPerSec;
}

//------------------------------------------------------------------------------------------------------
// Setup

function setup(){
	console.log("Main setup...");
	gravityInput = document.getElementById("gravity-input");
	generationSpeedInput = document.getElementById("generationSpeed-input");
	shapeCountLabel = document.getElementById("shapeCount-label");

	
	gravityInput.oninput = updateGravity;
	generationSpeedInput.oninput = updateGenerationSpeed;

	document.getElementById('display').appendChild(app.view);

	// Separate listener for getting coordinates of click if it happened on transparent part of canvas (stage doesn't receive pointer events whick happened on a transparent portion of canvas, however we rely on it's transparency for area calculations)
	document.getElementById('display').addEventListener("click", getClickPosition, false); 

	console.log("Stage parent is: " + app.stage.parent);

	//app.ticker.add(update);

}

function getClickPosition(e) {
	if(removedShapeFrame){ // We have two even listeners: one from pixijs and one on DOM, stopPropagation from one doesn't stop the other.
		removedShapeFrame = false;
		return;
	}

    var xPosition = e.clientX;
    var yPosition = e.clientY;
    console.log("Click: " + xPosition + "," + yPosition);
    addShape({x: xPosition, y: yPosition});
}



//------------------------------------------------------------------------------------------------------
// Shapes

function addShape(coords=null){
	var newShape = new PIXI.Graphics();
	newShape.beginFill(Math.random() * 0xFFFFFF);
	newShape.lineStyle(Math.random() *10, Math.random() * 0xFFFFFF, 1);
	getRandomShape(newShape);
	
	newShape.endFill();

	if(coords == null){
		newShape.x = Math.random()*600;
		newShape.y = -50 + Math.random()*-200;
	} else {
		newShape.x = coords.x;
		newShape.y = coords.y-50;
	}
	
	newShape.dy = 0;
	newShape.on('pointerdown', (e) => {removeShape(e.target); e.stopPropagation(); removedShapeFrame=true;});
	newShape.interactive = true;

	app.stage.addChild(newShape);
	shapesArray.push(newShape);
}

function getRandomShape(graphics){
	var rand = Math.round(3+Math.random()*6); // Shape type (number of points), 8 - circle, 9 - ellipse
	var positionsX = [];
	var positionsY = [];

	if(rand == 8){ 										// draw circle
		graphics.drawCircle( 0, 0,Math.random()*150);
		return;
	} else if (rand == 9){ 								// draw an ellipase
		graphics.drawEllipse(0,0,Math.random()*150,Math.random()*150);
		return;
	}

	while(positionsX.length < 6){ // populating random points arrays
		positionsX.push(Math.random()*150);
		positionsY.push(Math.random()*150);
	}

	graphics.moveTo(positionsX[0],positionsY[0]); 		// first position
	for (var i = 1; i < rand; i++) {					// check number of sides
		graphics.lineTo(positionsX[i],positionsY[i]); 	// drawing jagged lines using random coordinates, 
	}
	graphics.lineTo(positionsX[0], positionsY[0]); 		// last is the same as first for closed loop


	//graphics.drawRect(0, 0, 100, 100);
}



function removeShape(shape, inputIndex = -1){ // accept index as parameter to avoid doing .indexOf
	console.log("removing shape");
	var index;
	if(inputIndex == -1){
		index = shapesArray.indexOf(shape);
	} else {
		index = inputIndex;
	}

	app.stage.removeChild(shapesArray[index]);
	shapesArray[index].removeAllListeners();
	shapesArray.splice(index,1);
}


