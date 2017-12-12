asset_loader = new Loader();

function Loader() { };

Loader.prototype.convert_textures = function(texture_list) {
  for (var e in texture_list) {
    var img = document.createElement("img");
    var img_container = document.getElementById("image-collection");
    img.src = texture_list[`${e}`];
    img_container.appendChild(img);

    texture_list[`${e}`] = img;
  };
}

Loader.prototype.convert_meshes = function(mesh_list)
{
  for (var e in mesh_list)
  {
    var data = JSON.parse(mesh_list[e]);

    var position_buffer = data.vertices[0];
    var normal_buffer = data.vertices[1];
    var colour_buffer = data.vertices[1];
    var texcoord_buffer = data.vertices[1];

    var vertex_count = position_buffer.values.length/3

    var vertex_list = [];
    for (var i = 0; i < vertex_count; ++i)
    {
      for (var k = 0; k < 3; ++k)
        vertex_list[vertex_list.length] = position_buffer.values[i*position_buffer.size + k];
      for (var k = 0; k < 3; ++k)
        vertex_list[vertex_list.length] = normal_buffer.values[i*normal_buffer.size + k];
      for (var k = 0; k < 3; ++k)
        vertex_list[vertex_list.length] = 0;
      for (var k = 0; k < 2; ++k)
        vertex_list[vertex_list.length] = texcoord_buffer.values[i*texcoord_buffer.size + k];
    }

    mesh_list[e] = {vertex : vertex_list, index: data.connectivity[0].indices};
  }
}