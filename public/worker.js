importScripts('https://d3js.org/d3.v5.min.js')

const voronoi = d3.voronoi()

const minRadius = 0.5,
  maxRadius = 3.5

// Linear seems to get better results than sqrt
const radius = d3
  .scaleLinear()
  .range([maxRadius, minRadius])
  .clamp(true)

let iterations = 0

const quadtree = d3.quadtree()

// Begin compute loop
onmessage = function (event) {
  const { points, width, height, density, threshold } = event.data

  voronoi.extent([
    [0, 0],
    [width, height]
  ])
  radius.domain([0, threshold])
  compute()

  function compute() {
    // Relax the voronoi with Lloyd's algorithm the first 12 times
    if (iterations < 12) {
      voronoi(points)
        .polygons()
        .map(d3.polygonCentroid)
        .forEach(function (centroid, i) {
          points[i] = [
            ...centroid,
            density[
              width * Math.floor(centroid[1]) +
                Math.floor(centroid[0])
            ]
          ]
          points[i].r =
            points[i][2] > threshold ? 0 : radius(points[i][2])
        })
      // Then shrink the points until there are no collisions
    } else if (!shrink(points)) {
      return
    }
    iterations++
    postMessage(points)
    setTimeout(compute, 0)
  }
}

// Look for point-point collisions, and shrink both radii
function shrink(points) {
  if (!quadtree.size()) {
    quadtree.addAll(points)
  }

  // For each point, shrink points that collide with it
  points.forEach(function (point) {
    point.shrink = false
    quadtree.visit(function (node, x0, y0, x1, y1) {
      if (
        point.shrink ||
        (!node.data &&
          (node.x0 > point[0] + point.r ||
            node.x1 < point[0] - point.r ||
            node.y0 > point[1] + point.r ||
            node.y1 < point[1] - point.r))
      ) {
        return true
      }
      if (node.data && node.data !== point) {
        const diff = collides(node.data, point)
        if (diff > 0) {
          ;[point, node.data].forEach(function (p) {
            p.shrink = true
          })
        }
      }
    })
  })

  let collision = false

  // Smoother than trying to shrink each pair as they're found
  points.forEach(function (point) {
    if (point.shrink && point.r > minRadius) {
      point.r = Math.max(minRadius, point.r * 0.9)
      collision = true
    }
  })

  return collision
}

function collides(a, b) {
  const dx = a[0] - b[0],
    dy = a[1] - b[1],
    dr = a.r + b.r

  return dr - Math.sqrt(dx * dx + dy * dy)
}
