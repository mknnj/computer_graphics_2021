import {utils} from "./utils.js"

export class Cube {
    constructor(program, jsonObj, gl, mesh){
        this.mesh = mesh;
        this.position = [0, 0, 0];
        this.rotation = [0, 0, 0];
        this.scale = 1;
        this.gl = gl;
        this.jsonObj = jsonObj;
        this.program = program;
        this.gl.useProgram(program);
        this.vao = this.gl.createVertexArray();
        this.positionBuffer = this.gl.createBuffer();
        this.normalBuffer = this.gl.createBuffer();
        this.indexBuffer = this.gl.createBuffer();
        this.setUp();
        this.updateWorld();
    }

    setUp(){
        this.positionLocation = this.gl.getAttribLocation(this.program, this.jsonObj.attribNames[0]);
        this.normalLocation = this.gl.getAttribLocation(this.program, this.jsonObj.attribNames[1]);

        this.diffuseLocation = this.gl.getUniformLocation(this.program, this.jsonObj.uniformNames[0]);
        this.lightDirectionLocation = this.gl.getUniformLocation(this.program, this.jsonObj.uniformNames[1]);
        this.projectionLocation = this.gl.getUniformLocation(this.program, this.jsonObj.uniformNames[2]);
        this.viewLocation = this.gl.getUniformLocation(this.program, this.jsonObj.uniformNames[3]);
        this.worldLocation = this.gl.getUniformLocation(this.program, this.jsonObj.uniformNames[4]);
        
        this.gl.bindVertexArray(this.vao);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.mesh.vertices, this.gl.STATIC_DRAW);
        this.gl.enableVertexAttribArray(this.positionLocation);
        this.gl.vertexAttribPointer(this.positionLocation, 3, this.gl.FLOAT, false, 0, 0);
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.mesh.vertexNormals, this.gl.STATIC_DRAW);
        this.gl.enableVertexAttribArray(this.normalLocation);
        this.gl.vertexAttribPointer(this.normalLocation, 3, this.gl.FLOAT, false, 0, 0);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.mesh.indices, this.gl.STATIC_DRAW);
        console.log(this.mesh)
    }

    updateWorld(){
        this.worldMatrix = utils.MakeWorld(this.position[0], this.position[1], this.position[2],
                                    this.rotation[0], this.rotation[1], this.rotation[2],
                                    this.scale);
    }

    draw(camera){
        this.gl.useProgram(this.program);
        
        this.gl.uniformMatrix4fv(this.projectionLocation, false,
            utils.transposeMatrix(camera.projectionMatrix));
        this.gl.uniformMatrix4fv(this.viewLocation, false,
            utils.transposeMatrix(camera.viewMat));
        this.gl.uniformMatrix4fv(this.worldLocation, false,
            utils.transposeMatrix(this.worldMatrix));
        this.gl.uniform4fv(this.diffuseLocation,[1, 0.7, 0.5, 1]);
        this.gl.uniform3fv(this.lightDirectionLocation, utils.normalize([-1, 3, 5]));
        
        this.gl.bindVertexArray(this.vao);
        
        this.gl.drawElements(this.gl.TRIANGLES, 0, this.gl.UNSIGNED_SHORT, 0 );
    }
}