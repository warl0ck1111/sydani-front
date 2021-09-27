import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { timer } from 'rxjs';

import { Subject } from 'rxjs';
import * as XLSX from 'xlsx';

import {
  finalize,
} from 'rxjs/operators';
import { Book } from '../models/book-model';
import { ExcelService } from '../services/excel/excel.service';
import { AjaxResponse } from '../models/ajax-response-model';

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css']
})
export class BookListComponent implements OnInit {

  GET_ALL_BOOKS_URL: string = "http://localhost:8080/api/v1/books";
  DELETE_BOOKS_URL: string = "http://localhost:8080/api/v1/books/";

  bookList: Book[] = []

  importBooks: Book[] = this.bookList;
  exportBooks: Book[] = [];


  spinnerEnabled = false;
  keys?: string[] | null;
  dataSheet: any = new Subject();
  @ViewChild('inputFile') inputFile!: ElementRef;
  isExcelFile!: boolean;


  alertMsg!: string;
  style!: string;
  show: boolean = false;
  interval: any;
  alertIcon!: string;

  searchBookForm!: FormGroup

  

  constructor(
    private http: HttpClient,
    private router: Router,
    private excelService: ExcelService,
    private fb: FormBuilder
  ) { this.initializeForm() }

 

  ngOnInit(): void {
    this.findAllBooks();
  }

  initializeForm() {
    this.searchBookForm = this.fb.group({
      search: [],
      

    })
  }

  findAllBooks() {
    this.http.get(this.GET_ALL_BOOKS_URL).subscribe((response: AjaxResponse<Book[]>) => {
      this.bookList = response.data as Book[];
      // console.log(response);

    })
  }


  
 


  gotoCreateBook() {
    this.router.navigate(['/create'])
  }

  gotoEditBook(book: Book) {
    sessionStorage.setItem('book', JSON.stringify(book))
    this.router.navigate(["/edit"]);
  }

  deleteBook(book: Book) {
    this.http.delete(`${this.DELETE_BOOKS_URL}${book.id}`)
      .pipe(finalize(() => {
        this.findAllBooks();
      }))
      .subscribe((response: any) => {

        if (response.status == "success") {
          this.showAlert('Book Deleted Successfully', "warning", "info-circle")

          this.bookList = response.data;

        }

        // console.log(response);

      }, (error: AjaxResponse<null>) => {
        this.showAlert(error.message as string, "warning", "warning")
      })
  }

  exportData(tableId: string) {
    this.excelService.exportToFile("books", tableId);
    this.showAlert("Books Exported Succesfully", "info", "info-circle")

  }

  /**
   * import .xls|.xlsx document
   * @param evt
   */
  onChange(evt: any) {
    this.bookList = [];
    let data: any[], header: any;
    const target: DataTransfer = <DataTransfer>(evt.target);
    this.isExcelFile = !!target.files[0].name.match(/(.xls|.xlsx)/);
    if (target.files.length > 1) {
      this.inputFile.nativeElement.value = '';
    }
    if (this.isExcelFile) {
      this.spinnerEnabled = true;
      const reader: FileReader = new FileReader();
      reader.onload = (e: any) => {
        /* read workbook */
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

        /* grab first sheet */
        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];

        /* save data */
        data = XLSX.utils.sheet_to_json(ws);

        // console.log(data);

        this.bookList = data
        this.bookList.map(x => {
          


        })

      };

      reader.readAsBinaryString(target.files[0]);

      reader.onloadend = (e) => {
        this.spinnerEnabled = false;
        this.keys = Object.keys(data[0]);
        this.dataSheet.next(data)
      }
    } else {
      this.showAlert("Invalid Excel File", "warning", "info-circle")
      this.inputFile.nativeElement.value = '';
    }

    this.showAlert("Data Successfully Imported", "info", "info-circle")

  }


  showAlert(msg: string, style: string, icon: string) {
    this.alertIcon = icon;
    this.alertMsg = msg;
    this.style = style || 'info';
    this.show = true;
    timer(5000).subscribe(() => (this.show = false));
    return false;
  }


}
