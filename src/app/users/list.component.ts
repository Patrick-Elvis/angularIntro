import { Component, OnInit, OnDestroy } from '@angular/core';
import { of, forkJoin, Subject } from 'rxjs';
import { takeUntil, tap, map } from 'rxjs/operators';

import { AccountService } from '@app/_services';

@Component({ templateUrl: 'list.component.html' })
export class ListComponent implements OnInit, OnDestroy {
  users?: any[];
  private unsubscribe$ = new Subject<void>();

  constructor(private accountService: AccountService) {}

  ngOnInit() {
    this.loadUsers();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  loadUsers() {
    this.accountService
      .getAll()
      .pipe(
        map((users) => users.map((user) => ({ ...user, isDeleting: false }))),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((users) => (this.users = users));
  }

  deleteUser(id: string) {
    const user = this.users!.find((x) => x.id === id);
    if (!user) return;

    user.isDeleting = true;
    this.accountService
      .delete(id)
      .pipe(
        tap(() => {
          this.users = this.users!.filter((x) => x.id !== id);
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe();
  }
}
