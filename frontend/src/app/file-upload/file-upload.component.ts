import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { StorageService } from '../storage.service';
import { RouterModule } from "@angular/router";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { Subject } from "rxjs";

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
      RouterModule,
  ],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  providers: [StorageService]
})
export class FileUploadComponent {
  files: File[] = [];
  uploading: boolean = false;
  progress: number = 0; // Progress value (0-100)
  progress$ = new Subject<number>();

  constructor(private storageService: StorageService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar) {}

  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      Array.from(event.dataTransfer.files).forEach(file => this.files.push(file));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  removeFile(index: number): void {
    this.files.splice(index, 1);
  }

  UploadFilesChunk(): void {
    this.uploading = true;
    if (!this.files.length) {
      alert('Please select a file first!');
      return;
    }

    this.storageService.uploadChunkFile(this.files[0], 'my-container').subscribe({
      next: (event) => {
        if (event.progress !== undefined) {
          if (event.progress === 100) {
            setTimeout(() => {
              console.log('All files uploaded successfully.');
              this.showToast('All files uploaded successfully!', 'success');
              this.reset(); // Reset files and progress after upload
            }, 2000);
          }
        }
        console.log('Progress:', event);
        this.progress = event.progress;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error uploading file:', err);
        this.uploading = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        console.log('File upload completed!');
        this.reset();
      },
    });

  }


  UploadFileStream(): void {
    if (!this.files) {
      alert('Please select a file!');
      return;
    }
    this.uploading = true;
    const containerName = 'my-container'; // Replace with your container name
    const blobName = this.files[0].name;

    this.storageService.streamUpload(this.files[0], containerName, blobName).subscribe({
      next: () => {
        this.showToast('File uploaded successfully!', 'success');
        this.reset();
      },
      error: (error) => {
        console.error('Error during upload:', error);
      },
      complete: () => {
        this.uploading = false;
      }
    });
  }

  uploadMultipartFormData(){
    if (!this.files) {
      alert('Please select a file!');
      return;
    }
    const containerName = 'my-container'; // Replace with your container name
    const blobName = this.files[0].name;
    this.storageService.uploadFile(this.files[0], containerName, blobName).subscribe({
      next: (value) => {
        this.progress = value;
      },
      error: (error) => {
        console.error('Progress subscription error:', error);
      },
      complete: () => {
        console.log('File uploaded successfully!');
        this.showToast('File uploaded successfully!', 'success');
        this.reset();
      }
    });

  }

  reset(): void {
    this.files = []; // Clear the files array
    this.progress = 0; // Reset progress
    this.uploading = false; // Reset uploading state
    this.cdr.detectChanges(); // Force Angular to update the view
  }

  showToast(message: string, type: 'success' | 'error' | 'info' | 'warn'): void {
    let panelClass = '';

    switch (type) {
      case 'success':
        panelClass = 'toast-success';
        break;
      case 'error':
        panelClass = 'toast-error';
        break;
      case 'info':
        panelClass = 'toast-info';
        break;
      case 'warn':
        panelClass = 'toast-warn';
        break;
    }

    this.snackBar.open(message, 'Close', {
      duration: 5000, // Toast will auto-dismiss after 3 seconds
      horizontalPosition: 'right', // Position: right
      verticalPosition: 'top', // Position: top
      panelClass: [panelClass], // Custom panel class for styling
    });
  }
}
