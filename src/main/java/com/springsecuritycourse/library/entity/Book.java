package com.springsecuritycourse.library.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "book")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String title;
    private String author;
    private BigDecimal price;
    private boolean available;

    //Constructor
    public Book() {
    }
    public Book(String author, boolean available, int id, BigDecimal price, String title) {
        this.author = author;
        this.available = available;
        this.id = id;
        this.price = price;
        this.title = title;
    }

    // getters
    public String getAuthor() {
        return author;
    }
    public boolean isAvailable() {
        return available;
    }
    public int getId() {
        return id;
    }
    public BigDecimal getPrice() {
        return price;
    }
    public String getTitle() {
        return title;
    }

    //setters
    public void setAuthor(String author) {
        this.author = author;
    }
    public void setAvailable(boolean available) {
        this.available = available;
    }
    public void setId(int id) {
        this.id = id;
    }
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    public void setTitle(String title) {
        this.title = title;
    }

}
