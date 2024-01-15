import React, { useState, useEffect, ChangeEvent } from "react";
import { TextInput, Textarea, FileInput, Button } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import classes from "~/style/NewEvent.module.css";
import pb from "../lib/pocketbase";
import "@mantine/dates/styles.css";
import "leaflet/dist/leaflet.css";
import { useNavigate, useLocation } from "react-router-dom";

// Dynamic imports for Leaflet components
let MapContainer: typeof import("react-leaflet")["MapContainer"];
let TileLayer: typeof import("react-leaflet")["TileLayer"];
let Marker: typeof import("react-leaflet")["Marker"];
let useMapEvents: typeof import("react-leaflet")["useMapEvents"];

if (typeof window !== "undefined") {
  const leaflet = require("react-leaflet");
  MapContainer = leaflet.MapContainer;
  TileLayer = leaflet.TileLayer;
  Marker = leaflet.Marker;
  useMapEvents = leaflet.useMapEvents;
  require("leaflet/dist/leaflet.css");
}

type FormData = {
  title: string;
  description: string;
  image: File[];
  from_date: Date | null;
  to_date: Date | null;
  place: string;
  owner: string;
  location: [number, number];
};

type ValidationErrors = {
  title: string;
  description: string;
  from_date: string;
  to_date: string;
  place: string;
  image: string;
};

type Event = {
  title: string;
  description: string;
  image: string;
  from_date: Date | null;
  to_date: Date | null;
  place: string;
  owner: string;
  location: [number, number];
};

