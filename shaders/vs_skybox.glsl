#version 300 es

in vec4 a_position;
out vec4 v_position;

uniform mat4 u_viewDirectionProjectionInverse;
void main() {
  v_position = u_viewDirectionProjectionInverse * a_position;
  gl_Position = a_position;
  gl_Position.z = 1.0;
}