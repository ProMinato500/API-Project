require("dotenv").config()


const express = require("express");

const mongoose = require("mongoose");

var bodyParser = require("body-parser");



//Database
const database = require("./database/database");

const BookModel = require("./database/book")
const AuthorModel = require("./database/author")
const PubModel = require("./database/publication")


//Initialise express
const booky = express();

booky.use(bodyParser.urlencoded({extended: true}));
booky.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URL,
{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}).then(() => console.log("Connection Established"));

/*
Route           /
Description     Get all the books
Access          PUBLIC
Parameter       NONE
Methods         GET
*/
booky.get("/", async (req,res) => {
    const getAllBooks = await BookModel.find();
    return res.json(getAllBooks);
});

/*
Route           /is
Description     Get spacific book on ISBN
Access          PUBLIC
Parameter       isbn
Methods         GET
*/
booky.get("/is/:isbn",async (req,res) => {

    const getSpecificBook = await BookModel.findOne({ISBN: req.params.isbn});


    if(!getSpecificBook) {
        return res.json({error: `No book found for the ISBN of ${req.params.isbn}`});
    }

    return res.json({book: getSpecificBook});
});

/*
Route           /c
Description     Get specific book on category
Access          PUBLIC
Parameter       category
Methods         GET
*/
booky.get("/c/:category", async (req,res) => {
    const getSpecificBook = await BookModel.findOne({category: req.params.category});


    if(!getSpecificBook) {
      return res.json({error: `No book found for the category of ${req.params.category}`});
    }

    return res.json({book: getSpecificBook});
});

/*
Route           /lang
Description     Get specific book on language
Access          PUBLIC
Parameter       language
Methods         GET
*/
booky.get("/lang/:language", async (req,res) => {
    const getSpecificBook = await BookModel.filter(
        (book) => book.language===req.params.language
    )

    if(getSpecificBook.length === 0) {
        return res.json({error: `No Book found for the language of ${req.params.language}`});
    }

    return res.json({book: getSpecificBook});
});

/*
Route           /author
Description     Get all authors
Access          PUBLIC
Parameter       NONE
Methods         GET
*/
booky.get("/author", async (req,res) => {
    const getAllAuthors = await AuthorModel.find();
    return res.json(getAllAuthors);
});

/*
Route           /a
Description     Get specific author based on id
Access          PUBLIC
Parameter       id
Methods         GET
*/
booky.get("/a/:id", (req,res) => {
    const getSpecificAuthor = database.author.filter(
        (author) => author.id === parseInt(req.params.id)
    );

    if(getSpecificAuthor.length === 0){
        return res.json({error: `No Author found for the ID of ${req.params.id}`})
    }

    return res.json({authors: getSpecificAuthor});
});

/*
Route           /author
Description     Get all authors based on books
Access          PUBLIC
Parameter       isbn
Methods         GET
*/
booky.get("/author/book/:isbn", (req,res) => {
    const getSpecificAuthor = database.author.filter(
        (author) => author.books.includes(req.params.isbn)
    );

    if(getSpecificAuthor.length === 0){
        return res.json({
        error: `No author found for the book of ${req.params.isbn}`
        });
    }
    return res.json({authors: getSpecificAuthor});
});

/*
Route           /publications
Description     Get all publications
Access          PUBLIC
Parameter       isbn
Methods         GET
*/
booky.get("/publications",async (req,res) => {
  const getAllPublications = await PubModel.find();
  return res.json(getAllPublications);
});

/*
Route           /publication
Description     Get specific publications based on id
Access          PUBLIC
Parameter       id
Methods         GET
*/
booky.get("/publication/:id", (req,res) => {
    const getSpecificPublication = database.publications.filter(
        (publication) => publication.id === parseInt(req.params.id)
    );

    if(getSpecificPublication.length === 0){
        return res.json({error: `No Publication found for the ID of ${req.params.id}`})
    }

    return res.json({publications: getSpecificPublication});
});

