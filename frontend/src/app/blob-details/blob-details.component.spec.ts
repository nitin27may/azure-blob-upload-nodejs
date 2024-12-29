import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlobDetailsComponent } from './blob-details.component';

describe('BlobDetailsComponent', () => {
  let component: BlobDetailsComponent;
  let fixture: ComponentFixture<BlobDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlobDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlobDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
