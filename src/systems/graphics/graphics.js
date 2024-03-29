function GraphicsSystem() {
  this.context;

  this.lights = [];
  this.materials = {};
  this.meshes = {};
  this.models = {};

  this.element_id;
};

GraphicsSystem.prototype.init_canvas = function(element_id, width, height) {
  var canvas = document.getElementById(this.element_id);
  width === undefined
    ? canvas.width = window.innerWidth
    : canvas.width = width;

  height === undefined
    ? canvas.height = window.innerHeight
    : canvas.height = height;

  canvas.aspect = canvas.width / canvas.height;

  this.context.canvas = canvas;
}

GraphicsSystem.prototype.init_gl_context = function(canvas) {
  try {
    this.context.gl = canvas.getContext("experimental-webgl", {antialias: true}); 
  } catch (e) {
    alert("No webGL compatability detected!"); 
    return false;
  }
}

GraphicsSystem.prototype.init_camera = function(position, target, up, near, far, fov, aspect) {
  this.context.camera = factory.create(Camera, {
    position: position, target: target, up: up,
    near: near, far: far, fov: fov,
    aspect: aspect
  }).init();
}

GraphicsSystem.prototype.init_scene = function(gl, canvas, camera) {
  this.context.scene = factory.create_scene(gl, canvas, camera);
}

GraphicsSystem.prototype.init_lights = function() {
  this.lights.push(
    factory.create_light({
      type: Light.LIGHT_TYPE.POINT,
      diffuse: [4, 4, 4], specular: [1, 1, 1], ambient: [0.4, 0.4, 0.4],
      position: [0, 0, 2.5], direction: [0, 0, -1], 
      alpha: 0.7, beta: 0.6,
      attenuation: Light.ATTENUATION_TYPE.NONE
    })
  );
}

GraphicsSystem.prototype.init_materials = function() {
  var texture_list = factory.create(Textures);
  asset_loader.convert_textures(texture_list);

  // Create containers for table materials
  this.materials.baize = factory.create_material({
    shininess: 5.0,
    specular: [0, 0, 0], ambient: [0.5, 0.5, 0.5], diffuse: [1, 1, 1]
  }, texture_list.green);

  this.materials.black = factory.create_material({
    shininess: 5.0,
    specular: [0, 0, 0], ambient: [0.5, 0.5, 0.5], diffuse: [1, 1, 1]
  }, texture_list.black);

  this.materials.wood = factory.create_material({
    shininess: 5.0,
    specular: [0, 0, 0], ambient: [0.5, 0.5, 0.5], diffuse: [1, 1, 1]
  }, texture_list.wood);

  this.materials.balls = [];
  for (i = 0; i < 15; i++) {
    this.materials.balls.push(
      factory.create_material({
        shininess: 96.0,
        specular: [1, 1, 1], ambient: [0.2, 0.2, 0.2], diffuse: [0.5, 0.5, 0.5]
      }, texture_list['ball_' + (i+1)])
    );
  }

  this.materials.cueball = factory.create_material({
    shininess: 96.0,
    specular: [1, 1, 1], ambient: [0.2, 0.2, 0.2], diffuse: [0.5, 0.5, 0.5]
  }, texture_list.cueball);
}

GraphicsSystem.prototype.init_meshes = function() {
  this.meshes = factory.create(Meshes);
  asset_loader.convert_meshes(this.meshes);

  this.meshes.room = geometry_helper.make_hollow_cube([0, 0, 0], [10, 10, 10], [0, 0, 0]);
  this.meshes.cueball = geometry_helper.make_sphere([0, 0, 0], 0.022, 50, 50, [0,0,0]);
  this.meshes.ball = geometry_helper.make_sphere([0,0,0], 0.024, 50, 50, [0,0,0]);
}

GraphicsSystem.prototype.init_models = function(meshes, materials) {
  this.models.table_top = factory.create_model("table_top", meshes.table_top, materials.baize);
  this.models.table_holes = factory.create_model("table_holes", meshes.table_holes, materials.black);
  this.models.table_wood = factory.create_model("table_wood", meshes.table_wood, materials.wood);

  
  this.models.room = factory.create_model("room", meshes.room, materials.wood);
  this.models.cueball = factory.create_model("cueball", meshes.cueball, materials.cueball);

  this.models.balls = [];
  for (i = 0; i < 15; i++) {
    this.models.balls.push(factory.create_model("ball_" + (i+1), meshes.ball, materials.balls[i]));
  }
}

GraphicsSystem.prototype.init_scene_graph = function(scene, lights, models) {
    nodes = {}
    nodes.light = scene.add_node(scene.root, lights[0], "light", Node.NODE_TYPE.LIGHT);
      nodes.room = scene.add_node(nodes.light, models.room, "room", Node.NODE_TYPE.MODEL);
      nodes.table = scene.add_node(nodes.light, null, "table", Node.NODE_TYPE.GROUP);
        nodes.table_top = scene.add_node(nodes.table, models.table_top, "table_top", Node.NODE_TYPE.MODEL);
        nodes.table_holes = scene.add_node(nodes.table, models.table_holes, "table_holes", Node.NODE_TYPE.MODEL);
        nodes.table_wood = scene.add_node(nodes.table, models.table_wood, "table_wood", Node.NODE_TYPE.MODEL);

      //playing balls
      nodes.balls = [];
      for (var i = 0; i < models.balls.length; i++) {
        nodes.balls.push(scene.add_node(nodes.light, models.balls[i], "ball_" + (i+1), Node.NODE_TYPE.MODEL));
      }

      // cueball
      nodes.cueball = scene.add_node(nodes.light, models.cueball, "cueball", Node.NODE_TYPE.MODEL);

    this.context.nodes = nodes;
  }

GraphicsSystem.prototype.init = function() {
  this.init_canvas(this.element_id);
  this.init_gl_context(this.context.canvas);
  this.init_camera([0, 0, 4], [0, 0, 0], [0, 1, 0], 0.1, 100, 0.5236, this.context.canvas.aspect);
  this.init_scene(this.context.gl, this.context.canvas, this.context.camera);
  this.init_lights();
  this.init_materials();
  this.init_meshes();
  this.init_models(this.meshes, this.materials);
  this.init_scene_graph(this.context.scene, this.lights, this.models);

  return this;
}

GraphicsSystem.prototype.update = function(camera_position) {
  this.context.camera.update(camera_position);

  var scene = this.context.scene;
  scene.begin_frame();
  scene.animate();
  scene.draw();
  scene.end_frame();
}