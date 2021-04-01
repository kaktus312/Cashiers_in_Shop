// main methods (CRUD) + db connection; imports stuff from models.ts
import { Database } from 'sqlite3';
import {
  ICashier, Net, Sex, City, SqlFilter,
} from './models';
import { dateFormat, parceCashier } from './utils';

// eslint-disable-next-line import/prefer-default-export
export class ShopDB {
  private db:Database;

  constructor(dbPath:string) {
    // console.log(dbPath);
    this.db = new Database(dbPath);
  }

  /**
       * Close opened DB
       */
  public close():void {
    this.db.close();
    console.log('DB was closed successfully');
  }

  /**
       * Add a new Cashier in to the DB
       */
  public addCashier(cashier:ICashier):Promise<number> {
    let addrID = -1;
    let id = -1;
    return new Promise((result, rej) => {
      let sql:string = `SELECT ID
                        FROM Address
                        WHERE city = '${City[cashier.addr.city]}' AND 
                              street = '${cashier.addr.street}' AND 
                              building = '${cashier.addr.building}' AND
                              litera = '${cashier.addr.litera}' AND 
                              apartment = '${cashier.addr.apartment}';`;

      this.db.get(sql, (err:any, row:any) => {
        // console.log(sql);
        if (err) {
          console.log(err);
          return;
        }
        if (row) {
          addrID = row.ID;
        }
        // console.log(`addrID = ${addrID}`);
        if (addrID < 0) {
          sql = `INSERT INTO Address (
                                    city,
                                    street,
                                    building,
                                    litera,
                                    apartment
                                  )
                                  VALUES (
                                    '${City[cashier.addr.city]}',
                                    '${cashier.addr.street}',
                                    '${cashier.addr.building}',
                                    '${cashier.addr.litera}',
                                    '${cashier.addr.apartment}'
                                  )`;
          this.db.run(sql, (errIns:any) => {
            // console.log(sql);
            if (errIns) {
              console.log(errIns);
              return;
            }
            sql = 'SELECT ID FROM Address WHERE rowid = last_insert_rowid();';
            this.db.get(sql, (err:any, addrIdRow:any) => {
              // console.log(sql);
              if (err) {
                console.log(err);
                return;
              }
              addrID = addrIdRow.ID;
              // console.log(`new addrID = ${addrID}`);
              const newCashierID:Promise<number> = this.cashierInsert(cashier, addrID);
              newCashierID.then((val) => {
                id = val;
                result(id);
              });
            });
          });
        } else {
          const newCashierID:Promise<number> = this.cashierInsert(cashier, addrID);
          newCashierID.then((val) => {
            id = val;
            result(id);
          });
        }
      });
    });
  }

  private cashierInsert(cashier: ICashier, addrID:number):Promise<number> {
    let newCashierID = -1;
    return new Promise((reslt) => {
      let sql:string = `INSERT INTO Cashier (
                                    personnelNumber,
                                    lastName,
                                    firstName,
                                    patronymic,
                                    sex,
                                    phone,
                                    addrID,
                                    birthday,
                                    shopID,
                                    startWork,
                                    lastNet
                                )
                                VALUES (
                                    '${cashier.personnelNumber}',
                                    '${cashier.employeeName.lastName}',
                                    '${cashier.employeeName.firstName}',
                                    '${cashier.employeeName.patronymic}',
                                    '${cashier.sex}',
                                    '${cashier.phone}',
                                    '${addrID}',
                                    '${dateFormat(cashier.birthday)}',
                                    '${cashier.shopID}',
                                    '${dateFormat(cashier.startWork)}',
                                    '${cashier.lastNet}'
                                )`;
      this.db.run(sql, (res:any, err:any) => {
        // console.log(sql);
        // console.log(res);
        if (err) {
          console.log(err);
          return;
        }
        sql = `SELECT  id 
                 FROM Cashier 
                WHERE personnelNumber = '${cashier.personnelNumber}'`;
        this.db.get(sql, (errSel:any, resSel:any) => {
          // console.log(sql);
          if (errSel) {
            console.log(errSel);
            return;
          }
          if (resSel) {
            newCashierID = resSel.id;
            console.log(`New Cashier's id is ${newCashierID}`);
            console.log(`Данные по кассиру ${cashier.employeeName.lastName} успешно добавлены`);
            reslt(newCashierID);
          }
        });
      });
    });
  }

  /**
       * Get information about a Cashier by ID
       */
  public getCashierById(id:number):Promise<ICashier> {
    const sql:string = `SELECT Cashier.*, 
                              Address.city, 
                              Address.street, 
                              Address.building, 
                              Address.litera, 
                              Address.apartment 
                        FROM  Cashier, 
                              Address 
                        WHERE Cashier.addrID = Address.ID AND 
                              Cashier.id=${id};`;
    return new Promise((res, rej) => {
      this.db.get(sql, (err: any, row: any) => {
        if (row) {
          const cashier:ICashier = parceCashier(row);
          res(cashier);
        } else {
          console.log(`Данные о кассире с id ${id} не найдены`);
        }
      });
    });
  }

