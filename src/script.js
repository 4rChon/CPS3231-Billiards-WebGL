//--------------------------------------------------------------------------------------------------------//
// Program main entry point
//--------------------------------------------------------------------------------------------------------//
var main=function() {
  var context = factory.create_engine('canvas-cg-lab');

  var camera_position = vec3.from(0, 0, 4);

  var step=function() {
    context.systems.input.update();
    context.systems.game.update();
    context.systems.physics.update();
    context.systems.graphics.update(camera_position);

    window.requestAnimationFrame(step);
  };

  step();
}
