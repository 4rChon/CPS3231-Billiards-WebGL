function GameSystem() {
  this.context;
  this.game_objects = [];

  this.sensitivity = 1.0;
  this.delta = 0.1;
}

GameSystem.prototype.init = function() {
  var input_system = this.context.systems.input;
  input_system.add_keycode_callback(87, this.forward.bind(this));
  input_system.add_keycode_callback(83, this.back.bind(this));
  input_system.add_keycode_callback(65, this.rotate_left.bind(this));
  input_system.add_keycode_callback(68, this.rotate_right.bind(this));
  input_system.add_keycode_callback(82, this.increase_sensitivity.bind(this));
  input_system.add_keycode_callback(84, this.decrease_sensitivity.bind(this));
  input_system.add_keycode_callback(32, this.shoot.bind(this));

  return this;
}

GameSystem.prototype.update = function() {
  return true;
}

GameSystem.prototype.forward = function() {
  this.context.camera.zoom(-this.delta);
}

GameSystem.prototype.back = function() {
  this.context.camera.zoom(this.delta);
}

GameSystem.prototype.rotate_left = function() {
  this.context.camera.yaw(this.delta * this.sensitivity);
}

GameSystem.prototype.rotate_right = function() {
  this.context.camera.yaw(-this.delta * this.sensitivity);
}

GameSystem.prototype.increase_sensitivity = function() {
  this.sensitivity -= 0.1;
  this.sensitivity = Math.max(0.2, this.sensitivity);
  console.log(this.sensitivity);
}

GameSystem.prototype.decrease_sensitivity = function() {
  this.sensitivity += 0.1;
  this.sensitivity = Math.min(2, this.sensitivity);
  console.log(this.sensitivity);
}

GameSystem.prototype.shoot = function() {

}