  /**
       * Update information about a Cashier
       */
  public updateCashier(cashier:ICashier):void {
    let sql:string = `SELECT addrID 
                        FROM Cashier 
                        WHERE id='${cashier.id}'`;
    this.db.get(sql, (err:any, addrIdRow:any) => {
      // console.log(sql);
      if (err) {
        console.log(err);
        return;
      }
      // console.log(addrIdRow);

      sql = `UPDATE Address 
                SET city = '${cashier.addr.city}', 
                    street = '${cashier.addr.street}', 
                    building = '${cashier.addr.building}', 
                    litera = '${cashier.addr.litera}', 
                    apartment = '${cashier.addr.apartment}' 
                WHERE id=${addrIdRow.addrID}`;
      this.db.get(sql, (errUpdAddr:any, resRow:number) => {
        if (errUpdAddr) {
          console.log(errUpdAddr);
          return;
        }
        // console.log(sql);

        sql = `UPDATE Cashier 
                  SET personnelNumber = '${cashier.personnelNumber}', 
                      lastName = '${cashier.employeeName.lastName}', 
                      firstName = '${cashier.employeeName.firstName}', 
                      patronymic = '${cashier.employeeName.patronymic}', 
                      sex = '${Sex[cashier.sex] as unknown as number}', 
                      phone = '${cashier.phone}', 
                      addrID = '${addrIdRow.addrID}', 
                      birthday = '${dateFormat(cashier.birthday)}', 
                      shopID = '${cashier.shopID}', 
                      startWork = '${cashier.startWork}', 
                      lastNet = '${Net[cashier.lastNet] as unknown as number}' 
                WHERE id='${cashier.id}'`;
        // console.log(sql);
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
      // console.log(sql);
      if (err) {
        console.log(err);
        return;
      }
      console.log(`Информация о кассире с id= ${id} успешно удалена`);
    });
  }

  /**
     * Delete a Cashier from the DB
     */
  public completDeleteCashier(id:number):void {
    const sql = `DELETE FROM Cashier WHERE id='${id}'`;
    this.db.run(sql, (res:any, err:any) => {
      // console.log(sql);
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
    const sql:string = `SELECT Cashier.*, 
                               Address.* 
                          FROM Cashier, 
                               Address 
                         WHERE Cashier.addrID = Address.ID;`;
    console.log('Информация о всех кассирах:');
    this.db.each(sql, (err: any, row: any) => {
      if (row) {
        console.log(parceCashier(row));
      }
    });
  }

  /**
   * Get information about all Cashiers in the Shop accordin some filter
   */
  public getAllFiltredCashiers(fl:SqlFilter):void {
    let fltr:string = (fl.firstName) ? ` AND firstName = '${fl.firstName}'` : '';
    fltr += (fl.lastName) ? ` AND lastName = '${fl.lastName}'` : '';
    fltr += (fl.phone) ? ` AND phone = '${fl.phone}'` : '';
    fltr += (fl.operator) ? ` AND phone LIKE '%${fl.operator}%'` : '';
    fltr += (fl.sex) ? ` AND sex = '${fl.sex}'` : '';
    fltr += (fl.lastNet) ? ` AND lastNet = '${fl.lastNet}'` : '';
    fltr += (fl.city) ? ` AND Address.city = '${City[fl.city]}'` : '';

    const sql:string = `SELECT Cashier.*, 
                               Address.* 
                          FROM Cashier, 
                               Address 
                         WHERE Cashier.addrID = Address.ID
                                ${fltr};`;
    console.log('Информация о всех кассирах согласно заданному фильтру:');
    // console.log(sql);
    this.db.each(sql, (err: any, row: any) => {
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
    const sql:string = `SELECT Cashier.*, 
                               Address.* 
                          FROM Cashier, 
                               Address 
                         WHERE Cashier.addrID = Address.ID AND
                               Cashier.shopID IN (
                                                  SELECT Shop.id 
                                                    FROM Shop, 
                                                         Address 
                                                   WHERE Shop.addrID = Address.ID AND 
                                                         Address.City = '${City[City.Львов]}') AND 
                                                         Cashier.lastNet IN (${Net.Сiльпо} , ${Net.Арсен}) AND 
                                                         Cashier.startWork<='2016-01-01'`;
    // console.log(sql);
    this.db.each(sql, (err: any, row: any) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(parceCashier(row));
    });
  }

  /**
   * getTargetCashiers2
   */
  public getTargetCashiers2():void {
    console.log('Данi по усіх касирах магазину ATB за адресою Шевенка 100, які працюють на касах з непарним числом щопонеділка у нічну зміну (23:00 - 07:00)');
    const sql:string = `SELECT Cashier.*, 
                               Address.* 
                          FROM Cashier, 
                               Address 
                         WHERE Cashier.addrID = Address.ID AND 
                               Cashier.shopID IN (
                                                  SELECT Shop.id 
                                                    FROM Shop, 
                                                         Address 
                                                   WHERE Shop.addrID = Address.ID AND 
                                                         Address.street = 'ул. Шевченко' AND 
                                                         Address.building = 100
                                                  ) AND 
                                Cashier.id IN (
                                                SELECT CashRegister.cashierID 
                                                  FROM CashRegister 
                                                 WHERE CashRegister.cashBoxNumber% 2 AND 
                                                       ((CashRegister.transactionTime BETWEEN '00:00:00' AND '07:00:00') OR 
                                                        (CashRegister.transactionTime BETWEEN '23:00:00' AND '23:59:59')) AND 
                                                        strftime('%w', CashRegister.transactionDate) = '1')`;
    // console.log(sql);
    this.db.each(sql, (err: any, row: any) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(parceCashier(row));
    });
  }
}
