import Canvas from './Canvas.js';
import {rand} from './util.js';

const BLACK = new Uint8ClampedArray(3);

let canvas;
let colorMap;
let idCounter;
let labeledPixels;
let listeners;
let threads;
let tiles;

export default class Voronoi {
  constructor(numThreads) {
    canvas = new Canvas();
    canvas.attachToDom();
    colorMap = new Map();
    idCounter = 1;
    labeledPixels = [];
    listeners = new Set();
    threads = new Array(numThreads).fill().map(() => new Worker('./js/partitioner.js'));
    tiles = [];

    console.log('thread count:', threads.length);
  }

  randomize(numTiles) {
    tiles = [];
    colorMap.clear();
    const width = canvas.width;
    const height = canvas.height;
    while (tiles.length < numTiles) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const id = (idCounter++).toString(36);
      colorMap.set(id, new Uint8ClampedArray([rand(256), rand(256), rand(256)]));
      tiles.push([x, y, id]);
    }
    return this;
  }

  partition(metric) {
    if (tiles.length === 0) {
      console.error(`Can't partition with empty tiles array.`);
      return this;
    }

    const width = canvas.width;
    const height = canvas.height;
    const rowsPerThread = Math.ceil(height / threads.length);

    labeledPixels = new Array(height);
    let startPixel = 0;
    const partitionPromises = new Array(threads.length);
    for (let i = 0; i < threads.length; i++) {
      const thread = threads[i];
      partitionPromises[i] = new Promise((resolve) => {
        const start = startPixel;
        const end = i < threads.length - 1 ? (startPixel += rowsPerThread) : height;
        thread.postMessage([start, end, width, tiles, metric]);
        thread.onmessage = ({data}) => {
          thread.onmessage = null;
          for (let y = start; y < end; y++) {
            labeledPixels[y] = data[y - start];
          }
          resolve();
        };
      });
    }

    return Promise.all(partitionPromises).then(() => this.render_());
  }

  render_() {
    const width = canvas.width;
    const height = canvas.height;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        canvas.setPixel(x, y, colorMap.get(labeledPixels[y][x]));
      }
    }
    canvas.repaint();
  }

  recolor() {
    colorMap.forEach(color => {
      color[0] = rand(256);
      color[1] = rand(256);
      color[2] = rand(256);      
    });
    return this.render_();
  }

  resize(metric) {
    const wRatio = window.innerWidth / canvas.width;
    const hRatio = window.innerHeight / canvas.height;
    for (let tile of tiles) {
      tile[0] *= wRatio;
      tile[1] *= hRatio;
    }
    listeners.forEach(args => canvas.removeEventListener(...args));
    canvas = new Canvas();
    canvas.attachToDom();
    listeners.forEach(args => canvas.addEventListener(...args));
    return this.partition(metric);
  }

  addEventListener(...args) {
    listeners.add(args);
    canvas.addEventListener(...args);
  }

  removeEventListener(...args) {
    listeners.delete(args);
    canvas.removeEventListener(...args);
  }
}
