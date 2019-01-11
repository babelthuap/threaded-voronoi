export default class Canvas {
  constructor(initialColor = 'white') {
    this.root_ = document.createElement('canvas');
    this.root_.width = this.width = window.innerWidth;
    this.root_.height = this.height = window.innerHeight;
    this.ctx_ = this.root_.getContext('2d');
    this.ctx_.fillStyle = initialColor;
    this.ctx_.fillRect(0, 0, this.width, this.height);
    this.imageData_ = this.ctx_.getImageData(0, 0, this.width, this.height);
  }

  attachToDom() {
    if (document.body.children[0] !== this.root_) {
      [...document.body.children].forEach(child => child.remove());
      document.body.appendChild(this.root_);
    }
  }

  repaint() {
    this.ctx_.putImageData(this.imageData_, 0, 0);
  }

  setPixel(x, y, rgb) {
    const red = 4 * (x + this.width * y);
    this.imageData_.data[red] = rgb[0];
    this.imageData_.data[red + 1] = rgb[1];
    this.imageData_.data[red + 2] = rgb[2];
  }

  setRow(y, startX, endX, rgb) {
    const data = this.imageData_.data;
    const startRed = 4 * (startX + this.width * y);
    const endRed = 4 * (endX + this.width * y);
    for (let i = startRed; i <= endRed; i += 4) {
      data[i] = rgb[0];
      data[i + 1] = rgb[1];
      data[i + 2] = rgb[2];
    }
  }

  addEventListener(...args) {
    this.root_.addEventListener(...args);
  }

  removeEventListener(...args) {
    this.root_.removeEventListener(...args);
  }
}
