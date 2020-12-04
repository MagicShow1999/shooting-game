// variable to hold a reference to our A-Frame world
let world,gun,box;
const bullets = [];
const enemies = [];
const types = [Box,Sphere,Dodecahedron,Octahedron,Tetrahedron,TorusKnot,Torus];

// import assets here
let pistolSound, leftArrow, rightArrow;
let hurtSound, enemyHurtSound;
let heartImg;
let health;




// other global variables
let cooldown = 0;
let changeAmmo = true;
let bullets_left = 5;
let hearts_left = 5;

function preload(){
	pistolSound = loadSound("assets/sounds/pistol.mp3");
	hurtSound = loadSound("assets/sounds/hurt.ogg");
	enemyHurtSound = loadSound("assets/sounds/enemy-hurt.wav");
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

	setHealth(5);
	setAmmo(5);
}

function draw() {
	// change the gun position to always locate around world camera position
	gun.setPosition(world.camera.x,world.camera.y - 0.3,world.camera.z);
	gun.rotateY(world.camera.rotationY + 180);
	gun.rotateX(-world.camera.rotationX);

	
	for(let i = 0; i < bullets.length; i++){
		bullets[i].move();
		const pos = bullets[i].bullet.getWorldPosition();
		// check collision here
		for(let j = 0; j < enemies.length; j++){
			
			if(enemies[j].checkCollision(pos)){
				const enemy_hp = enemies[j].hp;
				enemyHurtSound.play();
				if (enemy_hp == 1) {
					world.remove(enemies[j].enemyContainer);
					enemies.splice(j,1);
					j--;
				} else {
					enemies[j].reduceHp();
					world.remove(bullets[i].myContainer);
					bullets.splice(i, 1);
					i--;
				}
				break;
			}
		}
		// get current position of the player
		const playerPos = world.getUserPosition();
		// remove the bullets if they are far away from player.
		if (getDistance(pos, playerPos) > 10 && bullets.length !== 0) {
			world.remove(bullets[i].myContainer);
			bullets.splice(i, 1);
			i--;
			continue;
		}
	}
	for(let i = 0; i < enemies.length; i++){
		enemies[i].move();
		// check the collision with the player
		// if true, then 1. remove the enemy 2. reduce the health hearts by 1

		if(enemies[i].checkPlayerCollision(world.camera)) {
			world.remove(enemies[i].enemyContainer);
			enemies.splice(i, 1);
			i--;
			hearts_left -= 1;
			setHealth(hearts_left);
			hurtSound.play();
		}
	}

	if (changeAmmo) {
		changeAmmo = false;
		setAmmo(bullets_left);
	}

}

/* create bullet here and handle ammo cooldown */
function mousePressed(){
	if (cooldown < frameCount && bullets_left >= 0) {
		// console.log(frameCount);
		const interval = frameCount - cooldown;
		cooldown = frameCount;
		if (bullets_left === 0) {
			// console.log(interval);
			// this interval is the cool down. so the player can't
			// keep shooting if there's no bullet and they need to wait reloading
			if (interval > 80) {
				bullets_left = 5;
			}
			
		} else {
			const temp = new Bullet();
			// TODO: ENABLE THE SOUND! Because in dev this sound is annoying... 
			// so i just commented out 
			pistolSound.play();
			bullets.push( temp );
			bullets_left -= 1;
			changeAmmo = true;
			// setAmmo(bullets_left);
		}
		
	}

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
		const pos = { x:random(-5,5), y:0.8, z:random(-6,-2)};
		enemies.push(new Enemy("starwar", 0.01, 6, 0.01, pos));
	}
	// spawn green monsters
	for(let i = 0; i < 3; i ++){
		const pos = { x:random(-5,5), y:0.5, z:random(-6,-2)};
		enemies.push(new Enemy("green_monster", 1, 3, 0.02, pos));
	}
	
}

/* this function directly alters the DOM and display different numbers of hearts
	at bottom left
	@param int number - number of hearts to be displayed
	*/
function setHealth(number) {
	console.log('sethealth', number);
	const health = document.getElementById("health");
	// clear old hearts first
	while (health.firstChild) {
		health.removeChild(health.firstChild);
	}
	for(let i = 0; i < number; i++) {
		var x = document.createElement("IMG");
		x.setAttribute("src", "assets/images/heart.jpg");
		x.setAttribute("width", 20);
		x.setAttribute("height", 20);
		health.appendChild(x);
	}
}

/* this function directly alters the DOM and display different numbers of bullets
	at bottom right
	@param int number - number of bullets to be displayed
	*/
function setAmmo(number) {

	const ammo = document.getElementById("ammo");
	// clear old hearts first
	while (ammo.firstChild) {
		ammo.removeChild(ammo.firstChild);
	}
	for(let i = 0; i < number; i++) {
		var x = document.createElement("IMG");
		x.setAttribute("src", "assets/images/ammo1.png");
		x.setAttribute("width", 20);
		x.setAttribute("height", 20);
		ammo.appendChild(x);
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
		this.bullet = new Sphere({
			x:0,
			y:0,
			z:0,
			scaleX: 0.01,
			scaleY: 0.01,
			scaleZ: 0.01,
			red:212,
			green:175,
			blue:55
		});
		this.myContainer.addChild(this.bullet);
	}
	move() {
		// make the speed faster so its' more real
		this.bullet.nudge(0,0,0.1);
	}

}

// enemy class
class Enemy{
	constructor(name, scale, hp, speed, pos){
		this.fullHp = hp;
		this.hp = hp;
		this.speed = speed;
		this.pos = pos;
		this.enemyContainer = new Container3D({
			x: pos.x,
			y: pos.y,
			z: pos.z,
			red:255, green:255, blue:255,
		});
		this.obj = new OBJ({
			asset: `${name}_obj`,
			mtl: `${name}_mtl`,
			x: 0,
			y: 0,
			z: 0,
			scaleX: scale,
			scaleY: scale,
			scaleZ: scale,
		});
		const yValue = name === "green_monster" ? 0.4 : 0.8;
		this.healthbar = new Plane({
			x: 0,
			y: yValue,
			z: 0,
			width: 1,
			height: 0.1,
			red:random(255), green:0, blue: 0,
		}) 
		this.enemyContainer.add(this.obj);
		this.enemyContainer.add(this.healthbar);
		world.add(this.enemyContainer);
	}
	move(){
		// TODO: make the enemies always move towards player
		this.enemyContainer.nudge(0,0,this.speed);
		
	}
	checkCollision(collider){
		// console.log(this.pos);
		
		const pos = {x: this.enemyContainer.x, y: this.enemyContainer.y, z: this.enemyContainer.z};
		// console.log(getDistance(pos, collider));
		if(getDistance(pos, collider) <= 0.55) {
			return true;
		} 
		return false;
	}
	checkPlayerCollision(player) {
		const pos = {x: this.enemyContainer.x, y: this.enemyContainer.y, z: this.enemyContainer.z};
		// console.log(getDistance(pos, collider));
		if(getDistance(pos, player) <= 1) {
			return true;
		} 
		return false;
	}
	reduceHp() {
		this.hp -= 1;
		this.healthbar.setWidth(this.hp / this.fullHp);
	}
}
