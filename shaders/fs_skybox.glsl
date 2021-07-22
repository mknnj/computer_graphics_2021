#version 300 es
precision highp float;

uniform samplerCube u_skybox;


in vec4 v_position;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  outColor = texture(u_skybox, normalize(v_position.xyz / v_position.w));
}