import { CommonModule } from "@angular/common";
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from "../../environments/environment";

@Component({
  selector: 'app-blob-details',
  templateUrl: './blob-details.component.html',
  styleUrls: ['./blob-details.component.scss'],
  imports: [CommonModule]
})
export class BlobDetailsDialogComponent {

  environment = environment;
  constructor(
    public dialogRef: MatDialogRef<BlobDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
 // Check if the content type is text
 isTextContent(contentType: string): boolean {
  return contentType?.startsWith('text/');
}

// Check if the content type is an image
isImageContent(contentType: string): boolean {
  return contentType?.startsWith('image/');
}

// Check if the content type is video
isVideoContent(contentType: string): boolean {
  return contentType?.startsWith('video/');
}

// Check if the content type is audio
isAudioContent(contentType: string): boolean {
  return contentType?.startsWith('audio/');
}


// Mock method to fetch text content (replace with real implementation)
fetchBlobContent(sasUri: string): string {
  // Implement a service call to fetch and return text content from the SAS URL
  return 'Sample text content fetched from blob.';
}

closeDialog(): void {
  this.dialogRef.close();
}


}
