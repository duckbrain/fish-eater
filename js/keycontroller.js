function KeyController(preset) {
  var self = this;

  switch (preset) {
    case "wasd":
      this.keys = {
        up: [keys.w],
        down: [keys.d],
        right: [keys.r],
        left: [keys.l],
        pause: [keys.esc, keys.space],
        depower: [keys.t],
      };
    case "arrow":
    default:
      this.keys = {
        up: [keys.up],
        down: [keys.down],
        right: [keys.right],
        left: [keys.left],
        pause: [keys.esc, keys.space],
        depower: [keys.t],
      };
      break;
  }

  this.onKeyDown = function (e) {
    var key = e.keyCode;
    if (self.keys.up.indexOf(key) != -1) self.up = true;
    if (self.keys.down.indexOf(key) != -1) self.down = true;
    if (self.keys.left.indexOf(key) != -1) self.left = true;
    if (self.keys.right.indexOf(key) != -1) self.right = true;
    if (self.keys.pause.indexOf(key) != -1) game.togglePaused();
    if (self.keys.depower.indexOf(key) != -1) self.depower = true;
  };
  this.onKeyUp = function (e) {
    var key = e.keyCode;
    if (self.keys.up.indexOf(key) != -1) self.up = false;
    if (self.keys.down.indexOf(key) != -1) self.down = false;
    if (self.keys.left.indexOf(key) != -1) self.left = false;
    if (self.keys.right.indexOf(key) != -1) self.right = false;
    if (self.keys.depower.indexOf(key) != -1) self.depower = false;
  };
  this.init = function () {
    document.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("keyup", this.onKeyUp);
  };
  this.deinit = function () {
    document.removeEventListener("keydown", this.onKeyDown);
    document.removeEventListener("keyup", this.onKeyUp);
  };
}
KeyController.prototype = new PlayerController();

var keys = {
  backspace: 8,
  tab: 9,
  enter: 13,
  shift: 16,
  ctrl: 17,
  alt: 18,
  pause: 19,
  capslock: 20,
  esc: 27,
  space: 32,
  pageup: 33,
  pagedown: 34,
  end: 35,
  home: 36,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  insert: 45,
  delete: 46,
  n0: 48,
  num1: 49,
  num2: 50,
  num3: 51,
  num4: 52,
  num5: 53,
  num6: 54,
  num7: 55,
  num8: 56,
  num9: 57,
  a: 65,
  b: 66,
  c: 67,
  d: 68,
  e: 69,
  f: 70,
  g: 71,
  h: 72,
  i: 73,
  j: 74,
  k: 75,
  l: 76,
  m: 77,
  n: 78,
  o: 79,
  p: 80,
  q: 81,
  r: 82,
  s: 83,
  t: 84,
  u: 85,
  v: 86,
  w: 87,
  x: 88,
  y: 89,
  z: 90,
  numpad0: 96,
  numpad1: 97,
  numpad2: 98,
  numpad3: 99,
  numpad4: 100,
  numpad5: 101,
  numpad6: 102,
  numpad7: 103,
  numpad8: 104,
  numpad9: 105,
  multiply: 106,
  plus: 107,
  minut: 109,
  dot: 110,
  slash1: 111,
  F1: 112,
  F2: 113,
  F3: 114,
  F4: 115,
  F5: 116,
  F6: 117,
  F7: 118,
  F8: 119,
  F9: 120,
  F10: 121,
  F11: 122,
  F12: 123,
  equal: 187,
  coma: 188,
  slash: 191,
  backslash: 220,
};
