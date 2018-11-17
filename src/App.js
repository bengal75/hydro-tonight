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
        try {
            const response = await fetch("/_/functions/getEvents");
            const event = await response.json();
            const image = this.chooseImage(event.images);
            this.setState({ loading: false, event, image });
        } catch (err) {
            console.log(err);
            this.setState({ loading: false, event: false });
        }
    };

    retry = () => {
        this.setState({ loading: true, event: null, image: null });
        this.componentDidMount();
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
                {this.state.loading ? (
                    <h1>Checking...</h1>
                ) : this.state.event ? (
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
                    <>
                        <h1>Dunno</h1>
                        <p>Couldn't find out what's on at the Hydro tonight. Maybe you're offline?</p>
                        <p className="try-again" onClick={this.retry}>
                            Try again
                        </p>
                    </>
                )}
            </div>
        );
    }
}

export default App;
