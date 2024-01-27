Color = function (r, g, b, a) {
  this.r = r || 0;
  this.g = g || 0;
  this.b = b || 0;
  this.a = a || 1;
};
Color.prototype = {
  toString: function () {
    return "rgba(" + [this.r, this.g, this.b, this.a].join(",") + ")";
  },
  getHSV: function () {
    var min, max, delta;
    var hsv = {};
    min = Math.min(this.r, this.g, this.b);
    max = Math.max(this.r, this.g, this.b);
    hsv.v = max / 255; // v
    delta = max - min;
    if (max != 0)
      hsv.s = delta / max; // s
    else {
      // r = g = b = 0		// s = 0, v is undefined
      hsv.s = 0;
      hsv.h = -1;
      return hsv;
    }
    if (this.r == max)
      hsv.h = (this.g - this.b) / delta; // between yellow & magenta
    else if (this.g == max)
      hsv.h = 2 + (this.b - this.r) / delta; // between cyan & yellow
    else hsv.h = 4 + (this.r - this.g) / delta; // between magenta & cyan
    hsv.h *= 60; // degrees
    if (hsv.h < 0) hsv.h += 360;
    return hsv;
  },
  setHSV: function (h, s, v) {
    if (typeof h == "object") {
      s = h.s;
      v = h.v;
      h = h.h;
    }

    var i, f, p, q, t;
    if (s == 0) {
      // achromatic (grey)
      this.r = this.g = this.b = v;
      return;
    }
    h /= 60; // sector 0 to 5
    i = Math.floor(h);
    f = h - i; // factorial part of h
    p = v * (1 - s);
    q = v * (1 - s * f);
    t = v * (1 - s * (1 - f));
    switch (i) {
      case 0:
        this.r = v;
        this.g = t;
        this.b = p;
        break;
      case 1:
        this.r = q;
        this.g = v;
        this.b = p;
        break;
      case 2:
        this.r = p;
        this.g = v;
        this.b = t;
        break;
      case 3:
        this.r = p;
        this.g = q;
        this.b = v;
        break;
      case 4:
        this.r = t;
        this.g = p;
        this.b = v;
        break;
      default: // case 5:
        this.r = v;
        this.g = p;
        this.b = q;
        break;
    }
    this.r = Math.round(this.r * 255);
    this.g = Math.round(this.g * 255);
    this.b = Math.round(this.b * 255);
  },
};
