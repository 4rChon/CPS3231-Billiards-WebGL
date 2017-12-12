factory = new Factory();
function Factory () { 
    this.scene = null;
};

Factory.prototype.create = function(Obj, attr) {
    obj = new Obj();
    for (var v in attr) {
        obj[v] = attr[v];
    }

    return obj;
}

Factory.prototype.create_scene = function(gl, canvas, camera) {
    this.scene = this.create(Scene).init(gl, canvas, camera);
    return this.scene;
}

Factory.prototype.create_light = function(light_struct) {
    return this.create(Light, light_struct)
                  .bind(this.scene.gl, this.scene.shader_program, 0);
}

Factory.prototype.create_material = function(material_struct, texture) {
    return this.create(Material, material_struct)
                  .set_albedo(this.scene.gl, texture)
                  .bind(this.scene.gl, this.scene.shader_program);
}

Factory.prototype.create_model = function(name, mesh, material) {
    return this.create(Model, {
        name: name,
        index: mesh.index, vertex: mesh.vertex,
        material: material
    }).compile(this.scene);
}