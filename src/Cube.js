import {utils} from "./utils.js"

export class Cube {
    constructor(program, jsonObj, gl, mesh, position, scale){
        this.mesh = mesh;
        this.position = position;
        this.rotation = [0, 0, 0];
        this.scale = scale;

        this.gl = gl;
        this.jsonObj = jsonObj;
        this.program = program;
        this.gl.useProgram(program);

        this.vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.vao);
        this.positionBuffer = this.gl.createBuffer();
        this.normalBuffer = this.gl.createBuffer();
        this.indexBuffer = this.gl.createBuffer();
        this.setUp();
        this.updateWorld();
    }

    setUp(){
        this.gl.useProgram(this.program);
        this.positionLocation = this.gl.getAttribLocation(this.program, this.jsonObj.attribNames[0]);
        this.normalLocation = this.gl.getAttribLocation(this.program, this.jsonObj.attribNames[1]);

        this.diffuseLocation = this.gl.getUniformLocation(this.program, this.jsonObj.uniformNames[0]);
        this.lightDirectionLocation = this.gl.getUniformLocation(this.program, this.jsonObj.uniformNames[1]);
        this.projectionLocation = this.gl.getUniformLocation(this.program, this.jsonObj.uniformNames[2]);
        this.viewLocation = this.gl.getUniformLocation(this.program, this.jsonObj.uniformNames[3]);
        this.worldLocation = this.gl.getUniformLocation(this.program, this.jsonObj.uniformNames[4]);
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.mesh.vertices), this.gl.STATIC_DRAW);
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.mesh.vertexNormals), this.gl.STATIC_DRAW);
        
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.mesh.indices), this.gl.STATIC_DRAW);
    }

    updateWorld(){
        this.worldMatrix = utils.MakeWorld(this.position[0], this.position[1], this.position[2],
                                    this.rotation[0], this.rotation[1], this.rotation[2],
                                    this.scale);
    }

    draw(camera, light){
        this.gl.useProgram(this.program);
        this.gl.bindVertexArray(this.vao);

        this.gl.enableVertexAttribArray(this.positionLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.vertexAttribPointer(this.positionLocation, 3, this.gl.FLOAT, false, 0, 0);
        
        this.gl.enableVertexAttribArray(this.normalLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
        this.gl.vertexAttribPointer(this.normalLocation, 3, this.gl.FLOAT, false, 0, 0);
        
        this.gl.uniformMatrix4fv(this.projectionLocation, false,
            utils.transposeMatrix(camera.projectionMatrix));
        this.gl.uniformMatrix4fv(this.viewLocation, false,
            utils.transposeMatrix(camera.viewMat));
        this.gl.uniformMatrix4fv(this.worldLocation, false,
            utils.transposeMatrix(this.worldMatrix));
        this.gl.uniform4fv(this.diffuseLocation,light.diffuse);
        this.gl.uniform3fv(this.lightDirectionLocation, utils.normalize(light.direction));

        this.gl.bindVertexArray(this.vao);
        this.gl.drawElements(this.gl.TRIANGLES, this.mesh.indices.length, this.gl.UNSIGNED_SHORT, 0 );
        this.gl.disableVertexAttribArray(this.positionLocation);
        this.gl.disableVertexAttribArray(this.normalLocation);
    }
}