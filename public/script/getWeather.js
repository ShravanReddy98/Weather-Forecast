const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

function success(pos) {
  const latitude = pos.coords.latitude;
  const longitude = pos.coords.longitude;

  // Send a POST request with latitude and longitude
  fetch("/curr", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ lat: latitude, lon: longitude }),
  })
    .then((response) => {
      if (response.ok) {
        window.location.href = "./curr";
      } else {
        console.error("Failed to redirect to ./curr");
      }
    })
    .catch((error) => console.error("Error:", error));
}

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

function getWeather() {
  navigator.geolocation.getCurrentPosition(success, error, options);
}




// get data by city
function cityWeather() {
  let location = document.getElementById("location").value;
  let addrs = location.split(",");
  let city = addrs[0].trim();
  let state = "";
  let countryCode = "";

  if (addrs.length > 1) {
    let addr1 = addrs[1].trim();
    if (addr1.length !== 0) state = addr1;
    if (addrs.length === 3) {
      let addr2 = addrs[2].trim();
      if (addr2.length !== 0) countryCode = addr2;
    }
  }

  let params = { city: city };
  if (state) params.state = state;
  if (countryCode) params.countryCode = countryCode;

  fetch("/city", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ params: params }),
  })
    .then((response) => {
      if (response.ok) {
        window.location.href = "./city";
      } else {
        console.error("Failed to redirect to ./city");
      }
    })
    .catch((error) => console.error("Error:", error));
}

document.addEventListener('DOMContentLoaded', (event) => {
  setWallpaper();
});


function setWallpaper() {
  try {
    // Retrieve the wall-data attribute from the body element
    const bodyElement = document.querySelector('body');
    const wallData = bodyElement.getAttribute('wall-data');

    const data = JSON.parse(wallData);

    let time = "";
    const hours = new Date(data.dt_txt).getHours();

    if (hours >= 6 && hours < 9) time = "Morning";
    else if (hours >= 9 && hours < 17) time = "Day";
    else if (hours >= 17 && hours < 19) time = "Evening";
    else time = "Night";

    const weather = data.weather[0].description;

    let url = "../images/backGround/";

    let strng= time + ".jpg"
    switch (weather) {
      case "light rain":
        url += "rainy" + strng;
        break;
      case "broken clouds":
        url += "cloudy" + strng;
        break;
      case "overcast clouds":
        url += "overcastCloudy" + strng;
        break;
      case  "scattered clouds":
        url += "scatteredCloudy" + strng;
        break;
      default:
        url += "default"+strng; 
        break;
      }

    bodyElement.style.backgroundImage = `url(${url})`;
    bodyElement.style.backgroundPosition = 'center';
  } catch (error) {
    console.error('Error in setWallpaper:', error);
  }
}
