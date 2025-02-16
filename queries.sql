create table books(
    id serial primary key,
    isbn varchar(20),
    title varchar(100),
    date date,
    rating numeric(2),
    review text,
    notes text,
    check (rating <= 10)
)

alter table books add column imgurl text

