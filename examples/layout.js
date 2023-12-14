import { Light } from "../dist/index.js";

async function run() {
  // instantiate the twinkly
  console.log("Creating twinkly...");
  const twinkly = new Light("192.168.1.164");

  // must login before sending commands
  console.log("Logging in...");
  await twinkly.login();
  // get the twinkly name
  console.log(`This twinkly is called ${await twinkly.getName()}`);
  // // adjust brightness
  // console.log("Set twinkly to full brightness");
  // await twinkly.setBrightness(100);
  // turn off lights
  console.log("Set twinkly to off mode");
  await twinkly.setMode("off");

  let details = await twinkly.getDeviceDetails();
  let nleds = details.number_of_led;

  // let layout = await twinkly.getLayout();

  // await twinkly.uploadLayout(randomLayout(nleds), "2d", true);

  let layout = await twinkly.getLayout();
  // layout.coordinates = flipYZ(layout.coordinates);
  console.log(layout);

  // use reduce to find the min and max values of x, y, and z
  // let minMax = layout.coordinates.reduce(
  //   (acc, coord) => {
  //     acc.minX = Math.min(acc.minX, coord.x);
  //     acc.maxX = Math.max(acc.maxX, coord.x);
  //     acc.minY = Math.min(acc.minY, coord.y);
  //     acc.maxY = Math.max(acc.maxY, coord.y);
  //     acc.minZ = Math.min(acc.minZ, coord.z);
  //     acc.maxZ = Math.max(acc.maxZ, coord.z);
  //     return acc;
  //   },
  //   {
  //     minX: Infinity,
  //     maxX: -Infinity,
  //     minY: Infinity,
  //     maxY: -Infinity,
  //     minZ: Infinity,
  //     maxZ: -Infinity,
  //   }
  // );

  // console.log(minMax);
  // console.log(
  //   layout.coordinates.filter((coord) => coord.z === minMax.minZ).length
  // );

  // await twinkly.uploadLayout(layout.coordinates, "2D", true);

  // get list of movies
  // let listOfMovies = await twinkly.getListOfMovies();
  // console.log(listOfMovies);
  // add movie to twinkly (better way to do this)
  // await twinkly.addMovie(movie);
  // // set twinkly to movie mode
  // console.log("Set twinkly to movie mode");
  // await twinkly.setMode("movie");
}

run();

function randomLayout(n) {
  let coords = [];
  for (let i = 0; i < n; i++) {
    coords.push({
      x: Math.random(),
      y: Math.random(),
      z: 0,
    });
  }
  return coords;
}

function flipYZ(coords) {
  return coords.map((coord) => {
    return {
      x: coord.x,
      y: coord.z,
      z: coord.y,
    };
  });
}