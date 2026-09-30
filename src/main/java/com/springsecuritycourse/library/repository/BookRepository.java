package com.springsecuritycourse.library.repository;

import com.springsecuritycourse.library.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BookRepository extends JpaRepository<Book, Integer> {
    Optional<Book> findByTitle(String title);
    Optional<Book> findByAuthor(String author);
}
