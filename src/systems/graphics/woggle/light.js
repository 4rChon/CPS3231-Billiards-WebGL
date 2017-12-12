//--------------------------------------------------------------------------------------------------------//
//  Light
//--------------------------------------------------------------------------------------------------------//
function Light() {
  this.type = 0; // Directional light

  this.position = [0, 0, 0];
  this.direction = [0, -1, 0];

  this.ambient = [0.2, 0.2, 0.2];
  this.diffuse = [0.5, 0.5, 0.5];
  this.specular = [0.5, 0.5, 0.5];

  this.alpha = 0.965;
  this.beta = 0.82;

  this.attenuation = 0;

  this.shader_indices = {
    bound : false, type_vertex : 0, type_fragment : 0, position : 0, direction : 0,
    ambient : 0, diffuse : 0, specular : 0,
    alpha : 0, beta : 0, attenuation : 0
  };
}

Light.LIGHT_TYPE = {
  DIRECTIONAL : 0,
  POINT : 1,
  SPOT : 2
}

Light.ATTENUATION_TYPE = {
  NONE : 0,
  LINEAR : 1,
  QUAD: 2
}

Light.prototype.set_type = function(light_type) {
  this.type = light_type;
  return this; // for chaining
}

Light.prototype.set_position = function (pos) {
  this.position = pos;
  return this; // for chaining
}

Light.prototype.set_direction = function(dir) {
  this.direction = dir;
  return this; // for chaining
}

Light.prototype.set_ambient = function(ambient_contribution) {
  this.ambient = ambient_contribution;
  return this; // for chaining
}

Light.prototype.set_diffuse = function(diffuse_contribution) {
  this.diffuse = diffuse_contribution;
  return this; // for chaining
}

Light.prototype.set_specular = function(specular_contribution) {
  this.specular = specularContribution;
  return this; // for chaining
}

Light.prototype.set_attenuation_type = function(type) {
  this.attenuation = type;
  return this; // for chaining
}

Light.prototype.setCone = function(inner, outer) {
  this.alpha = inner;
  this.beta = outer;
  return this; // for chaining
}

Light.prototype.bind = function(gl, shader_program, light_index) {
  var light_vertex_prefix = "light_vertex[" + light_index + "].";
  var light_fragment_prefix = "light_fragment[" + light_index + "].";

  this.shader_indices.bound = true;
  this.shader_indices.position = gl.getUniformLocation(shader_program, light_vertex_prefix + "position");
  this.shader_indices.direction = gl.getUniformLocation(shader_program, light_vertex_prefix + "direction");
  this.shader_indices.type_vertex = gl.getUniformLocation(shader_program, light_vertex_prefix + "type"); 
  this.shader_indices.type_fragment = gl.getUniformLocation(shader_program, light_fragment_prefix + "type");
  this.shader_indices.attenuation = gl.getUniformLocation(shader_program, light_fragment_prefix + "attenuation");
  this.shader_indices.alpha = gl.getUniformLocation(shader_program, light_fragment_prefix + "alpha");
  this.shader_indices.beta = gl.getUniformLocation(shader_program, light_fragment_prefix + "beta");
  this.shader_indices.ambient = gl.getUniformLocation(shader_program, light_fragment_prefix + "ambient");
  this.shader_indices.diffuse = gl.getUniformLocation(shader_program, light_fragment_prefix + "diffuse");
  this.shader_indices.specular = gl.getUniformLocation(shader_program, light_fragment_prefix + "specular");

  return this; // for chaining
}

Light.prototype.use_transformed = function(gl, transform) {
  // Light must be bound before use
  if (!this.shader_indices.bound) { 
    alert("Please bind light before using it!");
    return;
  }

  var d = vec3.create(),
      p = vec3.create();

  mat4.multiply_vector(d, transform, this.direction);
  mat4.multiply_point(p, transform, this.position);

  gl.uniform1i(this.shader_indices.type_vertex, this.type);
  gl.uniform1i(this.shader_indices.type_fragment, this.type);
  gl.uniform1i(this.shader_indices.attenuation, this.attenuation);
  gl.uniform1f(this.shader_indices.alpha, this.alpha);
  gl.uniform1f(this.shader_indices.beta, this.beta);
  gl.uniform3f(this.shader_indices.position, p[0], p[1], p[2]);
  gl.uniform3f(this.shader_indices.direction, d[0], d[1], d[2]);
  gl.uniform3f(this.shader_indices.ambient, this.ambient[0], this.ambient[1], this.ambient[2]);
  gl.uniform3f(this.shader_indices.diffuse, this.diffuse[0], this.diffuse[1], this.diffuse[2]);
  gl.uniform3f(this.shader_indices.specular, this.specular[0], this.specular[1], this.specular[2]);

  return this; // for chaining
}

Light.prototype.use = function(gl) {
  // Light must be bound before use
  if (!this.shader_indices.bound) { 
    alert("Please bind light before using it!");
    return;
  }

  gl.uniform1i(this.shader_indices.type_vertex, this.type);
  gl.uniform1i(this.shader_indices.type_fragment, this.type);
  gl.uniform1i(this.shader_indices.attenuation, this.attenuation);
  gl.uniform1f(this.shader_indices.alpha, this.alpha);
  gl.uniform1f(this.shader_indices.beta, this.beta);
  gl.uniform3f(this.shader_indices.position, this.position[0], this.position[1], this.position[2]);
  gl.uniform3f(this.shader_indices.direction, this.direction[0], this.direction[1], this.direction[2]);
  gl.uniform3f(this.shader_indices.ambient, this.ambient[0], this.ambient[1], this.ambient[2]);
  gl.uniform3f(this.shader_indices.diffuse, this.diffuse[0], this.diffuse[1], this.diffuse[2]);
  gl.uniform3f(this.shader_indices.specular, this.specular[0], this.specular[1], this.specular[2]);

  return this; // for chaining
}