#version 300 es

precision mediump float;

in vec3 v_normal;
in vec3 v_position;
in vec2 v_uv;

out vec4 outColor;

uniform sampler2D u_texture; 
uniform float u_isTexturePresent; //1 if using texture
uniform vec3 u_eyePos; //eye position is camera position

uniform vec4 u_diffuseColor; //material diffuse color
uniform vec4 u_specularColor; //material specular color
uniform vec4 u_ambientColor; //material ambient color
uniform float u_dToonTh; //toon shading threshold for diffuse component
uniform float u_sToonTh; //toon shading threshold for specular component

//point light
uniform vec4 u_pointLightColor; //point light color 
uniform vec3 u_pointLightPosition; //point light position
uniform float u_pointLightTarget; //point light target (g)
uniform float u_pointLightDecay; //point light decay (beta)

//directional light
uniform vec3 u_dirLightDirection; //directional light direction
uniform vec4 u_dirLightColor; //directional light color

void main() {
    vec3 normalizedEyeDirVec = normalize(u_eyePos - v_position);
    vec3 normalizedNormal = normalize(v_normal);

    //handle texture color
    vec4 textureColor = texture(u_texture, v_uv);
    vec4 diffuseColor = u_diffuseColor * (1.0 - u_isTexturePresent) + textureColor * u_isTexturePresent;
    vec4 ambientColor = u_ambientColor * (1.0 - u_isTexturePresent) + textureColor * u_isTexturePresent;

    //point light
    vec4 pointLightColor = u_pointLightColor * pow(u_pointLightTarget / length(u_pointLightPosition - v_position), u_pointLightDecay);
    vec3 normalizedPointLightDirection = normalize(u_pointLightPosition - v_position);
    
    //directional light
    vec3 normalizedDirLightDirection = normalize(u_dirLightDirection);
    vec4 dirLightColor = u_dirLightColor;

    //diffuse color w/ toon 
    vec4 pointLightDiffuseToonColor = diffuseColor * pointLightColor * max(sign(dot(normalizedPointLightDirection, normalizedNormal) - u_dToonTh),0.0);

    vec4 dirLightDiffuseToonColor = diffuseColor * dirLightColor * max(sign(dot(normalizedDirLightDirection, normalizedNormal) - u_dToonTh),0.0);

    //specular color w/ toon (Phong)
    vec3 reflectionPointLight = -reflect(normalizedPointLightDirection, normalizedNormal);
    float dotPointLightDirNormalVec = max(dot(normalizedNormal, normalizedPointLightDirection), 0.0);
    float dotReflectionPointEyeDir = max(dot(reflectionPointLight, normalizedEyeDirVec), 0.0);
    vec4 pointLightSpecularColor = pointLightColor * u_specularColor * max(sign(dotPointLightDirNormalVec),0.0);
    vec4 pointLightSpecularToon = max(sign(dotReflectionPointEyeDir - u_sToonTh), 0.0) * pointLightSpecularColor;

    vec3 reflectionDirLight = -reflect(normalizedDirLightDirection, normalizedNormal);
    float dotDirLightDirNormalVec = max(dot(normalizedNormal, normalizedDirLightDirection), 0.0);
    float dotReflectionDirEyeDir = max(dot(reflectionDirLight, normalizedEyeDirVec), 0.0);
    vec4 dirLightSpecularColor = dirLightColor * u_specularColor * max(sign(dotDirLightDirNormalVec),0.0);
    vec4 dirLightSpecularToon = max(sign(dotReflectionDirEyeDir - u_sToonTh), 0.0) * dirLightSpecularColor;

    //ambient color
    vec4 ambientColorResult = u_ambientColor * ambientColor;

    outColor = vec4(clamp(ambientColorResult +
                            pointLightDiffuseToonColor + 
                            dirLightDiffuseToonColor +
                            pointLightSpecularToon +
                            dirLightSpecularToon, 0.0, 1.0)); 
}