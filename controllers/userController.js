const pool = require('../config/db_config');

exports.createUser = async (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: "Name and email are required" });
    }
    try {
        const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existing.rows.length) {
            return res.status(400).json({ error: "Email already exists" });
        }
        const result = await pool.query(
            'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id',
            [name, email]
        );
        res.status(201).json({ message: "User created", userId: result.rows[0].id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getUser = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (!result.rows.length) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};
