import {utils} from "./utils.js";

const RSPE = .1;
const MSPE = .1;

export class Camera {
    constructor(gl){
        this.gl = gl;
        this.pos = [0, 0, 0];
        this.elev = 0.0;
        this.ang = 0.0;
        this.viewMat = null;
        this.projectionMatrix = null;
        this.viewDirectionProjectionMatrix = null;
        this.viewDirectionProjectionInverseMatrix = null;
        this.front = false;
        this.back = false;
        this.left = false;
        this.right = false;
        this.high = false;
        this.down = false;

        this.updateProjection();
    }

    getViewMatrix(){
        this.viewMat = utils.MakeView(this.pos[0], this.pos[1], this.pos[2], this.elev, this.ang);
        return this.viewMat;
    }

    mouseMove(e){
        this.ang += RSPE * e.movementX;
        this.elev -= RSPE * e.movementY;
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

    updatePos(){
        let [front, left, high] = [0, 0, 0];
        if (this.front) front++;
        if (this.back) front--;
        if (this.left) left++;
        if (this.right) left--;
        if (this.high) high++;
        if (this.down) high--;

        this.pos[0] += (Math.sin(utils.degToRad(this.ang)) * front - Math.cos(utils.degToRad(this.ang)) * left) * MSPE;
        this.pos[2] -= (Math.cos(utils.degToRad(this.ang)) * front + Math.sin(utils.degToRad(this.ang)) * left) * MSPE;
        this.pos[1] += high * MSPE;
    }

    updateProjection(){
        var aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        this.projectionMatrix = utils.MakePerspective(30, aspect, 0.01, 2000);
    }

    updateMatrices(){
        this.viewDirectionProjectionMatrix = utils.multiplyMatrices(this.projectionMatrix, this.getViewMatrix());
        this.viewDirectionProjectionInverseMatrix = utils.invertMatrix(this.viewDirectionProjectionMatrix);
    }

    getSkyboxMatrix(){
        //console.log(this.projectionMatrix)
        
        var skyboxMatrix = utils.multiplyMatrices(this.projectionMatrix, utils.MakeView(0,0,0,this.elev,this.ang));
        
        return utils.invertMatrix(skyboxMatrix);
    }
}