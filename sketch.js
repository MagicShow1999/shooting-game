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
	for(b of bullets){
		/*var vectorHUD = new THREE.Vector3();
		vectorHUD.setFromMatrixPosition(b.tag.object3D.matrixWorld);
		var vectorCamera = b.getWorldPosition();
		var xDiff = vectorHUD.x - vectorCamera.x;
		var yDiff = vectorHUD.y - vectorCamera.y;
		var zDiff = vectorHUD.z - vectorCamera.z;
		if (b.flying) {
			b.nudge(xDiff * 0.01, yDiff *  0.01, zDiff *  0.01);
		} else {
			b.nudge(xDiff *  0.01, 0, zDiff *  0.01);
		}*/

		b.nudge(0,0,0.1);//0.01*Math.sin(b.rotationY*PI/180),-0.01*Math.sin(b.rotationX*PI/180),0.01*Math.cos(b.rotationY*PI/180));
		if(b.getZ() > 1){
			//box.removeChild(b);
		}
	}

}

function mousePressed(){
	pistolSound.play();
	const b = new OBJ({
		asset: 'bullet_obj',
		mtl: 'bullet_mtl',
		x: 0,
		y: 0,
		z: 0,
		rotationX:gun.rotationX,
		rotationY:0,
		scaleX:0.1,
		scaleY:0.1,
		scaleZ:0.1,
	});
	bullets.push(b);
	box.addChild(b);
	//world.add(b);
}

function createEnemies(){
	random()
}
