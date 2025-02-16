import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import pg from "pg"

const port = 3000;
const app = express();

let review = []

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

const db = new pg.Client({
    user: 'postgres',
    host: 'localhost',
    database: 'books',
    password: 'ps4501',
    port: 5432,
});
db.connect();

const URL = "https://covers.openlibrary.org/b/isbn/";
const urlId = "https://covers.openlibrary.org/b/id/";

app.get("/", (req,res)=>{
    res.render("form.ejs");
})


app.get("/books", async (req,res)=>{
    const result = await db.query("SELECT * FROM books");
    res.render("index.ejs",{ result: result.rows})
})


app.post("/summary", async (req,res)=>{
    const isbn = req.body["isbn"];
    const result = await db.query("SELECT * FROM books WHERE isbn = $1", [`${isbn}`]);
    res.render("summary.ejs", { result: result.rows});
})


app.post("/book",async (req,res)=>{
    const isbn = req.body["isbn"];

    try {
         const response = await axios.get(`${URL}${isbn}.json`);
         const result = response.data;
         
         db.query(
           "INSERT INTO books (isbn, title, date, rating, review, notes, imgurl) VALUES($1, $2, $3, $4, $5, $6, $7);",
           [
             req.body["isbn"],
             req.body["title"],
             new Date(req.body["date"]).toISOString().split("T")[0],
             req.body["rating"],
             req.body["review"],
             req.body["notes"],
             result.source_url,
           ]
         );

         res.render("form.ejs", {message: "Book info added successfully!"});
    } catch (error) {
        res.render("form.ejs", {message: "Operation failed!"});
        console.log(error);
    }  
})


app.post("/edit", async(req,res)=>{
    const isbn = req.body["isbn"];

    try {
         const response = await axios.get(`${URL}${isbn}.json`);
         const result = response.data;

         const updateData = {
           title: req.body["title"] || null,
           date: req.body["date"] ? new Date(req.body["date"]).toISOString().split('T')[0] : null,
           rating: req.body["rating"] || null,
           review: req.body["review"] || null,
           notes: req.body["notes"] || null
         };

         await db.query(
           "UPDATE books SET title = COALESCE($1, title), date = COALESCE($2, date), rating = COALESCE($3, rating), review = COALESCE($4, review), notes = COALESCE($5, notes) WHERE isbn = $6",
           [
             updateData.title,
             updateData.date,
             updateData.rating,
             updateData.review,
             updateData.notes,
             `${isbn}`,
           ]
         );



         res.render("form.ejs", {message: "Book info edited successfully!"});
    } catch (error) {
        res.render("form.ejs", {message: "Book info not found!"});
        console.log(error);
    }
})


app.post("/delete", async(req,res)=>{
    const isbn = req.body["isbn"];
    const id = review.findIndex((book) => book.isbn === isbn);
    try {
         await db.query("DELETE FROM books WHERE isbn = '" + isbn + "'");

         res.render("form.ejs", { message: "Book info deleted successfully!" });
    } catch (error) {
        res.render("form.ejs", { message: "Book info not found!" });
        console.log(error);  
    }   
})


app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
});
