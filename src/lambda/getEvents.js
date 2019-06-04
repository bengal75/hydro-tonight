import dotenv from "dotenv/config";
import fetch from "node-fetch";
import format from "date-fns/format";

const emptyEvent = {
    name: "Nothing",
    url: null,
    dates: {},
    images: [],
};

export const handler = async (event) => {
    const hydroVenueId = "KovZ9177Sq0";
    const apikey = process.env.TICKETMASTER_API_KEY;
    const today = format(new Date(), "YYYY-MM-DD");
    const requestUrl = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apikey}&venueId=${hydroVenueId}&startDateTime=${today}T00%3A00%3A00Z&endDateTime=${today}T23%3A59%3A59Z`;

    const response = await fetch(requestUrl);
    const events = await response.json();

    const nothingOn = events.page.totalElements === 0;
    if (nothingOn)
        return {
            statusCode: 200,
            body: JSON.stringify(emptyEvent, null, 2),
        };

    const filteredEvents = events._embedded.events.filter(event => {
        // Don't use 'events' that are just listings of premium tickets
        // using a rather crude metric on the name. It works though!
        const lowerCaseName = event.name.toLowerCase();
        if (lowerCaseName.includes("- platinum") || lowerCaseName.includes("- vip")) return false;
        return true;
    });
    const singleEvent = filteredEvents.length ? filteredEvents[0] : events._embedded.events[0];
    const returnValue = {
        name: singleEvent.name,
        url: singleEvent.url,
        dates: singleEvent.dates,
        images: singleEvent.images,
    };
    return {
        statusCode: 200,
        body: JSON.stringify(returnValue, null, 2),
    };
};
