import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  statusBars = [
    { label: 'En cola',    pct: 50, color: '#d97706', value: 8 },
    { label: 'En proceso', pct: 31, color: '#3a8fd1', value: 5 },
    { label: 'Checking',   pct: 19, color: '#059669', value: 3 },
  ];

  clientBars = [
    { label: 'Minera Los Andes', pct: 80, value: 6 },
    { label: 'Industrias Perú',  pct: 55, value: 4 },
    { label: 'AgroTech SAC',     pct: 38, value: 3 },
  ];
}
