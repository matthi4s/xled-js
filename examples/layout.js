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

  await twinkly.uploadLayout(randomLayout(nleds), "2d", true);

  let layout = await twinkly.getLayout();
  console.log(layout);
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
