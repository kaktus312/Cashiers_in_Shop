"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopDB = void 0;
const sqlite3_1 = require("sqlite3");
const models_1 = require("./models");
const utils_1 = require("./utils");
class ShopDB {
    constructor(dbPath) {
        console.log(dbPath);
        this.db = new sqlite3_1.Database(dbPath);
    }
    close() {
        this.db.close();
        console.log('DB was closed successfully');
    }
    addCashier(cashier) {
        let addrID = -1;
        let id = -1;
        return new Promise((result, rej) => {
            let sql = `SELECT ID
                        FROM Address
                        WHERE city = '${models_1.City[cashier.addr.city]}' AND 
                              street = '${cashier.addr.street}' AND 
                              building = '${cashier.addr.building}' AND
                              litera = '${cashier.addr.litera}' AND 
                              apartment = '${cashier.addr.apartment}';`;
            this.db.get(sql, (err, res) => {
                console.log(sql);
                if (err) {
                    console.log(err);
                    return;
                }
                if (res) {
                    addrID = res.ID;
                    console.log(`addrID = ${addrID}`);
                    if (addrID < 0) {
                        sql = `INSERT INTO Address (
                                    city,
                                    street,
                                    building,
                                    litera,
                                    apartment
                                  )
                                  VALUES (
                                    '${models_1.City[cashier.addr.city]}',
                                    '${cashier.addr.street}',
                                    '${cashier.addr.building}',
                                    '${cashier.addr.litera}',
                                    '${cashier.addr.apartment}'
                                  )`;
                        this.db.run(sql, (resIns, errIns) => {
                            if (errIns) {
                                console.log(errIns);
                                return;
                            }
                            sql = 'SELECT ID FROM Address WHERE rowid = last_insert_rowid();';
                            this.db.get(sql, (err, addrIdRow) => {
                                console.log(sql);
                                if (err) {
                                    console.log(err);
                                    return;
                                }
                                addrID = addrIdRow;
                                console.log(`new addrID = ${addrID}`);
                            });
                        });
                    }
                    sql = `INSERT INTO Cashier (
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
                                    '${utils_1.dateFormat(cashier.birthday)}',
                                    '${cashier.shopID}',
                                    '${utils_1.dateFormat(cashier.startWork)}',
                                    '${cashier.lastNet}'
                                )`;
                    this.db.run(sql, (err, res) => {
                        console.log(sql);
                        console.log(res);
                        if (err) {
                            console.log(err);
                            return;
                        }
                        console.log(`Данные по кассиру ${cashier.employeeName.lastName} успешно добавлены`);
                        sql = `SELECT  id 
                    FROM Cashier 
                    WHERE rowid=last_insert_rowid() OR 
                          personnelNumber = '${cashier.personnelNumber}'`;
                        this.db.get(sql, (err, res) => {
                            console.log(sql);
                            if (err) {
                                console.log(err);
                                return;
                            }
                            if (res) {
                                id = res.id;
                                console.log(`New Cashier's id is ${id}`);
                                result(id);
                            }
                        });
                    });
                }
            });
        });
    }
    getCashierById(id) {
        const sql = `SELECT Cashier.*, 
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
            this.db.get(sql, (err, row) => {
                if (row) {
                    const cashier = utils_1.parceCashier(row);
                    res(cashier);
                }
            });
        });
    }
    updateCashier(cashier) {
        let sql = `SELECT addrID 
                        FROM Cashier 
                        WHERE id='${cashier.id}'`;
        this.db.get(sql, (err, addrIdRow) => {
            if (err) {
                console.log(err);
                console.log(sql);
                return;
            }
            console.log(addrIdRow);
            sql = `UPDATE Address 
                SET city = '${models_1.City[cashier.addr.city]}', 
                    street = '${cashier.addr.street}', 
                    building = '${cashier.addr.building}', 
                    litera = '${cashier.addr.litera}', 
                    apartment = '${cashier.addr.apartment}' 
                WHERE id=${addrIdRow.addrID}`;
            this.db.get(sql, (errUpdAddr, resRow) => {
                if (errUpdAddr) {
                    console.log(errUpdAddr);
                    return;
                }
                console.log(sql);
                sql = `UPDATE Cashier 
                  SET personnelNumber = '${cashier.personnelNumber}', 
                      lastName = '${cashier.employeeName.lastName}', 
                      firstName = '${cashier.employeeName.firstName}', 
                      patronymic = '${cashier.employeeName.patronymic}', 
                      sex = '${models_1.Sex[cashier.sex]}', 
                      phone = '${cashier.phone}', 
                      addrID = '${addrIdRow.addrID}', 
                      birthday = '${utils_1.dateFormat(cashier.birthday)}', 
                      shopID = '${cashier.shopID}', 
                      startWork = '${cashier.startWork}', 
                      lastNet = '${models_1.Net[cashier.lastNet]}' 
                WHERE id='${cashier.id}'`;
                console.log(sql);
                this.db.run(sql, (resUdate, errUpdate) => {
                    if (errUpdate) {
                        console.log(errUpdate);
                        return;
                    }
                    console.log(`Данные кассира ${cashier.employeeName.lastName} успешно обновлены`);
                });
            });
        });
    }
    delCashier(id) {
        const sql = `UPDATE Cashier SET deleted = 1 WHERE id='${id}'`;
        this.db.run(sql, (res, err) => {
            console.log(sql);
            if (err) {
                console.log(err);
                return;
            }
            console.log(`Информация о кассире с ${id} успешно удалена`);
        });
    }
    completDeleteCashier(id) {
        const sql = `DELETE FROM Cashier WHERE id='${id}'`;
        this.db.run(sql, (res, err) => {
            console.log(sql);
            if (err) {
                console.log(err);
                return;
            }
            console.log(`Информация о кассире с ${id} успешно удалена`);
        });
    }
    getAllCashiers() {
        const sql = `SELECT Cashier.*, 
                               Address.* 
                          FROM Cashier, 
                               Address 
                         WHERE Cashier.addrID = Address.ID;`;
        console.log('Информация о всех кассирах:');
        this.db.each(sql, (err, row) => {
            if (row) {
                console.log(utils_1.parceCashier(row));
            }
        });
    }
    getAllFiltredCashiers(fl) {
        let fltr = (fl.firstName) ? ` AND firstName = '${fl.firstName}'` : '';
        fltr += (fl.lastName) ? ` AND lastName = '${fl.lastName}'` : '';
        fltr += (fl.phone) ? ` AND phone = '${fl.phone}'` : '';
        fltr += (fl.operator) ? ` AND phone LIKE '%${fl.operator}%'` : '';
        fltr += (fl.sex) ? ` AND sex = '${fl.sex}'` : '';
        fltr += (fl.lastNet) ? ` AND lastNet = '${fl.lastNet}'` : '';
        fltr += (fl.city) ? ` AND Address.city = '${models_1.City[fl.city]}'` : '';
        const sql = `SELECT Cashier.*, 
                               Address.* 
                          FROM Cashier, 
                               Address 
                         WHERE Cashier.addrID = Address.ID
                                ${fltr};`;
        console.log('Информация о всех кассирах согласно заданному фильтру:');
        console.log(sql);
        this.db.each(sql, (err, row) => {
            if (row) {
                console.log(utils_1.parceCashier(row));
            }
        });
    }
    getTargetCashiers1() {
        console.log('Данi по усіх касирах магазину за всю історію роботи магазинів ATB у місті Львів, які мають більше 5 років досвіду та раніше працювали у Silpo або Arsen:');
        const sql = `SELECT Cashier.*, 
                               Address.* 
                          FROM Cashier, 
                               Address 
                         WHERE Cashier.addrID = Address.ID AND
                               Cashier.shopID IN (
                                                  SELECT Shop.id 
                                                    FROM Shop, 
                                                         Address 
                                                   WHERE Shop.addrID = Address.ID AND 
                                                         Address.City = '${models_1.City[models_1.City.Львов]}') AND 
                                                         Cashier.lastNet IN (${models_1.Net.Сiльпо} , ${models_1.Net.Арсен}) AND 
                                                         Cashier.startWork<='2016-01-01'`;
        console.log(sql);
        this.db.each(sql, (err, row) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log(utils_1.parceCashier(row));
        });
    }
    getTargetCashiers2() {
        console.log('Данi по усіх касирах магазину ATB за адресою Шевенка 100, які працюють на касах з непарним числом щопонеділка у нічну зміну (23:00 - 07:00)');
        const sql = `SELECT Cashier.*, 
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
        console.log(sql);
        this.db.each(sql, (err, row) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log(utils_1.parceCashier(row));
        });
    }
}
exports.ShopDB = ShopDB;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZGIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EscUNBQW1DO0FBQ25DLHFDQUVrQjtBQUNsQixtQ0FBbUQ7QUFHbkQsTUFBYSxNQUFNO0lBR2pCLFlBQVksTUFBYTtRQUN2QixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxrQkFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFLTSxLQUFLO1FBQ1YsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNoQixPQUFPLENBQUMsR0FBRyxDQUFDLDRCQUE0QixDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUtNLFVBQVUsQ0FBQyxPQUFnQjtRQUNoQyxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNoQixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNaLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEVBQUU7WUFDakMsSUFBSSxHQUFHLEdBQVU7O3dDQUVpQixhQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7MENBQ3JCLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTTs0Q0FDakIsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFROzBDQUN2QixPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU07NkNBQ2hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUM7WUFFbEUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBTyxFQUFFLEdBQU8sRUFBRSxFQUFFO2dCQUNwQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNqQixJQUFJLEdBQUcsRUFBRTtvQkFDUCxPQUFPLENBQUMsR0FBRyxDQUFD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O2FBQ1I7WUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNqQyxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFLTSxrQkFBa0I7UUFDdkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyw2SUFBNkksQ0FBQyxDQUFDO1FBQzNKLE1BQU0sR0FBRyxHQUFVOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRHQW1CcUYsQ0FBQztRQUN6RyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQVEsRUFBRSxHQUFRLEVBQUUsRUFBRTtZQUN2QyxJQUFJLEdBQUcsRUFBRTtnQkFDUCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNqQixPQUFPO2FBQ1I7WUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNqQyxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQXhWRCx3QkF3VkMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBtYWluIG1ldGhvZHMgKENSVUQpICsgZGIgY29ubmVjdGlvbjsgaW1wb3J0cyBzdHVmZiBmcm9tIG1vZGVscy50c1xuaW1wb3J0IHsgRGF0YWJhc2UgfSBmcm9tICdzcWxpdGUzJztcbmltcG9ydCB7XG4gIElDYXNoaWVyLCBOZXQsIFNleCwgQ2l0eSwgU3FsRmlsdGVyLFxufSBmcm9tICcuL21vZGVscyc7XG5pbXBvcnQgeyBkYXRlRm9ybWF0LCBwYXJjZUNhc2hpZXIgfSBmcm9tICcuL3V0aWxzJztcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9wcmVmZXItZGVmYXVsdC1leHBvcnRcbmV4cG9ydCBjbGFzcyBTaG9wREIge1xuICBwcml2YXRlIGRiOkRhdGFiYXNlO1xuXG4gIGNvbnN0cnVjdG9yKGRiUGF0aDpzdHJpbmcpIHtcbiAgICBjb25zb2xlLmxvZyhkYlBhdGgpO1xuICAgIHRoaXMuZGIgPSBuZXcgRGF0YWJhc2UoZGJQYXRoKTtcbiAgfVxuXG4gIC8qKlxuICAgICAgICogQ2xvc2Ugb3BlbmVkIERCXG4gICAgICAgKi9cbiAgcHVibGljIGNsb3NlKCk6dm9pZCB7XG4gICAgdGhpcy5kYi5jbG9zZSgpO1xuICAgIGNvbnNvbGUubG9nKCdEQiB3YXMgY2xvc2VkIHN1Y2Nlc3NmdWxseScpO1xuICB9XG5cbiAgLyoqXG4gICAgICAgKiBBZGQgYSBuZXcgQ2FzaGllciBpbiB0byB0aGUgREJcbiAgICAgICAqL1xuICBwdWJsaWMgYWRkQ2FzaGllcihjYXNoaWVyOklDYXNoaWVyKTpQcm9taXNlPG51bWJlcj4ge1xuICAgIGxldCBhZGRySUQgPSAtMTtcbiAgICBsZXQgaWQgPSAtMTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc3VsdCwgcmVqKSA9PiB7XG4gICAgICBsZXQgc3FsOnN0cmluZyA9IGBTRUxFQ1QgSURcbiAgICAgICAgICAgICAgICAgICAgICAgIEZST00gQWRkcmVzc1xuICAgICAgICAgICAgICAgICAgICAgICAgV0hFUkUgY2l0eSA9ICcke0NpdHlbY2FzaGllci5hZGRyLmNpdHldfScgQU5EIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyZWV0ID0gJyR7Y2FzaGllci5hZGRyLnN0cmVldH0nIEFORCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkaW5nID0gJyR7Y2FzaGllci5hZGRyLmJ1aWxkaW5nfScgQU5EXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXRlcmEgPSAnJHtjYXNoaWVyLmFkZHIubGl0ZXJhfScgQU5EIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBhcnRtZW50ID0gJyR7Y2FzaGllci5hZGRyLmFwYXJ0bWVudH0nO2A7XG5cbiAgICAgIHRoaXMuZGIuZ2V0KHNxbCwgKGVycjphbnksIHJlczphbnkpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coc3FsKTtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyZXMpIHtcbiAgICAgICAgICBhZGRySUQgPSByZXMuSUQ7XG5cbiAgICAgICAgICBjb25zb2xlLmxvZyhgYWRkcklEID0gJHthZGRySUR9YCk7XG4gICAgICAgICAgaWYgKGFkZHJJRCA8IDApIHtcbiAgICAgICAgICAgIHNxbCA9IGBJTlNFUlQgSU5UTyBBZGRyZXNzIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNpdHksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJlZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWlsZGluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpdGVyYSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwYXJ0bWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBWQUxVRVMgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyR7Q2l0eVtjYXNoaWVyLmFkZHIuY2l0eV19JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcke2Nhc2hpZXIuYWRkci5zdHJlZXR9JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcke2Nhc2hpZXIuYWRkci5idWlsZGluZ30nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyR7Y2FzaGllci5hZGRyLmxpdGVyYX0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyR7Y2FzaGllci5hZGRyLmFwYXJ0bWVudH0nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKWA7XG4gICAgICAgICAgICB0aGlzLmRiLnJ1bihzcWwsIChyZXNJbnM6YW55LCBlcnJJbnM6YW55KSA9PiB7XG4gICAgICAgICAgICAgIGlmIChlcnJJbnMpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJJbnMpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBzcWwgPSAnU0VMRUNUIElEIEZST00gQWRkcmVzcyBXSEVSRSByb3dpZCA9IGxhc3RfaW5zZXJ0X3Jvd2lkKCk7JztcbiAgICAgICAgICAgICAgdGhpcy5kYi5nZXQoc3FsLCAoZXJyOmFueSwgYWRkcklkUm93Om51bWJlcikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHNxbCk7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYWRkcklEID0gYWRkcklkUm93O1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBuZXcgYWRkcklEID0gJHthZGRySUR9YCk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHNxbCA9IGBJTlNFUlQgSU5UTyBDYXNoaWVyIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlcnNvbm5lbE51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3ROYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3ROYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0cm9ueW1pYyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNleCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBob25lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkcklELFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmlydGhkYXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG9wSUQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydFdvcmssXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0TmV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVkFMVUVTIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcke2Nhc2hpZXIucGVyc29ubmVsTnVtYmVyfScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnJHtjYXNoaWVyLmVtcGxveWVlTmFtZS5sYXN0TmFtZX0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyR7Y2FzaGllci5lbXBsb3llZU5hbWUuZmlyc3ROYW1lfScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnJHtjYXNoaWVyLmVtcGxveWVlTmFtZS5wYXRyb255bWljfScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnJHtjYXNoaWVyLnNleH0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyR7Y2FzaGllci5waG9uZX0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyR7YWRkcklEfScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnJHtkYXRlRm9ybWF0KGNhc2hpZXIuYmlydGhkYXkpfScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnJHtjYXNoaWVyLnNob3BJRH0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyR7ZGF0ZUZvcm1hdChjYXNoaWVyLnN0YXJ0V29yayl9JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcke2Nhc2hpZXIubGFzdE5ldH0nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClgO1xuICAgICAgICAgIHRoaXMuZGIucnVuKHNxbCwgKGVycjphbnksIHJlczphbnkpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHNxbCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXMpO1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg0JTQsNC90L3Ri9C1INC/0L4g0LrQsNGB0YHQuNGA0YMgJHtjYXNoaWVyLmVtcGxveWVlTmFtZS5sYXN0TmFtZX0g0YPRgdC/0LXRiNC90L4g0LTQvtCx0LDQstC70LXQvdGLYCk7XG4gICAgICAgICAgICBzcWwgPSBgU0VMRUNUICBpZCBcbiAgICAgICAgICAgICAgICAgICAgRlJPTSBDYXNoaWVyIFxuICAgICAgICAgICAgICAgICAgICBXSEVSRSByb3dpZD1sYXN0X2luc2VydF9yb3dpZCgpIE9SIFxuICAgICAgICAgICAgICAgICAgICAgICAgICBwZXJzb25uZWxOdW1iZXIgPSAnJHtjYXNoaWVyLnBlcnNvbm5lbE51bWJlcn0nYDtcbiAgICAgICAgICAgIHRoaXMuZGIuZ2V0KHNxbCwgKGVycjphbnksIHJlczphbnkpID0+IHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coc3FsKTtcbiAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChyZXMpIHtcbiAgICAgICAgICAgICAgICBpZCA9IHJlcy5pZDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgTmV3IENhc2hpZXIncyBpZCBpcyAke2lkfWApO1xuICAgICAgICAgICAgICAgIHJlc3VsdChpZCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgICAgICogR2V0IGluZm9ybWF0aW9uIGFib3V0IGEgQ2FzaGllciBieSBJRFxuICAgICAgICovXG4gIHB1YmxpYyBnZXRDYXNoaWVyQnlJZChpZDpudW1iZXIpOlByb21pc2U8SUNhc2hpZXI+IHtcbiAgICBjb25zdCBzcWw6c3RyaW5nID0gYFNFTEVDVCBDYXNoaWVyLiosIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWRkcmVzcy5jaXR5LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3Muc3RyZWV0LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3MuYnVpbGRpbmcsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWRkcmVzcy5saXRlcmEsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWRkcmVzcy5hcGFydG1lbnQgXG4gICAgICAgICAgICAgICAgICAgICAgICBGUk9NICBDYXNoaWVyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3MgXG4gICAgICAgICAgICAgICAgICAgICAgICBXSEVSRSBDYXNoaWVyLmFkZHJJRCA9IEFkZHJlc3MuSUQgQU5EIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ2FzaGllci5pZD0ke2lkfTtgO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IHtcbiAgICAgIHRoaXMuZGIuZ2V0KHNxbCwgKGVycjogYW55LCByb3c6IGFueSkgPT4ge1xuICAgICAgICBpZiAocm93KSB7XG4gICAgICAgICAgY29uc3QgY2FzaGllcjpJQ2FzaGllciA9IHBhcmNlQ2FzaGllcihyb3cpO1xuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGDQlNCw0L3QvdGL0LUg0L4g0LrQsNGB0YHQuNGA0LUg0YEgaWQgJHtpZH06XFxuYCwgY2FzaGllcik7XG4gICAgICAgICAgcmVzKGNhc2hpZXIpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgICAgICogVXBkYXRlIGluZm9ybWF0aW9uIGFib3V0IGEgQ2FzaGllclxuICAgICAgICovXG4gIHB1YmxpYyB1cGRhdGVDYXNoaWVyKGNhc2hpZXI6SUNhc2hpZXIpOnZvaWQge1xuICAgIGxldCBzcWw6c3RyaW5nID0gYFNFTEVDVCBhZGRySUQgXG4gICAgICAgICAgICAgICAgICAgICAgICBGUk9NIENhc2hpZXIgXG4gICAgICAgICAgICAgICAgICAgICAgICBXSEVSRSBpZD0nJHtjYXNoaWVyLmlkfSdgO1xuICAgIHRoaXMuZGIuZ2V0KHNxbCwgKGVycjphbnksIGFkZHJJZFJvdzphbnkpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgY29uc29sZS5sb2coc3FsKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc29sZS5sb2coYWRkcklkUm93KTtcblxuICAgICAgc3FsID0gYFVQREFURSBBZGRyZXNzIFxuICAgICAgICAgICAgICAgIFNFVCBjaXR5ID0gJyR7Q2l0eVtjYXNoaWVyLmFkZHIuY2l0eV19JywgXG4gICAgICAgICAgICAgICAgICAgIHN0cmVldCA9ICcke2Nhc2hpZXIuYWRkci5zdHJlZXR9JywgXG4gICAgICAgICAgICAgICAgICAgIGJ1aWxkaW5nID0gJyR7Y2FzaGllci5hZGRyLmJ1aWxkaW5nfScsIFxuICAgICAgICAgICAgICAgICAgICBsaXRlcmEgPSAnJHtjYXNoaWVyLmFkZHIubGl0ZXJhfScsIFxuICAgICAgICAgICAgICAgICAgICBhcGFydG1lbnQgPSAnJHtjYXNoaWVyLmFkZHIuYXBhcnRtZW50fScgXG4gICAgICAgICAgICAgICAgV0hFUkUgaWQ9JHthZGRySWRSb3cuYWRkcklEfWA7XG4gICAgICB0aGlzLmRiLmdldChzcWwsIChlcnJVcGRBZGRyOmFueSwgcmVzUm93Om51bWJlcikgPT4ge1xuICAgICAgICBpZiAoZXJyVXBkQWRkcikge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVyclVwZEFkZHIpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhzcWwpO1xuXG4gICAgICAgIHNxbCA9IGBVUERBVEUgQ2FzaGllciBcbiAgICAgICAgICAgICAgICAgIFNFVCBwZXJzb25uZWxOdW1iZXIgPSAnJHtjYXNoaWVyLnBlcnNvbm5lbE51bWJlcn0nLCBcbiAgICAgICAgICAgICAgICAgICAgICBsYXN0TmFtZSA9ICcke2Nhc2hpZXIuZW1wbG95ZWVOYW1lLmxhc3ROYW1lfScsIFxuICAgICAgICAgICAgICAgICAgICAgIGZpcnN0TmFtZSA9ICcke2Nhc2hpZXIuZW1wbG95ZWVOYW1lLmZpcnN0TmFtZX0nLCBcbiAgICAgICAgICAgICAgICAgICAgICBwYXRyb255bWljID0gJyR7Y2FzaGllci5lbXBsb3llZU5hbWUucGF0cm9ueW1pY30nLCBcbiAgICAgICAgICAgICAgICAgICAgICBzZXggPSAnJHtTZXhbY2FzaGllci5zZXhdIGFzIHVua25vd24gYXMgbnVtYmVyfScsIFxuICAgICAgICAgICAgICAgICAgICAgIHBob25lID0gJyR7Y2FzaGllci5waG9uZX0nLCBcbiAgICAgICAgICAgICAgICAgICAgICBhZGRySUQgPSAnJHthZGRySWRSb3cuYWRkcklEfScsIFxuICAgICAgICAgICAgICAgICAgICAgIGJpcnRoZGF5ID0gJyR7ZGF0ZUZvcm1hdChjYXNoaWVyLmJpcnRoZGF5KX0nLCBcbiAgICAgICAgICAgICAgICAgICAgICBzaG9wSUQgPSAnJHtjYXNoaWVyLnNob3BJRH0nLCBcbiAgICAgICAgICAgICAgICAgICAgICBzdGFydFdvcmsgPSAnJHtjYXNoaWVyLnN0YXJ0V29ya30nLCBcbiAgICAgICAgICAgICAgICAgICAgICBsYXN0TmV0ID0gJyR7TmV0W2Nhc2hpZXIubGFzdE5ldF0gYXMgdW5rbm93biBhcyBudW1iZXJ9JyBcbiAgICAgICAgICAgICAgICBXSEVSRSBpZD0nJHtjYXNoaWVyLmlkfSdgO1xuICAgICAgICBjb25zb2xlLmxvZyhzcWwpO1xuICAgICAgICB0aGlzLmRiLnJ1bihzcWwsIChyZXNVZGF0ZTphbnksIGVyclVwZGF0ZTphbnkpID0+IHtcbiAgICAgICAgICBpZiAoZXJyVXBkYXRlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJVcGRhdGUpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zb2xlLmxvZyhg0JTQsNC90L3Ri9C1INC60LDRgdGB0LjRgNCwICR7Y2FzaGllci5lbXBsb3llZU5hbWUubGFzdE5hbWV9INGD0YHQv9C10YjQvdC+INC+0LHQvdC+0LLQu9C10L3Ri2ApO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAgICogTWFyayBzb21lIENhc2hpZXIgYXMgYSBkZWxldGVkIHdpdGhvdXQgZGVsZXRpbmcgZnJvbSB0aGUgREJcbiAgICAgKi9cbiAgcHVibGljIGRlbENhc2hpZXIoaWQ6bnVtYmVyKTp2b2lkIHtcbiAgICBjb25zdCBzcWwgPSBgVVBEQVRFIENhc2hpZXIgU0VUIGRlbGV0ZWQgPSAxIFdIRVJFIGlkPScke2lkfSdgO1xuICAgIHRoaXMuZGIucnVuKHNxbCwgKHJlczphbnksIGVycjphbnkpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKHNxbCk7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUubG9nKGDQmNC90YTQvtGA0LzQsNGG0LjRjyDQviDQutCw0YHRgdC40YDQtSDRgSAke2lkfSDRg9GB0L/QtdGI0L3QviDRg9C00LDQu9C10L3QsGApO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAgICogRGVsZXRlIGEgQ2FzaGllciBmcm9tIHRoZSBEQlxuICAgICAqL1xuICBwdWJsaWMgY29tcGxldERlbGV0ZUNhc2hpZXIoaWQ6bnVtYmVyKTp2b2lkIHtcbiAgICBjb25zdCBzcWwgPSBgREVMRVRFIEZST00gQ2FzaGllciBXSEVSRSBpZD0nJHtpZH0nYDtcbiAgICB0aGlzLmRiLnJ1bihzcWwsIChyZXM6YW55LCBlcnI6YW55KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhzcWwpO1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zb2xlLmxvZyhg0JjQvdGE0L7RgNC80LDRhtC40Y8g0L4g0LrQsNGB0YHQuNGA0LUg0YEgJHtpZH0g0YPRgdC/0LXRiNC90L4g0YPQtNCw0LvQtdC90LBgKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgaW5mb3JtYXRpb24gYWJvdXQgYWxsIENhc2hpZXJzIGluIHRoZSBTaG9wXG4gICAqL1xuICBwdWJsaWMgZ2V0QWxsQ2FzaGllcnMoKTp2b2lkIHtcbiAgICBjb25zdCBzcWw6c3RyaW5nID0gYFNFTEVDVCBDYXNoaWVyLiosIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3MuKiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgRlJPTSBDYXNoaWVyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBZGRyZXNzIFxuICAgICAgICAgICAgICAgICAgICAgICAgIFdIRVJFIENhc2hpZXIuYWRkcklEID0gQWRkcmVzcy5JRDtgO1xuICAgIGNvbnNvbGUubG9nKCfQmNC90YTQvtGA0LzQsNGG0LjRjyDQviDQstGB0LXRhSDQutCw0YHRgdC40YDQsNGFOicpO1xuICAgIHRoaXMuZGIuZWFjaChzcWwsIChlcnI6IGFueSwgcm93OiBhbnkpID0+IHtcbiAgICAgIGlmIChyb3cpIHtcbiAgICAgICAgY29uc29sZS5sb2cocGFyY2VDYXNoaWVyKHJvdykpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBpbmZvcm1hdGlvbiBhYm91dCBhbGwgQ2FzaGllcnMgaW4gdGhlIFNob3AgYWNjb3JkaW4gc29tZSBmaWx0ZXJcbiAgICovXG4gIHB1YmxpYyBnZXRBbGxGaWx0cmVkQ2FzaGllcnMoZmw6U3FsRmlsdGVyKTp2b2lkIHtcbiAgICBsZXQgZmx0cjpzdHJpbmcgPSAoZmwuZmlyc3ROYW1lKSA/IGAgQU5EIGZpcnN0TmFtZSA9ICcke2ZsLmZpcnN0TmFtZX0nYCA6ICcnO1xuICAgIGZsdHIgKz0gKGZsLmxhc3ROYW1lKSA/IGAgQU5EIGxhc3ROYW1lID0gJyR7ZmwubGFzdE5hbWV9J2AgOiAnJztcbiAgICBmbHRyICs9IChmbC5waG9uZSkgPyBgIEFORCBwaG9uZSA9ICcke2ZsLnBob25lfSdgIDogJyc7XG4gICAgZmx0ciArPSAoZmwub3BlcmF0b3IpID8gYCBBTkQgcGhvbmUgTElLRSAnJSR7Zmwub3BlcmF0b3J9JSdgIDogJyc7XG4gICAgZmx0ciArPSAoZmwuc2V4KSA/IGAgQU5EIHNleCA9ICcke2ZsLnNleH0nYCA6ICcnO1xuICAgIGZsdHIgKz0gKGZsLmxhc3ROZXQpID8gYCBBTkQgbGFzdE5ldCA9ICcke2ZsLmxhc3ROZXR9J2AgOiAnJztcbiAgICBmbHRyICs9IChmbC5jaXR5KSA/IGAgQU5EIEFkZHJlc3MuY2l0eSA9ICcke0NpdHlbZmwuY2l0eV19J2AgOiAnJztcblxuICAgIGNvbnN0IHNxbDpzdHJpbmcgPSBgU0VMRUNUIENhc2hpZXIuKiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWRkcmVzcy4qIFxuICAgICAgICAgICAgICAgICAgICAgICAgICBGUk9NIENhc2hpZXIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3MgXG4gICAgICAgICAgICAgICAgICAgICAgICAgV0hFUkUgQ2FzaGllci5hZGRySUQgPSBBZGRyZXNzLklEXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7Zmx0cn07YDtcbiAgICBjb25zb2xlLmxvZygn0JjQvdGE0L7RgNC80LDRhtC40Y8g0L4g0LLRgdC10YUg0LrQsNGB0YHQuNGA0LDRhSDRgdC+0LPQu9Cw0YHQvdC+INC30LDQtNCw0L3QvdC+0LzRgyDRhNC40LvRjNGC0YDRgzonKTtcbiAgICBjb25zb2xlLmxvZyhzcWwpO1xuICAgIHRoaXMuZGIuZWFjaChzcWwsIChlcnI6IGFueSwgcm93OiBhbnkpID0+IHtcbiAgICAgIGlmIChyb3cpIHtcbiAgICAgICAgY29uc29sZS5sb2cocGFyY2VDYXNoaWVyKHJvdykpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIGdldFRhcmdldENhc2hpZXJzMVxuICAgKi9cbiAgcHVibGljIGdldFRhcmdldENhc2hpZXJzMSgpOnZvaWQge1xuICAgIGNvbnNvbGUubG9nKCfQlNCw0L1pINC/0L4g0YPRgdGW0YUg0LrQsNGB0LjRgNCw0YUg0LzQsNCz0LDQt9C40L3RgyDQt9CwINCy0YHRjiDRltGB0YLQvtGA0ZbRjiDRgNC+0LHQvtGC0Lgg0LzQsNCz0LDQt9C40L3RltCyIEFUQiDRgyDQvNGW0YHRgtGWINCb0YzQstGW0LIsINGP0LrRliDQvNCw0Y7RgtGMINCx0ZbQu9GM0YjQtSA1INGA0L7QutGW0LIg0LTQvtGB0LLRltC00YMg0YLQsCDRgNCw0L3RltGI0LUg0L/RgNCw0YbRjtCy0LDQu9C4INGDIFNpbHBvINCw0LHQviBBcnNlbjonKTtcbiAgICBjb25zdCBzcWw6c3RyaW5nID0gYFNFTEVDVCBDYXNoaWVyLiosIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3MuKiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgRlJPTSBDYXNoaWVyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBZGRyZXNzIFxuICAgICAgICAgICAgICAgICAgICAgICAgIFdIRVJFIENhc2hpZXIuYWRkcklEID0gQWRkcmVzcy5JRCBBTkRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDYXNoaWVyLnNob3BJRCBJTiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNFTEVDVCBTaG9wLmlkIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEZST00gU2hvcCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBZGRyZXNzIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgV0hFUkUgU2hvcC5hZGRySUQgPSBBZGRyZXNzLklEIEFORCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3MuQ2l0eSA9ICcke0NpdHlbQ2l0eS7Qm9GM0LLQvtCyXX0nKSBBTkQgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDYXNoaWVyLmxhc3ROZXQgSU4gKCR7TmV0LtChadC70YzQv9C+fSAsICR7TmV0LtCQ0YDRgdC10L19KSBBTkQgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDYXNoaWVyLnN0YXJ0V29yazw9JzIwMTYtMDEtMDEnYDtcbiAgICBjb25zb2xlLmxvZyhzcWwpO1xuICAgIHRoaXMuZGIuZWFjaChzcWwsIChlcnI6IGFueSwgcm93OiBhbnkpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc29sZS5sb2cocGFyY2VDYXNoaWVyKHJvdykpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIGdldFRhcmdldENhc2hpZXJzMlxuICAgKi9cbiAgcHVibGljIGdldFRhcmdldENhc2hpZXJzMigpOnZvaWQge1xuICAgIGNvbnNvbGUubG9nKCfQlNCw0L1pINC/0L4g0YPRgdGW0YUg0LrQsNGB0LjRgNCw0YUg0LzQsNCz0LDQt9C40L3RgyBBVEIg0LfQsCDQsNC00YDQtdGB0L7RjiDQqNC10LLQtdC90LrQsCAxMDAsINGP0LrRliDQv9GA0LDRhtGO0Y7RgtGMINC90LAg0LrQsNGB0LDRhSDQtyDQvdC10L/QsNGA0L3QuNC8INGH0LjRgdC70L7QvCDRidC+0L/QvtC90LXQtNGW0LvQutCwINGDINC90ZbRh9C90YMg0LfQvNGW0L3RgyAoMjM6MDAgLSAwNzowMCknKTtcbiAgICBjb25zdCBzcWw6c3RyaW5nID0gYFNFTEVDVCBDYXNoaWVyLiosIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3MuKiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgRlJPTSBDYXNoaWVyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBZGRyZXNzIFxuICAgICAgICAgICAgICAgICAgICAgICAgIFdIRVJFIENhc2hpZXIuYWRkcklEID0gQWRkcmVzcy5JRCBBTkQgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ2FzaGllci5zaG9wSUQgSU4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTRUxFQ1QgU2hvcC5pZCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBGUk9NIFNob3AsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWRkcmVzcyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFdIRVJFIFNob3AuYWRkcklEID0gQWRkcmVzcy5JRCBBTkQgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBZGRyZXNzLnN0cmVldCA9ICfRg9C7LiDQqNC10LLRh9C10L3QutC+JyBBTkQgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBZGRyZXNzLmJ1aWxkaW5nID0gMTAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgQU5EIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDYXNoaWVyLmlkIElOIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNFTEVDVCBDYXNoUmVnaXN0ZXIuY2FzaGllcklEIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBGUk9NIENhc2hSZWdpc3RlciBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBXSEVSRSBDYXNoUmVnaXN0ZXIuY2FzaEJveE51bWJlciUgMiBBTkQgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKChDYXNoUmVnaXN0ZXIudHJhbnNhY3Rpb25UaW1lIEJFVFdFRU4gJzAwOjAwOjAwJyBBTkQgJzA3OjAwOjAwJykgT1IgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChDYXNoUmVnaXN0ZXIudHJhbnNhY3Rpb25UaW1lIEJFVFdFRU4gJzIzOjAwOjAwJyBBTkQgJzIzOjU5OjU5JykpIEFORCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyZnRpbWUoJyV3JywgQ2FzaFJlZ2lzdGVyLnRyYW5zYWN0aW9uRGF0ZSkgPSAnMScpYDtcbiAgICBjb25zb2xlLmxvZyhzcWwpO1xuICAgIHRoaXMuZGIuZWFjaChzcWwsIChlcnI6IGFueSwgcm93OiBhbnkpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc29sZS5sb2cocGFyY2VDYXNoaWVyKHJvdykpO1xuICAgIH0pO1xuICB9XG59XG4iXX0=