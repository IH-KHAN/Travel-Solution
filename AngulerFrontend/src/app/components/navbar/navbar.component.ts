import { Component, ElementRef, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  isCollapsed: boolean = true;
  activeMenu: string | null = null;

  constructor(private router: Router, private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.activeMenu = null;
    }
  }

  toggleMenu(menu: string, event: Event): void {
    event.stopPropagation();
    this.activeMenu = this.activeMenu === menu ? null : menu;
  }

  closeMenu(): void {
    this.activeMenu = null;
    this.isCollapsed = true;
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  get userName(): string {
    return localStorage.getItem('userName') || '';
  }

  get userRole(): string {
    return localStorage.getItem('role') || '';
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    this.router.navigate(['/login']);
  }
}
