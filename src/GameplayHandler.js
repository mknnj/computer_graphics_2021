import { Drawable } from "./Drawable.js";
import { ThirdPersonCamera } from "./ThirdPersonCamera.js";
import { utils } from "./utils.js";

const RSPE = 0.08;

export class GameplayHandler {
    constructor(scene){
        this.gl = scene.gl;
        this.objects = scene.objects;
        this.lights = scene.lights;
        this.player;
        this.velocityScale = 0.05;
        this.jumpStrength = 0.05;

        this.front = false;
        this.back = false;
        this.left = false;
        this.right = false;
        this.high = false;
        this.down = false;

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
        this.objects.push(this.player);
    }

    draw(){
        this.objects.forEach((x)=>x.draw(this.camera, this.lights));
    }

    update(){
        let vel = this.computePlayerVel();
        let oldPosition = this.player.position;
        this.player.position = utils.addVectors(oldPosition, vel);
        this.player.updateWorld();
        if(this.player.collider.isColliding(this.objects)){
            this.player.position = oldPosition;
            this.player.updateWorld();
        }

        
        this.camera.updatePos();
        this.camera.updateMatrices();
    }

    computePlayerVel(){
        let velocity = [0, 0, 0];
        let [front, left, high] = [0, 0, 0];
        if (this.front) front++;
        if (this.back) front--;
        if (this.left) left++;
        if (this.right) left--;
        if (this.high) high++;
        if (this.down) high--;

        velocity[2] = -(Math.sin(utils.degToRad(this.player.rotation[0])) * front - Math.cos(utils.degToRad(this.player.rotation[0])) * left) * this.velocityScale;
        velocity[0] = -(Math.cos(utils.degToRad(this.player.rotation[0])) * front + Math.sin(utils.degToRad(this.player.rotation[0])) * left) * this.velocityScale;
        velocity[1] = high * this.jumpStrength;
        return velocity;
    }

    //HANDLING INPUT

    handleKeyPressed(key){
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
}