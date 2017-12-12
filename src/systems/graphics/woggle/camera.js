function Camera() {
  this.position = vec3.create();
  this.target = vec3.create();
  this.up = vec3.create();

  //this.perspective;
  this.view = mat4.create();
  this.projection = mat4.create();

  this.near = 0;
  this.far = 0;
  this.fov = 0;
  this.aspect = 0;

}

Camera.prototype.init = function () {
  // set view frustum
  mat4.make_identity(this.view);
  mat4.make_identity(this.projection);

  mat4.make_projection(this.projection, this.near, this.far, this.fov, this.aspect); 
  return this;
}

Camera.prototype.look_at = function(position, target, up)
{
  this.position = position;
  this.target = target;
  this.up = up;
  mat4.look_at(this.view, this.position, this.target, this.up);
  return this;
}

Camera.prototype.yaw = function(rotation) {
  // get forward vector
  var forward = vec3.create();
  vec3.sub(forward, this.position, this.target);
  vec3.normalise(forward, forward);

  var direction = vec3.create();
  // Up x Forward
  vec3.cross(direction, forward, this.up);
  vec3.normalise(direction, direction);
  vec3.mult(direction, direction, rotation);
  vec3.add(this.position, this.position, direction);
}

Camera.prototype.zoom = function(translation) {
  var direction = vec3.create()
  vec3.sub(direction, this.position, this.target);
  vec3.normalise(direction, direction);
  vec3.mult(direction, direction, translation);
  vec3.add(this.position, this.position, direction);
}

Camera.prototype.update = function() {
  var view_transform = mat4.create();
  mat4.make_identity(view_transform);
  mat4.multiply_point(this.target, view_transform, this.position);
  this.look_at(this.target, [0, 0, 0], [0, 1, 0])
}