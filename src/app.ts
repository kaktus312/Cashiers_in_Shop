// app main point;
// can have full API routing for CRUD (will be plus) OR in simplified version:
// can only call getAllCashiers + getTargetCashiers1 + getTargetCashiers2 and log output of both
// Import dependencies
import { ShopDB } from './db';
import {
  ICashier, Sex, City, Net, SqlFilter,
} from './models';
import { Task } from './const';

let task:string = '';
const arg:string = process.argv[2];
if (arg) {
  task = arg;
} else {
  process.argv.forEach((val, index, array) => {
    console.log(`${index}: ${val}`);
  });
  console.log(`Please, use one from next options:
              ${Task.cashierCreate}, 
              ${Task.cashierUpdate},  
              ${Task.cashierDelete}, 
              ${Task.getAllCashiers}, 
              ${Task.useFilter1}, 
              ${Task.useFilter2}, 
              ${Task.getTargetCashiers1} or  
              ${Task.getTargetCashiers2}`);
}
console.log(process.argv[2]);

// connecting to the shop DB (login and password not require)
const db = new ShopDB('db.sqlite');

// creating a new Casheir, get information about it and update some fields
if (task === Task.cashierCreate) {
  const newCashier:ICashier = {
    id: null,
    personnelNumber: '457932',
    employeeName: {
      lastName: 'Бабенко',
      firstName: 'Анна',
      patronymic: 'Николаевна',
    },
    sex: Sex.female,
    phone: '380962571544',
    addr: {
      city: City.Одесса,
      street: 'ул. Бенюка',
      building: 45,
      litera: null,
      apartment: null,
    },
    birthday: null,
    shopID: 17,
    startWork: new Date(2021, 2, 18),
    endWork: null,
    lastNet: Net.Comfy,
  };

  // adding created Cashier to the DB
  const newCashierId:Promise<number> = db.addCashier(newCashier);
  newCashierId.then((value) => {
    newCashier.id = value;
    console.log(newCashier.id);

    // getting information about cashier with id=19 and updating it
    const tmpCashier:Promise<ICashier> = db.getCashierById(newCashier.id);
    tmpCashier.then((values) => {
      const cashier:ICashier = values;
      console.log(cashier);

      // updating information about cashier
      cashier.birthday = new Date(1983, 0, 3); // Month in 0-11
      cashier.addr.building = 45;
      cashier.addr.apartment = 15;
      console.log(cashier);
      db.updateCashier(cashier);
    });
  });
}

// deleting information about cashier with some id
if (task === Task.cashierDelete) {
  db.delCashier(20);
// db.completDeleteCashier(20);
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
