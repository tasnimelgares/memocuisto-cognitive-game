import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class InventoryStateService {
  isVisible = false; 

  toggleVisibility(){
    this.isVisible = !this.isVisible;
  }

  resetVisibility(){
    this.isVisible = false;
  }
}