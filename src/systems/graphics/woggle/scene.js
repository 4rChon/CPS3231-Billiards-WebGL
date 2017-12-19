//--------------------------------------------------------------------------------------------------------//
//  Scene Element
//--------------------------------------------------------------------------------------------------------//
function Node() {
  this.type = 0;
  this.name = "untitled";
  this.parent = null;
  this.children = [];
  this.node_object = null;
  this.collider;

  // Create transform for node (= I)
  this.transform = mat4.create();
  this.position = vec3.create();
  
  mat4.make_identity(this.transform);

  this.animation_callback = null; // T * R * S
}

Node.NODE_TYPE = {
  GROUP_ROOT : 0,
  GROUP : 1,
  LIGHT : 2,
  MODEL : 3
}

Node.prototype.draw = function(scene, parent_transform) {
  var composite_transform = mat4.create();
  mat4.make_identity(composite_transform);
  mat4.compose(composite_transform, [this.transform, parent_transform]);  

  vec3.to(this.position, [composite_transform[12], composite_transform[13], composite_transform[14]]);

  var _type = this.type;
  var _node_object = this.node_object;
  if (_type == Node.NODE_TYPE.MODEL && _node_object) {
    _node_object.draw(scene, composite_transform);
  }

  this.children.forEach(function(child_node) {
    if (_type == Node.NODE_TYPE.LIGHT && _node_object) {
      // Transform light before setting it
      _node_object.use_transformed(scene.gl, composite_transform);
    }

    child_node.draw(scene, composite_transform);
  });
}

Node.prototype.animate = function(delta_time) {
  if (this.animation_callback) {
    this.animation_callback(delta_time);
  }

  this.children.forEach(function(child_node) {
    child_node.animate(delta_time);
  });
}

Node.prototype.translate = function(translation, model_space=false) {
  if (!model_space) {
    this.transform[12] += translation[0];
    this.transform[13] += translation[1];
    this.transform[14] += translation[2];
  } else {
    var translation_matrix = mat4.create();
    mat4.make_translation(translation_matrix, translation);
    mat4.compose(this.transform, [translation_matrix]);
  }

  if(this.has_collider()) {
    this.collider.position = {x: this.transform[12], y: this.transform[14]};
  }
}

Node.prototype.has_collider = function() {
  return this.collider !== undefined;
}

Node.prototype.rotate = function(rotation, model_space=true) {
  var rotation_x = mat4.create();
  var rotation_y = mat4.create();
  var rotation_z = mat4.create();

  mat4.make_rotation_x(rotation_x, rotation[0]);
  mat4.make_rotation_y(rotation_y, rotation[1]);
  mat4.make_rotation_z(rotation_z, rotation[2]);

  var position = [this.transform[12], this.transform[13], this.transform[14]];
  
  if (model_space) {
    this.move_to_origin();
  }

  mat4.compose(this.transform, [rotation_z, rotation_y, rotation_x]);

  if (model_space) {
    this.move_to_position(position);
  }
}

Node.prototype.scale = function(scale, model_space=true) {
  mat4.make_scaling(this.scaling_transform, scale);

  var position = [this.transform[12], this.transform[13], this.transform[14]];

  if (model_space) {
    this.move_to_origin();
  }

  mat4.compose(this.transform, [this.scaling_transform]);

  if (model_space) {
    this.move_to_position(position);
  }
}

Node.prototype.move_to_origin = function() {
  this.transform[12] = 0;
  this.transform[13] = 0;
  this.transform[14] = 0;
}

Node.prototype.move_to_position = function(position) {
  this.transform[12] = position[0];
  this.transform[13] = position[1];
  this.transform[14] = position[2];
}

//--------------------------------------------------------------------------------------------------------//
//  Scene Graph
//--------------------------------------------------------------------------------------------------------//
function Scene() {
  this.gl = null;
  this.canvas = null;
  this.root = new Node();

  this.index_color = 0;
  this.index_normal = 0;
  this.index_position = 0;
  this.index_texcoords = 0;

  this.index_matrix_view = 0;
  this.index_matrix_model = 0;
  this.index_matrix_projection = 0;

  this.camera = null;

  this.matrix_model = mat4.create();

  this.shader_vertex = null;
  this.shader_fragment = null;

  this.shader_program = null;

  this.last_update = Date.now();
}
//--------------------------------------------------------------------------------------------------------//
//  Helpers
//--------------------------------------------------------------------------------------------------------//
Scene.prototype.load_shader = function(shader_name, shader_type, shader_type_string) {
  try {
    var source = document.getElementById(shader_name).text;
    var shader = this.gl.createShader(shader_type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      return shader;
    }
    alert("Error compiling shader '" + shader_name + "', " + this.gl.getShaderInfoLog(shader));
  } catch (e) {
    alert("Exception : Cannot load shader '" + shader_name + "'!");
  }

  return false;
}
//--------------------------------------------------------------------------------------------------------//
//  Scene Initialisation
//--------------------------------------------------------------------------------------------------------//
Scene.prototype.init_shaders = function() {
  // Load vertex and fragment shaders
  this.shader_vertex = this.load_shader("vertex-shader", this.gl.VERTEX_SHADER, "VERTEX");
  this.shader_fragment = this.load_shader("fragment-shader", this.gl.FRAGMENT_SHADER, "FRAGMENT");

  // Create shader program context and attach compiled shaders
  this.shader_program = this.gl.createProgram();
  this.gl.attachShader(this.shader_program, this.shader_vertex);
  this.gl.attachShader(this.shader_program, this.shader_fragment);
  this.gl.linkProgram(this.shader_program);

  // Get attribute locations for color, normal, position and texture coordinates in vertex format
  this.index_position = this.gl.getAttribLocation(this.shader_program, "position");
  this.index_normal = this.gl.getAttribLocation(this.shader_program, "normal");
  this.index_color = this.gl.getAttribLocation(this.shader_program, "color");
  this.index_texcoords = this.gl.getAttribLocation(this.shader_program, "texcoords");

  // Enable attributes
  this.gl.enableVertexAttribArray(this.index_color);
  this.gl.enableVertexAttribArray(this.index_normal);
  this.gl.enableVertexAttribArray(this.index_position);
  this.gl.enableVertexAttribArray(this.index_texcoords);

  // Enable the use of shader program
  this.gl.useProgram(this.shader_program);
}

