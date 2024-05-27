// Define the sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  let errorCode = document.querySelector("#error404"); // Correct selector
  let params = { city: "hyderabad" };
  
  sleep(3000).then(() => {
    console.log("Redirecting to /city with default city hyderabad");
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
  });
  