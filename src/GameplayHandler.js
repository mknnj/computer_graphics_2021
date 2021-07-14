import { Drawable } from "./Drawable.js";
import { utils } from "./utils.js";

export class GameplayHandler {
    constructor(scene){
        this.gl = scene.gl;
        this.objects = scene.objects;
        this.lights = scene.lights;
        this.camera = scene.camera;
        this.player;
        this.spawnPlayer(scene);
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

    update(){}
}