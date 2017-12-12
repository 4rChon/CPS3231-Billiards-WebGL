//--------------------------------------------------------------------------------------------------------//
//  Material
//--------------------------------------------------------------------------------------------------------//
function Material() {
  this.ambient = [0.2, 0.2, 0.2];
  this.diffuse = [1, 1, 1];
  this.specular = [1, 1, 1];
  this.shininess = 32.0;

  this.albedo_texture = 0;

  this.shader_indices = {
      bound : false, ambient : 0, diffuse : 0, specular : 0, shininess : 0, sampler_index : 0
  }
}

Material.prototype.set_albedo = function(gl, albedo) {
  var texture_image = albedo;

  this.albedo_texture = gl.createTexture();

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, this.albedo_texture);

  // Flip the image's Y axis to match the WebGL texture coordinate space.
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  // Set the parameters so we can render any size image.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture_image);

  return this; // for chaining
}

Material.prototype.set_ambient = function(ambient_contribution) {
  this.ambient = ambient_contribution;
  return this; // for chaining
}

Material.prototype.set_diffuse = function(diffuse_contribution) {
  this.diffuse = diffuse_contribution;
  return this; // for chaining
}

Material.prototype.set_specular = function(specular_contribution) {
  this.specular = specular_contribution;
  return this; // for chaining
}

Material.prototype.set_shininess = function(shininess_factor) {
  this.shininess = shininess_factor;
  return this; // for chaining
}

Material.prototype.bind = function(gl, shader_program) {
  this.shader_indices.bound = true;
  this.shader_indices.ambient = gl.getUniformLocation(shader_program, "u_ambient");
  this.shader_indices.diffuse = gl.getUniformLocation(shader_program, "u_diffuse");
  this.shader_indices.specular = gl.getUniformLocation(shader_program, "u_specular");
  this.shader_indices.shininess = gl.getUniformLocation(shader_program, "u_shininess");
  this.shader_indices.sampler_index = gl.getUniformLocation(shader_program, "u_texture_0" );

  return this; // for chaining
}

Material.prototype.use = function(gl) {
  // Material must be bound before use
  if (!this.shader_indices.bound) { 
      alert("Please bind material before using it!");
      return;
  }
  
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, this.albedo_texture);

  gl.uniform1i(this.shader_indices.sampler_index, 0);
  gl.uniform3f(this.shader_indices.ambient, this.ambient[0], this.ambient[1], this.ambient[2]);
  gl.uniform3f(this.shader_indices.diffuse, this.diffuse[0], this.diffuse[1], this.diffuse[2]);
  gl.uniform3f(this.shader_indices.specular, this.specular[0], this.specular[1], this.specular[2]);
  gl.uniform1f(this.shader_indices.shininess, this.shininess);
  
  return this; // for chaining
}