import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Role } from '../models/role';
import { RoleGroup } from '../models/role-group';

const ROLES_KEY = 'roles';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private roles: Role[];
  private roleGroups: RoleGroup[];

  private roleSubject: BehaviorSubject<Role[]> = new BehaviorSubject(null);
  private roleGroupsSubject: BehaviorSubject<RoleGroup[]> = new BehaviorSubject(null);

  constructor(private http: HttpClient) { 
    this.http.get<RoleGroup[]>('assets/one-night/monkey/role-groups.json').toPromise().then(groups => {
      this.roleGroups = groups;

      this.http.get<Role[]>('assets/one-night/monkey/roles.json').toPromise().then(roles => {
        this.roles = roles;
        
        if (ROLES_KEY in localStorage) {
          const storedRoles: Role[] = JSON.parse(localStorage.getItem(ROLES_KEY));
          this.roles.forEach(r => {
              r.selected = storedRoles.find(sr => sr.name === r.name && sr.displayOrder === r.displayOrder).selected;
          });
        }
        
        this.checkRoleGroups();
        this.roleSubject.next(this.roles);
        this.roleGroupsSubject.next(this.roleGroups);
      });
    });
  }

  public getRoles(): Observable<Role[]> {
    return this.roleSubject.asObservable();
  }

  public getRoleGroups(): Observable<RoleGroup[]> {
    return this.roleGroupsSubject.asObservable();
  }

  public toggleRoleSelected(role: Role) {
    const foundRole = this.roles.find(r => r.name === role.name && r.displayOrder === role.displayOrder);
    foundRole.selected = !foundRole.selected;
    localStorage.setItem(ROLES_KEY, JSON.stringify(this.roles));
    
    this.checkRoleGroups();
    this.roleSubject.next(this.roles);
    this.roleGroupsSubject.next(this.roleGroups);
  }

  private checkRoleGroups() {
    const activeRoles = this.roles.filter(r => r.selected);
    this.roleGroups.forEach(rg => {
      const activeRolesInGroup = activeRoles.filter(r => rg.roleIds.includes(r.id));
      // e.g. Dazed Zookeeper and Sanguinus Imperator must both be active for their role group to be active
      // while for the Monkeys group it's enough for any monkey to be active.
      // Assume the group is special if there are no roles in it (such as "Everyone").
      rg.isActive = (rg.mustIncludeAllRoles && activeRolesInGroup.length === rg.roleIds.length) || (!rg.mustIncludeAllRoles && activeRolesInGroup.length > 0) || (rg.roleIds.length === 0);
    });
  }
}
