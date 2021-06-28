import {utils} from "./utils.js";

const RSPE = .1;

export class Camera {
    constructor(){
        this.pos = [0, 0, 0];
        this.elev = 0.01;
        this.ang = 0.01;
        this.viewMat = null;
    }

    getViewMatrix(){
        this.viewMat = utils.MakeView(this.pos[0], this.pos[1], this.pos[2], this.elev, this.ang);
        return this.viewMat;
    }

    mouseMove(e){
        this.ang += RSPE * e.movementX;
        this.elev -= RSPE * e.movementY;
    }
}