/*
Route           /p
Description     Get specific publications based on id
Access          PUBLIC
Parameter       id
Methods         GET
*/
booky.get("/p/:isbn", (req,res) => {
    const getSpecificPublication = database.publications.filter(
        (publication) => publication.books.includes(req.params.isbn)
    );

    if(getSpecificPublication.length === 0){
        return res.json({error: `No Publication found for the book of ${req.params.isbn}`})
    }

    return res.json({publications: getSpecificPublication});
});

//POST

/*
Route           /book/new
Description     Add new books
Access          PUBLIC
Parameter       NONE
Methods         POST
*/
booky.post("/book/new",async (req,res) => {
    const { newBook } = req.body;
    const addNewBook = BookModel.create(newBook);
    return res.json({
        books: addNewBook,
        message: "Book was added !!!"
    });
});

/*
Route           /author/new
Description     Add new authors
Access          PUBLIC
Parameter       NONE
Methods         POST
*/
booky.post("/author/new",async (req,res) => {
const { newAuthor } = req.body;
const addNewAuthor = AuthorModel.create(newAuthor);
  return res.json(
    {
      author: addNewAuthor,
      message: "Author was added!!!"
    }
  );
});

/*
Route           /publication/new
Description     Add new publications
Access          PUBLIC
Parameter       NONE
Methods         POST
*/
booky.post("/publication/new", (req,res) => {
  const newPublication = req.body;
  database.publication.push(newPublication);
  return res.json(database.publication);
});

/*
Route           /publication/update/book
Description     Update/Add new publications
Access          PUBLIC
Parameter       isbn
Methods         PUT
*/
booky.put("/publication/update/book/:isbn",(req,res) => {
    database.publications.forEach((pub) => {
        if(pub.id === req.body.pubID) {
            return pub.books.push(req.params.isbn);
        }
    });

    database.books.forEach((book) => {
        if(book.ISBN === req.params.isbn) {
            book.publications = req.body.pubID;
            return;
        }
    });

    return res.json(
        {
            books: database.books,
            publications: database.publications,
            message: "Successfully updated publication"
        }
    );
});

/*
Route           /book/delete
Description     Delete a book
Access          PUBLIC
Parameter       isbn
Methods         DELETE
*/
booky.delete("/book/delete/:isbn",(req,res) => {
    const updatedBookDatabase = database.books.filter(
        (book) => book.ISBN !==req.params.isbn
    )
    database.books = updatedBookDatabase;
    return res.json({books: database.books});
});

/*
Route           /book/delete/author
Description     Delete an author from a book
Access          PUBLIC
Parameter       isbn
Methods         DELETE
*/
booky.delete("book/delete/author/:isbn", (req,res) => {
    database.books.forEach((book) => {
            if(book.ISBN === req.params.isbn) {
                const newAuthorList = book.author.filter(
                    (eachAuthor) => eachAuthor !== parseInt(req.params.authorId)
                );
                book.author = newAuthorList;
                return;
            }
        });
        return res.json({
            book: database.books,
            author: database.author,
            message: "Author was deleted!!!!"
        })
    });

/*
Route           /book/delete/author
Description     Delete an author from a book and vice versa
Access          PUBLIC
Parameter       isbn, authorId
Methods         DELETE
*/
booky.delete("book/delete/author/:isbn/:authorId", (req,res) => {
    database.books.forEach((book) => {
        if(book.ISBN === req.params.isbn) {
            const newAuthorList = book.author.filter(
                (eachAuthor) => eachAuthor !== parseInt(req.params.authorId)
            );
            book.author = newAuthorList;
            return;
        }
    });

    database.author.forEach((eachAuthor) => {
        if(eachAuthor.id === parseInt(req.params.authorId)) {
            const newBookList = eachAuthor.books.filter(
                (book) => book!== req.params.isbn
            );
            eachAuthor.books = newBookList;
            return;}
        });

        return res.json({
            book: database.books,
            author: database.author,
            message: "Author was deleted!!!!"
        })
});












booky.listen(3000,() => {
    console.log("Server is up and running");
});