import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StringMap, initElement, navigate, clone, isSuccessful, makeDiff } from 'angularx';
import { Status, handleError, useResource, hasPermission, write, getLocale, confirm } from 'uione';
import { MasterDataClient } from './service/master-data';
import { Privilege, Role, RoleClient } from './service/role';
import { registerEvents, showFormError, validateForm } from 'ui-plus';
import { hideLoading, showLoading } from 'ui-loading';
import { alertError, alertSuccess, alertWarning } from 'ui-alert';
import { Result } from 'onecore';

interface ShownItem {
  action: number
  show: boolean
}
interface Permission {
  id: string
  actions: number
  permissions: number
}

function getPrivilege(id: string, all: Privilege[]): Privilege | undefined {
  if (!all || !id) {
    return undefined;
  }
  for (const root of all) {
    if (root.id === id) {
      return root;
    }
    if (root.children && root.children.length > 0) {
      const m = getPrivilege(id, root.children);
      if (m) {
        return m;
      }
    }
  }
  return undefined;
}
function containOne(privileges?: string[], all?: Privilege[]): boolean {
  if (!privileges || privileges.length === 0 || !all || all.length === 0) {
    return false;
  }
  for (const m of all) {
    if (privileges.includes(m.id)) {
      return true;
    }
  }
  return false;
}
function buildAll(privileges: string[], all: Privilege[]): void {
  for (const root of all) {
    privileges.push(root.id);
    if (root.children && root.children.length > 0) {
      buildAll(privileges, root.children);
    }
  }
}
function buildActionAll(actions: Map<string, number>, all: Privilege[]): void {
  for (const root of all) {
    actions.set(root.id, +root.actions);
    if (root.children && root.children.length > 0) {
      buildActionAll(actions, root.children);
    }
  }
}
// function buildPrivileges(id: string, type: string, privileges: string[], all: Privilege[]): string[] {
//   if (type === 'parent') {
//     const parent = getPrivilege(id, all);
//     if (parent && parent.children) {
//       const ids = parent.children.map(i => i.id);
//       const ms = privileges.filter(i => !ids.includes(i));
//       if (containOne(privileges, parent.children)) {
//         return ms;
//       } else {
//         return ms.concat(parent.children.map(i => i.id));
//       }
//     } else {
//       return [];
//     }
//   } else {
//     let checked = true;
//     if (privileges && privileges.length > 0) {
//       const m = privileges.find(item => item === id);
//       checked = (m != null);
//     } else {
//       checked = false;
//     }
//     if (!checked) {
//       return privileges.concat([id]);
//     } else {
//       return privileges.filter(item => item !== id);
//     }
//   }
// }
function buildShownModules(keyword: string, allPrivileges: Privilege[]): Privilege[] {
  if (!keyword || keyword === '') {
    return allPrivileges;
  }
  const w = keyword.toLowerCase();
  const shownPrivileges = allPrivileges.map(parent => {
    const parentCopy = Object.assign({}, parent);
    if (parentCopy.children) {
      parentCopy.children = parentCopy.children.filter(child => child.name.toLowerCase().includes(w));
    }
    return parentCopy;
  }).filter(item => (item.children && item.children.length > 0) || item.name.toLowerCase().includes(w));
  return shownPrivileges;
}
function buildPermissions(actions: Map<string, number>, privileges?: string[]): Permission[] {
  if (!privileges || privileges.length === 0) {
    return []
  }
  return privileges.map((privilege) => {
    let permissions: number = 1
    const p = privilege.split(" ")
    if (p.length > 1) {
      permissions = +p[1] // convert string to number
    } else {
      permissions = 0
    }
    const id = p[0]
    return { id: id, actions: actions.get(id) || 0, permissions: permissions || 0 } as any;
  })
}
function getMax(map: Map<string, number>): number {
  let max = -Infinity;
  map.forEach((value, key) => {
    if (value > max) {
      max = value;
    }
  });
  return max;
}
function mergeArray(dest: Permission[], src: Permission[], allowPermission0?: Boolean) {
  for (let i = 0; i < src.length; i++) {
    const item = src[i]
    const index = dest.findIndex((k) => k.id === item.id)
    if (index !== -1) {
      dest.splice(index, 1)
    }
    if (allowPermission0) {
      dest.push(item)
    } else {
      if (item.permissions > 0) {
        dest.push(item)
      }
    }
  }
}

