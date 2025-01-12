
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, CommonModule]
})
export class AppComponent {
  constructor(private authService: AuthService) {}

  get isLoggedIn(): boolean {
    return !!this.authService.currentUserValue;
  }
}