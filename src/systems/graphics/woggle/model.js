function Model() {
  this.name = "untitled";

  this.vertex = [];
  this.vertex_buffer = null;

  this.index = [];
  this.index_buffer = null;

  this.material = null;
}

Model.prototype.compile = function(scene) {
  this.vertex_buffer = scene.gl.createBuffer();
  scene.gl.bindBuffer(scene.gl.ARRAY_BUFFER, this.vertex_buffer);
  scene.gl.bufferData(scene.gl.ARRAY_BUFFER, new Float32Array(this.vertex), scene.gl.STATIC_DRAW);

  this.index_buffer = scene.gl.createBuffer();
  scene.gl.bindBuffer(scene.gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
  scene.gl.bufferData(scene.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.index), scene.gl.STATIC_DRAW);

  return this;
}

Model.prototype.draw = function(scene, transform) {
  if (this.index_buffer == null || this.vertex_buffer == null) {
    alert("Cannot bind index or vertex buffer for model " + this.name + "!");
    return;
  }

  if (this.material == null) {
    alert(this.name + " has no material assigned!");
    return;
  }

  scene.set_model(transform);
  scene.update_model();
  scene.bind_model_data(this.vertex_buffer, this.index_buffer);

  this.material.use(scene.gl);

  scene.gl.drawElements(scene.gl.TRIANGLES, this.index.length, scene.gl.UNSIGNED_SHORT, 0);
}