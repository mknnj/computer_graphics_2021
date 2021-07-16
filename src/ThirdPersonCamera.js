import {utils} from "./utils.js";

const RSPE = .08;

export class ThirdPersonCamera {
    constructor(gl, player){
        this.player = player;
        this.gl = gl;
        this.pos = [0, 0, 0];
        this.radius = 3;
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
        this.viewMat =  utils.invertMatrix(utils.LookAt(this.pos, this.player.position, [0, 1, 0]));
        return this.viewMat;
    }

    mouseMove(e){
        this.ang += RSPE * e.movementX;
        this.elev += RSPE * e.movementY;
    }

    updatePos(){
        if(this.elev>89) this.elev = 89;
        if(this.elev<-89) this.elev = -89;
        let offset = [this.radius * Math.cos(utils.degToRad(this.ang)) * Math.sin(utils.degToRad(90-this.elev)),
                      this.radius * Math.cos(utils.degToRad(90-this.elev)),
                      this.radius * Math.sin(utils.degToRad(this.ang)) * Math.sin(utils.degToRad(90-this.elev))];
        this.player.rotation[0] = this.ang;
        this.pos = utils.addVectors(this.player.position, offset);
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