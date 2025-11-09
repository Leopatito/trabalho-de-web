import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BackendHealthService {
  private _broken$ = new BehaviorSubject<boolean>(false);

  get broken$() {
    return this._broken$.asObservable();
  }

  get isBroken(): boolean {
    return this._broken$.getValue();
  }

  setBroken(value: boolean) {
    this._broken$.next(value);
  }
}
