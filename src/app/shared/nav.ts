export interface Privilege {
  id?: string;
  name: string;
  resource?: string;
  path?: string;
  icon?: string;
  sequence?: number;
  children?: Privilege[];
}
export function findParent(ele: HTMLElement, node: string): HTMLElement|null {
  let current: HTMLElement|null = ele;
  while (true) {
    current = current.parentElement;
    if (!current) {
      return null;
    }
    if (current.nodeName === node) {
      return current;
    }
  }
}
export function getIconClass(icon?: string): string {
  return !icon || icon === '' ? 'settings' : icon;
}
export const collapseAll = (currentTarget: HTMLElement) => {
  const parent = findParent(currentTarget, 'NAV');
  if (parent) {
    parent.classList.add('collapsed-all');
    parent.classList.remove('expanded-all');
    const navbar = Array.from(parent.querySelectorAll('.sidebar>nav>ul>li>ul.expanded'));
    if (navbar.length > 0) {
      const icons = Array.from(parent.querySelectorAll('i.down'));
      let i = 0;
      for (i = 0; i < navbar.length; i++) {
        navbar[i].className = 'list-child';
      }
      for (i = 0; i < icons.length; i++) {
        icons[i].className = 'entity-icon up';
      }
    }
  }
};
export const expandAll = (currentTarget: HTMLElement) => {
  const parent = findParent(currentTarget, 'NAV');
  if (parent) {
    parent.classList.remove('collapsed-all');
    parent.classList.add('expanded-all');
    const navbar = Array.from(parent.querySelectorAll('.sidebar>nav>ul>li>ul.list-child'));
    if (navbar.length > 0) {
      const icons = Array.from(parent.querySelectorAll('i.up'));
      let i = 0;
      for (i = 0; i < navbar.length; i++) {
        navbar[i].className = 'list-child expanded';
      }
      for (i = 0; i < icons.length; i++) {
        icons[i].className = 'entity-icon down';
      }
    }
  }
};
export function isCollapsedAll(parent: HTMLElement): boolean {
  const navbar = Array.from(parent.querySelectorAll('.sidebar>nav>ul>li>ul.list-child'));
  if (navbar.length > 0) {
    let i = 0;
    for (i = 0; i < navbar.length; i++) {
      if (navbar[i].classList.contains('expanded')) {
        return false;
      }
    }
    return true;
  }
  return false;
}
export function isExpandedAll(parent: HTMLElement): boolean {
  const navbar = Array.from(parent.querySelectorAll('.sidebar>nav>ul>li>ul.list-child'));
  if (navbar.length > 0) {
    let i = 0;
    for (i = 0; i < navbar.length; i++) {
      if (!navbar[i].classList.contains('expanded')) {
        return false;
      }
    }
    return true;
  }
  return false;
}
export const activeWithPath = (activePath: string, path: string | undefined, isParent: boolean, features?: Privilege[]) => {
  if (isParent && features && Array.isArray(features)) {
    const hasChildLink = features.some((item) => item.path && item.path.length > 0 && activePath.startsWith(item.path));
    return path && activePath.startsWith(path) && hasChildLink ? 'active' : '';
  }
  return path && activePath.startsWith(path) ? 'active' : '';
};
export const toggleMenuItem = (currentTarget: HTMLElement) => {
  let target: HTMLElement|null = currentTarget;
  const nul = currentTarget.nextElementSibling;
  if (nul) {
    const elI = currentTarget.querySelectorAll('.menu-item > i.entity-icon');
    if (nul.classList.contains('expanded')) {
      nul.classList.remove('expanded');
      if (elI && elI.length > 0) {
        elI[0].classList.add('up');
        elI[0].classList.remove('down');
      }
    } else {
      nul.classList.add('expanded');
      if (elI && elI.length > 0) {
        elI[0].classList.remove('up');
        elI[0].classList.add('down');
      }
    }
  }
  if (target.nodeName === 'A') {
    target = target.parentElement;
  }
  if (target && target.nodeName === 'LI') {
    target.classList.toggle('open');
  }
  const parent = findParent(currentTarget, 'NAV');
  if (parent) {
    setTimeout(() => {
      if (isExpandedAll(parent)) {
        parent.classList.remove('collapsed-all');
        parent.classList.add('expanded-all');
      } else if (isCollapsedAll(parent)) {
        parent.classList.remove('expanded-all');
        parent.classList.add('collapsed-all');
      } else {
        parent.classList.remove('expanded-all');
        parent.classList.remove('collapsed-all');
      }
    }, 0);
  }
};
export function sub(n1?: number, n2?: number): number {
  if (!n1 && !n2) {
    return 0;
  } else if (n1 && n2) {
    return n1 - n2;
  } else if (n1) {
    return n1;
  } else if (n2) {
    return -n2;
  }
  return 0;
}
