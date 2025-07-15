const pool = require('../config/db_config');
// Create Event
exports.createEvent = async (req, res) => {
    const { title, datetime, location, capacity } = req.body;
    if (!title || !datetime || !location || !capacity) {
        return res.status(400).json({ error: "All fields are required" });
    }
    if (capacity <= 0 || capacity > 1000) {
        return res.status(400).json({ error: "Capacity must be between 1 and 1000" });
    }
    try {
        const result = await pool.query(
            'INSERT INTO events (title, datetime, location, capacity) VALUES ($1, $2, $3, $4) RETURNING id',
            [title, datetime, location, capacity]
        );
        res.status(201).json({ message: "Event created", eventId: result.rows[0].id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get Event with Registrations
exports.getEvent = async (req, res) => {
    const { id } = req.params;
    try {
        const eventData = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
        if (!eventData.rows.length) {
            return res.status(404).json({ error: "Event not found" });
        }
        const registrations = await pool.query(
            `SELECT u.id, u.name, u.email 
             FROM registrations r 
             JOIN users u ON r.user_id = u.id 
             WHERE r.event_id = $1`,
             [id]
        );
        const event = eventData.rows[0];
        event.registrations = registrations.rows;
        res.json(event);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Register User with Transaction to avoid overbooking
exports.registerUser = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ error: "userId required" });
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const eventData = await client.query('SELECT * FROM events WHERE id = $1 FOR UPDATE', [id]);
        if (!eventData.rows.length) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "Event not found" });
        }
        const event = eventData.rows[0];

        if (new Date(event.datetime) < new Date()) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: "Cannot register for past events" });
        }

        const regCount = await client.query('SELECT COUNT(*) FROM registrations WHERE event_id = $1', [id]);
        if (parseInt(regCount.rows[0].count) >= event.capacity) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: "Event is full" });
        }

        const userExists = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (!userExists.rows.length) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "User not found" });
        }

        const alreadyRegistered = await client.query(
            'SELECT * FROM registrations WHERE event_id = $1 AND user_id = $2',
            [id, userId]
        );
        if (alreadyRegistered.rows.length) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: "User already registered" });
        }

        await client.query('INSERT INTO registrations (user_id, event_id) VALUES ($1, $2)', [userId, id]);
        await client.query('COMMIT');
        res.json({ message: "User registered successfully" });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    } finally {
        client.release();
    }
};

// Cancel Registration
exports.cancelRegistration = async (req, res) => {
    const { id, userId } = req.params;
    try {
        const registration = await pool.query(
            'SELECT * FROM registrations WHERE event_id = $1 AND user_id = $2',
            [id, userId]
        );
        if (!registration.rows.length) {
            return res.status(400).json({ error: "User is not registered for this event" });
        }
        await pool.query(
            'DELETE FROM registrations WHERE event_id = $1 AND user_id = $2',
            [id, userId]
        );
        res.json({ message: "Registration cancelled" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get Upcoming Events with custom comparator
exports.getUpcomingEvents = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM events WHERE datetime > NOW()');
        const events = result.rows;
        events.sort((a, b) => {
            const dateA = new Date(a.datetime);
            const dateB = new Date(b.datetime);
            if (dateA - dateB !== 0) {
                return dateA - dateB;
            }
            return a.location.localeCompare(b.location);
        });
        res.json(events);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Event Stats
exports.getEventStats = async (req, res) => {
    const { id } = req.params;
    try {
        const eventData = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
        if (!eventData.rows.length) {
            return res.status(404).json({ error: "Event not found" });
        }
        const event = eventData.rows[0];
        const regCount = await pool.query('SELECT COUNT(*) FROM registrations WHERE event_id = $1', [id]);
        const totalRegistrations = parseInt(regCount.rows[0].count);
        const remainingCapacity = event.capacity - totalRegistrations;
        const percentageUsed = ((totalRegistrations / event.capacity) * 100).toFixed(2) + "%";
        res.json({
            eventId: event.id,
            title: event.title,
            totalRegistrations,
            remainingCapacity,
            percentageUsed
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};
