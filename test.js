import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const port = 3000;
const app = express();

let review = []

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));



const URL = "https://covers.openlibrary.org/b/isbn/";
const urlId = "https://covers.openlibrary.org/b/id/";


app.get("/", (req,res)=>{
    res.render("form.ejs");
})


app.get("/books", async (req,res)=>{
    res.render("index.ejs", {result: review});
})


app.post("/summary", async (req,res)=>{
    const isbn = req.body["isbn"];
    const id = review.findIndex((book)=>book.isbn === isbn);
    res.render("summary.ejs", {result: review[id]});
})


app.post("/book", async (req, res) => {
  const isbn = req.body["isbn"];

  try {
    const response = await axios.get(`${URL}${isbn}.json`);
    const result = response.data;

    const data = {
      isbn: req.body["isbn"],
      imgurl: result.source_url,
      title: req.body["title"],
      date: req.body["date"],
      rating: req.body["rating"],
      review: req.body["review"],
      notes: req.body["notes"],
    };

    review.push(data);
    res.render("form.ejs", { message: "Book info added successfully!" });
  } catch (error) {
    res.render("form.ejs", { message: "Operation failed!" });
    console.log(error);
  }
});


app.post("/edit", async(req,res)=>{
    const isbn = req.body["isbn"];

    try {
         const response = await axios.get(`${URL}${isbn}.json`);
         const result = response.data;
         const id = review.findIndex((book) => book.isbn === isbn);

         const data = {
           isbn: req.body["isbn"] || review[id].isbn,
           imgurl: result.source_url || review[id].imgurl,
           title: req.body["title"] || review[id].title,
           date: req.body["date"] || review[id].date,
           rating: req.body["rating"] || review[id].rating,
           review: req.body["review"] || review[id].review,
           notes: req.body["notes"] || review[id].notes,
         };

         review[id] = data
         res.render("form.ejs", {message: "Book info edited successfully!"});
         console.log(req.body['review'])
    } catch (error) {
        res.render("form.ejs", {message: "Book info not found!"});
        console.log(error);
    }
})


app.post("/delete", async(req,res)=>{
    const isbn = req.body["isbn"];
    const id = review.findIndex((book) => book.isbn === isbn);
    try {
         review.splice(id, 1);
         res.render("form.ejs", { message: "Book info deleted successfully!" });
         console.log(review);
    } catch (error) {
        res.render("form.ejs", { message: "Book info not found!" });
        console.log(error);  
    }   
})


app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
});