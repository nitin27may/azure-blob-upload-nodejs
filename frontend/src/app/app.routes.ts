import { Routes } from '@angular/router';
import { FileListComponent } from "./file-list/file-list.component";
import { FileUploadComponent } from "./file-upload/file-upload.component";

export const routes: Routes = [
  { path: '', component: FileListComponent },
  { path: 'upload', component: FileUploadComponent }
];


