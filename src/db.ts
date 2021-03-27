// main methods (CRUD) + db connection; imports stuff from models.ts
import { Database } from 'sqlite3';
import {
  ICashier, Net, Sex, City,
} from './models';
import { dateFormat, parceCashier } from './utils';

// const sqlite3 = require('sqlite3').verbose();
// const sqlite3 = require('sqlite3').verbose();
// const db = new sqlite3.Database(':memory:');
// const db = new sqlite3.Database('./db.sqlite');

// db.serialize(() => {
//   const res = db.get('SELECT name FROM sqlite_master WHERE type="table" AND name=?', 'lorem');
//   if (!res) {
//     db.run('CREATE TABLE lorem (info TEXT)');
//   }

//   const stmt = db.prepare('INSERT INTO lorem VALUES (?)');
//   for (let i = 0; i < 10; i += 1) {
//     stmt.run(`Ipsum ${i}`);
//   }
//   stmt.finalize();

// db.each('SELECT rowid AS id, info FROM lorem',(err: any, row: { id: string; info: string; }) => {
//     console.log(`${row.id}: ${row.info}`);
//   });
// });

// db.close();

// eslint-disable-next-line import/prefer-default-export
export class ShopDB {
  private db:Database;

  constructor(dbPath:string) {
    console.log(dbPath);
    this.db = new Database(dbPath);
  }

  /**
       * Close opened DB
       */
  public close():void {
    this.db.close();
  }

  /**
       * Add a new Cashier in to the DB
       */
  public addCashier(cashier:ICashier):number {
    console.log(`Данные по кассиру ${cashier.employeeName.lastName} успешно добавлены в БД`);
    const sql:string = 'SELECT id FROM Cashier WHERE rowid=last_insert_rowid();';
    let id:number = -1;
    this.db.get(sql, (res:number, err:any) => {
      if (res) {
        id = res;
      }
    });
    return id;
  }

  // const stmt = this.db.prepare('INSERT INTO Cashier VALUES (?)');
  // for (let i = 0; i < 10; i += 1) {
  //   stmt.run(`Ipsum ${i}`);
  // }
  // // cashier.addr.city
  // stmt.finalize();

  /**
       * Get information about a Cashier by ID
       */
  public getCashierById(id:number):Promise<ICashier> {
    return new Promise((res, rej) => {
      this.db.get(`SELECT Cashier.*, Address.city, Address.street, Address.building, Address.litera, Address.apartment FROM Cashier, Address Where Cashier.addrID = Address.id AND Cashier.id=${id};`, (err: any, row: any) => {
        if (row) {
          const cashier:ICashier = parceCashier(row);
          // console.log(`Данные о кассире с id ${id}:\n`, cashier);
          res(cashier);
        }
      });
    });
  }

  /**
       * Update information about a Cashier
       */
  public updateCashier(cashier:ICashier):void {
    let sql:string = `SELECT addrID FROM Cashier WHERE id='${cashier.id}'`;
    this.db.get(sql, (err:any, addrIdRow:any) => {
      if (err) {
        console.log(err);
        console.log(sql);
        return;
      }
      console.log(addrIdRow);

      sql = `UPDATE Address SET city = '${City[cashier.addr.city]}', street = '${cashier.addr.street}', building = '${cashier.addr.building}', litera = '${cashier.addr.litera}', apartment = '${cashier.addr.apartment}' WHERE id=${addrIdRow.addrID}`;
      this.db.get(sql, (errUpdAddr:any, resRow:number) => {
        if (errUpdAddr) {
          console.log(errUpdAddr);
          return;
        }
        console.log(sql);

        sql = `UPDATE Cashier SET personnelNumber = '${cashier.personnelNumber}', lastName = '${cashier.employeeName.lastName}', firstName = '${cashier.employeeName.firstName}', patronymic = '${cashier.employeeName.patronymic}', sex = '${Sex[cashier.sex] as unknown as number}', phone = '${cashier.phone}', addrID = '${addrIdRow.addrID}', birthday = '${dateFormat(cashier.birthday)}', shopID = '${cashier.shopID}', startWork = '${cashier.startWork}', lastNet = '${Net[cashier.lastNet] as unknown as number}' WHERE id='${cashier.id}'`;
        console.log(sql);
        this.db.run(sql, (resUdate:any, errUpdate:any) => {
          if (errUpdate) {
            console.log(errUpdate);
            return;
          }
          console.log(`Данные кассира ${cashier.employeeName.lastName} успешно обновлены`);
        });
      });
    });
  }

  /**
     * Mark some Cashier as a deleted without deleting from the DB
     */
  public delCashier(id:number):void {
    const sql = `UPDATE Cashier SET deleted = 1 WHERE id='${id}'`;
    this.db.run(sql, (res:any, err:any) => {
      console.log(sql);
      if (err) {
        console.log(err);
        return;
      }
      console.log(`Информация о кассире с ${id} успешно удалена`);
    });
  }

  /**
     * Delete a Cashier from the DB
     */
  public completDeleteCashier(id:number):void {
    const sql = `DELETE FROM Cashier WHERE id='${id}'`;
    this.db.run(sql, (res:any, err:any) => {
      console.log(sql);
      if (err) {
        console.log(err);
        return;
      }
      console.log(`Информация о кассире с ${id} успешно удалена`);
    });
  }

  /**
   * Get information about all Cashiers in the Shop
   */
  public getAllCashiers():void {
    console.log('Информация о всех кассирах:');
    this.db.each('SELECT Cashier.*, Address.* FROM Cashier, Address Where Cashier.addrID = Address.id;', (err: any, row: any) => {
      if (row) {
        console.log(parceCashier(row));
      }
    });
  }

  /**
   * getTargetCashiers1
   */
  public getTargetCashiers1():void {
    console.log('Данi по усіх касирах магазину за всю історію роботи магазинів ATB у місті Львів, які мають більше 5 років досвіду та раніше працювали у Silpo або Arsen:');
    // const sql:string = `SELECT Cashier.*, Address.* FROM Cashier, Address Where Cashier.addrID = Address.id AND Address.City = '${City[City.Львов]}' AND startWork<='2016-01-01' AND lastNet IN (${Net.Сiльпо} , ${Net.Арсен});`;
    // console.log(sql);
    // this.db.each(sql, (err: any, row: any) => {
    //   if (row) {
    //     console.log(parceCashier(row));
    //   }
    // });
  }

  /**
   * getTargetCashiers2
   */
  public getTargetCashiers2():void {
    console.log('Данi по усіх касирах магазину ATB за адресою Шевенка 100, які працюють на касах з непарним числом щопонеділка у нічну зміну (23:00 - 07:00)');
  }
}
