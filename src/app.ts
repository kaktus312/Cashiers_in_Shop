// app main point;
import { ShopDB } from './db';
import {
  ICashier, Sex, City, Net, SqlFilter, Name, Address,
} from './models';
import { Task } from './const';
import { randomPhone, randomPN, showHelp } from './utils';

require('dotenv').config('./.env');

let task:string = '';

let tmpEmplName:Name = <Name>{};
let tmpPatronymic:string = '';
const tmpPhone:string = randomPhone();
let tmpAddr:Address = <Address>{};
let tmpBuilding:any = null;
let tmpApartment:number = 0;
let tmpCity:City|any;
let id:number = -1;

const arg:string = process.argv[2];
console.log(process.argv[2]);
if (arg) {
  if ((arg === Task.cashierCreate) && (process.argv.length >= 9)) {
    console.log(`${process.argv[3]}, 
${process.argv[4]}, 
${process.argv[5]}, 
${process.argv[6]}, 
${process.argv[7]},
${process.argv[8]}}`);

    task = arg;
    tmpEmplName = {
      lastName: process.argv[3],
      firstName: process.argv[4],
      patronymic: '',
    };

    tmpCity = City[process.argv[5] as any];
    tmpCity = (tmpCity) || City.Львов;
    console.log(tmpCity);

    tmpAddr = {
      city: tmpCity,
      street: process.argv[6],
      building: process.argv[7] as unknown as number,
      apartment: process.argv[8] as unknown as number,
    };
  }

  if ((arg === Task.cashierUpdate) && (process.argv.length >= 7)) {
    id = process.argv[3] as unknown as number;
    tmpPatronymic = process.argv[4];
    tmpBuilding = process.argv[5] as unknown as number;
    tmpApartment = process.argv[6] as unknown as number;
    task = arg;
  }

  if (((arg === Task.cashierDelete) || (arg === Task.getCashierById))
          && (process.argv.length >= 4)) {
    console.log(`Target ID is ${process.argv[3]}`);
    task = arg;
    id = process.argv[3] as unknown as number;
  }

  if (!task) {
    showHelp();
  }
} else {
  process.argv.forEach((val, index) => {
    console.log(`${index}: ${val}`);
  });
  showHelp();
}

// connecting to the shop DB (login and password not require)
const db = new ShopDB(process.env.DB_PATH as string);

// creating a new Casheir, get information about it and update some fields
if (task === Task.cashierCreate) {
  const newCashier:ICashier = {
    id: null,
    personnelNumber: randomPN(),
    employeeName: tmpEmplName,
    sex: Sex.female,
    phone: tmpPhone,
    addr: tmpAddr,
    birthday: null,
    shopID: 17,
    startWork: new Date(2021, 2, 18), // Month in 0-11
    endWork: null,
    lastNet: Net.Comfy,
  };

  // adding created Cashier to the DB
  const newCashierId:Promise<number> = db.addCashier(newCashier);
  newCashierId.then((value) => {
    newCashier.id = value;
    console.log(newCashier.id);

    // getting information about cashier with newCashier.id
    const tmpCashier:Promise<ICashier> = db.getCashierById(newCashier.id);
    tmpCashier.then((values) => {
      const cashier:ICashier = values;
      console.log(cashier);
    });
  });
}

if (task === Task.cashierUpdate) {
  // getting information about cashier with newCashier.id and updating it
  const tmpCashier:Promise<ICashier> = db.getCashierById(id);
  tmpCashier.then((values) => {
    const cashier:ICashier = values;
    console.log(cashier);

    // updating information about cashier
    cashier.addr.city = cashier.addr.city as unknown as number;
    cashier.employeeName.patronymic = tmpPatronymic;
    cashier.addr.building = tmpBuilding;
    cashier.addr.apartment = tmpApartment;
    db.updateCashier(cashier);
    console.log(cashier);
  });
}

// getting information about cashier by id
if (task === Task.getCashierById) {
  const targetCashier:Promise<ICashier> = db.getCashierById(id);
  targetCashier.then((val) => {
    console.log(val);
  });
}

// deleting information about cashier with some id
if (task === Task.cashierDelete) {
// db.delCashier(20);
  db.completDeleteCashier(id);
}
// getting info about all cashiers
if (task === Task.getAllCashiers) {
  db.getAllCashiers();
}

// getting info about all cashiers according some filters
// get all cashiers with first name Anna which worked in Metro Cash&Carry
if (task === Task.useFilter1) {
  const fltr1:SqlFilter = {
    firstName: 'Анна',
    lastNet: Net['Metro Cash&Carry'],
  };
  db.getAllFiltredCashiers(fltr1);
}

// get all cashiers from Mariupol and phone number with code operator 096
if (task === Task.useFilter2) {
  const fltr2 = {
    operator: '096',
    city: City.Мариуполь,
  };
  db.getAllFiltredCashiers(fltr2);
}

// getting information about cashier with a special filter_1
if (task === Task.getTargetCashiers1) {
  db.getTargetCashiers1();
}

// getting information about cashier with a special filter_2
if (task === Task.getTargetCashiers2) {
  db.getTargetCashiers2();
}

// close DB and connection
if (!task) {
  db.close();
}
