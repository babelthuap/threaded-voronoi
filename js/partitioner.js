onmessage = function(e) {
  const [start, end, width, tiles, metric] = e.data;
  partition(start, end, width, tiles, metric);
};

const metrics = {
  1: (x1, y1, x2, y2) => Math.abs(x1 - x2) + Math.abs(y1 - y2),
  2: (x1, y1, x2, y2) => (x1 - x2) ** 2 + (y1 - y2) ** 2,
  3: (x1, y1, x2, y2) => Math.abs(x1 - x2) ** 3 + Math.abs(y1 - y2) ** 3,
};

function partition(start, end, width, tiles, metric) {
  const distFunction = metrics[metric];
  const labeledPixels = new Array(end - start);
  for (let y = start; y < end; y++) {
    const row = labeledPixels[y - start] = new Array(width);
    for (let x = 0; x < width; x++) {
      let closestTile;
      let minDist = Infinity;
      for (let [tileX, tileY, id] of tiles) {
        const dist = distFunction(x, y, tileX, tileY);
        if (dist < minDist) {
          minDist = dist;
          closestTile = id;
        }
      }
      row[x] = closestTile;
    }
  }
  postMessage(labeledPixels);
}
