import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import open from 'open'; // Import the open package

// Set up __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
dotenv.config();

const app = express();
const PORT = 5500;

// Get API key from .env
const API_KEY = 3b31392b088040f744c7a7fb1894f55b;
const celcius = "metric";

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: "your-secret-key",
  resave: false,
  saveUninitialized: true,
}));

// Serve static files from the 'public' directory
app.use(express.static("public"));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Custom middleware for CSS MIME type
app.use((req, res, next) => {
  if (req.url.endsWith(".css")) {
    res.setHeader("Content-Type", "text/css");
  }
  next();
});

// Route to serve index.html
app.get("/", (req, res) => {
  console.log(req.socket.remoteAddress);
  res.sendFile(path.join(__dirname, "index.html"));
});

// Route to handle /forecast and render index.ejs
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

// Other routes to handle current location and city-based forecast
app.post("/curr", (req, res) => {
  req.session.lat = req.body.lat;
  req.session.lon = req.body.lon;
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
  const q = state && countryCode ? `${city},${state},${countryCode}` : state ? `${city},${state}` : city;
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
  open(`http://localhost:${PORT}`); // Open the browser to the specified URL
});
