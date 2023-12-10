import { Light, Frame, Movie, Led } from "../dist/index.js";

async function run() {
  const red = new Led(255, 0, 0);
  const green = new Led(0, 255, 0);
  const blue = new Led(0, 0, 255);
  const yellow = new Led(255, 255, 0);
  const cyan = new Led(0, 255, 255);
  const magenta = new Led(255, 0, 255);
  const white = new Led(255, 255, 255);
  const purple = new Led(255, 0, 255);
  const key = [red, green, blue, yellow, cyan, magenta, white, purple];

  const nLeds = 600;
  let leds = makeColorSequence(key, nLeds);

  let frames = leds.map((led) => {
    return new Frame(led);
  });

  let movie = new Movie({ frames: frames, fps: 1, loop_type: 1 });
  console.log(movie);

  console.log("Creating device...");
  const device = new Light("192.168.1.164");

  // must login before sending commands
  console.log("Logging in...");
  await device.login();
  // turn off lights
  console.log("Set device to off mode");
  await device.setMode("off");
  // add movie to device (better way to do this)
  console.log("Upload Movie");
  await device.addMovie(movie);
  // set device to movie mode
  console.log("Set device to movie mode");
  await device.setMode("movie");

  return;
  // turn off after cycling through colors once
  const timeout = 5500;
  setTimeout(() => {
    console.log("Set device to off mode");
    device.setMode("off");
  }, timeout);

  // get movie config
  let config = await device.getMovieConfig();
  console.log(config);
}

run();

/**
 * Generate color sequence set
 * @param {Array} key of colors (ie ['red','green','blue'])
 * @param {Number} nPts Total number of sequences in set
 * @returns {Array} Returns array of unique permutations of color sequences
 */
function makeColorSequence(key, nPts) {
  let maxPermutations = factorial(key.length);
  let estimatedPermutations = nearestFactorialInverse(nPts);
  if (estimatedPermutations < key.length) {
    key = key.slice(0, estimatedPermutations);
    console.warn(`Reducing key to ${key.length} colors`);
  }
  let colors = permute(key);
  colors = shuffleArray(colors);
  if (nPts > maxPermutations) {
    throw `Number of requested points [${nPts}] exceeds available permutations [${maxPermutations}].  Increase number of color addresses to [${estimatedPermutations}]!`;
  } else {
    colors.length = nPts;
  }
  return transpose(colors);

  function permute(xs) {
    if (!xs.length) return [[]];
    // or this duplicate-safe way, suggested by @M.Charbonnier in the comments
    return xs.flatMap((x, i) => {
      return permute(xs.filter((v, j) => i !== j)).map((vs) => [x, ...vs]);
    });
  }
  function shuffleArray(array) {
    let curId = array.length;
    // There remain elements to shuffle
    while (0 !== curId) {
      // Pick a remaining element
      let randId = Math.floor(Math.random() * curId);
      curId -= 1;
      // Swap it with the current element.
      let tmp = array[curId];
      array[curId] = array[randId];
      array[randId] = tmp;
    }
    return array;
  }
  function factorial(n) {
    if (n === 0 || n === 1) {
      return 1; // 0! and 1! are both defined as 1
    }

    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }

    return result;
  }
  function nearestFactorialInverse(n) {
    let x = 0;
    let factorialResult = 1;

    while (factorialResult < n) {
      x++;
      factorialResult *= x;
    }

    return x;
  }
  function transpose(matrix) {
    const numRows = matrix.length;
    const numCols = matrix[0].length;

    // Create a new empty matrix with swapped dimensions
    const transposedMatrix = new Array(numCols)
      .fill()
      .map(() => new Array(numRows));

    // Fill the transposed matrix with values from the original matrix
    for (let i = 0; i < numRows; i++) {
      for (let j = 0; j < numCols; j++) {
        transposedMatrix[j][i] = matrix[i][j];
      }
    }

    return transposedMatrix;
  }
}
