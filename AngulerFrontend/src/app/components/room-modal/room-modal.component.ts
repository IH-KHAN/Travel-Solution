import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-room-modal',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatIconModule, 
    MatButtonModule,
    MatSelectModule,
    MatSlideToggleModule
  ],
  templateUrl: './room-modal.component.html',
  styleUrls: ['./room-modal.component.css']
})
export class RoomModalComponent implements OnInit {
  roomsForm!: FormGroup;
  roomTypes: any[] = [];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    public dialogRef: MatDialogRef<RoomModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { rooms: any[] }
  ) {}

  ngOnInit(): void {
    this.roomsForm = this.fb.group({
      rooms: this.fb.array([])
    });

    this.fetchRoomTypes();
  }

  fetchRoomTypes(): void {
    this.apiService.getAll<any[]>('RoomTypes').subscribe(res => {
      this.roomTypes = res;

      if (this.data && this.data.rooms && this.data.rooms.length > 0) {
        this.data.rooms.forEach(r => this.addRoom(r));
      } else {
        this.addRoom();
      }
    });
  }

  get rooms(): FormArray {
    return this.roomsForm.get('rooms') as FormArray;
  }

  addRoom(existingData: any = null): void {
    const unitsArray = this.fb.array([]) as FormArray;
    if (existingData && existingData.roomUnits && existingData.roomUnits.length > 0) {
      existingData.roomUnits.forEach((u: any) => {
        unitsArray.push(this.fb.group({
          roomUnitId: [u.roomUnitId || 0],
          roomNumber: [u.roomNumber || '', Validators.required],
          floor: [u.floor || '', Validators.required],
          roomView: [u.roomView || ''],
          isAvailable: [u.isAvailable !== undefined ? u.isAvailable : true]
        }));
      });
    } else {
      const initRoomNum = existingData?.roomNumber || '';
      const initFloor = existingData?.floor || '';
      const initView = existingData?.roomView || '';
      unitsArray.push(this.fb.group({
        roomUnitId: [0],
        roomNumber: [initRoomNum, Validators.required],
        floor: [initFloor, Validators.required],
        roomView: [initView],
        isAvailable: [true]
      }));
    }

    const roomGroup = this.fb.group({
      roomId: [existingData?.roomId || 0],
      roomTypeId: [existingData?.roomTypeId || null, Validators.required],
      description: [existingData?.description || ''],
      pricePerNight: [existingData?.pricePerNight || 0, [Validators.required, Validators.min(0)]],
      maxGuest: [existingData?.maxGuest || 1, [Validators.required, Validators.min(1)]],
      isAvailable: [existingData?.isAvailable !== undefined ? existingData.isAvailable : true],
      room_Images: [existingData?.room_Images || []],
      roomUnits: unitsArray
    });

    this.rooms.push(roomGroup);
  }

  getRoomUnits(roomIndex: number): FormArray {
    return (this.rooms.at(roomIndex) as FormGroup).get('roomUnits') as FormArray;
  }

  addRoomUnit(roomIndex: number): void {
    const units = this.getRoomUnits(roomIndex);
    units.push(this.fb.group({
      roomUnitId: [0],
      roomNumber: ['', Validators.required],
      floor: ['', Validators.required],
      roomView: [''],
      isAvailable: [true]
    }));
  }

  removeRoomUnit(roomIndex: number, unitIndex: number): void {
    const units = this.getRoomUnits(roomIndex);
    if (units.length > 1) {
      units.removeAt(unitIndex);
    }
  }

  removeRoom(index: number): void {
    this.rooms.removeAt(index);
  }

  onFileSelected(event: any, roomIndex: number): void {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        
        this.apiService.create('Uploads/Temp', formData).subscribe({
          next: (res: any) => {
            if (res && res.url) {
              const roomGroup = this.rooms.at(roomIndex) as FormGroup;
              const images = roomGroup.get('room_Images')?.value || [];
              // Determine if primary based on if it's the first image
              const isPrimary = images.length === 0;
              images.push({ room_ImageID: 0, imageUrl: res.url, isPrimaryImage: isPrimary });
              roomGroup.patchValue({ room_Images: images });
              roomGroup.markAsDirty();
            }
          },
          error: (err) => console.error('Upload failed', err)
        });
      }
      event.target.value = '';
    }
  }

  removeRoomImage(roomIndex: number, imageIndex: number): void {
    const roomGroup = this.rooms.at(roomIndex) as FormGroup;
    const images = roomGroup.get('room_Images')?.value || [];
    images.splice(imageIndex, 1);
    
    // Ensure one image is primary if any exist
    if (images.length > 0 && !images.some((i: any) => i.isPrimaryImage)) {
        images[0].isPrimaryImage = true;
    }
    
    roomGroup.patchValue({ room_Images: images });
    roomGroup.markAsDirty();
  }

  setPrimaryImage(roomIndex: number, imageIndex: number): void {
    const roomGroup = this.rooms.at(roomIndex) as FormGroup;
    const images = roomGroup.get('room_Images')?.value || [];
    images.forEach((img: any, idx: number) => img.isPrimaryImage = (idx === imageIndex));
    roomGroup.patchValue({ room_Images: images });
    roomGroup.markAsDirty();
  }

  onSave(): void {
    if (this.roomsForm.valid) {
      this.dialogRef.close(this.roomsForm.value.rooms);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
