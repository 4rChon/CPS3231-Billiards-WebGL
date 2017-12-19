function PhysicsSystem() {
  this.context;

  this.colliders = {};
  this.engine;
  this.world;
  this.pairs_to_update = [];
};

PhysicsSystem.prototype.init_events = function() {
  Matter.Events.on(this.engine, "afterUpdate", this.after_update.bind(this));
  Matter.Events.on(this.engine, "beforeUpdate", this.before_update.bind(this));
  Matter.Events.on(this.engine, "collisionStart", this.collision_start.bind(this));
  //Matter.Events.on(this.engine, "collisionActive", this.collision_active);
  //Matter.Events.on(this.engine, "collisionEnd", this.collision_end);
  Matter.Events.on(this.world, "afterAdd", this.after_add);
}

PhysicsSystem.prototype.init_colliders = function() {
  var nodes = this.context.nodes;
  var balls = nodes.balls;
  //for (var i in nodes.balls) {
    var i = 0;
    this.add_collider(balls[i], [balls[i].position[0], balls[i].position[2]], 0.024, 'circle');
    i = 1;
    this.add_collider(balls[i], [balls[i].position[0], balls[i].position[2]], 0.024, 'circle');
  //}

  //this.add_collider(nodes.cueball, [nodes.cueball.position[0], nodes.cueball.position[2]], 0.022, 'circle');
  this.add_collider(null, [0, 0.825], [5, 1], 'wall');
  this.add_collider(null, [-1.55, 0], [1, 5], 'wall');
  this.add_collider(null, [1.55, 0], [1, 5], 'wall');
  this.add_collider(null, [0, -0.825], [5, 1], 'wall');
}

PhysicsSystem.prototype.init = function() {
  if(this.context.canvas == undefined) {
    alert("Canvas " + this.context.canvas + ". Graphics System must be initialised before Physics System.");
    return false;
  }

  this.engine = Matter.Engine.create();
  this.world = this.engine.world;
  this.world.gravity = {x: 0, y: 0};

  this.init_colliders();
  this.init_events();

  // console.log(Matter.Composite.allBodies(this.world));
  // console.log(this.world);

  var collider = this.context.nodes.balls[0].collider;
  // Matter.Body.applyForce(collider, collider.position, {x: 0, y: 0.5});

  return this;
}

PhysicsSystem.prototype.add_collider = function(node, position, dimensions, type) {
  var collider = this['add_' + type](position, dimensions);
  if (node !== null) {
    node['collider'] = collider;

    node.animation_callback = function() {
      this.transform[12] = this.collider.position.x;
      this.transform[14] = this.collider.position.y;
    }
  }

  // Matter.Body.setPosition(node.collider, {x: node.transform[12], y: node.transform[14]});
  // console.log(node.transform);
  
  Matter.World.add(this.world, [collider]);
}

PhysicsSystem.prototype.add_circle = function(position, radius) {
  return Matter.Bodies.circle(
    position[0], position[1], radius, {
      frictionAir: 0.01,
      friction: 0,
      restitution: 1,
      inertia: Infinity,
      mass: 1
    });
}

PhysicsSystem.prototype.add_wall = function(position, dimensions) {
  return Matter.Bodies.rectangle(
    position[0], position[1], dimensions[0], dimensions[1], {
      restitution: 0,
      isStatic: true,
      mass: 100,
      intertia: 0
    });
}

PhysicsSystem.prototype.update = function() {
  //console.log(collider.force);
  //var position = {x: 0, y: 0};
  //console.log(collider.position);
  //collider.force = [1, 1];
  //Matter.Body.update(collider);
  //Matter.Body.update(collider);
  //console.log(collider.position);
  //console.log(collider.force);
  //console.log(collider);
  Matter.Engine.update(this.engine, 1/60);
}

// Events
PhysicsSystem.prototype.before_update = function(e) {
  //console.log((e.timestamp/1000).toFixed(3) + " seconds");
  for (var i = 0; i < this.pairs_to_update.length; i++) {
    var pair = this.pairs_to_update[i];
    Matter.Body.applyForce(pair.bodyA, pair.bodyB.position, pair.bodyB.velocity);
    Matter.Body.applyForce(pair.bodyB, pair.bodyA.position, pair.bodyA.velocity);
  }

  this.pairs_to_update = [];
}

PhysicsSystem.prototype.after_update = function(e) {
  //console.log((e.timestamp/1000).toFixed(3) + " seconds");
}

PhysicsSystem.prototype.collision_start = function(e) {
  var pairs = e.pairs;

  for (var i = 0; i < pairs.length; i++) {
    this.pairs_to_update.push(pairs[i]);
  }
}

PhysicsSystem.prototype.collision_active = function(e) {
  console.log((e.timestamp/1000).toFixed(3) + " seconds");
  console.log(e.source.pairs);
}

PhysicsSystem.prototype.collision_end = function(e) {
  console.log((e.timestamp/1000).toFixed(3) + " seconds");
  console.log(e.source.pairs);
}

PhysicsSystem.prototype.after_add = function(e) {
  console.log("Added to world: ", e.object);
}