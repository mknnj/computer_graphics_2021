#version 300 es

precision mediump float;

in vec3 v_position;
in vec3 v_normal;
in vec2 v_uv;

out vec4 outColor;

uniform sampler2D u_texture; 
uniform float u_isTexturePresent; //1 if using texture

uniform vec4 u_diffuseColor; //material diffuse color
uniform vec4 u_specularColor; //material specular color
uniform vec4 u_ambientMatColor; //material ambient color
uniform float u_phongGamma; //gamma parameter for Phong reflection
uniform float u_alpha; //alpha of final color

//spot light
uniform vec4 u_spotColor;  
uniform vec3 u_spotPos; 
uniform float u_spotTarget; 
uniform float u_spotDecay; 
uniform float u_spotConeOut;
uniform float u_spotConeIn;
uniform vec3 u_spotDir;

//directional light
uniform vec3 u_dirLightDirection; //directional light direction
uniform vec4 u_dirLightColor; //directional light color

//ambient light
uniform vec4 u_ambientLight; //ambient light color

void main() {
    vec3 normalizedEyeDirVec = normalize(- v_position);
    vec3 normalizedNormal = normalize(v_normal);

    //handle texture color
    vec4 textureColor = texture(u_texture, v_uv);
    vec4 diffuseColor = u_diffuseColor * (1.0 - u_isTexturePresent) + textureColor * u_isTexturePresent;
    vec4 ambientColor = u_ambientMatColor * (1.0 - u_isTexturePresent) + textureColor * u_isTexturePresent;


    //spot light

    float spotCosOut = cos(radians(u_spotConeOut / 2.0));
	float spotCosIn = cos(radians(u_spotConeOut * u_spotConeIn / 2.0));
    vec3 spotDir = normalize(u_spotPos - v_position);
    vec3 nSpotDir = normalize(u_spotDir);
	float cosSpot = dot(spotDir, nSpotDir);
	vec4 spotColor = u_spotColor * pow(u_spotTarget / length(u_spotPos - v_position), u_spotDecay) *
						clamp((cosSpot - spotCosOut) / (spotCosIn - spotCosOut), 0.0, 1.0);

    

    
    //directional light
    vec3 normalizedDirLightDirection = normalize(u_dirLightDirection);

    vec4 spotDiffuseColor = clamp(diffuseColor * spotColor * dot(- nSpotDir, normalizedNormal), 0.0, 1.0);
    vec4 dirLightDiffuseColor = clamp(diffuseColor * u_dirLightColor * dot(- normalizedDirLightDirection, normalizedNormal), 0.0, 1.0);

    //specular color 
    vec3 reflectionSpot = - reflect(spotDir, normalizedNormal);
    float dotSpotDirNormalVec = max(dot(normalizedNormal, spotDir), 0.0);
    float dotReflectionSpotEyeDir = max(dot(reflectionSpot, normalizedEyeDirVec), 0.0);
    vec4 spotSpecularColor = spotColor * u_specularColor * max(sign(dotSpotDirNormalVec),0.0);
    vec4 spotSpecular = pow(dotReflectionSpotEyeDir, u_phongGamma) * spotSpecularColor;

    vec3 reflectionDirLight = -reflect(normalizedDirLightDirection, normalizedNormal);
    float dotDirLightDirNormalVec = max(dot(normalizedNormal, normalizedDirLightDirection), 0.0);
    float dotReflectionDirEyeDir = max(dot(reflectionDirLight, normalizedEyeDirVec), 0.0);
    vec4 dirLightSpecularColor = u_dirLightColor * u_specularColor * max(sign(dotDirLightDirNormalVec),0.0);
    vec4 dirLightSpecular = clamp(pow(dotReflectionDirEyeDir, u_phongGamma) * dirLightSpecularColor, 0.0, 1.0);

    //ambient color
    vec4 ambientColorResult =clamp( u_ambientLight * ambientColor, 0.0, 1.0);

    outColor = vec4(clamp(ambientColorResult +
                            spotDiffuseColor +
                            dirLightDiffuseColor + 
                            spotSpecular +
                            dirLightSpecular
                            , 0.0, 1.0).xyz, u_alpha);
    
}