async function getEvent(eventId: string): Promise<Event | null> {
  try {
    const res = await fetch(
      `http://127.0.0.1:8090/api/collections/events/records/${eventId}`,
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

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function NewEvent() {
  const navigate = useNavigate();
  const query = useQuery();
  const [event, setEvent] = useState<Event | null>(null);
  const [editing, setEditing] = useState<boolean>(false);

  const [formData, setFormData] = useState<FormData>({
    title: "okokokoko",
    description: "vbnnm",
    image: [],
    from_date: new Date("2024-01-26T00:00:00+0100"),
    to_date: new Date("2024-01-31T00:00:00+0100"),
    place: "bnm",
    owner: pb.authStore.model?.id || "",
    location: [50.6594, 14.0416],
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    title: "",
    description: "",
    from_date: "",
    to_date: "",
    place: "",
    image: "",
  });

  useEffect(() => {
    const eventId = query.get("id");
    if (eventId) {
      getEvent(eventId).then((fetchedEvent) => {
        if (fetchedEvent) {
          setEvent(fetchedEvent);
          setEditing(true);
          setFormData({
            title: fetchedEvent.title || "",
            description: fetchedEvent.description || "",
            image: [],
            from_date: fetchedEvent.from_date
              ? new Date(fetchedEvent.from_date)
              : null,
            to_date: fetchedEvent.to_date
              ? new Date(fetchedEvent.to_date)
              : null,
            place: fetchedEvent.place || "",
            owner: fetchedEvent.owner || pb.authStore.model?.id || "",
            location: fetchedEvent.location || [50.6594, 14.0416],
          });
        }
      });
    }
  }, []);

  const validateTitle = (title: string) =>
    title.length >= 3 && title.length <= 20;
  const validateDescription = (description: string) =>
    description.length > 0 && description.length <= 2000;
  const validateFromDate = (fromDate: Date | null) =>
    fromDate && fromDate > new Date();
  const validateToDate = (toDate: Date | null, fromDate: Date | null) =>
    toDate && fromDate && toDate > fromDate;
  const validatePlace = (place: string) =>
    place.length >= 3 && place.length <= 20;
  const validateImage = (image: File[]) =>
    image.length > 0 && image.length <= 20;

  const handleChange =
    (field: keyof FormData) => (value: string | Date | File[] | null) => {
      setFormData({ ...formData, [field]: value });
      console.log(formData);
    };

  const validateForm = () => {
    const errors: ValidationErrors = {
      title: validateTitle(formData.title) ? "" : "Název musí mít 3-20 znaků.",
      description: validateDescription(formData.description)
        ? ""
        : "Popis musí mít 1-2000 znaků.",
      image: validateImage(formData.image)
        ? ""
        : "Musíte vybrat alespoň jeden obrázek. (max 20)",
      from_date: validateFromDate(formData.from_date)
        ? ""
        : "Událost musí začínat v budoucnu",
      to_date: validateToDate(formData.to_date, formData.from_date)
        ? ""
        : "Konec události musí být po jejím začátku",
      place: validatePlace(formData.place) ? "" : "Místo musí mít 3-20 znaků.",
    };
    setValidationErrors(errors);

    const isValid = Object.values(errors).every((error) => error === "");
    setIsFormValid(isValid);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    validateForm();

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    if (formData.from_date) {
      data.append("from_date", formData.from_date.toISOString());
    }
    if (formData.to_date) {
      data.append("to_date", formData.to_date.toISOString());
    }
    data.append("place", formData.place);
    if (pb.authStore.model?.id) {
      data.append("owner", pb.authStore.model.id);
    }

    if (formData.image.length > 0) {
      formData.image.forEach((image, index) => {
        data.append(`image`, image);
      });
    }

    data.append("location", JSON.stringify(formData.location));
    try {
      const record = await pb.collection("events").create(data);
      navigate("/app/home");
      console.log("Event created:", record);
    } catch (error) {
      console.error("Failed to create event:", error);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      require("leaflet/dist/leaflet.css");
    }
  }, []);

  const Markers = () => {
    const map = useMapEvents({
      click(e) {
        setFormData({ ...formData, location: [e.latlng.lat, e.latlng.lng] });
      },
    });

    console.log(formData.location);

    return formData.location ? (
      <Marker position={formData.location} interactive={false} />
    ) : null;
  };

  return (
    <div className={classes.content}>
      <div className={classes.container}>
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Název"
            placeholder="Napište název události"
            value={formData.title}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              handleChange("title")(event.currentTarget.value)
            }
          />
          <Textarea
            label="Popis"
            placeholder="Napište popis události"
            value={formData.description}
            className={classes.input}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
              handleChange("description")(event.currentTarget.value)
            }
          />
          <FileInput
            label="Obrázky"
            placeholder="Nahrajte obrázky události"
            className={classes.input}
            multiple
            onChange={(files: File[] | null) => handleChange("image")(files)}
            //accept=".jpg, .jpeg, .png" // Add the accepted file formats here
          />
          {formData.image.map((file, index) => (
            <div key={index}>
              <img
                src={URL.createObjectURL(file)}
                className={classes.smallimg}
                alt={`Image ${index}`}
              />
            </div>
          ))}

          <DateTimePicker
            valueFormat="YYYY-MM-DD HH:mm:ss"
            label="Od"
            placeholder="Vyberte datum a čas začátku události"
            value={formData.from_date}
            className={classes.input}
            onChange={(date: Date | null) => handleChange("from_date")(date)}
          />
          <DateTimePicker
            valueFormat="YYYY-MM-DD HH:mm:ss"
            label="Do"
            placeholder="Vyberte datum a čas konce události"
            className={classes.input}
            value={formData.to_date}
            onChange={(date: Date | null) => handleChange("to_date")(date)}
          />
          <TextInput
            label="Místo"
            placeholder="Napište místo konání události"
            value={formData.place}
            className={classes.input}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              handleChange("place")(event.currentTarget.value)
            }
          />
          <Button type="submit" className={classes.input}>
            Přidat událost
          </Button>
          {Object.keys(validationErrors).map(
            (key) =>
              validationErrors[key as keyof ValidationErrors] && (
                <p style={{ color: "red" }}>
                  {validationErrors[key as keyof ValidationErrors]}
                </p>
              )
          )}
        </form>
      </div>
      <div className={classes.container}>
        {typeof window !== "undefined" && (
          <MapContainer
            center={[50.6594, 14.0416]}
            zoom={13}
            className={classes.map}
            style={{ height: "400px", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Markers />
          </MapContainer>
        )}

        <p>Na mapě označte přesné místo konání akce</p>
      </div>
    </div>
  );
}
