create database event_db;

create table users (
    id serial primary key,
    name text not null,
    email text unique not null
);

----------------------------------------------------------------------

create table events (
    id serial primary key,
    title text not null,
    datetime timestamptz not null,
    location text not null,
    capacity integer not null check (capacity > 0 and capacity <= 1000)
);

----------------------------------------------------------------------

create table registrations (
    id serial primary key,
    user_id integer references users(id) on delete cascade,
    event_id integer references events(id) on delete cascade,
    unique(user_id, event_id)
);
SELECT * FROM events