function filterPermission(parentId: string | undefined, mapPermissions: Permission[], all: Privilege[], actions: Map<string, number>): Permission[] {
  const parent = getPrivilege(parentId || "", all)
  const childrenIds = parent?.children?.map((item) => item.id) || []
  const hasChild = mapPermissions.some((i) => childrenIds.includes(i.id) && i.permissions > 0)
  if (hasChild && parentId) {
    mergeArray(mapPermissions, [{ id: parentId, actions: actions.get(parentId) || 0, permissions: 0 }], true)
    return mapPermissions
  }
  return mapPermissions.filter((i) => i.id !== parentId)
}

function isCheckedAll(privileges: string[] | undefined, all: string[]): boolean | undefined {
  const checkedAll = privileges && all && privileges.length === all.length
  return checkedAll
}

function bitwiseAnd(numbers: number[], result: number): number {
  for (let num of numbers) {
    result &= num
  }
  return result
}

function mapPermissionOfParent(id: string, childPermissions: Permission[], actions: Map<string, number>) {
  const groupActionAndPermission = new Map<number, number[]>()
  // check permission of parent
  let permission = 0
  if (childPermissions.length === 1) {
    permission = childPermissions[0].permissions
  } else {
    for (let i = 0; i < childPermissions.length; i++) {
      const item = childPermissions[i]
      let a = groupActionAndPermission.get(item.actions) || []
      a.push(item.permissions)
      groupActionAndPermission.set(item.actions, a)
    }
    groupActionAndPermission.forEach((value, key) => {
      const f = bitwiseAnd(value, key)
      permission = permission | f
    })
  }
  const maxAction = actions.get(id) || 0
  childPermissions.push({ id: id, actions: maxAction, permissions: permission & maxAction })
  return childPermissions
}

function mapPermission(actions: Map<string, number>, item: Permission, pCheckedValue: number, uChecked: boolean): Permission {
  const actionMax = actions.get(item.id) || 1
  const id = item.id
  let v = item.permissions | pCheckedValue
  if (!uChecked) {
    if (pCheckedValue === 1) {
      v = item.permissions & 0 // OR
    } else {
      v = item.permissions ^ pCheckedValue // XOR
    }
  }
  if (pCheckedValue > actionMax) {
    return { id: item.id, actions: actionMax, permissions: actionMax }
  }
  return { id: id, actions: actionMax, permissions: v }
}

function getColumns(maxAction: number): number[] {
  let i = 0
  let total = 0
  let rs = []
  while (total < maxAction) {
    const action = 1 << i
    total = total + action
    rs.push(action)
    i++
  }
  return rs
}

function binaryStringToArray(binaryString: string): string[] {
  // Use the split method to convert the binary string to an array of characters
  return binaryString.split("")
}

function decimalToBinary(decimal: number): string {
  // Convert decimal to binary using the toString method with base 2
  return (decimal >>> 0).toString(2)
}

function padLeft(str: string, num: number) {
  return str.padStart(num, "0")
}

const handleCheckAllModule = (
  e: any,
  privileges: string[] | undefined,
  all: string[],
  actions: Map<String, number>,
  callback: (privileges: string[]) => void,
) => {
  e.preventDefault()
  const checked = e.target.checked
  if (!checked) {
    callback([])
    return
  }

  if (!privileges) {
    privileges = []
  }
  if (checked) {
    privileges = []
    for (const m of all) {
      privileges.push(m + " " + actions.get(m))
    }
  }

  callback(privileges || [])
}

