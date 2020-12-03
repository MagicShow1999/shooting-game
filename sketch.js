// variable to hold a reference to our A-Frame world
let world,gun,box;
const bullets = [];
const enemies = [];
const types = [Box,Sphere,Dodecahedron,Octahedron,Tetrahedron,TorusKnot,Torus];
let pistolSound, leftArrow, rightArrow;
let heartImg;
let health;

let enemyobj;
let cooldown = 0;

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
			world.slideToObject( theBox, 2000 );
		}
	});
	rightCone = new Cone({
		x:10, y:1, z:-10,
		height:1,
		radiusBottom: 1, radiusTop: 1,
		red:0, green:0, blue:0,
		clickFunction: function(theBox) {
			world.slideToObject( theBox, 2000 );
		}
	});
	leftCone = new Cone({
		x:-10, y:1, z:-10,
		height:1,
		radiusBottom: 1, radiusTop: 1,
		red:0, green:0, blue:0,
		clickFunction: function(theBox) {
			world.slideToObject( theBox, 2000 );
		}
	})
	// spawn enemies
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
	health.showHealth();
}

function draw() {
	// change the gun position to always locate around world camera position
	gun.setPosition(world.camera.x,world.camera.y - 0.3,world.camera.z);
	gun.rotateY(world.camera.rotationY + 180);
	gun.rotateX(-world.camera.rotationX);
	// does the same for health bar
	// BUG: health bar won't show up
	// health.obj.setPosition(world.camera.x, world.camera.y, world.camera.z);
	// health.obj.rotateY(world.camera.rotationY + 180);
	// health.obj.rotateX(-world.camera.rotationX);
	for(let i = 0; i < bullets.length; i++){
		bullets[i].move();
		const pos = bullets[i].bullet.getWorldPosition();
		// check collision here
		for(let j = 0; j < enemies.length; j++){
			const enemyPos = enemies[j].obj.getWorldPosition();

			if(getDistance(pos,enemyPos) < 1){
				console.log('here');
				world.remove(bullets[i].myContainer);
				world.remove(enemies[j].obj);
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
		enemies[i].move(gun);
		// check the collision with the player
		if(enemies[i].checkCollision(world.camera)) {
			enemies[i].remove();
			enemies.splice(i, 1);
			i--;
		}
	}
}



function mousePressed(){
	// TODO: ENABLE THE SOUND! Because in dev this sound is annoying... so i just commented out
	// pistolSound.play();

	if (cooldown < frameCount) {
		const temp = new Bullet();
		cooldown = frameCount;
		console.log('printed three times');
		bullets.push( temp );
	}


	// BUG: don't know why but it seems that this function is run 3 times each time i click on mouse

	// console.log(bullets.length);
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
	// currently i just choose Box as default placeholder for enemy object
	// spawn starwar enemies
	for(let i = 0; i < 3; i ++){
		const pos = { x:random(-5,5), y:0.8, z:random(-15,5)};
		enemies.push(new Enemy("starwar", 0.01, 6, 0.02, pos));
	}
	// spawn green monsters
	for(let i = 0; i < 3; i ++){
		const pos = { x:random(-5,5), y:0.5, z:random(-15,5)};
		enemies.push(new Enemy("green_monster", 1, 3, 0.03, pos));
	}

}

// bullet class
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
	constructor(name, scale, hp, speed, pos){

		this.hp = hp;
		this.speed = speed;
		this.pos = pos;

		this.obj = new OBJ({
			asset: `${name}_obj`,
			mtl: `${name}_mtl`,
			x: pos.x,
			y: pos.y,
			z: pos.z,
			rotationX:0,
			rotationY:0,
			rotationZ:0,
			scaleX: scale,
			scaleY: scale,
			scaleZ: scale,
		});

		world.add(this.obj);
	}
	move(objective){
		//strange bug where the enemy moves away from the player when they swap to a different base
		let objPos = objective.getWorldPosition();
		let thisPos = this.obj.getWorldPosition();
		let deltaX = objPos.x - thisPos.x;
		let deltaZ = objPos.z - thisPos.z;
		let angle = Math.atan(deltaX/deltaZ);
		let xSpeed = this.speed * Math.sin(angle);
		let zSpeed = this.speed*Math.cos(angle);
		this.obj.nudge(xSpeed,0,0);
		this.obj.nudge(0,0,zSpeed);
	}
	checkCollision(collider){
		if(getDistance(this.obj, collider) < 1) {
			return true;
		}
		return false;
	}
	remove(){
		world.remove(this.obj);
	}
}

// health system. default has 5 hearts
class Health {
	constructor(){
		this.health = 5;
		this.obj = new Box({
			x: world.camera.x + 0.1,
			y: world.camera.y - 0.3,
			z: world.camera.z + 3,
			width:3, height: 1, depth: 1,
		});

		world.add(this.obj);
	}
	showHealth() {
		for (let i = 0; i < this.health; i++) {
			const heartPlane = new Plane({
				x: 0, y:0, z:0, width:1, height:1, asset:'heart'
			});
			this.obj.add(heartPlane);
		}
	}
	setHealth(number) {
		this.health = number;
	}
}
