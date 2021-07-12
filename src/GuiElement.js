export class GuiElement {
    constructor(program, jsonObj, gl, position, height, width, color, texture = null){
        this.position = position;
        this.height = height;
        this.width = width;
        
        this.texture = texture;
        this.color = color;
        this.gl = gl;
        var aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        this.mesh = {
            vertices :[
                this.position[0]-this.width/(2*aspect), this.position[1]-this.height/(2*aspect),
                this.position[0]+this.width/(2*aspect), this.position[1]-this.height/(2*aspect),
                this.position[0]+this.width/(2*aspect), this.position[1]+this.height/(2*aspect),
                this.position[0]-this.width/(2*aspect), this.position[1]+this.height/(2*aspect)
            ],
            textures : [
                0, 0,
                1, 0,
                1, 1,
                0, 1
            ],
            indices : [
                0, 1, 2, 3, 0, 2
            ]
        };

        
        this.jsonObj = jsonObj;
        this.program = program;
        this.gl.useProgram(program);

        this.vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.vao);
        this.positionBuffer = this.gl.createBuffer();
        this.uvBuffer = this.gl.createBuffer();
        this.indexBuffer = this.gl.createBuffer();
        this.setUp();
    }

    resize(){
        var aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        this.mesh = {
            vertices :[
                this.position[0]-this.width/(2*aspect), this.position[1]-this.height/(2*aspect),
                this.position[0]+this.width/(2*aspect), this.position[1]-this.height/(2*aspect),
                this.position[0]+this.width/(2*aspect), this.position[1]+this.height/(2*aspect),
                this.position[0]-this.width/(2*aspect), this.position[1]+this.height/(2*aspect)
            ],
            textures : [
                0, 0,
                1, 0,
                1, 1,
                0, 1
            ],
            indices : [
                0, 1, 2, 3, 0, 2
            ]
        };
        //this.setUp();
    }

    setUp(){
        this.gl.useProgram(this.program);
        this.positionLocation = this.gl.getAttribLocation(this.program, this.jsonObj.attribNames[0]);
        this.uvLocation = this.gl.getAttribLocation(this.program, this.jsonObj.attribNames[1]);

        this.textureLocation = this.gl.getUniformLocation(this.program, this.jsonObj.uniformNames[0]);
        this.textureBoolLocation = this.gl.getUniformLocation(this.program, this.jsonObj.uniformNames[1]);
        this.colorLocation = this.gl.getUniformLocation(this.program, this.jsonObj.uniformNames[2]);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.mesh.vertices), this.gl.STATIC_DRAW);
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.uvBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.mesh.textures), this.gl.STATIC_DRAW);
        
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.mesh.indices), this.gl.STATIC_DRAW);
    }

    draw(){
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.enable(this.gl.BLEND);
        this.gl.useProgram(this.program);
        this.gl.bindVertexArray(this.vao);

        this.gl.enableVertexAttribArray(this.positionLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);
        
        this.gl.enableVertexAttribArray(this.uvLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.uvBuffer);
        this.gl.vertexAttribPointer(this.uvLocation, 2, this.gl.FLOAT, false, 0, 0);
        
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

        //lights uniform
        this.gl.uniform4fv(this.colorLocation, this.color);
        
        this.gl.bindVertexArray(this.vao);
        this.gl.drawElements(this.gl.TRIANGLES, this.mesh.indices.length, this.gl.UNSIGNED_SHORT, 0 );
        this.gl.disableVertexAttribArray(this.positionLocation);
        this.gl.disableVertexAttribArray(this.uvLocation);
    }
}