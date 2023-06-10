export interface IGetH4HCatererMenu {
  menu: {
    id: string;
    name: string;
    categories: IGetH4HCatererMenuCategory[];
  };
}

export interface IGetH4HCatererMenuCategory {
  id: string;
  name: string;
  items: IGetH4HCatererMenuItem[];
}

export interface IGetH4HCatererMenuItem {
  id: string;
  name: string;
  status: string;
  comboComponents: any[];
}

export function isIGetH4HCatererMenu(obj: any): obj is IGetH4HCatererMenu {
  return (
    typeof obj.menu === 'object' &&
    typeof obj.menu.id === 'string' &&
    typeof obj.menu.name === 'string' &&
    Array.isArray(obj.menu.categories) &&
    obj.menu.categories.every(isIGetH4HCatererMenuCategory)
  );
}

function isIGetH4HCatererMenuCategory(
  obj: any,
): obj is IGetH4HCatererMenuCategory {
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    Array.isArray(obj.items) &&
    obj.items.every(isIGetH4HCatererMenuItem)
  );
}

function isIGetH4HCatererMenuItem(obj: any): obj is IGetH4HCatererMenuItem {
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.status === 'string' &&
    Array.isArray(obj.comboComponents)
  );
}