Scene.prototype.init_matrices = function() {
  this.index_matrix_view = this.gl.getUniformLocation( this.shader_program, "view_matrix" ); 
  this.index_matrix_model = this.gl.getUniformLocation( this.shader_program, "model_matrix" );
  this.index_matrix_projection = this.gl.getUniformLocation( this.shader_program, "projection_matrix" );

  mat4.make_identity(this.matrix_model);
}

Scene.prototype.init_flags = function ()
{
  this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
  this.gl.viewport(0.0, 0.0, this.canvas.width, this.canvas.height);

  this.gl.enable(this.gl.DEPTH_TEST);
  this.gl.depthFunc(this.gl.LESS);
}

Scene.prototype.init = function(gl, canvas, camera) {
  this.gl = gl;
  this.canvas = canvas;
  this.camera = camera;

  this.root.name = "scene";

  this.init_shaders();
  this.init_matrices();
  this.init_flags();

  return this // for chaining;
}

//--------------------------------------------------------------------------------------------------------//
//  Bind model prior to rendering
//--------------------------------------------------------------------------------------------------------//
Scene.prototype.bind_model_data = function(vertex_buffer, index_buffer) 
{
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertex_buffer);

    // Show how to interpret vertex format attributes
    this.gl.vertexAttribPointer(this.index_position, 3, this.gl.FLOAT, this.gl.GL_FALSE, 11*4, 0);
    this.gl.vertexAttribPointer(this.index_normal, 3, this.gl.FLOAT, this.gl.GL_FALSE, 11*4, 3*4);
    this.gl.vertexAttribPointer(this.index_color, 3, this.gl.FLOAT, this.gl.GL_FALSE, 11*4, 6*4);
    this.gl.vertexAttribPointer(this.index_texcoords, 2, this.gl.FLOAT, this.gl.GL_FALSE, 11*4, 9*4);

    // Bind index buffer
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, index_buffer);
}

//--------------------------------------------------------------------------------------------------------//
//  Scene Graph transform management
//--------------------------------------------------------------------------------------------------------//
Scene.prototype.update_view = function() {
    this.gl.uniformMatrix4fv(this.index_matrix_view, false, this.camera.view);
}

Scene.prototype.update_projection = function() {
    this.gl.uniformMatrix4fv(this.index_matrix_projection, false, this.camera.projection);   
}

Scene.prototype.update_model = function() {
    this.gl.uniformMatrix4fv(this.index_matrix_model, false, this.matrix_model); 
}

Scene.prototype.set_model = function(model)
{
  mat4.to(this.matrix_model, model);
}

//--------------------------------------------------------------------------------------------------------//
//  Scene Graph node managment
//--------------------------------------------------------------------------------------------------------//
Scene.prototype.find_node = function(node_name) 
{
  var stack = [this.root];

  while(stack.length != 0) {
    var node = stack.pop();
    
    if (node.name.localeCompare(node_name) == 0)
      return node;

    node.children.forEach(function(child_node) {
      stack.push(child_node);
    });
  }
}

Scene.prototype.add_node = function(parent, node_object, node_name, node_type) 
{
  var node = new Node();
  node.name = node_name;
  node.type = node_type;
  node.node_object = node_object;
  node.parent = parent;

  parent.children[parent.children.length] = node;

  return node;
}

//--------------------------------------------------------------------------------------------------------//
//  Animation and Rendering scene graph methods
//--------------------------------------------------------------------------------------------------------//
Scene.prototype.begin_frame = function() 
{
  this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

  this.update_projection();
  this.update_view();
}

Scene.prototype.end_frame = function() {
  this.gl.flush();
}

Scene.prototype.animate = function() 
{
  var now = Date.now();
  var delta_time = now - this.last_update;
  this.last_update = now;

  this.root.animate(delta_time);
}

Scene.prototype.draw = function() {
  this.root.draw(this, mat4.I);
}