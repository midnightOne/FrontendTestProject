PIXI.utils.sayHello();


/*
	MODEL simulates world and stores it's data
	VIEW shows graphical data for world, stored in MODEL
	CONTROLLER transfers data from/to MODEL and VIEW, and handles user input.
*/

//--------------------------------------------------------------------------------------
//                                                                                  	Basic shape data structure
//--------------------------------------------------------------------------------------

var ShapeObject = function (){
	this.x = 0;
	this.y = 0;
	this.dy = 0;
	this.shapeType = 1;
	this.points = [];
	this.color = 0xFFFFFF;
	this.linethickness = 1;
	this.lineColor = 0x000000;
	this.flaggedForRemoval=false;
};

//--------------------------------------------------------------------------------------
//                                                                                  	Custom Observer
//--------------------------------------------------------------------------------------


var MyEvent = function (sender) {
    this._sender = sender;
    this._listeners = [];
};

MyEvent.prototype = {

    attach: function (listener) {
        this._listeners.push(listener);
    },

    notify: function (args) {
        for (var i = 0; i < this._listeners.length; i += 1) {
            this._listeners[i](this._sender, args);
        }
    }

};


//--------------------------------------------------------------------------------------
//                                                                                  	MODEL
//--------------------------------------------------------------------------------------

var AppModel = function (){
	this.gravity = 0.5;
	this.shapesPerSec = 10;
	this.shapeInterval = 100;
	this.removedShapeFrame = false;
	this.shapeObjects = [];
	this.lastShapeSpawn = Date.now();

	this.shapeSpawnEvent = new MyEvent(this);
	this.shapeRemoveEvent = new MyEvent(this); // implemented - not used

	this.init();
};

AppModel.prototype = {

	init: function (fps=60) {
		//setInterval(() => {window.requestAnimationFrame(this.update.bind(this));}, 1000/fps) ; 	
		setInterval(this.update.bind(this), 1000/fps) ;
	},

	update: function () { // UPDATE shapes' positions and spawn new shapes

		this.generateShapes();
		this.updateShapes();
	},

	generateShapes: function(){
		var now = Date.now();
	    while(this.lastShapeSpawn < now){ // compare last shape generation timestamp to current time, add a shape along with interval, repeat until the demand is satisfied.
	    	this.addShape();
	    	this.lastShapeSpawn += this.shapeInterval;
	    }
	},



	 updateShapes: function() {
		for(var i=0;i<this.shapeObjects.length;i++){
			this.shapeObjects[i].dy += this.gravity/10; 			// increase the falling speed due to gravity
			this.shapeObjects[i].y += this.shapeObjects[i].dy;	// change position

			if(this.shapeObjects[i].y > 800){   			// remove the shape if it's below screen
				this.removeShape(this.shapeObjects[i],i);
				i--;
			}
		}
	},

	addShape: function(coords=null){
		var newShape = new ShapeObject();

		newShape.color = Math.random() * 0xFFFFFF;
		newShape.linethickness = Math.random() *10;
		newShape.lineColor = Math.random() * 0xFFFFFF;
		this.getRandomShape(newShape);
		

		if(coords == null){
			newShape.x = Math.random()*600;
			newShape.y = -100 + Math.random()*-200;
		} else {
			newShape.x = coords.x;
			newShape.y = coords.y-50;
		}
		
		newShape.dy = 0;
		this.shapeObjects.push(newShape);
		this.shapeSpawnEvent.notify(newShape);
		//console.log("MODEL: shape created");
	},

	getRandomShape: function(shape){
		shape.type = Math.round(3+Math.random()*6); // Shape type (number of points), 8 - circle, 9 - ellipse
		var positionsX = [];
		var positionsY = [];

		if(shape.type == 8){ 						// draw circle
			shape.radius = Math.random()*150;
			return;
		} else if (shape.type == 9){ 				// draw an ellipase
			shape.radius = Math.random()*150;
			shape.radius2 = Math.random()*150;
			return;
		}

		for (var i = 0; i < shape.type; i++) {		// check number of sides
			shape.points[i] = {x:Math.random()*150,y:Math.random()*150};
		}
	},



	removeShape: function(shape, inputIndex = -1){ // accept index as parameter to avoid doing .indexOf
		
		var index;
		if(inputIndex == -1){
			index = this.shapeObjects.indexOf(shape);
		} else {
			index = inputIndex;
		}
		shape.flaggedForRemoval = true;

		this.shapeObjects.splice(index,1);
		//console.log("MODEL: shape removed");
	}

};