@Component({
  selector: 'app-role',
  templateUrl: './role.html',
  providers: [RoleClient, MasterDataClient]
})
export class RoleComponent implements OnInit {
  constructor(private viewContainerRef: ViewContainerRef, private route: ActivatedRoute, private roleService: RoleClient, private masterDataService: MasterDataClient, protected router: Router) {
    this.role = this.createModel();
    this.resource = useResource();
  }

  refForm?: HTMLFormElement;
  isReadOnly?: boolean;
  newMode?: boolean;

  resource: StringMap;
  id?: string;
  originRole: Role = {} as any;
  role: Role = {} as any;
  checkedAll?: boolean;
  keyword: string = '';

  all: string[] = [];
  allPrivileges: Privilege[] = [];
  actions: Map<string, number> = new Map<string, number>();
  shownPrivileges: Privilege[] = [];
  privileges: Permission[] = [];
  maxAction: number = 0;
  statusList: any = [];
  disabled?: boolean;

  ngOnInit() {
    this.refForm = initElement(this.viewContainerRef, registerEvents);
    this.id = this.route.snapshot.params.id;
    this.newMode = !this.id;
    // this.isReadOnly = !hasPermission(write, 1);
    this.isReadOnly = false;
    Promise.all([
      this.masterDataService.getStatus(),
      this.roleService.getPrivileges()
    ]).then(values => {
      const [status, allPrivileges] = values;
      buildAll(this.all, allPrivileges);
      buildActionAll(this.actions, allPrivileges)
      if (!this.id) {
        const role = this.createModel();
        this.originRole = clone(role);
        this.role = role;
        this.statusList = status;
        this.allPrivileges = allPrivileges;
        this.shownPrivileges = allPrivileges;
        this.privileges = buildPermissions(this.actions, role.privileges)
        this.maxAction = getMax(this.actions);
        this.checkedAll = isCheckedAll(role.privileges, this.all);
      } else {
        showLoading();
        this.roleService
          .load(this.id)
          .then((role) => {
            if (!role) {
              alertError(this.resource.error_404, () => window.history.back())
            } else {
              this.originRole = clone(role);
              this.role = role;
              this.statusList = status;
              this.allPrivileges = allPrivileges;
              this.shownPrivileges = allPrivileges;
              this.privileges = buildPermissions(this.actions, role.privileges);
              this.maxAction = getMax(this.actions);
              this.checkedAll = isCheckedAll(role.privileges, this.all);
            }
          })
          .catch(handleError)
          .finally(hideLoading)
      }
    }).catch(handleError);
  }

  createModel(): Role {
    const role = {} as any;
    role.privileges = [];
    role.status = Status.Active;
    return role;
  }

  onChangeKeyword(event: any) {
    const keyword = event.target.value;
    const { allPrivileges } = this;
    this.shownPrivileges = buildShownModules(keyword, allPrivileges);
  }


  // checkedRole(module: Privilege, privilegesOfRoleId?: string[]) {
  //   const parent = module.children && module.children.length > 0;
  //   if (!privilegesOfRoleId) {
  //     return false;
  //   }
  //   if (parent) {
  //     return containOne(this.role.privileges, module.children);
  //   }
  //   return this.role.privileges ? (this.role.privileges.some(item => item === module.id)) : false;
  // }
  showModel(role: Role) {
    this.role = role;
    if (!role) {
      return;
    }
    const { all } = this;
    if (!role.privileges) {
      role.privileges = [];
    } else {
      role.privileges = role.privileges.map(p => p.split(' ', 1)[0]);
    }
    this.setCheckedAll(role.privileges, all);
  }

  setCheckedAll(privileges: string[], all: string[]) {
    this.checkedAll = privileges && all && privileges.length === all.length;
  }

  isParentChecked(id: string, child: Privilege[], privileges: Permission[]) {
    if (!privileges) {
      return false
    }
    if (child === undefined) {
      return false
    }
    const ids = child?.filter((i) => i.id !== id).map((i) => i.id) || []
    if (privileges.length < ids.length) {
      return false
    }
    const { actions } = this
    const checked = privileges.filter((item) => ids.includes(item.id) && item.permissions === actions.get(item.id))
    return checked.length === ids.length
  }

