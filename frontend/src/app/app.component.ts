import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  loader: boolean;
  imageDetails: any;
  formData: FormData;
  constructor(private httpClient: HttpClient) {
    this.loader = false;
  }

  uploadFile(event: any): void {
    this.formData = new FormData();
    for (const fileDetail of event) {
      this.formData.append('file', fileDetail.file);
    }
    this.uploadtoServer();
  }

  uploadtoServer(): void {
    this.formData.append('containerName', 'images');
    this.formData.append('folderpath', 'profile');
    this.loader = true;
    this.httpClient.post('/file/upload', this.formData).subscribe(
      (data: any) => {
        this.imageDetails = data;
        this.loader = false;
      },
      (error) => {
        this.loader = false;
      }
    );
  }
}
