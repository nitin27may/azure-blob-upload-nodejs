import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from "../environments/environment";

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly chunkSize = 5 * 1024 * 1024; // 5 MB per chunk
  private baseUrl = environment.apiEndpoint;

  constructor(private http: HttpClient) {}

  uploadFile(file: File, containerName: string, blobName: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('containerName', containerName);
    formData.append('blobName', blobName);
    return this.http.post(`${this.baseUrl}/blob/upload`, formData);
  }

  uploadLargeFile(file: File, containerName: string, blobName: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('containerName', containerName);
    formData.append('blobName', blobName);
    return this.http.post(`${this.baseUrl}/blob/upload-large`, formData);
  }

  getFiles(containerName: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/blob/list?containerName=${containerName}`);
  }

  deleteFile(fileName: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/blob/delete/${fileName}`);
  }

  uploadChunkFile(file: File, containerName: string): Observable<any> {
    const chunkSize = this.chunkSize || 5 * 1024 * 1024; // Default chunk size: 5 MB
    const totalChunks = Math.ceil(file.size / chunkSize);
    let isCompleted = false; // Guard to ensure process runs only once

    const uploadChunk = async (chunkIndex: number): Promise<void> => {
      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append('chunk', chunk, file.name);
      formData.append('containerName', containerName);
      formData.append('blobName', file.name);
      formData.append('chunkIndex', chunkIndex.toString());
      formData.append('totalChunks', totalChunks.toString());

      try {
        const response = await this.http.post(`${this.baseUrl}/blob/upload-chunk`, formData).toPromise();
        console.log(`Uploaded chunk ${chunkIndex + 1}/${totalChunks}`, response);

        if (chunkIndex + 1 >= totalChunks) {
          console.log('All chunks uploaded successfully.');
          isCompleted = true; // Mark completion
          return; // End recursion explicitly
        }
      } catch (error) {
        console.error(`Error uploading chunk ${chunkIndex + 1}:`, error);
        throw error; // Propagate error to calling code
      }
    };

    return new Observable((observer) => {
      if (isCompleted) {
        console.log('Upload already completed, skipping.');
        return; // Exit if already completed
      }

      let uploadedChunks = 0;
      let isCancelled = false;

      const uploadChunksSequentially = async (): Promise<void> => {
        for (let i = 0; i < totalChunks && !isCancelled; i++) {
          try {
            await uploadChunk(i);
            uploadedChunks++;
            observer.next({
              progress: Math.round((uploadedChunks / totalChunks) * 100),
            });
          } catch (error) {
            observer.error(error);
            return; // Stop further processing on error
          }
        }
      };

      uploadChunksSequentially()
        .then(() => {
          if (!isCancelled && !isCompleted) {
            //observer.next({ message: 'File uploaded successfully.' });
            observer.complete();
          }
        })
        .catch((error) => {
          observer.error(error);
        });

      // Cleanup function to handle cancellation
      return () => {
        isCancelled = true;
        console.log('Upload cancelled by the user.');
      };
    });
  }
  streamUpload(file: File, containerName: string, blobName: string): Observable<void> {
    const fileStream = file.stream();
    const headers = new Headers({
      'Container-Name': containerName,
      'Blob-Name': blobName,
    });

    const reader = fileStream.getReader();

    return new Observable<void>((observer) => {
      fetch(`${this.baseUrl}/blob/stream-upload`, {
        method: 'POST',
        headers,
        duplex: 'half',
        body: new ReadableStream({
          start(controller) {
            function push() {
              reader.read().then(({ done, value }) => {
                if (done) {
                  controller.close();
                  observer.next(); // Notify completion
                  observer.complete();
                  return;
                }
                controller.enqueue(value); // Pass the chunk to the stream
                push(); // Continue reading the next chunk
              }).catch((error) => {
                observer.error(error); // Notify error
              });
            }
            push();
          },
        }),
      } as RequestInit)
        .then((response) => {
          if (response.ok) {
            observer.next(); // Notify success
            observer.complete(); // Complete the observable
          } else {
            observer.error(new Error(`Upload failed with status: ${response.status}`));
          }
        })
        .catch((error) => {
          observer.error(error); // Notify error
        });
    });
  }
}
