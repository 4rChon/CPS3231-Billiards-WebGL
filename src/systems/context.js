function EngineContext() {
  this.systems = {};
  this.nodes = {};
  this.canvas = null;
  this.gl = null;
  this.scene = null;
  this.camera = null;
};

EngineContext.prototype.add_system = function(name, System, attr) {
  this.systems[name] = factory.create(System, attr);
  this.systems[name].context = this;
  this.systems[name].init();
  return this;
};