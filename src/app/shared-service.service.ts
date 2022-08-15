import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedServiceService {
  menuOpen$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  constructor() {}

  getMenuOpen$(): BehaviorSubject<boolean> {
    return this.menuOpen$;
  }
}