  handleCheckParent(e: any, id: string) {
    e.preventDefault()
    const { all, allPrivileges, actions } = this
    const checked = e.target.checked
    let mapPermissions = this.privileges
    const parentPrivilege = getPrivilege(id || "", allPrivileges)
    if (parentPrivilege !== undefined) {
      let childrenPermission =
        parentPrivilege?.children?.map((k) => {
          const act = actions.get(k.id) || 0
          return {
            id: k.id,
            actions: act,
            permissions: checked ? act : 0,
          }
        }) || []
      mergeArray(mapPermissions, childrenPermission)
    }
    mapPermissions = filterPermission(id, mapPermissions, allPrivileges, actions)
    const mapToSavePrivileges = mapPermissions.map((p) => {
      return p.id + " " + p.permissions
    })
    const checkedAll = isCheckedAll(mapToSavePrivileges, all)
    this.checkedAll = checkedAll;
    this.role.privileges = mapToSavePrivileges;
  }

  isChecked(id: string, privileges: Permission[]): boolean {
    if (!privileges) return false
    return privileges && privileges.find((item) => item.id === id && item.permissions > 0) ? true : false
  }

  checked(id: string, action: number, privileges: Permission[]): boolean {
    const privilege = privileges.find((item) => item.id === id)
    if (!privilege) return false
    return Boolean(privilege?.permissions & action)
  }

  handleCheckAll(privileges: string[]): void {
    const checkedAll = isCheckedAll(privileges, this.all)
    this.checkedAll = checkedAll;
    this.role.privileges = privileges;
  }

  handleCheckAllModule(
    e: any,
    privileges: string[] | undefined,
    all: string[],
    actions: Map<String, number>,
  ) {
    e.preventDefault()
    const checked = e.target.checked
    if (!checked) {
      this.handleCheckAll([])
      this.privileges = buildPermissions(this.actions, this.role.privileges);
      return
    }

    if (!privileges) {
      privileges = []
    }
    if (checked) {
      privileges = []
      for (const m of all) {
        privileges.push(m + " " + actions.get(m))
      }
    }

    this.handleCheckAll(privileges || [])
    this.privileges = buildPermissions(this.actions, this.role.privileges);
  }

