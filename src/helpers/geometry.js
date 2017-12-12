geometry_helper = new Geometry();

function Geometry() { };

Geometry.prototype.make_sphere = function(centre, radius, h, v, color) {
  var vertex_list = [], index_list = [];

  // north pole
  vertex_list[vertex_list.length] = centre[0]           // x
  vertex_list[vertex_list.length] = centre[1] + radius  // y
  vertex_list[vertex_list.length] = centre[2]           // z

  vertex_list[vertex_list.length] = centre[0]           // xn
  vertex_list[vertex_list.length] = centre[1] + radius  // yn
  vertex_list[vertex_list.length] = centre[2]           // zn

  vertex_list[vertex_list.length] = color[0]            // r
  vertex_list[vertex_list.length] = color[1]            // g
  vertex_list[vertex_list.length] = color[2]            // b

  vertex_list[vertex_list.length] = 1                   // u
  vertex_list[vertex_list.length] = 0                   // v

  for (var i = 0; i <= v + 1; i++) {
    for (var j = 0; j <= h; j++) {
      var theta = 2 * Math.PI * j / h;
      var y = (i / v - 0.5) * 2;
      var r = Math.sqrt(1 - y * y);
      var x = Math.cos(theta) * r; 
      var z = Math.sin(theta) * r;
      var point = [x, y, z];

      for (var k=0; k<3; k++)
        vertex_list[vertex_list.length] = point[k] * radius + centre[k];  // x, y, z
      for (var k=0; k<3; k++)
        vertex_list[vertex_list.length] = point[k];                       // xn, yn, zn
      for (var k=0; k<3; k++)
        vertex_list[vertex_list.length] = color[k];                       // r, g, b

      vertex_list[vertex_list.length] = 1 - j/h;                              // u
      vertex_list[vertex_list.length] = i/v;                              // v
  }}

  // south pole
  vertex_list[vertex_list.length] = centre[0]           // x
  vertex_list[vertex_list.length] = centre[1] - radius  // y
  vertex_list[vertex_list.length] = centre[2]           // z

  vertex_list[vertex_list.length] = centre[0]           // xn
  vertex_list[vertex_list.length] = centre[1] - radius  // yn
  vertex_list[vertex_list.length] = centre[2]           // zn

  vertex_list[vertex_list.length] = color[0]            // r
  vertex_list[vertex_list.length] = color[1]            // g
  vertex_list[vertex_list.length] = color[2]            // b

  vertex_list[vertex_list.length] = 0                   // u
  vertex_list[vertex_list.length] = 1                   // v
  
  for (var i = 0; i < v+1; i++) {
    for (var j = 0; j < h-1; j++) {
      index_list[index_list.length] = i * h + j;
      index_list[index_list.length] = (i + 1) * h + (j + 1) % h;
      index_list[index_list.length] = i * h + (j + 1) % h;
      index_list[index_list.length] = i * h + j;
      index_list[index_list.length] = (i + 1) * h + j;
      index_list[index_list.length] = (i + 1) * h + (j + 1) % h;
    }

    // connect last vertices to first vertices in stripe
    if (i > 0) {
      index_list[index_list.length] = i * h - 1;
      index_list[index_list.length] = (i + 1) * h;
      index_list[index_list.length] = i * h;
      index_list[index_list.length] = i * h - 1;
      index_list[index_list.length] = (i + 1) * h - 1;
      index_list[index_list.length] = (i + 1) * h;
    }
  }
  
  return {vertex : vertex_list, index : index_list};
};

