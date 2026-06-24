import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-homepage-title',
  templateUrl: './homepage-title.component.html',
  styleUrl: './homepage-title.component.scss'
})
export class HomepageTitleComponent {

  @Input() title: string = "titre en chargement";

}
