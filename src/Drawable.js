import {utils} from "./utils.js";
import { Collider } from "./Collider.js";

export class Drawable {
    constructor(program, jsonObj, gl, mesh, material, name, position, rotation, scale, texture = null){
        this.mesh = mesh;
        this.material = material;
        this.name = name;
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
        this.texture = texture;
        this.alpha = 1.0;
        this.collider = new Collider(this);

        this.gl = gl;
        this.jsonObj = jsonObj;
        this.program = program;
        this.gl.useProgram(program);

        this.vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.vao);
        this.positionBuffer = this.gl.createBuffer();
        this.normalBuffer = this.gl.createBuffer();
        this.uvBuffer = this.gl.createBuffer();
        this.indexBuffer = this.gl.createBuffer();
        
        this.setUp();
        this.updateWorld();
    }

    setUp(){
        this.gl.useProgram(this.program);
        this.positionLocation = this.gl.getAttribLocation(this.program, this.jsonObj.attribNames[0]);
        this.normalLocation = this.gl.getAttribLocation(this.program, this.jsonObj.attribNames[1]);
        this.uvLocation = this.gl.getAttribLocation(this.program, this.jsonObj.attribNames[2]);

        this.viewWorldMatrixLocation = this.gl.getUniformLocation(this.program, this.jsonObj.uniformNames[0]);
        this.projectionMatrixLocation = this.gl.getUniformLocation(this.program, this.jsonObj.uniformNames[1]);
        this.normalMatrixLocation = this.gl.getUniformLocation(this.program, this.jsonObj.uniformNames[2]);
        this.textureLocation = this.gl.getUniformLocation(this.program, this.jsonObj.uniformNames[3]);
        this.textureBoolLocation = this.gl.getUniformLocation(this.program, this.jsonObj.uniformNames[4]);
        
        this.diffuseLocation = this.gl.getUniformLocation(this.program, this.jsonObj.uniformNames[5]);
        this.specularLocation = this.gl.getUniformLocation(this.program, this.jsonObj.uniformNames[6]);
        this.ambientMatColorLocation = this.gl.getUniformLocation(this.program, this.jsonObj.uniformNames[7]);
        this.phongGammaLocation = this.gl.getUniformLocation(this.program, this.jsonObj.uniformNames[8]);
        this.alphaLocation = this.gl.getUniformLocation(this.program, this.jsonObj.uniformNames[9]);
        this.spotColorLocation = this.gl.getUniformLocation(this.program, this.jsonObj.uniformNames[10]);
        this.spotLocation = this.gl.getUniformLocation(this.program, this.jsonObj.uniformNames[11]);
        this.spotTargetLocation = this.gl.getUniformLocation(this.program, this.jsonObj.uniformNames[12]);
        this.spotDecayLocation = this.gl.getUniformLocation(this.program, this.jsonObj.uniformNames[13]);
        this.spotConeOLocation = this.gl.getUniformLocation(this.program, this.jsonObj.uniformNames[14]);
        this.spotConeILocation = this.gl.getUniformLocation(this.program, this.jsonObj.uniformNames[15]);
        this.spotDirLocation = this.gl.getUniformLocation(this.program, this.jsonObj.uniformNames[16]);
        this.directionalLightLocation = this.gl.getUniformLocation(this.program, this.jsonObj.uniformNames[17]);
        this.directionLightColorLocation = this.gl.getUniformLocation(this.program, this.jsonObj.uniformNames[18]);
        this.ambientLightLocation = this.gl.getUniformLocation(this.program, this.jsonObj.uniformNames[19]);
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.mesh.vertices), this.gl.STATIC_DRAW);
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.mesh.vertexNormals), this.gl.STATIC_DRAW);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.uvBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.mesh.textures), this.gl.STATIC_DRAW);
        
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.mesh.indices), this.gl.STATIC_DRAW);
    }

    updateWorld(){
        this.worldMatrix = utils.MakeWorld(this.position[0], this.position[1], this.position[2],
                                    this.rotation[0], this.rotation[1], this.rotation[2],
                                    this.scale);
        this.collider.updateCollider();
    }

    getWorldWithoutRotation(){
        return utils.MakeWorld(this.position[0], this.position[1], this.position[2],
            0, 0, 0,
            this.scale);
    }

    updateAlpha(alpha){ // final transparency of object
        this.alpha = alpha;
    }

    draw(camera, lights){
        this.gl.useProgram(this.program);

        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.enable(this.gl.BLEND);
        this.gl.bindVertexArray(this.vao);

        this.gl.enableVertexAttribArray(this.positionLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.vertexAttribPointer(this.positionLocation, 3, this.gl.FLOAT, false, 0, 0);
        
        this.gl.enableVertexAttribArray(this.normalLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
        this.gl.vertexAttribPointer(this.normalLocation, 3, this.gl.FLOAT, false, 0, 0);

        this.gl.enableVertexAttribArray(this.uvLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.uvBuffer);
        this.gl.vertexAttribPointer(this.uvLocation, 2, this.gl.FLOAT, false, 0, 0);
        
        //matrices uniform
        
        let viewWorld = utils.multiplyMatrices(camera.getViewMatrix(), this.worldMatrix);
        let projectionMatrix = utils.multiplyMatrices(camera.projectionMatrix, viewWorld);
        let normalMatrix = utils.invertMatrix(utils.transposeMatrix(viewWorld));

        this.gl.uniformMatrix4fv(this.viewWorldMatrixLocation, false,utils.transposeMatrix(viewWorld));
        this.gl.uniformMatrix4fv(this.projectionMatrixLocation, false, utils.transposeMatrix(projectionMatrix));
        this.gl.uniformMatrix4fv(this.normalMatrixLocation, false, utils.transposeMatrix(normalMatrix));
        
        //texture uniform
        this.gl.uniform1i(this.textureLocation, 0);
        if(this.texture === null) 
            {
            this.gl.uniform1f(this.textureBoolLocation, 0.0);
        } else {
            this.gl.uniform1f(this.textureBoolLocation, 1.0);
            this.gl.activeTexture(this.gl.TEXTURE0);
            // Bind the texture to texture unit 0
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        }


        let spotLightPositionTransformed = utils.multiplyMatrixVector(camera.getViewMatrix(), lights.spotLight.position).slice(0,3);
        let lightTransformMatrix = utils.sub3x3from4x4(camera.getViewMatrix());
        let spotLightDirectionTransformed = utils.multiplyMatrix3Vector3(lightTransformMatrix, lights.spotLight.direction);
        let dirLightDirectionTransformed = utils.multiplyMatrix3Vector3(lightTransformMatrix, lights.directionalLight.direction);

        
        //lights uniform
        this.gl.uniform4fv(this.diffuseLocation, this.material.diffuse);
        this.gl.uniform4fv(this.specularLocation, this.material.specular);
        this.gl.uniform4fv(this.ambientMatColorLocation, this.material.ambient);
        this.gl.uniform1f(this.phongGammaLocation, this.material.phongGamma);
        this.gl.uniform1f(this.alphaLocation, this.alpha);
        this.gl.uniform4fv(this.spotColorLocation, lights.spotLight.color);
        this.gl.uniform3fv(this.spotLocation, spotLightPositionTransformed);
        this.gl.uniform1f(this.spotTargetLocation, lights.spotLight.target);
        this.gl.uniform1f(this.spotDecayLocation, lights.spotLight.decay);
        this.gl.uniform1f(this.spotConeOLocation, lights.spotLight.coneO);
        this.gl.uniform1f(this.spotConeILocation, lights.spotLight.coneI);
        this.gl.uniform3fv(this.spotDirLocation,spotLightDirectionTransformed );
        this.gl.uniform3fv(this.directionalLightLocation, dirLightDirectionTransformed);
        this.gl.uniform4fv(this.directionLightColorLocation, lights.directionalLight.color);
        this.gl.uniform4fv(this.ambientLightLocation, lights.ambient.color);

        this.gl.bindVertexArray(this.vao);
        this.gl.drawElements(this.gl.TRIANGLES, this.mesh.indices.length, this.gl.UNSIGNED_SHORT, 0 );
        this.gl.disableVertexAttribArray(this.positionLocation);
        this.gl.disableVertexAttribArray(this.normalLocation);
        this.gl.disableVertexAttribArray(this.uvLocation);
    }
}