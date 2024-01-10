import React, { useEffect, useState } from "react";
import pb from "../lib/pocketbase";
import classes from "~/style/BadgeCard.module.css";
import { IconMapPin, IconCalendarEvent } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { Carousel } from "@mantine/carousel";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);

  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  return date.toLocaleString("cs-CZ", options).replace(",", "");
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
}

interface UserData {
  id?: string;
  avatar?: string;
  name?: string;
  surname?: string;
  username?: string;
}

async function getEvents(): Promise<Event[]> {
  try {
    const res = await fetch(
      "https://rocnikovka2.pockethost.io/api/collections/events/records/",
      { cache: "no-store" }
    );
    if (!res.ok) {
      throw new Error(`Error: ${res.status}`);
    }
    const data = await res.json();
    return data?.items || [];
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return [];
  }
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getEvents().then((fetchedEvents) => {
      setEvents(fetchedEvents);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div>Loading events...</div>;
  }

  return (
    <div className={classes.home}>
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

export function EventCard({ event }: { event: Event }) {
  let imageUrls = [];
  for (let i = 0; i < event.image.length; i++) {
      imageUrls.push(`https://rocnikovka2.pockethost.io/api/files/${event.collectionId}/${event.id}/${event.image[i]}`);
  }
  const image = `https://rocnikovka2.pockethost.io/api/files/${event.collectionId}/${event.id}/${event.image[0]}`;
  const [loading2, setLoading2] = useState<boolean>(true);
  const [dataUser, setDataUser] = useState<UserData | null>(null);

  const shortDescription =
    event.description.length > 100
      ? `${event.description.substring(0, 97)}...`
      : event.description;

  const [eventUsers, setEventUsers] = useState<{ users: string[] }>({
    users: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://rocnikovka2.pockethost.io/api/collections/users/records/${pb?.authStore?.model?.id}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const jsonData: UserData = await response.json();
        setDataUser(jsonData);
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
      }
    };
    if (pb.authStore.isValid) {
      fetchData();
    }
  }, [pb?.authStore?.isValid]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://rocnikovka2.pockethost.io/api/collections/events/records/${event.id}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const jsonData = await response.json();
        setEventUsers(jsonData);
        setLoading2(false);
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
      }
    };
    fetchData();
  }, []);

  const data = {
    users: [...eventUsers.users.filter((user) => user !== dataUser?.id)],
  };

  const isUserInEvent = eventUsers.users.includes(dataUser?.id ?? "");
  const isUserOwner = event.owner === dataUser?.id;

  const handleJoinEvent = async (eventId: string) => {
    setLoading2(true);
    if (isUserInEvent) {
      data.users = eventUsers.users.filter((user) => user !== dataUser?.id);
    } else {
      data.users = [dataUser?.id ?? "", ...eventUsers.users];
    }
    await pb.collection("events").update(eventId, data);
    try {
      const response = await fetch(
        `https://rocnikovka2.pockethost.io/api/collections/events/records/${eventId}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const jsonData = await response.json();
      setEventUsers(jsonData); // Update the event users state
      setLoading2(false);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  const navigate = useNavigate();
  const handleAboutEvent = async (eventId: string) => {
    navigate(`/app/event?id=${eventId}`);
  };

  const slides = imageUrls.map((image) => (
    <Carousel.Slide key={image}>
      <img src={image} alt="Event Image" className={classes.image} />
    </Carousel.Slide>
  ));

  return (
    <div className={classes.card}>
      <div className={classes.cardcontent}>
        <div className={classes.imgcontainer}>
        {event.image.length === 1 ? (
  <img src={image} alt="Event Image" className={classes.image} />
) : (
  <Carousel withIndicators height={200}>
    {slides}
  </Carousel>
)}

        </div>
        <div className={classes.info}>
          <h1>{event.title}</h1>
          <p>{shortDescription}</p>
          <div className={classes.icontext}>
            <IconMapPin /> {event.place}
          </div>
          <div className={classes.icontext}>
            <IconCalendarEvent />
            <p>
              {formatDate(event.from_date)} - {formatDate(event.to_date)}
            </p>
          </div>
        </div>
      </div>
      <div className={classes.buttons}>
        {isUserOwner ? (
          <button className={classes.buttonjoin}>Editovat</button>
        ) : !loading2 ? (
          isUserInEvent ? (
            <button
              className={classes.buttonjoinNO}
              onClick={() => handleJoinEvent(event.id)}
            >
              Už nemám zájem
            </button>
          ) : (
            <button
              className={classes.buttonjoin}
              onClick={() => handleJoinEvent(event.id)}
            >
              Mám zájem
            </button>
          )
        ) : (
          <span>Zpracovávám</span> // Showing "Zpracovávám" when loading
        )}
        <button
          className={classes.buttonabout}
          onClick={() => handleAboutEvent(event.id)}
        >
          Více informací
        </button>
      </div>
    </div>
  );
}