//--------------------------------------------------------------------------------------
//                                                                                  	VIEW
//--------------------------------------------------------------------------------------


var AppView = function (model) {
    this.model = model;
	this.shapeCountLabel = document.getElementById("shapeCount-label");
	this.shapesArray = [];

	this.graphicShapeSpawnEvent = new MyEvent(this); // Custom Event for indirect communication with subscribers (controller(s))

    this.init();
};

AppView.prototype = {

    init: function () {
    	this.app = new PIXI.Application(800, 600, { antialias: true, transparent: true , forceCanvas:true});
    	document.getElementById('display').appendChild(this.app.view);
    	this.app.ticker.add(this.update.bind(this));

    	this.shapeSpawnEventHandler = this.shapeSpawn.bind(this);
    	this.shapeRemoveEventHandler = this.shapeRemove.bind(this);

    	this.model.shapeSpawnEvent.attach(this.shapeSpawnEventHandler);
    	this.model.shapeRemoveEvent.attach(this.shapeRemoveEventHandler);

    },

    update: function () {
    	
    	this.updateShapeGraphics();
    	this.updateShapeCount();
   		
    },

    // Update graphics' positions to match model
    updateShapeGraphics: function () {
    	for (var i = 0; i < this.shapesArray.length; i++) {
    		if(this.shapesArray[i].shapeData.flaggedForRemoval){
    			this.removeShapeAt(i);
    			i--;
    			continue;
    		}
    		this.shapesArray[i].x = this.shapesArray[i].shapeData.x;
    		this.shapesArray[i].y = this.shapesArray[i].shapeData.y;
    	}
    },


    updateShapeCount: function () {
    	this.shapeCountLabel.innerHTML = "Shapes onstage: " + this.shapesArray.length;
    },

    //Create graphic representation of a shape from model's data 
    shapeSpawn: function(model, shapeData){
    	var newShape = new PIXI.Graphics();
		newShape.beginFill(shapeData.color);
		newShape.lineStyle(shapeData.linethickness, shapeData.lineColor, 1);
		this.getShapeType(newShape, shapeData);
		
		newShape.endFill();

		newShape.x = shapeData.x;
		newShape.y = shapeData.y;

		
		newShape.dy = 0;
		//newShape.on('pointerdown', (e) => {removeShape(e.target); e.stopPropagation(); removedShapeFrame=true;});
		newShape.interactive = true;

		newShape.shapeData = shapeData;
		this.app.stage.addChild(newShape);
		this.shapesArray.push(newShape);

		this.graphicShapeSpawnEvent.notify(newShape); // Notify subscribers (controller) that the View created a new shape graphics object (so subscribers can add a listener to it if needed)

    	//console.log("VIEW: Shape created");
    },

    getShapeType: function(shapeGraphics, shapeData){
		var type = shapeData.type;

		if(type == 8){ 										// draw circle
			shapeGraphics.drawCircle( 0, 0,shapeData.radius);
			return;
		} else if (type == 9){ 								// draw an ellipase
			shapeGraphics.drawEllipse(0,0,shapeData.radius,shapeData.radius2);
			return;
		}

		shapeGraphics.moveTo(shapeData.points[0].x,shapeData.points[0].y); 		// first position
		for (var i = 1; i < shapeData.points.length; i++) {					// check number of sides
			shapeGraphics.lineTo(shapeData.points[i].x,shapeData.points[i].y); 	// drawing jagged lines using random coordinates, 
		}
		shapeGraphics.lineTo(shapeData.points[0].x,shapeData.points[0].y); 		// last is the same as first for closed loop

		//graphics.drawRect(0, 0, 100, 100);

		/*
		graphics.moveTo(210,300);
		graphics.quadraticCurveTo(600, 0, 480,100);
		graphics.lineTo(210,300);*/
	},

	removeShapeAt: function(index){
		this.shapesArray[index].shapeData = null;
		this.app.stage.removeChild(this.shapesArray[index]);
		this.shapesArray[index].removeAllListeners();
		this.shapesArray.splice(index,1);
	},

    shapeRemove: function(model, shape){
    	//console.log("VIEW: Shape removed");

    	//We can use this function, but setting a flag and reading it in the same for-loop as the coordinates update is faster.
    }


};


