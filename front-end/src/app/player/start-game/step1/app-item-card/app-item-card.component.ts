import { Component, Input,Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-item',
  templateUrl: './app-item-card.component.html',
  styleUrl: './app-item-card.component.scss'
})

export class ItemComponent {
  @Input() isSelected: boolean = false;
  @Input() isHighlighted: boolean = false;
  @Input() isError: boolean = false; 

  @Output() itemClicked = new EventEmitter<void>();

  onClick() {
    this.itemClicked.emit();
  }
}
