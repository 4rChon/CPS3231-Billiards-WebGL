//--------------------------------------------------------------------------------------------------------//
//  Scene Element
//--------------------------------------------------------------------------------------------------------//
function Node() {
  this.type = 0;
  this.name = "untitled";
  this.parent = null;
  this.children = [];
  this.node_object = null;

  // Create transform for node (= I)
  this.transform = mat4.create();
  this.animation_transform = mat4.create();
  mat4.make_identity(this.transform);
  mat4.make_identity(this.animation_transform);

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
  // mat4.multiply(composite_transform, this.transform, parent_transform);
  mat4.multiply(composite_transform, this.animation_transform, composite_transform);

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
  mat4.make_identity(this.animation_transform);
  if (this.animation_callback) {
    this.animation_callback(delta_time);
  }

  this.children.forEach(function(child_node) {
    child_node.animate(delta_time);
  });
}

Node.prototype.scale = function(scale) {
  var scale_matrix = mat4.create();
  mat4.make_scaling(scale_matrix, scale);
  mat4.multiply(this.animation_transform, this.transform, scale_matrix);
}

Node.prototype.translate = function(translation) {
  var translation_matrix = mat4.create();
  mat4.make_translation(translation_matrix, translation);
  mat4.multiply(this.animation_transform, this.transform, translation_matrix);
}

Node.prototype.rotate = function(rotation) {
  var rotation_matrix = mat4.create();
  var rotate_x = mat4.create();
  var rotate_y = mat4.create();
  var rotate_z = mat4.create();

  mat4.make_identity(rotation_matrix);

  mat4.make_rotation_x(rotate_x, rotation[0]);
  mat4.make_rotation_y(rotate_y, rotation[1]);
  //mat4.make_rotation_z(rotate_z, rotation[2]);
  //mat4.multiply(rotation_matrix, rotate_y, rotate_x);
  //mat4.multiply(rotation_matrix, rotate_z, rotation_matrix);
  mat4.multiply(this.animation_transform, this.transform, rotate_x);
  //mat4.multiply(this.animation_transform, this.transform, rotate_y);
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

// Scene.prototype.set_view_frustum = function(near, far, fov)
// {
//   mat4.make_projection(this.matrix_projection, near, far, fov, this.canvas.aspect); 
// }

// Scene.prototype.look_at = function(position, target, up)
// {
//   mat4.look_at(this.matrix_view, position, target, up);
// }

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