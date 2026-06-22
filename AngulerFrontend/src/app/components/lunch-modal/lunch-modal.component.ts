import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-lunch-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule],
  templateUrl: './lunch-modal.component.html',
  styleUrls: ['./lunch-modal.component.css']
})
export class LunchModalComponent implements OnInit {
  lunchForm!: FormGroup;
  timeSlots: string[] = this.generateTimeSlots();

  private generateTimeSlots(): string[] {
    const slots: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    }
    return slots;
  }

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<LunchModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    const existingData = this.data?.existingData;

    this.lunchForm = this.fb.group({
      menuId: [existingData?.menuId || 0],
      menuItem: [existingData?.menuItem || '', Validators.required],
      itemPrice: [existingData?.itemPrice || 0, [Validators.required, Validators.min(0)]],
      lunchTime: [
        existingData?.lunchTime ? this.formatTimeForInput(existingData.lunchTime) : '',
        Validators.required
      ]
    });
  }

  /**
   * Mirrors ActivityModal.formatTimeForInput exactly:
   * - Strings without Z/+ suffix → append Z so browser treats as UTC, then read local hours
   * - Strings with Z or Date objects → parse and read local hours
   */
  private formatTimeForInput(dateStr: string | Date): string {
    if (!dateStr) return '';
    let d = new Date();
    if (typeof dateStr === 'string' && dateStr.includes('T')) {
      const timePart = dateStr.split('T')[1];
      const [hh, mm, ss] = timePart.split(':');
      d.setHours(parseInt(hh, 10), parseInt(mm, 10), parseInt(ss || '0', 10), 0);
    } else {
      d = new Date(dateStr as string);
    }
    if (isNaN(d.getTime())) return '';

    let hh = d.getHours();
    let mm = Math.round(d.getMinutes() / 15) * 15;
    if (mm >= 60) { mm = 0; hh = (hh + 1) % 24; }
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  }

  onSave(): void {
    if (this.lunchForm.valid) {
      const formValue = { ...this.lunchForm.value };
      // Mirror ActivityModal onSave: combine today's date with selected HH:MM then toISOString()
      const [hh, mm] = formValue.lunchTime.split(':');
      const d = new Date();
      d.setHours(parseInt(hh, 10), parseInt(mm, 10), 0, 0);
      const yyyy = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hr = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      const sec = String(d.getSeconds()).padStart(2, '0');
      formValue.lunchTime = `${yyyy}-${mo}-${dd}T${hr}:${min}:${sec}`;
      this.dialogRef.close(formValue);
    }
  }
}
