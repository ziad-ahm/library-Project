package com.springsecuritycourse.library.controller;

import com.springsecuritycourse.library.entity.Book;
import com.springsecuritycourse.library.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/books")
public class BookController {

    private BookService bookService;
    @Autowired
    public BookController(BookService bookService) {
        this.bookService = bookService;
    }


    //Create a new Book
    @PostMapping
    public String CreateBook(@RequestBody Book book) {
        bookService.CreateBook(book);
        return"Book Created Successfully!";
    }


    //Get All Books in the Library
    @GetMapping
    public List<Book> GetBooks() {
        return bookService.GetBooks();
    }



    //Get Book by ID
    @GetMapping("/{id}")
    public Book getaBook(@PathVariable Integer id){
        return bookService.getaBook(id);
    }


    //Delete the Book
    @DeleteMapping("/{id}")
    public String deleteBook(@PathVariable Integer id){
        bookService.deleteBook(id);
        return "Book Deleted Successfully!";
    }


    //Edit the Book Information
    @PutMapping("/{id}")
    public String editBook(@PathVariable Integer id, @RequestBody Book book){
        bookService.EditBook(id, book);
        return "Edit Book Successfully!";
    }


    //Search with Title
    @GetMapping("/booktitle/{title}")
    public Book GetBookByTitle(@PathVariable String title){
        return bookService.GetBookByTitle(title);
    }


}
