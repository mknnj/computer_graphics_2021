import {utils} from "./utils.js";

const RSPE = .1;
const MSPE = .01;

export class Camera {
    constructor(){
        this.pos = [0, 0, 0];
        this.elev = 0.0;
        this.ang = 0.0;
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

    updatePos(e){
        let [front, left, high] = [0, 0, 0];
        if (e.key == "w") front++;
        else if (e.key == "s") front--;
        else if (e.key == "a") left++;
        else if (e.key == "d") left--;
        else if (e.key == " ") high++;
        else if (e.key == "Shift") high--;

        this.pos[0] += (Math.sin(utils.degToRad(this.ang)) * front - Math.cos(utils.degToRad(this.ang)) * left) * MSPE;
        this.pos[2] -= (Math.cos(utils.degToRad(this.ang)) * front + Math.sin(utils.degToRad(this.ang)) * left) * MSPE;
        this.pos[1] += high * MSPE;
    }
}