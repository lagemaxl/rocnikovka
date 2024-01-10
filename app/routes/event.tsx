import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import classes from "~/style/Event.module.css";
import { Image } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import "@mantine/carousel/styles.css";

// Helper function to parse query parameters
function useQuery() {
  return new URLSearchParams(useLocation().search);
}


interface Event {
  id: string;
  title: string;
  description: string;
  image: string;
  collectionId: string;
  from_date: string;
  to_date: string;
  owner: string;
  place: string;
  location: [number, number];
}

function formatDate(dateStr: string): string {
  // Vytvoření Date objektu z ISO řetězce
  const date = new Date(dateStr);

  // Nastavení lokalizace a formátu
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  // Formátování data do požadovaného formátu
  return date.toLocaleString("cs-CZ", options).replace(",", "");
}

async function getEvent(eventId: string): Promise<Event | null> {
  try {
    const res = await fetch(
      `https://rocnikovka2.pockethost.io/api/collections/events/records/${eventId}`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      throw new Error(`Error: ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch event:", error);
    return null;
  }
}

let MapContainer: typeof import("react-leaflet")["MapContainer"];
let TileLayer: typeof import("react-leaflet")["TileLayer"];
let Marker: typeof import("react-leaflet")["Marker"];

if (typeof window !== "undefined") {
  const leaflet = require("react-leaflet");
  MapContainer = leaflet.MapContainer;
  TileLayer = leaflet.TileLayer;
  Marker = leaflet.Marker;
  require("leaflet/dist/leaflet.css");
}

export default function EventDetails() {
  const navigate = useNavigate();
  const query = useQuery();
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    const eventId = query.get("id");
    if (eventId) {
      getEvent(eventId).then(setEvent);
    } else {
      navigate("/app/home"); // Redirect if no ID is found
    }
  }, [query]);

  if (!event) {
    return <div>Načítání...</div>;
  }

  console.log(event.location);

  let imageUrls = [];
for (let i = 0; i < event.image.length; i++) {
    imageUrls.push(`https://rocnikovka2.pockethost.io/api/files/${event.collectionId}/${event.id}/${event.image[i]}`);
}

  const slides = imageUrls.map((image) => (
    <Carousel.Slide key={image}>
      <Image src={image} className={classes.imageca} height={400} />
    </Carousel.Slide>
  ));

  return (
    <div className={classes.content}>
      <Carousel
        slideSize="100%"
        height="50%"
        slideGap="md"
        controlSize={29}
        loop
        withIndicators
        className={classes.carouselcon}
        classNames={{
          root: classes.carousel,
          controls: classes.carouselControls,
          indicator: classes.carouselIndicator,
        }}
      >
        {slides}
      </Carousel>
      <div className={classes.container}>
        <div className={classes.text}>
          <h1>{event.title}</h1>
          <p>{event.description}</p>
          <p>{event.place}</p>
          {formatDate(event.from_date)} - {formatDate(event.to_date)}
        </div>

        <div className={classes.map}>
          {typeof window !== "undefined" && (
            <MapContainer
              center={[50.6594, 14.0416]}
              zoom={13}
              className={classes.map}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[event.location[0], event.location[1]]} interactive={false} />;
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  );
}

