// app main point;
// can have full API routing for CRUD (will be plus) OR in simplified version:
// can only call getAllCashiers + getTargetCashiers1 + getTargetCashiers2 and log output of both
// Import dependencies
import { ShopDB } from './db';
import {
  ICashier, Sex, City, Net,
} from './models';

// connecting to the shop DB (login and password not require)
const db = new ShopDB('db.sqlite');

// createing a new Casheir
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

// deleting information about cashier with some id
// db.del(20);
// db.completDeleteCashier(20);

// getting info about all cashiers
// db.getAllCashiers();

// getting information about cashier with a special filter_1
// db.getTargetCashiers1();

// getting information about cashier with a special filter_2
// db.getTargetCashiers2();

// close DB and connection
// db.close();
