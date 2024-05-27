import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Set up __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// create an account on http://www.openweathermap.org
//get your api key or generate .
//create a .env file 
//and ADD data : API_KEY = < YOUR Api Key >
// example data :API_KEY = 3a31399b5150hd744c7141ahsbd1894f55b
const API_KEY = process.env.API_KEY;
const celcius = "metric";

app.use(bodyParser.json()); // Middleware to parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to handle sessions
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// Serve static files from the 'public' directory
app.use(express.static("public"));

// Define a custom middleware to set the correct MIME type for CSS files
app.use((req, res, next) => {
  if (req.url.endsWith(".css")) {
    res.setHeader("Content-Type", "text/css");
  }
  next();
});

app.get("/", (req, res) => {
  console.log(req.socket.remoteAddress);
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/forecast", async (req, res) => {
  try {
    const params = req.session.params || {
      q: "hyderabad",
      appid: API_KEY,
      units: celcius,
    };
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast`,
      { params }
    );
    res.render("index.ejs", { data: response.data });
  } catch (err) {
    console.error("Failed to make request:", err.message);
    res.render("404.ejs");
  }
});

app.post("/curr", (req, res) => {
  // Store the coordinates in the session
  req.session.lat = req.body.lat;
  req.session.lon = req.body.lon;

  // Redirect to the GET request handler
  res.redirect("/curr");
});

app.get("/curr", async (req, res) => {
  const params = {
    lat: req.session.lat,
    lon: req.session.lon,
    appid: API_KEY,
    units: celcius,
  };
  req.session.params = params;
  res.redirect("/forecast");
});

app.post("/city", (req, res) => {
  const { city, state, countryCode } = req.body.params;
  const q =
    state && countryCode
      ? `${city},${state},${countryCode}`
      : state
      ? `${city},${state}`
      : city;

  req.session.params = { q, appid: API_KEY, units: celcius };
  res.redirect("/city");
});

app.get("/city", (req, res) => {
  res.redirect("/forecast");
});

app.get("/index", (req, res) => {
  res.render("index.ejs", { data: "hi there ,ejs is working" });
});

app.listen(PORT, () => {
  console.log(`Server is Running at port:${PORT}.`);
});
