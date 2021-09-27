import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { timer } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Book } from '../models/book-model';
import { AjaxResponse } from '../models/ajax-response-model';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css']
})
export class BookComponent implements OnInit, OnDestroy {

  title: string = "Create New"
  actionButtonText = "Create"
  actionButtonIcon = "plus-circle"
  bookForm!: FormGroup
  bookList!: Book[] | Book 
  book!: Book 
  isUpdate: boolean = false;



  alertMsg!: string;
  style!: string;
  show: boolean = false;
  interval: any;
  alertIcon!: string;

  constructor(private http: HttpClient,
    private fb: FormBuilder) {
    this.initializeForm()
  }

  ngOnInit(): void {

    if (sessionStorage.getItem('book')) { //if it is an update populate fields
      let a = sessionStorage.getItem("book");
      console.log(a)
      this.book = JSON.parse(a == null ? "{}" : a);
      this.initializeFormwithData()
      this.title = "Update "
      this.actionButtonText = "Update"
      this.actionButtonIcon = "paper-plane"
      this.isUpdate = true
    }
  }

  ngOnDestroy(): void {
    sessionStorage.removeItem("book")
  }

  initializeForm() {
    this.bookForm = this.fb.group({
      name: [this.book?.name],
      id: [this.book?.id],
      isbn: [this.book?.isbn],
      number_of_pages: [this.book?.number_of_pages],
      publisher: [this.book?.publisher],
      released: [this.book?.released],
      country: [this.book?.country],

    })
  }

  initializeFormwithData() {
    this.bookForm = this.fb.group({
      name: [this.book?.name],
      id: [this.book?.id],
      isbn: [this.book?.isbn],
      number_of_pages: [this.book?.number_of_pages],
      publisher: [this.book?.publisher],
      released: [this.book?.released],
      country: [this.book?.country],

    })
  }

  createUpdateBook() {

    if (sessionStorage.getItem("book")) {
      this.updateBook();
    }
    else {
      this.createBook();
    }

  }

  createBook() {
    // console.log(this.bookForm.value);
    let CREATE_BOOK_URL = `http://localhost:8080/api/v1/books/${this.book?.id}?name=${this.book?.name}&isbn=${this.book?.isbn}&number_of_pages=${this.book?.number_of_pages}&publisher=${this.book?.publisher}&released=${this.book?.released}&country=${this.book?.country}`

    this.http.post<Book>(CREATE_BOOK_URL, null)
      .pipe(finalize(() => {

      }))
      .subscribe((response: any) => {
        if (response.status == "OK") {
          this.bookForm.reset();
          this.showAlert('Book Created Successfully', "warning", "info-circle")
          timer(2500).subscribe(() => {
            this.goBack();
          });


        }
      },
        (error: AjaxResponse<null>) => {
          this.showAlert(<string>(error?.message), "warning", "info-circle")
        })
  }


  searchBooks(event:any) {
    this.http.get(`http://localhost:8080/api/external-books?name=${event.target.value}`).subscribe(
      (response: AjaxResponse<Book[]>) => {
      this.book = response.data as Book ;
      // this.bookList.forEach(x=>{
      //   this.book.isbn = x.isbn;
      //   this.book.id = x.id;
      //   this.book.name = x.name;
      //   this.book.number_of_pages = x.number_of_pages;
      //   this.book.publisher = x.publisher;
      //   this.book.released = x.released
      // })
      this.initializeFormwithData();
      console.log(this.book);

    })
  }

  updateBook() {
    // console.log(this.bookForm.value);kjlkj
    let UPDATE_BOOK_URL = `http://localhost:8080/api/v1/books/${this.book?.id}?name=${this.book?.name}&isbn=${this.book?.isbn}&number_of_pages=${this.book?.number_of_pages}&publisher=${this.book?.publisher}&released=${this.book?.released}&country=${this.book?.country}`
    this.http.put<Book>(UPDATE_BOOK_URL, this.bookForm.value)
      .pipe(finalize(() => {

      }))
      .subscribe((response: any) => {

        if (response.status == "OK") {
          this.bookForm.reset();
          this.showAlert('Update Successful', "warning", "info-circle")
          timer(300).subscribe(() => {
            this.goBack();

          });


        }
      },
        (error: AjaxResponse<null>) => {
          this.showAlert(<string>(error?.message), "warning", "info-circle")
        })
  }


  goBack() {
    window.history.back();
  }

  //custom toast view
  showAlert(msg: string, style: string, icon: string) {
    this.alertIcon = icon;
    this.alertMsg = msg;
    this.style = style || 'info';
    this.show = true;
    timer(5000).subscribe(() => (this.show = false));
    return false;
  }



}
