import { Drawable } from "./Drawable.js";
import { ThirdPersonCamera } from "./ThirdPersonCamera.js";
import { utils } from "./utils.js";
import { ColliderRenderer } from "./ColliderRenderer.js";

const RSPE = 0.08;

export class GameplayHandler {
    constructor(scene){
        this.gl = scene.gl;
        this.objects = scene.objects;
        this.lights = scene.lights;
        this.player;
        this.velocity = [0, 0, 0];
        this.velocityScale = 0.05;
        this.gravityScale = 0.002;
        this.jumpStrength = 0.05;
        this.canJump = false;
        this.debug = false;

        this.front = false;
        this.back = false;
        this.left = false;
        this.right = false;
        this.high = false;
        this.down = false;

        this.showColliders = false;

        this.spawnPlayer(scene);
        this.camera = new ThirdPersonCamera(this.gl, this.player);
    }

    spawnPlayer(scene){
        var position = this.objects.filter((x) => x.name === "spawnBrick")[0].position;
        this.player = new Drawable(
            scene.shaderHandler.getProgram("main"),
            scene.shaderHandler.getJson("main"),
            this.gl,
            scene.meshDict["ghost"],
            scene.materialDict["ghost"],
            "ghost",
            utils.addVectors(position, [0, 1, 0]),
            [0, 0, 0],
            0.2,
            scene.getTexture("ghost")
        );
        this.player.collider.renderer = new ColliderRenderer(
            scene.shaderHandler.getProgram("lit"), 
            scene.shaderHandler.getJson("lit"), 
            this.gl,
            this.player.collider
        );

        this.player.collider.useSixColliders();
        this.player.scene = false;
        this.objects.push(this.player);
    }

    draw(){
        this.objects.forEach((x)=>x.draw(this.camera, this.lights));
        if(this.showColliders)
            this.objects.forEach((x)=>x.collider.draw(this.camera));
    }

    update(){
        this.velocity = this.computePlayerVel();
        
        let oldPosition = this.player.position;
        this.player.position = utils.addVectors(this.player.position, this.velocity);
        this.player.updateWorld();
        let colliding = this.player.collider.isCollidingWith(this.objects);
        
        
        if(colliding != null){
            if (colliding.drawable.name === "plane"){
                alert("YOU ARE DEAD");
                this.respawnPlayer();
            } 
            else if (colliding.drawable.name === "goalBrick") this.victory();
            else {
                let dirColliders = this.player.collider.sixColliders(this.objects);
                this.canJump = dirColliders.down;
                let counterVel = this.computeCounterVel(dirColliders);
                this.player.position = utils.addVectors(oldPosition, counterVel);
                //this.player.position = oldPosition;
            }
            this.player.updateWorld();
        }

        this.camera.updatePos();
        this.camera.updateMatrices();
    }

    computePlayerVel(){
        let accel = [0, -this.gravityScale, 0];
        
        let velocity = utils.addVectors(this.velocity, accel);
        let [front, left, high] = [0, 0, 0];
        if (this.front) front++;
        if (this.back) front--;
        if (this.left) left++;
        if (this.right) left--;
        if (this.high) high++;
        if (this.down) high--;

        velocity[2] = -(Math.sin(utils.degToRad(this.player.rotation[0])) * front - Math.cos(utils.degToRad(this.player.rotation[0])) * left) * this.velocityScale;
        velocity[0] = -(Math.cos(utils.degToRad(this.player.rotation[0])) * front + Math.sin(utils.degToRad(this.player.rotation[0])) * left) * this.velocityScale;

        if(this.canJump && high){
            velocity[1] += this.jumpStrength;
            this.canJump = false;
        }
        
        return velocity;
    }

    computeCounterVel(dirColliders){
        var counterVelocity = [0, 0, 0];
        if(!dirColliders.down && !dirColliders.up)
            counterVelocity[1] = this.velocity[1];
        else this.velocity[1] = 0;
        
        if(!dirColliders.front && !dirColliders.back)
            counterVelocity[2] = this.velocity[2];
        else this.velocity[2] = 0;
            
        
        if(!dirColliders.left && !dirColliders.right)
            counterVelocity[0] = this.velocity[0];
        else this.velocity[0] = 0;
         
        return counterVelocity;
    }

    respawnPlayer(){
        var position = this.objects.filter((x) => x.name === "spawnBrick")[0].position;
        this.player.position = utils.addVectors(position, [0, 1, 0]);
        this.front = false;
        this.back = false;
        this.left = false;
        this.right = false;
        this.high = false;
        this.down = false;
    }

    victory(){
        alert("CONGRATULATIONS! YOU WON");
        this.respawnPlayer();
    }

    //HANDLING INPUT

    handleKeyPressed(key){
        if (key == "c")
            this.showColliders = !this.showColliders;
        if(key =="h"){
            console.log(this.player.collider.sixColliders(this.objects));
        }

        if(key=="y")
            this.debug = !this.debug;
    }

    mouseMove(e){
        this.camera.ang += RSPE * e.movementX;
        this.camera.elev -= RSPE * e.movementY;
    }

    activateMovement(e){
        this.setDir(e, true)
    }

    deactivateMovement(e){
        this.setDir(e, false);
    }

    setDir(e, bool){
        if (e.key.toLowerCase() == "w") this.front = bool;
        if (e.key.toLowerCase() == "s") this.back = bool;
        if (e.key.toLowerCase() == "a") this.left = bool;
        if (e.key.toLowerCase() == "d") this.right = bool;
        if (e.key == " ") this.high = bool;
        if (e.key == "Shift") this.down = bool;
        
    }

    beforeChangeScene(){
        let playerPosition = this.objects.map((x, i)=>{return {name:x.name, index:i}}).filter((x) => x.name === "ghost")[0].index;
        this.objects.splice(playerPosition, 1);
    }
}