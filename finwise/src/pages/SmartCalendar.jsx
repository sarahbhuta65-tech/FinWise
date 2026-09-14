import { useState, useEffect } from "react";
import axios from "axios";
import "./SmartCalendar.css";

function SmartCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [selectedDay, setSelectedDay] = useState(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthName = currentDate.toLocaleString("default", {
        month: "long",
    });

    // First day of the month
    const firstDay = new Date(year, month, 1).getDay();

    // Number of days in the month
    const daysInMonth = new Date(
        year,
        month + 1,
        0
    ).getDate();

    const previousMonth = () => {
        setCurrentDate(
            new Date(year, month - 1, 1)
        );
    };

    const nextMonth = () => {
        setCurrentDate(
            new Date(year, month + 1, 1)
        );
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const calendarDays = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(null);
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day);
    }

    const isToday = (day) => {
        const today = new Date();

        return (
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        );
    };

    useEffect(() => {
        const fetchCalendarEvents = async () => {
            try {
                const user = JSON.parse(
                    localStorage.getItem("user")
                );

                if (!user?._id) return;

                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/calendar/${user._id}`,
                    {
                        params: {
                            month: month + 1,
                            year: year,
                        },
                    }
                );

                setEvents(res.data);

            } catch (error) {
                console.error(
                    "Failed to fetch calendar events:",
                    error
                );

                setEvents([]);
            }
        };

        fetchCalendarEvents();

    }, [month, year]);

    const getEventsForDay = (day) => {
        if (!day) return [];

        return events.filter((event) => {
            const eventDate = new Date(event.dueDate);

            return (
                eventDate.getDate() === day &&
                eventDate.getMonth() === month &&
                eventDate.getFullYear() === year
            );
        });
    };

    return (
        <div className="smart-calendar">

            {/* HEADER */}
            <div className="calendar-header">

                <div>
                    <span className="calendar-eyebrow">
                        FINWISE
                    </span>

                    <h1>
                        Smart Calendar
                    </h1>

                    <p>
                        Your financial commitments,
                        organized by date.
                    </p>
                </div>

                <button
                    className="today-btn"
                    onClick={goToToday}
                >
                    Today
                </button>

            </div>


            {/* CALENDAR PANEL */}
            <div className="calendar-panel">

                {/* MONTH NAVIGATION */}
                <div className="calendar-navigation">

                    <button
                        onClick={previousMonth}
                        className="month-nav-btn"
                    >
                        ←
                    </button>

                    <h2>
                        {monthName} {year}
                    </h2>

                    <button
                        onClick={nextMonth}
                        className="month-nav-btn"
                    >
                        →
                    </button>

                </div>


                {/* WEEK DAYS */}
                <div className="calendar-weekdays">

                    {[
                        "Sun",
                        "Mon",
                        "Tue",
                        "Wed",
                        "Thu",
                        "Fri",
                        "Sat",
                    ].map((day) => (
                        <div
                            key={day}
                            className="weekday"
                        >
                            {day}
                        </div>
                    ))}

                </div>


                {/* DAYS */}
                <div className="calendar-grid">

                    {calendarDays.map(
                        (day, index) => (

                            <div
                                key={index}
                                className={`calendar-day ${
                                    day && isToday(day)
                                        ? "today"
                                        : ""
                                } ${
                                    day && getEventsForDay(day).length > 0
                                        ? "has-events"
                                        : ""
                                }`}
                                onClick={() => {
                                    if (day) {
                                        setSelectedDay(day);
                                    }
                                }}
                            >
                                {day && (
                                    <>
                                        <span className="day-number">
                                            {day}
                                        </span>

                                        <div className="day-events">

                                            {getEventsForDay(day).map((event) => (
                                                <span
                                                    key={event._id}
                                                    className={`event-dot ${event.type.toLowerCase()}`}
                                                    title={`${event.title} • ₹${event.amount}`}
                                                />
                                            ))}

                                        </div>

                                        {getEventsForDay(day).length > 0 && (
                                            <div className="calendar-hover-preview">
                                                {getEventsForDay(day).map((event) => (
                                                    <div className="calendar-hover-event" key={event._id}>
                                                        <span className={`hover-event-type ${event.type.toLowerCase()}`}>
                                                            {event.type}
                                                        </span>
                                                        <strong>{event.title}</strong>
                                                        <span>₹{Number(event.amount).toLocaleString("en-IN")}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                        )
                    )}

                </div>

            </div>


            {/* UPCOMING SECTION */}
            <div className="calendar-bottom">

                <div className="calendar-summary-card">

                    <span className="summary-label">
                        UPCOMING
                    </span>

                    <h3>
                        Your upcoming commitments
                    </h3>

                    <p>
                        SIP, EMI and Savings Goal
                        payments will appear here.
                    </p>

                </div>


                <div className="calendar-summary-card">

                    <span className="summary-label">
                        THIS MONTH
                    </span>

                    <h3>
                        Financial overview
                    </h3>

                    <p>
                        Your monthly financial
                        commitments will be shown here.
                    </p>

                </div>

            </div>

            {selectedDay && (
                <div className="selected-day-panel">

                    <div className="selected-day-header">

                        <div>
                            <span className="summary-label">
                                SELECTED DATE
                            </span>

                            <h3>
                                {selectedDay} {monthName} {year}
                            </h3>
                        </div>

                        <button
                            className="close-day-btn"
                            onClick={() => setSelectedDay(null)}
                        >
                            ×
                        </button>

                    </div>

                    <div className="selected-day-events">

                        {getEventsForDay(selectedDay).length > 0 ? (

                            getEventsForDay(selectedDay).map((event) => (

                                <div
                                    className="calendar-event-card"
                                    key={event._id}
                                >

                                    <div className="event-info">

                                        <span
                                            className={`event-type ${event.type.toLowerCase()}`}
                                        >
                                            {event.type}
                                        </span>

                                        <h4>
                                            {event.title}
                                        </h4>

                                        {event.notes && (
                                            <p>
                                                {event.notes}
                                            </p>
                                        )}

                                    </div>

                                    <div className="event-amount">

                                        <strong>
                                            ₹{Number(event.amount).toLocaleString("en-IN")}
                                        </strong>

                                        <span
                                            className={
                                                event.paid
                                                    ? "paid-status"
                                                    : "pending-status"
                                            }
                                        >
                                            {event.paid
                                                ? "Paid"
                                                : "Pending"}
                                        </span>

                                    </div>

                                </div>

                            ))

                        ) : (

                            <p className="no-events">
                                No financial commitments on this date.
                            </p>

                        )}

                    </div>

                </div>
            )}

        </div>
    );
}

export default SmartCalendar;