// helpers, utils, etc. (loggers, time parser etc. - if there are any)
import type {
  Name, Address, ICashier,
} from './models';
import { Sex, Net, City } from './models';

export function nameBuild(firstName:string, lastName:string, patronymic:string):Name {
  return {
    firstName,
    lastName,
    patronymic,
  };
}

export function addressBuild(_city:City, _street:string, _building:number,
  _litera?:string, _apartment?:number):Address {
  return {
    city: _city,
    street: _street,
    building: _building,
    litera: _litera || null,
    apartment: _apartment || null,
  };
}

export function dateFormat(date:Date|null, format?:string):string {
  let tmpDate:string = '';
  if (date) {
    const intl = new Intl.NumberFormat('ru-ru', { minimumIntegerDigits: 2 });
    const yyyy = date.getFullYear();

    let mm:number | string = date.getMonth() + 1;
    mm = intl.format(mm);

    let dd:number | string = date.getDate();
    dd = intl.format(dd);

    switch (format) {
      default:
      case 'yyyy-dd-mm':
        tmpDate = `${yyyy}-${mm}-${dd}`;
        break;
      case 'dd.mm.yyyy':
        tmpDate = `${dd}.${mm}.${yyyy}`;
        break;
    }
  }

  return tmpDate;
}

export function parceCashier(row:any):ICashier {
  const cashier:ICashier = {
    id: row.id,
    personnelNumber: row.personnelNumber,
    employeeName: {
      firstName: row.firstName,
      lastName: row.lastName,
      patronymic: row.patronymic,
    },
    sex: Sex[row.sex] as unknown as Sex,
    phone: row.phone,
    addr: {
      city: row.city,
      street: row.street,
      building: row.building,
      litera: row.litera,
      apartment: row.apartment,
    },
    birthday: row.birthday,
    shopID: row.shopID,
    startWork: row.startWork,
    endWork: row.endWork,
    lastNet: Net[row.lastNet] as unknown as Net,
  };
  return cashier;
}
