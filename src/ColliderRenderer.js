import {utils} from "./utils.js";

export class ColliderRenderer {
    constructor(program, jsonObj, gl, parent){
        
        this.color = [0, 0, 1.0, 1.0];
        this.parent = parent; //collider which this renderer is attached to
        this.mesh = this.computeMesh();

        this.gl = gl;
        this.jsonObj = jsonObj;
        this.program = program;
        this.gl.useProgram(program);

        this.vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.vao);
        this.positionBuffer = this.gl.createBuffer();
        this.indexBuffer = this.gl.createBuffer();
        this.setUp();
    }

    computeMesh(){
        let mesh = {
            vertices : [
                this.parent.boundariesOriginal[0], this.parent.boundariesOriginal[1],this.parent.boundariesOriginal[2],
                this.parent.boundariesOriginal[0], this.parent.boundariesOriginal[1], this.parent.boundariesOriginal[5],
                this.parent.boundariesOriginal[0], this.parent.boundariesOriginal[1],this.parent.boundariesOriginal[5],
                this.parent.boundariesOriginal[0], this.parent.boundariesOriginal[4], this.parent.boundariesOriginal[5],
                this.parent.boundariesOriginal[0], this.parent.boundariesOriginal[4],this.parent.boundariesOriginal[5],
                this.parent.boundariesOriginal[0], this.parent.boundariesOriginal[4], this.parent.boundariesOriginal[2],
                this.parent.boundariesOriginal[0], this.parent.boundariesOriginal[4],this.parent.boundariesOriginal[2],
                this.parent.boundariesOriginal[0], this.parent.boundariesOriginal[1], this.parent.boundariesOriginal[2],

                this.parent.boundariesOriginal[3], this.parent.boundariesOriginal[1],this.parent.boundariesOriginal[2],
                this.parent.boundariesOriginal[3], this.parent.boundariesOriginal[1], this.parent.boundariesOriginal[5],
                this.parent.boundariesOriginal[3], this.parent.boundariesOriginal[1],this.parent.boundariesOriginal[5],
                this.parent.boundariesOriginal[3], this.parent.boundariesOriginal[4], this.parent.boundariesOriginal[5],
                this.parent.boundariesOriginal[3], this.parent.boundariesOriginal[4],this.parent.boundariesOriginal[5],
                this.parent.boundariesOriginal[3], this.parent.boundariesOriginal[4], this.parent.boundariesOriginal[2],
                this.parent.boundariesOriginal[3], this.parent.boundariesOriginal[4],this.parent.boundariesOriginal[2],
                this.parent.boundariesOriginal[3], this.parent.boundariesOriginal[1], this.parent.boundariesOriginal[2],

                this.parent.boundariesOriginal[3], this.parent.boundariesOriginal[1],this.parent.boundariesOriginal[2],
                this.parent.boundariesOriginal[0], this.parent.boundariesOriginal[1], this.parent.boundariesOriginal[2],
                this.parent.boundariesOriginal[3], this.parent.boundariesOriginal[1],this.parent.boundariesOriginal[5],
                this.parent.boundariesOriginal[0], this.parent.boundariesOriginal[1], this.parent.boundariesOriginal[5],
                this.parent.boundariesOriginal[3], this.parent.boundariesOriginal[4],this.parent.boundariesOriginal[5],
                this.parent.boundariesOriginal[0], this.parent.boundariesOriginal[4], this.parent.boundariesOriginal[5],
                this.parent.boundariesOriginal[3], this.parent.boundariesOriginal[4],this.parent.boundariesOriginal[2],
                this.parent.boundariesOriginal[0], this.parent.boundariesOriginal[4], this.parent.boundariesOriginal[2],
            ],
            indices : [
                ...Array(24).keys()
            ]
        };
        return mesh;
    }

    setUp(){
        this.gl.useProgram(this.program);
        this.positionLocation = this.gl.getAttribLocation(this.program, this.jsonObj.attribNames[0]);
        
        this.colorLocation = this.gl.getUniformLocation(this.program, this.jsonObj.uniformNames[0]);
        this.projectionMatrixLocation = this.gl.getUniformLocation(this.program, this.jsonObj.uniformNames[1]);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.mesh.vertices), this.gl.STATIC_DRAW);
        
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.mesh.indices), this.gl.STATIC_DRAW);
    }

    draw(camera){
        this.gl.useProgram(this.program);
        this.gl.bindVertexArray(this.vao);

        this.gl.enableVertexAttribArray(this.positionLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.vertexAttribPointer(this.positionLocation, 3, this.gl.FLOAT, false, 0, 0);
        
        //uniforms
        let viewWorld = utils.multiplyMatrices( camera.getViewMatrix(), this.parent.worldMatrix);
        this.gl.uniformMatrix4fv(this.projectionMatrixLocation, false, utils.transposeMatrix(utils.multiplyMatrices(camera.projectionMatrix, viewWorld)));
        this.gl.uniform4fv(this.colorLocation, this.color);
        

        this.gl.bindVertexArray(this.vao);
        this.gl.drawElements(this.gl.LINES, this.mesh.indices.length, this.gl.UNSIGNED_SHORT, 0 );
        this.gl.disableVertexAttribArray(this.positionLocation);
    }
}