import {
  Component,
  Output,
  EventEmitter,
} from '@angular/core';

@Component({
  selector: 'app-upload-files',
  templateUrl: './upload-files.component.html',
  styleUrls: ['./upload-files.component.css'],
})
export class UploadFileComponent {
  files: any = [];
  @Output() onfileUpload: EventEmitter<any> = new EventEmitter<any>();
  uploadFile(event: any): void {
    for (let index = 0; index < event.length; index++) {
      const element = event[index];
      this.files.push({ name: element.name, file: element });
      // this.fileList.push(element);
    }
  }
  deleteAttachment(index: any): void {
    this.files.splice(index, 1);
    event.preventDefault();
  }

  uploadDroppedFile() {
    this.onfileUpload.emit(this.files);
  }
  saveFileName(file: any, newFileName: any, index: number) {
    this.files[index].name = newFileName;
    console.log(file);
    console.log(newFileName);
  }
}
