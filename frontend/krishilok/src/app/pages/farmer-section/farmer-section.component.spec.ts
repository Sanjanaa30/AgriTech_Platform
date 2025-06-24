import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmerSectionComponent } from './farmer-section.component';

describe('FarmerSectionComponent', () => {
  let component: FarmerSectionComponent;
  let fixture: ComponentFixture<FarmerSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FarmerSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FarmerSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