//--------------------------------------------------------------------------------------
//                                                                                  	CONTROLLER
//--------------------------------------------------------------------------------------


var AppController = function (model, view) {
    this.model = model;
    this.view = view;
    this.removedShapeFrame = false;

    this.init();
};


AppController.prototype ={

	init: function () {
		this.gravityInput = document.getElementById("gravity-input");
		this.generationSpeedInput = document.getElementById("generationSpeed-input");
		this.gravityInput.addEventListener("input", this.updateGravity);
		this.generationSpeedInput.addEventListener("input", this.updateGenerationSpeed);
		document.getElementById('display').addEventListener("click", (e) => {this.getClickPosition(e,this);}, false); 
		document.getElementById('gravity-').addEventListener("click", (e) => {this.buttonsHandler(e,this);}, false); 
		document.getElementById('gravity+').addEventListener("click", (e) => {this.buttonsHandler(e,this);}, false); 
		document.getElementById('genSpeed-').addEventListener("click", (e) => {this.buttonsHandler(e,this);}, false); 
		document.getElementById('genSpeed+').addEventListener("click", (e) => {this.buttonsHandler(e,this);}, false); 

		this.graphicShapeSpawnEventHandler = this.shapeSpawnInteractivity.bind(this);

    	this.view.graphicShapeSpawnEvent.attach(this.graphicShapeSpawnEventHandler);
    },

    shapeSpawnInteractivity: function(view,shapeGraphic){

		shapeGraphic.on('pointerdown', (e) => {this.removeShape(e.target); e.stopPropagation(); this.removedShapeFrame=true;});
    },

    removeShape: function(shape){
    	this.model.removeShape(shape.shapeData);

	},

    buttonsHandler: function(e,that){
    	switch (e.target.id){
    		case "gravity-":
    			that.updateGravity(-0.1);
			    break;
			case "gravity+":
				that.updateGravity(0.1);
			    break;
			case "genSpeed-":
				that.updateGenerationSpeed(-1);
			    break;
			case "genSpeed+":
				that.updateGenerationSpeed(1);
			    break;

    	}
    },

    getClickPosition: function(e,that) {
		if(this.removedShapeFrame){ // We have two even listeners: one from pixijs and one on DOM, stopPropagation from one doesn't stop the other.
			this.removedShapeFrame = false;
			return;
		}

	    var xPosition = e.clientX;
	    var yPosition = e.clientY;
	    console.log("Click: " + xPosition + "," + yPosition);
	    that.model.addShape({x: xPosition, y: yPosition-50});
	},

	updateGravity: function(add=0){ // 
		if(add != 0){
			this.gravityInput.value = this.model.gravity = parseFloat(this.gravityInput.value) + add;
		} else {
			this.model.gravity = parseFloat(this.gravityInput.value);
		}
		
	},

	updateGenerationSpeed: function(add=0){
		var shapesPerSec = parseInt(this.generationSpeedInput.value);
		if(shapesPerSec != shapesPerSec){
			return; // shapesPerSec isNaN 
		}
		if(add != 0){
			shapesPerSec += add;
			this.generationSpeedInput.value = shapesPerSec;
		}

		this.model.shapesPerSec = shapesPerSec;
		this.model.shapeInterval = 1000/shapesPerSec;
	}

};

//--------------------------------------------------------------------------------------
//                                                                                  	ENTRY POINT
//--------------------------------------------------------------------------------------



(function () {
     var model = new AppModel(),
         view = new AppView(model),
         controller = new AppController(model, view);
 }());

