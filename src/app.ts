import axios from "axios";
import { Loader } from "@googlemaps/js-api-loader";
import env from "../env";

const form = document.querySelector("form")!;
const addressInput = document.getElementById("address") as HTMLInputElement;

const GOOGLE_API_KEY = env.API_KEY!;

type GoogleGeocodingResponse = {
  results: {
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }[];
  status: "OK" | "ZERO_RESULTS";
};

async function searchAddressHandler(event: Event) {
  event.preventDefault();
  const enteredAddress = addressInput.value;
  const coordinates = await getCoordinates(enteredAddress);
  drawMap(coordinates);
}

function drawMap(coordinates: { lat: number; lng: number }) {
  const loader = new Loader({
    apiKey: GOOGLE_API_KEY,
    version: "weekly",
    libraries: ["places"],
  });

  const mapOptions = {
    center: {
      lat: coordinates.lat,
      lng: coordinates.lng,
    },
    zoom: 16,
  };
  loader
    .importLibrary("maps")
    .then(({ Map }) => {
      const map = new Map(document.getElementById("map")!, mapOptions);
      new google.maps.Marker({ position: coordinates, map });
    })
    .catch((error) => {
      alert(error.message);
    });
}

async function getCoordinates(address: string) {
  const response = await axios.get<GoogleGeocodingResponse>(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURI(
      address
    )}&key=${GOOGLE_API_KEY}`
  );

  if (response.data.status !== "OK") {
    throw new Error("Could not fetch location");
  }
  return response.data.results[0].geometry.location;
}

form.addEventListener("submit", searchAddressHandler);
