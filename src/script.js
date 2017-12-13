//--------------------------------------------------------------------------------------------------------//
// Program main entry point
//--------------------------------------------------------------------------------------------------------//
var main=function() {
  var context = factory.create(EngineContext);
  context.add_system("graphics", GraphicsSystem, {element_id: 'canvas-cg-lab'});
  context.add_system("physics", PhysicsSystem);
  context.add_system("input", InputSystem);
  context.add_system("game", GameSystem);

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
