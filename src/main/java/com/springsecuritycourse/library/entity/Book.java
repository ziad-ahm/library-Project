package com.springsecuritycourse.library.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

@JsonPropertyOrder({
        "title",
        "author",
        "price",
        "available"
})

@Entity
@Table(name = "book")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank(message = "Title cannot be empty")
    private String title;

    @NotBlank(message = "Author cannot be empty")
    private String author;

    @NotNull(message = "Price cannot be Null")
    @Positive(message = "Price must be greater than Zero")
    private BigDecimal price;

    private boolean available;

    //Constructor
    public Book() {
    }
    public Book(String author, boolean available, Integer id, BigDecimal price, String title) {
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
    public Integer getId() {
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
    public void setId(Integer id) {
        this.id = id;
    }
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    public void setTitle(String title) {
        this.title = title;
    }

}
