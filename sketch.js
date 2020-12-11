// variable to hold a reference to our A-Frame world
let world,gun,box;
let bullets = [];
let enemies = [];
let powerUpList = [];
let reloadSpeedIncrease, increaseHealth;

// import assets here
let pistolSound, leftArrow, rightArrow;
let heartImg;
let health;


// other global variables
let cooldown = 0;
let changeAmmo = true;
let bullets_left = 5;
let hearts_left = 5;
let gameover = waveDone = powerUpSelected = powerUpShown = false;
let waveNum;
let reloadSpeed = 30;

function preload(){
	pistolSound = loadSound("assets/sounds/pistol.mp3");
	hurtSound = loadSound("assets/sounds/hurt.ogg");
	enemyHurtSound = loadSound("assets/sounds/enemy-hurt.wav");
	gameoverSound = loadSound("assets/sounds/gameover.wav");
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
			world.teleportToObject( theBox );
		}
	});
	rightCone = new Cone({
		x:10, y:1, z:-10,
		height:1,
		radiusBottom: 1, radiusTop: 1,
		red:0, green:0, blue:0,
		clickFunction: function(theBox ) {
			world.teleportToObject( theBox );
			/*
			const v = new THREE.Vector3(0,0,0);
			world.camera.holder.getAttribute("look-controls").enabled=false
			world.camera.holder.object3D.lookAt(v);
			world.camera.holder.getAttribute("look-controls").enabled=true
			*/
		}
	});
	leftCone = new Cone({
		x:-10, y:1, z:-10,
		height:1,
		radiusBottom: 1, radiusTop: 1,
		red:0, green:0, blue:0,
		clickFunction: function(theBox) {
			world.teleportToObject( theBox );
		}
	})

	//box.hide();
	//world.add(box);
	world.add(gun);
	gun.addChild(box);
	world.add(ground);
	world.add(rightCone);
	world.add(leftCone);
	world.add(centerCone);

	//initialize();
	gameover = true;
	document.getElementById("gameover").style.display= "flex";
	//I am not sure if the player can acutally press the button when they are in VR
	//if they can we can leave this here.
	//otherwise, remove and use the implmentation on line 236
	document.getElementById("replay").addEventListener("click", initialize);
}

function initialize() {
	gameover = waveDone = powerUpSelected = powerUpShown = false;
	changeAmmo = true;
	bullets_left = 5;
	hearts_left = 5;
	waveNum = 0;
	for(bullet of bullets){
		world.remove(bullet.myContainer);
	}
	bullets = [];
	enemies = [];
	setHealth(5);
	setAmmo(5);
	// spawn enemies
	createEnemies(3);
	setTimeout(displayNone,500,document.getElementById("gameover"));
	//document.getElementById("gameover").style.display = "none";
	world.teleportToObject( centerCone );
}

function draw() {
	/*if (gameover) {
		initialize();
	} else {*/
	if(!gameover){
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
					if (enemy_hp == 1) {
						enemyHurtSound.play();
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
				console.log(i);
				world.remove(bullets[i].myContainer);
				bullets.splice(i, 1);
				i--;
				continue;
			}
		}
		console.log(enemies.length);
		for(let i = 0; i < enemies.length; i++){
			enemies[i].move(gun);
			enemies[i].lookAt(gun);
			// check the collision with the player
			// if true, then 1. remove the enemy 2. reduce the health hearts by 1
			if(enemies[i].checkPlayerCollision(world.camera)) {
				world.remove(enemies[i].enemyContainer);
				enemies.splice(i, 1);
				i--;
				// if player has no HP, display game over screen
				if (hearts_left === 1) {
					// show game over screen in the middle and play game over sound
					document.getElementById("gameover").style.display= "flex";
					gameoverSound.play();
					gameover = true;
					// clear enemies
					if (enemies.length !== 0) {
						enemies.forEach(enemy => {
							enemy.remove();
						});
					}
				}
				hearts_left -= 1;
				setHealth(hearts_left);
				hurtSound.play();
			}
		}

		if (changeAmmo) {
			changeAmmo = false;
			setAmmo(bullets_left);
		}
		if(enemies.length === 0 && hearts_left > 0){
			waveDone = true;
			powerUps();
			if(powerUpSelected){
				for(let i = 0; i < powerUpList.length; i++){
					world.remove(powerUpList[i].container);
					powerUpList.splice(i,1);
					i--;
				}
				document.getElementById("wavePassed").style.display = "block";
				document.getElementById("waveNum").textContent = waveNum + 1;
				waveNum ++;
				powerUpShown = false;
				powerUpSelected = false;
				document.getElementById("nextWaveNum").textContent = waveNum + 1;
				createEnemies(3 + waveNum);
			}
		}
	}
}

function powerUps(){
	if(!powerUpShown){
		powerUpShown = true;
		reloadSpeedIncrease = new PowerUp(0,3,-7,5,1,()=>{
			reloadSpeed -= 10;
			powerUpSelected = true;
		});
		/*reloadSpeedIncrease = new Plane({
			x:0, y:3, z:-5,
			width: 5,
			height: 1,
			clickFunction: function(powerUp){
				reloadSpeed -= 10;
				powerUpSelected = true;
			}
		});*/
		//world.add(reloadSpeedIncrease.plane);
		powerUpList.push(reloadSpeedIncrease);
		reloadSpeedIncrease.plane.tag.setAttribute('text',
		    'value: Increase Reload Speed; color: rgb(0,0,0); align: center;');

		increaseHealth = new PowerUp(0,1.5,-7,5,1,()=>{
			setHealth(hearts_left + 3);
			powerUpSelected = true;
		});
		/*increaseHealth = new Plane({
			x:0, y:1.5, z:-5,
			width: 5,
			height: 1,
			clickFunction: function(powerUp){
				setHealth(hearts_left + 3);
				powerUpSelected = true;
			}
		});*/
		//world.add(increaseHealth.plane);
		powerUpList.push(increaseHealth);
		increaseHealth.plane.tag.setAttribute('text',
		    'value: Gain 3 Health; color: rgb(0,0,0); align: center;');
	}
	else{
		increaseHealth.lookAt(gun);
		reloadSpeedIncrease.lookAt(gun);
	}
}