Geometry.prototype.make_quad = function(positions, normals, colors, uvs)
{
  var vertex_list = [], index_list = [];

  for (var i = 0; i < 4; ++i)
  {
    for (var k = 0; k<3; ++k)
     vertex_list[vertex_list.length] = positions[i][k];
    for (var k = 0; k<3; ++k)
     vertex_list[vertex_list.length] = normals[i][k];
    for (var k = 0; k<3; ++k)
     vertex_list[vertex_list.length] = colors[i][k];
    for (var k = 0; k<2; ++k)
     vertex_list[vertex_list.length] = uvs[i][k];
  }

  index_list[index_list.length] = 0;
  index_list[index_list.length] = 1;
  index_list[index_list.length] = 2;
  index_list[index_list.length] = 0;
  index_list[index_list.length] = 2;
  index_list[index_list.length] = 3;

  return {vertex : vertex_list, index : index_list};
};

Geometry.prototype.make_hollow_cube = function(centre, dimensions, color)
{
  var vertex_list = [], index_list = [];

  var positions = [
    [centre[0]-(dimensions[0]/2), centre[1]-(dimensions[1]/2), centre[2]-(dimensions[2]/2)],
    [centre[0]+(dimensions[0]/2), centre[1]-(dimensions[1]/2), centre[2]-(dimensions[2]/2)],
    [centre[0]+(dimensions[0]/2), centre[1]+(dimensions[1]/2), centre[2]-(dimensions[2]/2)],
    [centre[0]-(dimensions[0]/2), centre[1]+(dimensions[1]/2), centre[2]-(dimensions[2]/2)],
    [centre[0]-(dimensions[0]/2), centre[1]-(dimensions[1]/2), centre[2]+(dimensions[2]/2)],
    [centre[0]+(dimensions[0]/2), centre[1]-(dimensions[1]/2), centre[2]+(dimensions[2]/2)],
    [centre[0]+(dimensions[0]/2), centre[1]+(dimensions[1]/2), centre[2]+(dimensions[2]/2)],
    [centre[0]-(dimensions[0]/2), centre[1]+(dimensions[1]/2), centre[2]+(dimensions[2]/2)]
  ]

  var uvs = [[0,0], [1,0], [1,1], [0,1]];

  var normals = [[0, 0, -1], [0, 0, 1], [-1, 0, 0], [1, 0, 0], [0, -1, 0], [0, 1, 0]];

  var quads = [];
  // front and back
  for (var i = 0; i < 2; i++) {
    quads[quads.length] = this.make_quad(
                          [positions[0+(4*i)], positions[1+(4*i)], positions[2+(4*i)], positions[3+(4*i)]],
                          [normals[i], normals[i], normals[i], normals[i]],
                          [color, color, color, color],
                          [uvs[0], uvs[1], uvs[2], uvs[3]]);  
  }

  //
  quads[quads.length] = this.make_quad(
                        [positions[3], positions[2], positions[6], positions[7]],
                        [normals[5], normals[5], normals[5], normals[5]],
                        [color, color, color, color],
                        [uvs[0], uvs[1], uvs[2], uvs[3]]);

  quads[quads.length] = this.make_quad(
                        [positions[0], positions[1], positions[5], positions[4]],
                        [normals[4], normals[4], normals[4], normals[4]],
                        [color, color, color, color],
                        [uvs[0], uvs[1], uvs[2], uvs[3]]);

  quads[quads.length] = this.make_quad(
                        [positions[1], positions[5], positions[6], positions[2]],
                        [normals[3], normals[3], normals[3], normals[3]],
                        [color, color, color, color],
                        [uvs[0], uvs[1], uvs[2], uvs[3]]);

  quads[quads.length] = this.make_quad(
                        [positions[0], positions[4], positions[7], positions[3]],
                        [normals[2], normals[2], normals[2], normals[2]],
                        [color, color, color, color],
                        [uvs[0], uvs[1], uvs[2], uvs[3]]);

  for (var i = 0; i < quads.length; i++) {
    vertex_list = vertex_list.concat(quads[i].vertex);

    quads[i].index = quads[i].index.map(function(x) {return x+(4*i);});
    index_list = index_list.concat(quads[i].index);
  }
  
  return {vertex: vertex_list, index: index_list};

}