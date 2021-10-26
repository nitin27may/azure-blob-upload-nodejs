// Import the core angular services.
import { Component } from '@angular/core';
import { EventEmitter } from '@angular/core';

// ----------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------- //

@Component({
  selector: 'inline-editable',
  inputs: ['value'],
  outputs: ['valueChangeEvents: valueChange'],
  styleUrls: ['./inline-edit.component.css'],
  templateUrl: './inline-edit.component.html'
})
export class InlineEditComponent {
  public isEditing: boolean;
  public pendingValue: string;
  public value!: string;
  public valueChangeEvents: EventEmitter<string>;

  // I initialize the editable component.
  constructor() {
    this.isEditing = false;
    this.pendingValue = '';
    this.valueChangeEvents = new EventEmitter();
  }

  // ---
  // PUBLIC METHODS.
  // ---

  // I cancel the editing of the value.
  public cancel(): void {
    this.isEditing = false;
  }

  // I enable the editing of the value.
  public edit(): void {
    this.pendingValue = this.value;
    this.isEditing = true;
  }

  // I process changes to the pending value.
  public processChanges(): void {
    // If the value actually changed, emit the change but don't change the local
    // value - we don't want to break unidirectional data-flow.
    if (this.pendingValue !== this.value) {
      this.valueChangeEvents.emit(this.pendingValue);
    }

    this.isEditing = false;
  }
}
