function Camera() {
  this.position = vec3.create();
  this.target = vec3.create();

  this.up = vec3.create();

  this.view = mat4.create();
  this.projection = mat4.create();

  this.near = 0;
  this.far = 0;
  this.fov = 0;
  this.aspect = 0;

  this.target_list = {};

}

Camera.prototype.init = function () {
  // set view frustum
  mat4.make_identity(this.view);
  mat4.make_identity(this.projection);

  mat4.make_projection(this.projection, this.near, this.far, this.fov, this.aspect); 

  return this;
}

Camera.prototype.yaw = function(delta) {
  // get forward vector
  var forward = vec3.create();
  vec3.sub(forward, this.position, this.target);
  vec3.normalise(forward, forward);

  var direction = vec3.create();
  // Up x Forward
  vec3.cross(direction, forward, this.up);
  vec3.normalise(direction, direction);
  vec3.mult(direction, direction, delta);
  vec3.add(this.position, this.position, direction);
}

Camera.prototype.zoom = function(delta) {
  var direction = vec3.create()
  vec3.sub(direction, this.position, this.target);
  vec3.normalise(direction, direction);
  vec3.mult(direction, direction, delta);
  vec3.add(this.position, this.position, direction);
}

Camera.prototype.pitch = function(delta) {
  // get forward vector
  var forward = vec3.create();
  vec3.sub(forward, this.position, this.target);
  vec3.normalise(forward, forward);

  var right = vec3.create();
  // Up x Forward
  vec3.cross(right, forward, this.up);
  vec3.normalise(right, right);
  vec3.mult(right, right, delta);

  var direction = vec3.create();
  // Right x Forward
  vec3.cross(direction, right, forward);
  vec3.normalise(direction, direction);
  vec3.mult(direction, direction, delta)

  delta > 0
    ? vec3.add(this.position, this.position, direction)
    : vec3.sub(this.position, this.position, direction);
}

Camera.prototype.add_target = function(node) {
  this.target_list[node.name] = node.position;
}

Camera.prototype.switch_target = function(name) {
  this.target = this.target_list[name];
}

Camera.prototype.update = function() {
  mat4.look_at(this.view, this.position, this.target, this.up);
}