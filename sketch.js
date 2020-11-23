// variable to hold a reference to our A-Frame world
let world,gun,box;
const bullets = [];
const types = [Box,Sphere,Dodecahedron,Octahedron,Tetrahedron,TorusKnot,Torus];
let pistolSound;

class enemey{
	constructor(hp,obj,speed){
		this.hp = hp;
		this.obj = obj;
		this.speed = speed;
	}
	move(){
		this.obj.nudge(0,0-speed);
	}
	checkCollision(collider){

	}
}

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
	//box.hide();
	world.add(gun);
	//world.add(box);
	gun.addChild(box);
	world.add(ground);
}

function draw() {
	gun.setPosition(world.camera.x,world.camera.y - 0.3,world.camera.z);
	gun.rotateY(world.camera.rotationY + 180);
	gun.rotateX(-world.camera.rotationX);
	for(let i = 0; i < bullets.length; i++){
		bullets[i].move();
		const pos = bullets[i].bullet.getWorldPosition();
		//makes these numbers much smaller
		if (pos.x > 50 || pos.x < -50 || pos.z > 50 || pos.z < -50) {
			world.remove(bullets[i].myContainer);
			bullets.splice(i, 1);
			i--;
			continue;
		}
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
		this.bullet.nudge(0,0,0.02);
	}
}


function mousePressed(){
	pistolSound.play();
	const temp = new Bullet();
	bullets.push( temp );
}

function createEnemies(){
	random()
}
