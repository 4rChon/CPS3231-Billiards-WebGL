function InputSystem() {
  this.context;
  
  this.key_callback = {};
  this.key_down = {};
};

InputSystem.prototype.init = function() {
  document.addEventListener("keydown", this.keyboard_down.bind(this));
  document.addEventListener("keyup", this.keyboard_up.bind(this));
  return this;
}

InputSystem.prototype.update = function() {
  for (var key in this.key_down) {
    if (this.key_down[key]) {
      if (this.key_callback[key] != null) {
        this.key_callback[key]();
      }
    }
  }
}

InputSystem.prototype.keyboard_down = function(event) {
  event.preventDefault();
  this.key_down[event.keyCode] = true;
}

InputSystem.prototype.keyboard_up = function(event) {
  this.key_down[event.keyCode] = false;
}

InputSystem.prototype.add_keycode_callback = function(key_code, callback) {
  this.key_callback[key_code] = callback;
  this.key_down[key_code] = false;
}