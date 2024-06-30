import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";
import env from "dotenv";

const app = express();
const port = 3000;
env.config();

const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});
  
db.connect();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', async function (req, res) {
    const result = await db.query("SELECT * FROM books_read");
    const data = result.rows;
    console.log(data);
    res.render("index.ejs", {data: data});
});

app.post("/sort", async function (req, res) {
    console.log(req.body);
    let result = [];
    if(req.body.sort == "Rating"){
        result = await db.query("SELECT * FROM books_read ORDER BY rate DESC");
    }
    else if(req.body.sort == "Recency"){
        result = await db.query("SELECT * FROM books_read ORDER BY date_read DESC");
    }
    else if(req.body.sort == "Title"){
        result = await db.query("SELECT * FROM books_read ORDER BY title DESC");
    }
    const data = result.rows;
    console.log(data);
    res.render("index.ejs", {data: data});
});

//CREATE
app.get('/create', async function (req, res) {
    res.render("create.ejs");
});

app.post("/create", function (req, res){
        if(req.body.edit >= 0){
            const id = req.body.edit;
            const date = new Date().toLocaleDateString()
            db.query("UPDATE books_read SET title = $1, date_read = $2, rate = $3, isbn = $4, review = $5 WHERE id = $6", [req.body.title, date, req.body.rating, req.body.isbn, req.body.review, id]);
            res.redirect("/");
        }
        else{
            console.log(req.body);
            const date = new Date().toLocaleDateString()
            db.query("INSERT INTO books_read (title, date_read, rate, isbn, review) VALUES ($1, $2, $3, $4, $5)", [req.body.title, date, req.body.rating, req.body.isbn, req.body.review])
            res.redirect("/");
        }
});

//READ
app.get("/view/:id", async function (req, res) {
    try{
        const id = req.params.id;
        console.log(id);
        const result = await db.query("SELECT * FROM books_read WHERE id = $1", [id]);
        const data = result.rows[0];
        console.log(data);
        res.render("views.ejs", {data: data});
    }
    catch(err){
        console.log(err);
        res.redirect("/");
    }
});

//UPDATE
app.get("/edit/:id", async function (req, res){
    try{
        const id = req.params.id;
        console.log(id);
        const result = await db.query("SELECT * FROM books_read WHERE id = $1", [id]);
        const data = result.rows[0];
        console.log(data);
        res.render("create.ejs", {data: data});
    }
    catch(err){
        console.log(err);
        res.redirect("/");
    }
});

//DELETE
app.post("/delete", async function(req, res) {
    const id = req.body.id
    console.log(req.body);
    await db.query("DELETE FROM books_read WHERE id = $1", [id]);
    res.redirect("/");
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});  