function keyPressed(){
	if (keyCode == 32) {


		if (cooldown < frameCount && bullets_left >= 0) {
			// console.log(frameCount);

			const interval = frameCount - cooldown;
			cooldown = frameCount;
			if (
			bullets_left === 0) {
				// console.log(interval);
				// this interval is the cool down. so the player can't
				// keep shooting if there's no bullet and they need to wait reloading
				if (interval > reloadSpeed) {
					bullets_left = 5;
				}

			} else {

				pistolSound.play();
				bullets.push(new Bullet());
				bullets_left -= 1;
				changeAmmo = true;
			}
			//this is only relevant if in vr, the player is unable to actuall press the play again button
			//if they are able to press it, we can remove this statement
			/*if(gameover){
				setTimeout(initialize, 500);
			}*/
			//similarly the reason why this is here.
			if(waveDone){
				waveDone = false;
				setTimeout(displayNone, 500,document.getElementById("wavePassed"));
			}
		}
	}
}

function displayNone(ele){
	ele.style.display = "none";
}
/* Get random values between min and max. Copied from mozilla */
function getRandomArbitrary(min, max) {
	return Math.random() * (max - min) + min;
}
/* Distance checker that returns the distance of two position objects */
function getDistance(objPos, objTwoPos) {
	return dist(objPos.x, objPos.y, objPos.z, objTwoPos.x, objTwoPos.y, objTwoPos.z);
}

/* this function directly alters the DOM and display different numbers of hearts
	at bottom left
	@param int number - number of hearts to be displayed
	*/
function setHealth(number) {
		//console.log('sethealth', number);
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
	hearts_left = number;
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

/* function to create enemy objects */
function createEnemies(num){
	// currently i just choose Box as default placeholder for enemy object
	// spawn starwar enemies
	for(let i = 0; i < num; i ++){
		const pos = { x:random(-5,5), y:0.8, z:random(-15,0)};
		const enemy = new Enemy("starwar", 0.01, 6, 0.02, pos, 45);
		enemies.push(enemy);
	}
	// spawn green monsters
	for(let i = 0; i < num; i ++){
		const pos = { x:random(-5,5), y:0.5, z:random(-15,0)};
		const enemy = new Enemy("green_monster", 1, 3, 0.03, pos, -60);
		enemies.push(enemy);
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
		// use generic shape: Sphere instead of 3D obj to increase performance
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
	constructor(name, scale, hp, speed, pos, rotY){
		this.fullHp = hp;
		this.hp = hp;
		this.speed = speed;
		this.pos = pos;
		this.enemyContainer = new Container3D({
			x: pos.x, y: pos.y, z: pos.z,
			rotationX:0,
			rotationY:0,
			rotationZ:0,
		});
		world.add(this.enemyContainer);
		this.obj = new OBJ({
			asset: `${name}_obj`,
			mtl: `${name}_mtl`,
			x: 0,
			y: 0,
			z: 0,
			rotationX:0,
			rotationY:rotY,
			rotationZ:0,
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

		this.enemyContainer.add(this.healthbar);
		this.enemyContainer.addChild(this.obj);
	}
	move(objective){
		let objPos = objective.getWorldPosition();
		let thisPos = this.enemyContainer.getWorldPosition();
		let deltaX = objPos.x - thisPos.x;
		let deltaZ = objPos.z - thisPos.z;
		let angle = Math.atan(deltaX/deltaZ);
		let xSpeed = this.speed * Math.sin(angle);
		let zSpeed = this.speed * Math.cos(angle);
		if(thisPos.z > objPos.z ){
			this.enemyContainer.nudge(-xSpeed,0,0);
			this.enemyContainer.nudge(0,0,-zSpeed);
		}
		else{
			this.enemyContainer.nudge(xSpeed,0,0);
			this.enemyContainer.nudge(0,0,zSpeed);
		}
	}
	lookAt(objective){
		let pos = objective.getWorldPosition();
		const cPos = this.enemyContainer.getWorldPosition();
		// compute a rotation vector from the cone to the object to look at
		let v = new THREE.Vector3()
		v.subVectors(pos, cPos).add(cPos);
		this.enemyContainer.tag.object3D.lookAt( v )
	}
	// this checks the collision with bullet
	checkCollision(collider){
		if(getDistance(this.enemyContainer, collider) < 0.55) {
			return true;
		}
		return false;
	}
	// this checks the collision with the player
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
	remove(){
		world.remove(this.enemyContainer);
	}
}

// powerup class
class PowerUp{
	constructor(x,y,z,width,height,func){
		this.container = new Container3D({
			x: x, y: y, z: z,
			rotationX:0,
			rotationY:0,
			rotationZ:0,
		});
		this.plane = new Plane({
			x:0, y:0, z:0,
			width: width,
			height: height,
			clickFunction: func
		});
		this.container.addChild(this.plane);
		world.add(this.container);
	}
	lookAt(obj){
		let pos = obj.tag.object3D.position
		const cPos = this.container.tag.object3D.position
		// compute a rotation vector from the cone to the object to look at
		let v = new THREE.Vector3()
		v.subVectors(pos, cPos).add(cPos);
		v.y = cPos.y;
		this.container.tag.object3D.lookAt( v )
	}
}
