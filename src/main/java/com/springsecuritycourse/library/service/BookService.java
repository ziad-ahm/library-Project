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
    public Book GetAllBooks(int id){
        return bookRepository.getById(id);
    }

}
