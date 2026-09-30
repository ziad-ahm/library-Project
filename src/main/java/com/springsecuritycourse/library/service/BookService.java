package com.springsecuritycourse.library.service;

import com.springsecuritycourse.library.entity.Book;
import com.springsecuritycourse.library.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookService {

    private BookRepository bookRepository;
    @Autowired
    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }


    //Create a new Book
    public Book CreateBook(Book book) {
        return bookRepository.save(book);
    }


    //Get All Books in the Library
    public List<Book> GetBooks() {
        return bookRepository.findAll();
    }


    //Get Book by ID
    public Book getaBook(Integer id){
        return bookRepository.getById(id);
    }


    //Delete the Book
    public void deleteBook(Integer id){
        bookRepository.deleteById(id);
    }

    //Edit the Book Information
    public void EditBook(int id , Book book) {

            // PUT ==> /books/1
            // 1 is existingBook ?!
        Book existingBook = bookRepository.findById(id).orElseThrow(null);

        existingBook.setTitle(book.getTitle());
        existingBook.setAuthor(book.getAuthor());
        existingBook.setPrice(book.getPrice());
        existingBook.setAvailable(book.isAvailable());

            bookRepository.save(existingBook);

    }


    //Search with Title
    public Book GetBookByTitle(String title){
        return bookRepository.findByTitle(title).orElseThrow(null);
    }
}
