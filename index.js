import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';
import session from 'express-session';
import dotenv from 'dotenv';

const app = express();
const PORT = process.env.PORT || 4000;

// Load environment variables
dotenv.config();

// Get API key from .env
const API_KEY = process.env.API_KEY;
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

// Route to handle root URL and render index.ejs
app.get("/", async (req, res) => {
  try {
    const params = req.session.params || {
      q: "hyderabad",
      appid: API_KEY,
      units: celcius,
    };

    // Save the default params to session if not already set
    if (!req.session.params) {
      req.session.params = params;
    }

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

// Route to handle current location forecast
app.post("/curr", (req, res) => {
  req.session.lat = req.body.lat;
  req.session.lon = req.body.lon;
  res.redirect("/");
});

app.get("/curr", async (req, res) => {
  const params = {
    lat: req.session.lat,
    lon: req.session.lon,
    appid: API_KEY,
    units: celcius,
  };
  req.session.params = params;
  res.redirect("/");
});

// Route to handle city-based forecast
app.post("/city", (req, res) => {
  const { city, state, countryCode } = req.body.params;
  const q = state && countryCode ? `${city},${state},${countryCode}` : state ? `${city},${state}` : city;
  req.session.params = { q, appid: API_KEY, units: celcius };
  res.redirect("/");
});

app.get("/city", (req, res) => {
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Server is Running at port:${PORT}.`);
  open(`http://localhost:${PORT}`); // Open the browser to the specified URL
});
