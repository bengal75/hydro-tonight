import React from "react";
import isPast from "date-fns/is_past";
import isToday from "date-fns/is_today";
import format from "date-fns/format";
import "./App.css";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = { loading: true, event: null, image: null };
    }

    chooseImage = (images) => {
        if (images.length === 0) return null;
        const fullWidth = window.innerWidth;
        const filteredImages = images.filter((image) => image.width < fullWidth);
        const imagesToSort = filteredImages.length > 0 ? filteredImages : images;
        const sortedImages = imagesToSort.sort((imageA, imageB) => imageB.width - imageA.width);
        return sortedImages[0].url;
    };

    componentDidMount = async () => {
        const response = await fetch("/.netlify/functions/getEvents");
        const event = await response.json();
        const image = this.chooseImage(event.images);
        this.setState({ loading: false, event, image });
    };

    getTimePhrase = () => {
        if (!this.state.event.dates.start)
            return (
                <p>
                    There's nothing on at the Hydro tonight
                    <br />({format(new Date(), "dddd Do MMMM YYYY")})
                </p>
            );
        const date = this.state.event.dates.start.localDate;
        const time = this.state.event.dates.start.localTime;
        const localDateTime = `${date}T${time}`;
        const startInPast = isPast(localDateTime);
        const startDateIsToday = isToday(date);
        const formattedDate = format(date, "dddd Do MMMM YYYY");
        return (
            <p>
                {startInPast ? "Started" : "Starts"} {startDateIsToday ? `today (${formattedDate})` : formattedDate} at{" "}
                {format(localDateTime, "h:mma")}
            </p>
        );
    };

    render() {
        return (
            <div className="App">
                {this.state.event ? (
                    <>
                        {this.state.event.images.length > 0 && (
                            <img src={this.state.image} className="event-image" alt="Event promo" />
                        )}
                        <h1 className="event-title">{this.state.event.name}</h1>
                        {this.getTimePhrase()}
                        {this.state.event.dates.status && this.state.event.dates.status.code === "onsale" && (
                            <p>
                                <a href={this.state.event.url} target="_blank" rel="noopener noreferrer">
                                    Look for tickets
                                </a>
                            </p>
                        )}
                    </>
                ) : (
                    <h1>Checking...</h1>
                )}
            </div>
        );
    }
}

export default App;
