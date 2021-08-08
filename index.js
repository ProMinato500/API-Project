const express = require("express");

var bodyParser = require("body-parser");



//Database
const database = require("./database");




//Initialise express
const booky = express();

booky.use(bodyParser.urlencoded({extended: true}));
booky.use(bodyParser.json());

/*
Route           /
Description     Get all the books
Access          PUBLIC
Parameter       NONE
Methods         GET
*/
booky.get("/",(req,res) => {
    return res.json({books: database.books});
});

/*
Route           /is
Description     Get spacific book on ISBN
Access          PUBLIC
Parameter       isbn
Methods         GET
*/
booky.get("/is/:isbn",(req,res) => {
    const getSpecificBook = database.books.filter(
        (book) => book.ISBN === req.params.isbn
    );

    if(getSpecificBook.length === 0) {
        return res.json({error: `No Book found for the ISBN of ${req.params.isbn}`});
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
booky.get("/c/:category", (req,res) => {
    const getSpecificBook = database.books.filter(
        (book) => book.category.includes(req.params.category)
    )

    if(getSpecificBook.length === 0) {
        return res.json({error: `No Book found for the category of ${req.params.category}`});
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
booky.get("/lang/:language", (req,res) => {
    const getSpecificBook = database.books.filter(
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
booky.get("/author", (req,res) => {
    return res.json({authors: database.author});
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
booky.get("/author/:isbn", (req,res) => {
    const getSpecificAuthor = database.author.filter(
        (author) => author.books.includes(req.params.isbn)
    );

    if(getSpecificAuthor.length === 0){
        return res.json({error: `No Author found for the book of ${req.params.isbn}`})
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
booky.get("/publications",(req,res) => {
    return res.json({publications: database.publications});
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
booky.post("/book/new",(req,res) => {
    const newBook = req.body;
    database.books.push(newBook);
    return res.json({updatedBooks: database.books});
});

/*
Route           /author/new
Description     Add new authors
Access          PUBLIC
Parameter       NONE
Methods         POST
*/
booky.post("/author/new",(req,res) => {
    const newAuthor = req.body;
    database.author.push(newAuthor);
    return res.json({updatedAuthors: database.author});
});

/*
Route           /publication/new
Description     Add new publications
Access          PUBLIC
Parameter       NONE
Methods         POST
*/
booky.post("/publication/new",(req,res) => {
    const newPublication = req.body;
    database.publications.push(newPublication);
    return res.json({updatedPublications: database.publications});
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