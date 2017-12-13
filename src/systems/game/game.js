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
  input_system.add_keycode_callback(65, this.yaw_left.bind(this));
  input_system.add_keycode_callback(68, this.yaw_right.bind(this));
  input_system.add_keycode_callback(90, this.pitch_up.bind(this));
  input_system.add_keycode_callback(67, this.pitch_down.bind(this));
  input_system.add_keycode_callback(82, this.increase_sensitivity.bind(this));
  input_system.add_keycode_callback(84, this.decrease_sensitivity.bind(this));

  input_system.add_keycode_callback(81, this.switch_to_table.bind(this));
  input_system.add_keycode_callback(69, this.switch_to_cueball.bind(this));

  input_system.add_keycode_callback(32, this.shoot.bind(this));

  this.reset_table();
  this.reset_balls();
  this.reset_camera();

  return this;
}

GameSystem.prototype.update = function() {
  return true;
}

GameSystem.prototype.reset_balls = function() {
  var cueball = this.context.nodes.cueball;
  var balls = this.context.nodes.balls;

  var table_level = -4.25;
  for (var ball in balls) {
    balls[ball].rotate([0.05, 0, 0]);
    balls[ball].translate([0, table_level, 0]);
  }
  cueball.translate([1, table_level, 0]);

  var ball_diameter = 0.048;

  balls[0].translate([0, 0, ball_diameter]);
  balls[1].translate([-2 * Math.sin(util.to_radians(60)) * ball_diameter, 0, -ball_diameter]);
  balls[2].translate([-Math.sin(util.to_radians(60)) * ball_diameter, 0, Math.cos(util.to_radians(60)) * ball_diameter]);
  balls[3].translate([-2 * Math.sin(util.to_radians(60)) * ball_diameter, 0, ball_diameter]);
  balls[4].translate([-2 * Math.sin(util.to_radians(60)) * ball_diameter, 0, 2 * ball_diameter]);
  balls[5].translate([-Math.sin(util.to_radians(60)) * ball_diameter, 0, -ball_diameter - Math.cos(util.to_radians(60)) * ball_diameter]);
  balls[6].translate([Math.sin(util.to_radians(120)) * ball_diameter, 0, Math.cos(util.to_radians(120)) * ball_diameter]);
  //balls[7].translate([]);
  balls[8].translate([2 * Math.sin(util.to_radians(60)) * ball_diameter, 0, 0]);
  balls[9].translate([-Math.sin(util.to_radians(120)) * ball_diameter, 0, Math.cos(util.to_radians(120)) * ball_diameter]);
  balls[10].translate([-2 * Math.sin(util.to_radians(60)) * ball_diameter, 0, -2 * ball_diameter]);
  balls[11].translate([Math.sin(util.to_radians(60)) * ball_diameter, 0, Math.cos(util.to_radians(60)) * ball_diameter]);
  balls[12].translate([2 * Math.sin(util.to_radians(60)) * -ball_diameter, 0, 0]);
  balls[13].translate([-Math.sin(util.to_radians(60)) * ball_diameter, 0, ball_diameter + Math.cos(util.to_radians(60)) * ball_diameter]);
  balls[14].translate([0, 0, -ball_diameter]);
}

GameSystem.prototype.reset_table = function() {
  var table = this.context.nodes.table;
  var rotation_x = mat4.create()
  var translation = mat4.create()

  mat4.make_rotation_x(rotation_x, -Math.PI/2);
  mat4.make_translation(translation, [0, -4.325, 0]);
  mat4.apply(table.transform, [translation, rotation_x]);
}

GameSystem.prototype.reset_camera = function() {
  var camera = this.context.camera;
  var nodes = this.context.nodes;

  camera.add_target(nodes.cueball);
  camera.add_target(nodes.table);
  camera.switch_target('table');
}

GameSystem.prototype.restart = function() {
  // for (var ball in this.context.nodes.balls) {
  //   mat4.make_translation(translation)
  //   ball.translate()
  // }
}

//--------------------------------------------------------------------------------------------------------//
// Controls Callback Functions
//--------------------------------------------------------------------------------------------------------//
GameSystem.prototype.forward = function() {
  this.context.camera.zoom(-this.delta);
}

GameSystem.prototype.back = function() {
  this.context.camera.zoom(this.delta);
}

GameSystem.prototype.yaw_left = function() {
  this.context.camera.yaw(this.delta * this.sensitivity);
}

GameSystem.prototype.yaw_right = function() {
  this.context.camera.yaw(-this.delta * this.sensitivity);
}

GameSystem.prototype.pitch_up = function() {
  this.context.camera.pitch(this.delta * this.sensitivity);
}

GameSystem.prototype.pitch_down = function() {
  this.context.camera.pitch(-this.delta * this.sensitivity);
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

GameSystem.prototype.switch_to_table = function() {
  this.context.camera.switch_target('table')
}

GameSystem.prototype.switch_to_cueball = function() {
  this.context.camera.switch_target('cueball')
}

GameSystem.prototype.shoot = function() {

}