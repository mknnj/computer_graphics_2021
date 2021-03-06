import {utils} from "./utils.js";

const MSPE = .08;

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

    getViewDirection(){
        //We need to go through the transformation pipeline in the inverse order so we invert the matrices
        var projInv = utils.invertMatrix(this.projectionMatrix);
        var viewInv = utils.invertMatrix(this.getViewMatrix());
        
        var pointEyeCoords = utils.multiplyMatrixVector(projInv, [0, 0, -1, 1]);
    
        var rayEyeCoords = [pointEyeCoords[0], pointEyeCoords[1], pointEyeCoords[2], 0];

        var rayDir = utils.multiplyMatrixVector(viewInv, rayEyeCoords);

        var normalisedRayDir = utils.normalize(rayDir);
        
        return normalisedRayDir;
    }

    getDestination(distance){
        var direction = this.getViewDirection();
        return utils.addVectors(this.pos, utils.multiplyScalarVector(direction, distance));
    }

    getViewMatrix(){
        return this.viewMat;
    }

    updateViewMat(){
        this.viewMat = utils.MakeView(this.pos[0], this.pos[1], this.pos[2], this.elev, this.ang);
    }

    getViewWithoutPos(){
        return utils.MakeView(0, 0, 0, this.elev, this.ang);
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
        this.updateViewMat();
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