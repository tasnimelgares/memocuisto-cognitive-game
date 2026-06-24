import { Component } from '@angular/core';
import { AccompagnementService } from 'src/services/accompagnement.service';

@Component({
  selector: 'app-inactivity-popup',
  templateUrl: './inactivity-popup.component.html',
  styleUrls: ['./inactivity-popup.component.scss']
})
export class InactivityPopupComponent {
  constructor(public accompagnementService: AccompagnementService) {}
}