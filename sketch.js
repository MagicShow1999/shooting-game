// variable to hold a reference to our A-Frame world
let world,gun,box;
const bullets = [];
const enemies = [];
const types = [Box,Sphere,Dodecahedron,Octahedron,Tetrahedron,TorusKnot,Torus];
let pistolSound, leftArrow, rightArrow;
let heartImg;
let health;

function preload(){
	pistolSound = loadSound("assets/sounds/pistol.mp3");
	
}
function setup() {
	// no canvas needed
	noCanvas();
	// construct the A-Frame world
	// this function requires a reference to the ID of the 'a-scene' tag in our HTML document
	world = new World('VRScene');
	world.setGazeControls();
	const ground = new Plane({
		x: 0, y:0, z:0, width:100, height:100, asset:'ground', rotationX:-90, repeatX:100, repeatY:100
	});
	gun = new OBJ({
		asset: 'gun_obj',
		mtl: 'gun_mtl',
		x: world.camera.x + 0.1,
		y: world.camera.y - 0.3,
		z: world.camera.z,
		rotationX:0,
		rotationY:180,
		scaleX:0.05,
		scaleY:0.05,
		scaleZ:0.05,
	});
	box = new Container3D({
		x:0, y:3.8, z:4,
		width:1, height: 1, depth: 1,
		red:random(255), green:random(255), blue:random(255)
	});
	centerCone = new Cone({
		x: world.camera.x + 0.1, y:world.camera.y - 0.3, z:world.camera.z,
		height:1,
		radiusBottom: 1, radiusTop: 1,
		red:0, green:0, blue:0,
		clickFunction: function(theBox) {
			// update color
			theBox.setColor( random(255), random(255), random(255) );

			// or hide it!
			//theBox.hide();

			// move the user toward this box over a 2 second period
			// (time is expressed in milliseconds)
			world.slideToObject( theBox, 2000 );
		}
	});
	rightCone = new Cone({
		x:10, y:1, z:-10,
		height:1,
		radiusBottom: 1, radiusTop: 1,
		red:0, green:0, blue:0,
		clickFunction: function(theBox) {

			// or hide it!
			//theBox.hide();

			// move the user toward this box over a 2 second period
			// (time is expressed in milliseconds)
			world.slideToObject( theBox, 2000 );
		}
	});
	leftCone = new Cone({
		x:-10, y:1, z:-10,
		height:1,
		radiusBottom: 1, radiusTop: 1,
		red:0, green:0, blue:0,
		clickFunction: function(theBox) {

			// or hide it!
			//theBox.hide();

			// move the user toward this box over a 2 second period
			// (time is expressed in milliseconds)
			world.slideToObject( theBox, 2000 );
		}
	})
	createEnemies();
	//box.hide();
	//world.add(box);
	world.add(gun);
	gun.addChild(box);
	world.add(ground);
	world.add(rightCone);
	world.add(leftCone);
	world.add(centerCone);

	// create health bar
	health = new Health();
}

function draw() {
	gun.setPosition(world.camera.x,world.camera.y - 0.3,world.camera.z);
	gun.rotateY(world.camera.rotationY + 180);
	gun.rotateX(-world.camera.rotationX);
	for(let i = 0; i < bullets.length; i++){
		bullets[i].move();
		const pos = bullets[i].bullet.getWorldPosition();
		// console.log(pos);
		for(let j = 0; j < enemies.length; j++){
			const enemyPos = enemies[j].getWorldPosition();
			if(dist(pos,enemyPos) < 1){
				world.remove(bullets[i].myContainer);

				world.remove(enemies[j]);
				bullets.splice(i, 1);
				i--;
				enemies.splice(j,1);
				j--;
				break;
			}
		}
		// get current position of the player
		const playerPos = world.getUserPosition();
		if (dist(pos, playerPos) < 3) {
			world.remove(bullets[i].myContainer);
			bullets.splice(i, 1);
			i--;
			continue;
		}
	}
	for(let i = 0; i < enemies.length; i++){
		enemies[i].move();
	}
}



function mousePressed(){
	pistolSound.play();
	const temp = new Bullet();
	// don't know why but it seems that this function is run 3 times each time i click on mouse
	console.log(temp);
	bullets.push( temp );
	console.log(bullets.length);
}

/* Get random values between min and max. Copied from mozilla */
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
/* Distance checker that returns the distance of two position objects */
function getDistance(objPos, objTwoPos) {
	return dist(objPos.x, objPos.y, objPos.z, objTwoPos.x, objTwoPos.y, objTwoPos.z);
}

/* function to create enemy objects */
function createEnemies(){
	const number = -80;
	// currently i just choose Box as default placeholder for enemy object
	// spawn enemies
	for(let i = 0; i < 5; i ++){
		enemies.push(new Enemy(100, 0.3));
	}
	
}


class Bullet{
	constructor() {
		const boxPosition = box.getWorldPosition();
		this.myContainer = new Container3D({
			x: boxPosition.x,
			y: boxPosition.y,
			z: boxPosition.z,
			rotationX: gun.getRotationX(),
			rotationY: gun.getRotationY(),
			rotationZ: gun.getRotationZ()
		});
		world.add(this.myContainer);
		this.bullet = new OBJ({
			asset: 'bullet_obj',
			mtl: 'bullet_mtl',
			x:0,
			y:0,
			z:0,
			scaleX:0.01,
			scaleY:0.01,
			scaleZ:0.01,
		});
		this.myContainer.addChild(this.bullet);
	}
	move() {
		// make the speed faster so its' more real
		this.bullet.nudge(0,0,0.2);
	}

}

// enemy class
class Enemy{
	constructor(hp,speed){
		this.hp = hp;
		
		this.speed = speed;
		// i set the negative number as a variable to make the expression look more
		// understandable
		const number = -80;
		const obj = new Box({
			x:0, y:1, z:2,
			width:1, height: 1, depth: 1,
			red:random(255), green:random(255), blue:random(255)
		});
		world.add(obj);
		enemies.push(obj);
		this.obj = obj;
	}
	move(){
		this.obj.nudge(0,0-this.speed);
	}
	checkCollision(collider){

	}
}

// health system. default has 5 hearts
class Health {
	constructor(){
		this.health = 5;
		this.healthUI = new Container3D({
			x: world.camera.x + 0.1,
			y: world.camera.y - 0.3,
			z: world.camera.z,
			width:3, height: 1, depth: 1,
			red:random(255), green:random(255), blue:random(255)
		});
		for (let i = 0; i < this.health; i++) {
			const heartPlane = new Plane({
				x: 0, y:0, z:0, width:100, height:100, asset:'heart', rotationX:-90, repeatX:100, repeatY:100
			});
			this.healthUI.add(heartPlane);
		}
		world.add(this.healthUI);
	}
	show() {
		
	}
	setHealth(number) {
		this.health = number;
	}
}
