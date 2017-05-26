PIXI.utils.sayHello();

var app = new PIXI.Application(800, 600, { antialias: true, transparent: true , forceCanvas:true});
var shapesArray = [];
var graphics = new PIXI.Graphics();
var gravityInput;
var generationSpeedInput;
var shapeCountLabel;
var gravity = 0.5;
var shapesPerSec = 1;
var shapeInterval = 1000;
var removedShapeFrame = false;

var lastShapeSpawn = Date.now();

window.onload = setup;

function update(){
	
	var now = Date.now();
    //var dt = now - lastShapeSpawn;
    //lastShapeSpawn = now;

    while(lastShapeSpawn < now){
    	addShape();
    	lastShapeSpawn += shapeInterval;
    }

	/*for(var i=0;i<ggg;i++){
		addShape();
	}*/

	updateShapes() ;
	
    //graphics.x += 0.1;
   graphics.rotation += 0.01;
   //document.getElementById('gravity-input').text = alphaRatio(app);
   shapeCountLabel.innerHTML = "Shapes onstage: " + shapesArray.length;
}
app.ticker.add(update);

function getClickPosition(e) {
	if(removedShapeFrame){ // У нас два слушателя событий, от pixijs и на элементе DOM, stopPropagation с первого не сработает.
		removedShapeFrame = false;
		return;
	}

    var xPosition = e.clientX;
    var yPosition = e.clientY;
    console.log("Click: " + xPosition + "," + yPosition);
    addShape({x: xPosition, y: yPosition});
}

function updateGravity(){
	gravity = parseFloat(gravityInput.value);
}

function updateGenerationSpeed(){
	//generationSpeedInput.value = generationSpeedInput.value.replace(/[^0-9.]/g, '');
	shapesPerSec = parseInt(generationSpeedInput.value);
	if(shapesPerSec != shapesPerSec){
		return; // shapesPerSec isNaN
	}
	shapeInterval = 1000/shapesPerSec;
}


function setup(){
	console.log("Main setup...");
	gravityInput = document.getElementById("gravity-input");
	generationSpeedInput = document.getElementById("generationSpeed-input");
	shapeCountLabel = document.getElementById("shapeCount-label");

	
	gravityInput.oninput = updateGravity;
	generationSpeedInput.oninput = updateGenerationSpeed;

	document.getElementById('display').appendChild(app.view);

	//app.stage.interactive = true;
	//app.stage.on('pointertap', onClick);
	document.getElementById('display').addEventListener("click", getClickPosition, false); // Отдельный слушатель для вычисления координат клика (stage на прозрачном канвасе не получает событий, а нам нужен прозрачный канвас чтоб считать площадь непрозрачных пикселей)

	// set a fill and line style
	graphics.beginFill(0xFF3300);
	graphics.lineStyle(10, 0xffd900, 1);
	// draw a shape
	graphics.moveTo(50,50);
	graphics.lineTo(250, 50);
	graphics.lineTo(100, 100);
	graphics.lineTo(250, 220);
	graphics.lineTo(50, 220);
	graphics.lineTo(50, 50);
	graphics.endFill();
	//graphics.anchor.set(0.5);
	graphics.x = 200;
	graphics.y = 200;

	app.stage.addChild(graphics);

	console.log("Stage parent is: " + app.stage.parent);

	//app.ticker.add(update);

}




function addShape(coords=null){
	var newShape = new PIXI.Graphics();
	newShape.beginFill(0xFF3300);
	newShape.lineStyle(10, 0xffd900, 1);
	newShape.drawRect(0, 0, 100, 100);
	newShape.endFill();

	if(coords == null){
		newShape.x = Math.random()*600;
		newShape.y = -50 + Math.random()*-200;
	} else {
		newShape.x = coords.x;
		newShape.y = coords.y-50;
	}
	
	newShape.dy = 0;
	//newShape.index = shapesArray.length; 		// Сохраняем индекс, чтоб при удалении не делать поиск.
	newShape.on('pointerdown', (e) => {removeShape(e.target); e.stopPropagation();});
	newShape.interactive = true;

	app.stage.addChild(newShape);
	shapesArray.push(newShape);
}

function updateShapes() {
	for(var i=0;i<shapesArray.length;i++){
		shapesArray[i].dy += gravity; 			// увеличиваем скорость падения
		shapesArray[i].y += shapesArray[i].dy;	// меняем позицию

		if(shapesArray[i].y > 800){
			app.stage.removeChild(shapesArray[i]);
			shapesArray.splice(i,1);
		}
	}
}

function removeShape(shape){
	console.log("removing shape");
	removedShapeFrame=true;
	var index = shapesArray.indexOf(shape);

	app.stage.removeChild(shapesArray[index]);
	shapesArray[index].removeAllListeners();
	shapesArray.splice(index,1);
}

function onClick(e) {
	console.log(e);
	addShape();
}






/*
PIXI.loader.load(setup);

function setup(){
	
	renderer.render(stage);
}*/