  handleCheckBox(event: any, id: string, parentId?: string, currentPrivilege?: Privilege, force?: boolean) {
    event.preventDefault()
    const uChecked: boolean = event.target.checked
    let pChecked: number = +event.target.value
    const { actions, allPrivileges } = this
    let permissions = this.privileges

    if (currentPrivilege === undefined) {
      return
    }
    // is parent
    const isParent = currentPrivilege?.children !== null && currentPrivilege?.children
    if (isParent) {
      // map privilegeCurrent -> permission current
      let childrenPermission =
        currentPrivilege?.children?.map((k) => {
          const e = permissions.find((i) => i.id === k.id)
          if (e !== undefined) {
            return e
          }
          return {
            id: k.id,
            actions: actions.get(k.id) || 0,
            permissions: uChecked ? 1 : 0,
          }
        }) || []
      let pChildren = childrenPermission.map((p) => {
        return mapPermission(actions, p, pChecked, uChecked)
      })
      pChildren = mapPermissionOfParent(id, pChildren, actions)
      mergeArray(permissions, pChildren)
    } else {
      const existed = permissions.find((i) => i.id === currentPrivilege.id)
      if (!existed) {
        permissions.push({
          id,
          actions: actions.get(id) || 0,
          permissions: 0,
        })
      }
      if (existed !== undefined) {
        existed.actions = actions.get(currentPrivilege.id) || 0
      }
      permissions = permissions.map((p) => {
        if (p.id === currentPrivilege.id) {
          if (force) {
            p.permissions = uChecked ? pChecked : 0
            return p
          }
          if (pChecked > 1) {
            if (p.permissions < pChecked) {
              //case Prevent unchecking "read" if "write" is unchecked, but "delete" is not unchecked => read checked
              pChecked = pChecked ^ 1 // xor 1 - if it has permission is write / delete / approve -> permission read
            }
          }
          return mapPermission(actions, p, pChecked, uChecked)
        }
        return p
      })
      // check permission of parent
      if (parentId !== "") {
        const privilegeParent = getPrivilege(parentId || "", allPrivileges)
        if (privilegeParent !== undefined) {
          let childrenPermission =
            privilegeParent?.children?.map((k) => {
              const e = permissions.find((i) => i.id === k.id)
              if (e !== undefined) {
                e.actions = actions.get(e.id) || 0
                return e
              }
              return {
                id: k.id,
                actions: actions.get(id) || 0,
                permissions: 0,
              }
            }) || []
          const pChildren = mapPermissionOfParent(parentId || "", childrenPermission, actions)
          mergeArray(permissions, pChildren)
        }
      } else {
        for (let i = 0; i < permissions.length; i++) {
          const p = permissions[i]
          if (p.permissions === 0 && p.id === id) {
            permissions.splice(i, 1)
          }
        }
      }
    }
    permissions = filterPermission(parentId, permissions, allPrivileges, actions)
    const mapToSavePrivileges = permissions.map((p) => {
      if (p.id === parentId) {
        return p.id + " 0"
      }
      return p.id + " " + p.permissions
    })
    this.privileges = permissions;
    const checkedAll = isCheckedAll(mapToSavePrivileges, this.all)
    this.checkedAll = checkedAll
    this.role.privileges = mapToSavePrivileges;
    // setState({ ...state, checkedAll, role: { ...state.role, privileges: mapToSavePrivileges } })
  }

  getColumnsOfRow(action: number): ShownItem[] {
    const { maxAction: maxActionAll } = this
    let binaryString = decimalToBinary(action)
    let maxLen = decimalToBinary(maxActionAll)
    binaryString = padLeft(binaryString, maxLen.length)
    let binaryArray = binaryStringToArray(binaryString)
    const cols = getColumns(action)
    binaryArray.reverse()
    return binaryArray.map((item, i) => {
      return { shown: item === "1", action: cols[i] } as any;
    })
  }

  protected getModelName(): string {
    return 'role';
  }

  elements(form: any, childName: string[]): any {
    const array = [];
    for (const f of form) {
      if (childName.includes(f.name)) {
        array.push(f);
      }
    }
    return array;
  }
  assign(event: Event, id: string) {
    event.preventDefault();
    navigate(this.router, `/roles/assign`, [id]);
  };
  back(event: Event) {
    window.history.back();
  }
  validate(role: Role): boolean {
    return validateForm(this.refForm, getLocale())
  }
  save(event: Event): void {
    event.preventDefault()
    const valid = this.validate(this.role)
    if (valid) {
      confirm(this.resource.msg_confirm_save, () => {
        if (this.newMode) {
          showLoading();
          this.roleService
            .create(this.role)
            .then((res) => this.afterSaved(res))
            .catch(handleError)
            .finally(hideLoading)
        } else {
          const diff = makeDiff(this.originRole, this.role, ["roleId"])
          const l = Object.keys(diff as any).length
          if (l === 0) {
            alertWarning(this.resource.msg_no_change)
          } else {
            showLoading()
            this.roleService
              .update(this.role)
              .then((res) => this.afterSaved(res))
              .catch(handleError)
              .finally(hideLoading)
          }
        }
      })
    }
  }
  afterSaved(res: Result<Role>): void {
    if (Array.isArray(res)) {
      showFormError(this.refForm?.current, res)
    } else if (isSuccessful(res)) {
      alertSuccess(this.resource.msg_save_success, () => window.history.back())
    } else if (res === 0) {
      alertError(this.resource.error_not_found)
    } else {
      alertError(this.resource.error_conflict)
    }
  }
}
