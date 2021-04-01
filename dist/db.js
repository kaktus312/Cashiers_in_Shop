"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopDB = void 0;
const sqlite3_1 = require("sqlite3");
const models_1 = require("./models");
const utils_1 = require("./utils");
class ShopDB {
    constructor(dbPath) {
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
            this.db.get(sql, (err, row) => {
                if (err) {
                    console.log(err);
                    return;
                }
                if (row) {
                    addrID = row.ID;
                }
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
                    this.db.run(sql, (errIns) => {
                        if (errIns) {
                            console.log(errIns);
                            return;
                        }
                        sql = 'SELECT ID FROM Address WHERE rowid = last_insert_rowid();';
                        this.db.get(sql, (err, addrIdRow) => {
                            if (err) {
                                console.log(err);
                                return;
                            }
                            addrID = addrIdRow.ID;
                            const newCashierID = this.cashierInsert(cashier, addrID);
                            newCashierID.then((val) => {
                                id = val;
                                result(id);
                            });
                        });
                    });
                }
                else {
                    const newCashierID = this.cashierInsert(cashier, addrID);
                    newCashierID.then((val) => {
                        id = val;
                        result(id);
                    });
                }
            });
        });
    }
    cashierInsert(cashier, addrID) {
        let newCashierID = -1;
        return new Promise((reslt) => {
            let sql = `INSERT INTO Cashier (
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
            this.db.run(sql, (res, err) => {
                if (err) {
                    console.log(err);
                    return;
                }
                sql = `SELECT  id 
                 FROM Cashier 
                WHERE personnelNumber = '${cashier.personnelNumber}'`;
                this.db.get(sql, (errSel, resSel) => {
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
                else {
                    console.log(`Данные о кассире с id ${id} не найдены`);
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
                return;
            }
            sql = `UPDATE Address 
                SET city = '${cashier.addr.city}', 
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
            if (err) {
                console.log(err);
                return;
            }
            console.log(`Информация о кассире с id= ${id} успешно удалена`);
        });
    }
    completDeleteCashier(id) {
        const sql = `DELETE FROM Cashier WHERE id='${id}'`;
        this.db.run(sql, (res, err) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZGIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EscUNBQW1DO0FBQ25DLHFDQUVrQjtBQUNsQixtQ0FBbUQ7QUFHbkQsTUFBYSxNQUFNO0lBR2pCLFlBQVksTUFBYTtRQUV2QixJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksa0JBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBS00sS0FBSztRQUNWLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDaEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFLTSxVQUFVLENBQUMsT0FBZ0I7UUFDaEMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDaEIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDWixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFO1lBQ2pDLElBQUksR0FBRyxHQUFVOzt3Q0FFaUIsYUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDOzBDQUNyQixPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU07NENBQ2pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUTswQ0FDdkIsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNOzZDQUNoQixPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDO1lBRWxFLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQU8sRUFBRSxHQUFPLEVBQUUsRUFBRTtnQkFFcEMsSUFBSSxHQUFHLEVBQUU7b0JBQ1AsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDakIsT0FBTztpQkFDUjtnQkFDRCxJQUFJLEdBQUcsRUFBRTtvQkFDUCxNQUFNLEdBQUcsR0FBRyxDQUFDLEVB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QUtNLGtCQUFrQjtRQUN2QixPQUFPLENBQUMsR0FBRyxDQUFDLDZJQUE2SSxDQUFDLENBQUM7UUFDM0osTUFBTSxHQUFHLEdBQVU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7NEdBbUJxRixDQUFDO1FBRXpHLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQVEsRUFBRSxHQUFRLEVBQUUsRUFBRTtZQUN2QyxJQUFJLEdBQUcsRUFBRTtnQkFDUCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNqQixPQUFPO2FBQ1I7WUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNqQyxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQXpXRCx3QkF5V0MiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBtYWluIG1ldGhvZHMgKENSVUQpICsgZGIgY29ubmVjdGlvbjsgaW1wb3J0cyBzdHVmZiBmcm9tIG1vZGVscy50c1xuaW1wb3J0IHsgRGF0YWJhc2UgfSBmcm9tICdzcWxpdGUzJztcbmltcG9ydCB7XG4gIElDYXNoaWVyLCBOZXQsIFNleCwgQ2l0eSwgU3FsRmlsdGVyLFxufSBmcm9tICcuL21vZGVscyc7XG5pbXBvcnQgeyBkYXRlRm9ybWF0LCBwYXJjZUNhc2hpZXIgfSBmcm9tICcuL3V0aWxzJztcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9wcmVmZXItZGVmYXVsdC1leHBvcnRcbmV4cG9ydCBjbGFzcyBTaG9wREIge1xuICBwcml2YXRlIGRiOkRhdGFiYXNlO1xuXG4gIGNvbnN0cnVjdG9yKGRiUGF0aDpzdHJpbmcpIHtcbiAgICAvLyBjb25zb2xlLmxvZyhkYlBhdGgpO1xuICAgIHRoaXMuZGIgPSBuZXcgRGF0YWJhc2UoZGJQYXRoKTtcbiAgfVxuXG4gIC8qKlxuICAgICAgICogQ2xvc2Ugb3BlbmVkIERCXG4gICAgICAgKi9cbiAgcHVibGljIGNsb3NlKCk6dm9pZCB7XG4gICAgdGhpcy5kYi5jbG9zZSgpO1xuICAgIGNvbnNvbGUubG9nKCdEQiB3YXMgY2xvc2VkIHN1Y2Nlc3NmdWxseScpO1xuICB9XG5cbiAgLyoqXG4gICAgICAgKiBBZGQgYSBuZXcgQ2FzaGllciBpbiB0byB0aGUgREJcbiAgICAgICAqL1xuICBwdWJsaWMgYWRkQ2FzaGllcihjYXNoaWVyOklDYXNoaWVyKTpQcm9taXNlPG51bWJlcj4ge1xuICAgIGxldCBhZGRySUQgPSAtMTtcbiAgICBsZXQgaWQgPSAtMTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc3VsdCwgcmVqKSA9PiB7XG4gICAgICBsZXQgc3FsOnN0cmluZyA9IGBTRUxFQ1QgSURcbiAgICAgICAgICAgICAgICAgICAgICAgIEZST00gQWRkcmVzc1xuICAgICAgICAgICAgICAgICAgICAgICAgV0hFUkUgY2l0eSA9ICcke0NpdHlbY2FzaGllci5hZGRyLmNpdHldfScgQU5EIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyZWV0ID0gJyR7Y2FzaGllci5hZGRyLnN0cmVldH0nIEFORCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkaW5nID0gJyR7Y2FzaGllci5hZGRyLmJ1aWxkaW5nfScgQU5EXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXRlcmEgPSAnJHtjYXNoaWVyLmFkZHIubGl0ZXJhfScgQU5EIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBhcnRtZW50ID0gJyR7Y2FzaGllci5hZGRyLmFwYXJ0bWVudH0nO2A7XG5cbiAgICAgIHRoaXMuZGIuZ2V0KHNxbCwgKGVycjphbnksIHJvdzphbnkpID0+IHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coc3FsKTtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyb3cpIHtcbiAgICAgICAgICBhZGRySUQgPSByb3cuSUQ7XG4gICAgICAgIH1cbiAgICAgICAgLy8gY29uc29sZS5sb2coYGFkZHJJRCA9ICR7YWRkcklEfWApO1xuICAgICAgICBpZiAoYWRkcklEIDwgMCkge1xuICAgICAgICAgIHNxbCA9IGBJTlNFUlQgSU5UTyBBZGRyZXNzIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNpdHksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJlZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWlsZGluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpdGVyYSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwYXJ0bWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBWQUxVRVMgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyR7Q2l0eVtjYXNoaWVyLmFkZHIuY2l0eV19JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcke2Nhc2hpZXIuYWRkci5zdHJlZXR9JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcke2Nhc2hpZXIuYWRkci5idWlsZGluZ30nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyR7Y2FzaGllci5hZGRyLmxpdGVyYX0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyR7Y2FzaGllci5hZGRyLmFwYXJ0bWVudH0nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKWA7XG4gICAgICAgICAgdGhpcy5kYi5ydW4oc3FsLCAoZXJySW5zOmFueSkgPT4ge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coc3FsKTtcbiAgICAgICAgICAgIGlmIChlcnJJbnMpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJySW5zKTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3FsID0gJ1NFTEVDVCBJRCBGUk9NIEFkZHJlc3MgV0hFUkUgcm93aWQgPSBsYXN0X2luc2VydF9yb3dpZCgpOyc7XG4gICAgICAgICAgICB0aGlzLmRiLmdldChzcWwsIChlcnI6YW55LCBhZGRySWRSb3c6YW55KSA9PiB7XG4gICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHNxbCk7XG4gICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBhZGRySUQgPSBhZGRySWRSb3cuSUQ7XG4gICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGBuZXcgYWRkcklEID0gJHthZGRySUR9YCk7XG4gICAgICAgICAgICAgIGNvbnN0IG5ld0Nhc2hpZXJJRDpQcm9taXNlPG51bWJlcj4gPSB0aGlzLmNhc2hpZXJJbnNlcnQoY2FzaGllciwgYWRkcklEKTtcbiAgICAgICAgICAgICAgbmV3Q2FzaGllcklELnRoZW4oKHZhbCkgPT4ge1xuICAgICAgICAgICAgICAgIGlkID0gdmFsO1xuICAgICAgICAgICAgICAgIHJlc3VsdChpZCk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgbmV3Q2FzaGllcklEOlByb21pc2U8bnVtYmVyPiA9IHRoaXMuY2FzaGllckluc2VydChjYXNoaWVyLCBhZGRySUQpO1xuICAgICAgICAgIG5ld0Nhc2hpZXJJRC50aGVuKCh2YWwpID0+IHtcbiAgICAgICAgICAgIGlkID0gdmFsO1xuICAgICAgICAgICAgcmVzdWx0KGlkKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGNhc2hpZXJJbnNlcnQoY2FzaGllcjogSUNhc2hpZXIsIGFkZHJJRDpudW1iZXIpOlByb21pc2U8bnVtYmVyPiB7XG4gICAgbGV0IG5ld0Nhc2hpZXJJRCA9IC0xO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzbHQpID0+IHtcbiAgICAgIGxldCBzcWw6c3RyaW5nID0gYElOU0VSVCBJTlRPIENhc2hpZXIgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGVyc29ubmVsTnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdE5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdE5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRyb255bWljLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V4LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGhvbmUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRySUQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiaXJ0aGRheSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3BJRCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0V29yayxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3ROZXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBWQUxVRVMgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyR7Y2FzaGllci5wZXJzb25uZWxOdW1iZXJ9JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcke2Nhc2hpZXIuZW1wbG95ZWVOYW1lLmxhc3ROYW1lfScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnJHtjYXNoaWVyLmVtcGxveWVlTmFtZS5maXJzdE5hbWV9JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcke2Nhc2hpZXIuZW1wbG95ZWVOYW1lLnBhdHJvbnltaWN9JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcke2Nhc2hpZXIuc2V4fScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnJHtjYXNoaWVyLnBob25lfScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnJHthZGRySUR9JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcke2RhdGVGb3JtYXQoY2FzaGllci5iaXJ0aGRheSl9JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcke2Nhc2hpZXIuc2hvcElEfScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnJHtkYXRlRm9ybWF0KGNhc2hpZXIuc3RhcnRXb3JrKX0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyR7Y2FzaGllci5sYXN0TmV0fSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKWA7XG4gICAgICB0aGlzLmRiLnJ1bihzcWwsIChyZXM6YW55LCBlcnI6YW55KSA9PiB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHNxbCk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHJlcyk7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzcWwgPSBgU0VMRUNUICBpZCBcbiAgICAgICAgICAgICAgICAgRlJPTSBDYXNoaWVyIFxuICAgICAgICAgICAgICAgIFdIRVJFIHBlcnNvbm5lbE51bWJlciA9ICcke2Nhc2hpZXIucGVyc29ubmVsTnVtYmVyfSdgO1xuICAgICAgICB0aGlzLmRiLmdldChzcWwsIChlcnJTZWw6YW55LCByZXNTZWw6YW55KSA9PiB7XG4gICAgICAgICAgLy8gY29uc29sZS5sb2coc3FsKTtcbiAgICAgICAgICBpZiAoZXJyU2VsKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJTZWwpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAocmVzU2VsKSB7XG4gICAgICAgICAgICBuZXdDYXNoaWVySUQgPSByZXNTZWwuaWQ7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgTmV3IENhc2hpZXIncyBpZCBpcyAke25ld0Nhc2hpZXJJRH1gKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGDQlNCw0L3QvdGL0LUg0L/QviDQutCw0YHRgdC40YDRgyAke2Nhc2hpZXIuZW1wbG95ZWVOYW1lLmxhc3ROYW1lfSDRg9GB0L/QtdGI0L3QviDQtNC+0LHQsNCy0LvQtdC90YtgKTtcbiAgICAgICAgICAgIHJlc2x0KG5ld0Nhc2hpZXJJRCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAgICAgKiBHZXQgaW5mb3JtYXRpb24gYWJvdXQgYSBDYXNoaWVyIGJ5IElEXG4gICAgICAgKi9cbiAgcHVibGljIGdldENhc2hpZXJCeUlkKGlkOm51bWJlcik6UHJvbWlzZTxJQ2FzaGllcj4ge1xuICAgIGNvbnN0IHNxbDpzdHJpbmcgPSBgU0VMRUNUIENhc2hpZXIuKiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBZGRyZXNzLmNpdHksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWRkcmVzcy5zdHJlZXQsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWRkcmVzcy5idWlsZGluZywgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBZGRyZXNzLmxpdGVyYSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBZGRyZXNzLmFwYXJ0bWVudCBcbiAgICAgICAgICAgICAgICAgICAgICAgIEZST00gIENhc2hpZXIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWRkcmVzcyBcbiAgICAgICAgICAgICAgICAgICAgICAgIFdIRVJFIENhc2hpZXIuYWRkcklEID0gQWRkcmVzcy5JRCBBTkQgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDYXNoaWVyLmlkPSR7aWR9O2A7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXMsIHJlaikgPT4ge1xuICAgICAgdGhpcy5kYi5nZXQoc3FsLCAoZXJyOiBhbnksIHJvdzogYW55KSA9PiB7XG4gICAgICAgIGlmIChyb3cpIHtcbiAgICAgICAgICBjb25zdCBjYXNoaWVyOklDYXNoaWVyID0gcGFyY2VDYXNoaWVyKHJvdyk7XG4gICAgICAgICAgcmVzKGNhc2hpZXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGDQlNCw0L3QvdGL0LUg0L4g0LrQsNGB0YHQuNGA0LUg0YEgaWQgJHtpZH0g0L3QtSDQvdCw0LnQtNC10L3Ri2ApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgICAgICogVXBkYXRlIGluZm9ybWF0aW9uIGFib3V0IGEgQ2FzaGllclxuICAgICAgICovXG4gIHB1YmxpYyB1cGRhdGVDYXNoaWVyKGNhc2hpZXI6SUNhc2hpZXIpOnZvaWQge1xuICAgIGxldCBzcWw6c3RyaW5nID0gYFNFTEVDVCBhZGRySUQgXG4gICAgICAgICAgICAgICAgICAgICAgICBGUk9NIENhc2hpZXIgXG4gICAgICAgICAgICAgICAgICAgICAgICBXSEVSRSBpZD0nJHtjYXNoaWVyLmlkfSdgO1xuICAgIHRoaXMuZGIuZ2V0KHNxbCwgKGVycjphbnksIGFkZHJJZFJvdzphbnkpID0+IHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKHNxbCk7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIGNvbnNvbGUubG9nKGFkZHJJZFJvdyk7XG5cbiAgICAgIHNxbCA9IGBVUERBVEUgQWRkcmVzcyBcbiAgICAgICAgICAgICAgICBTRVQgY2l0eSA9ICcke2Nhc2hpZXIuYWRkci5jaXR5fScsIFxuICAgICAgICAgICAgICAgICAgICBzdHJlZXQgPSAnJHtjYXNoaWVyLmFkZHIuc3RyZWV0fScsIFxuICAgICAgICAgICAgICAgICAgICBidWlsZGluZyA9ICcke2Nhc2hpZXIuYWRkci5idWlsZGluZ30nLCBcbiAgICAgICAgICAgICAgICAgICAgbGl0ZXJhID0gJyR7Y2FzaGllci5hZGRyLmxpdGVyYX0nLCBcbiAgICAgICAgICAgICAgICAgICAgYXBhcnRtZW50ID0gJyR7Y2FzaGllci5hZGRyLmFwYXJ0bWVudH0nIFxuICAgICAgICAgICAgICAgIFdIRVJFIGlkPSR7YWRkcklkUm93LmFkZHJJRH1gO1xuICAgICAgdGhpcy5kYi5nZXQoc3FsLCAoZXJyVXBkQWRkcjphbnksIHJlc1JvdzpudW1iZXIpID0+IHtcbiAgICAgICAgaWYgKGVyclVwZEFkZHIpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhlcnJVcGRBZGRyKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gY29uc29sZS5sb2coc3FsKTtcblxuICAgICAgICBzcWwgPSBgVVBEQVRFIENhc2hpZXIgXG4gICAgICAgICAgICAgICAgICBTRVQgcGVyc29ubmVsTnVtYmVyID0gJyR7Y2FzaGllci5wZXJzb25uZWxOdW1iZXJ9JywgXG4gICAgICAgICAgICAgICAgICAgICAgbGFzdE5hbWUgPSAnJHtjYXNoaWVyLmVtcGxveWVlTmFtZS5sYXN0TmFtZX0nLCBcbiAgICAgICAgICAgICAgICAgICAgICBmaXJzdE5hbWUgPSAnJHtjYXNoaWVyLmVtcGxveWVlTmFtZS5maXJzdE5hbWV9JywgXG4gICAgICAgICAgICAgICAgICAgICAgcGF0cm9ueW1pYyA9ICcke2Nhc2hpZXIuZW1wbG95ZWVOYW1lLnBhdHJvbnltaWN9JywgXG4gICAgICAgICAgICAgICAgICAgICAgc2V4ID0gJyR7U2V4W2Nhc2hpZXIuc2V4XSBhcyB1bmtub3duIGFzIG51bWJlcn0nLCBcbiAgICAgICAgICAgICAgICAgICAgICBwaG9uZSA9ICcke2Nhc2hpZXIucGhvbmV9JywgXG4gICAgICAgICAgICAgICAgICAgICAgYWRkcklEID0gJyR7YWRkcklkUm93LmFkZHJJRH0nLCBcbiAgICAgICAgICAgICAgICAgICAgICBiaXJ0aGRheSA9ICcke2RhdGVGb3JtYXQoY2FzaGllci5iaXJ0aGRheSl9JywgXG4gICAgICAgICAgICAgICAgICAgICAgc2hvcElEID0gJyR7Y2FzaGllci5zaG9wSUR9JywgXG4gICAgICAgICAgICAgICAgICAgICAgc3RhcnRXb3JrID0gJyR7Y2FzaGllci5zdGFydFdvcmt9JywgXG4gICAgICAgICAgICAgICAgICAgICAgbGFzdE5ldCA9ICcke05ldFtjYXNoaWVyLmxhc3ROZXRdIGFzIHVua25vd24gYXMgbnVtYmVyfScgXG4gICAgICAgICAgICAgICAgV0hFUkUgaWQ9JyR7Y2FzaGllci5pZH0nYDtcbiAgICAgICAgLy8gY29uc29sZS5sb2coc3FsKTtcbiAgICAgICAgdGhpcy5kYi5ydW4oc3FsLCAocmVzVWRhdGU6YW55LCBlcnJVcGRhdGU6YW55KSA9PiB7XG4gICAgICAgICAgaWYgKGVyclVwZGF0ZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyVXBkYXRlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc29sZS5sb2coYNCU0LDQvdC90YvQtSDQutCw0YHRgdC40YDQsCAke2Nhc2hpZXIuZW1wbG95ZWVOYW1lLmxhc3ROYW1lfSDRg9GB0L/QtdGI0L3QviDQvtCx0L3QvtCy0LvQtdC90YtgKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgICAqIE1hcmsgc29tZSBDYXNoaWVyIGFzIGEgZGVsZXRlZCB3aXRob3V0IGRlbGV0aW5nIGZyb20gdGhlIERCXG4gICAgICovXG4gIHB1YmxpYyBkZWxDYXNoaWVyKGlkOm51bWJlcik6dm9pZCB7XG4gICAgY29uc3Qgc3FsID0gYFVQREFURSBDYXNoaWVyIFNFVCBkZWxldGVkID0gMSBXSEVSRSBpZD0nJHtpZH0nYDtcbiAgICB0aGlzLmRiLnJ1bihzcWwsIChyZXM6YW55LCBlcnI6YW55KSA9PiB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhzcWwpO1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zb2xlLmxvZyhg0JjQvdGE0L7RgNC80LDRhtC40Y8g0L4g0LrQsNGB0YHQuNGA0LUg0YEgaWQ9ICR7aWR9INGD0YHQv9C10YjQvdC+INGD0LTQsNC70LXQvdCwYCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICAgKiBEZWxldGUgYSBDYXNoaWVyIGZyb20gdGhlIERCXG4gICAgICovXG4gIHB1YmxpYyBjb21wbGV0RGVsZXRlQ2FzaGllcihpZDpudW1iZXIpOnZvaWQge1xuICAgIGNvbnN0IHNxbCA9IGBERUxFVEUgRlJPTSBDYXNoaWVyIFdIRVJFIGlkPScke2lkfSdgO1xuICAgIHRoaXMuZGIucnVuKHNxbCwgKHJlczphbnksIGVycjphbnkpID0+IHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKHNxbCk7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUubG9nKGDQmNC90YTQvtGA0LzQsNGG0LjRjyDQviDQutCw0YHRgdC40YDQtSDRgSAke2lkfSDRg9GB0L/QtdGI0L3QviDRg9C00LDQu9C10L3QsGApO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBpbmZvcm1hdGlvbiBhYm91dCBhbGwgQ2FzaGllcnMgaW4gdGhlIFNob3BcbiAgICovXG4gIHB1YmxpYyBnZXRBbGxDYXNoaWVycygpOnZvaWQge1xuICAgIGNvbnN0IHNxbDpzdHJpbmcgPSBgU0VMRUNUIENhc2hpZXIuKiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWRkcmVzcy4qIFxuICAgICAgICAgICAgICAgICAgICAgICAgICBGUk9NIENhc2hpZXIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3MgXG4gICAgICAgICAgICAgICAgICAgICAgICAgV0hFUkUgQ2FzaGllci5hZGRySUQgPSBBZGRyZXNzLklEO2A7XG4gICAgY29uc29sZS5sb2coJ9CY0L3RhNC+0YDQvNCw0YbQuNGPINC+INCy0YHQtdGFINC60LDRgdGB0LjRgNCw0YU6Jyk7XG4gICAgdGhpcy5kYi5lYWNoKHNxbCwgKGVycjogYW55LCByb3c6IGFueSkgPT4ge1xuICAgICAgaWYgKHJvdykge1xuICAgICAgICBjb25zb2xlLmxvZyhwYXJjZUNhc2hpZXIocm93KSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGluZm9ybWF0aW9uIGFib3V0IGFsbCBDYXNoaWVycyBpbiB0aGUgU2hvcCBhY2NvcmRpbiBzb21lIGZpbHRlclxuICAgKi9cbiAgcHVibGljIGdldEFsbEZpbHRyZWRDYXNoaWVycyhmbDpTcWxGaWx0ZXIpOnZvaWQge1xuICAgIGxldCBmbHRyOnN0cmluZyA9IChmbC5maXJzdE5hbWUpID8gYCBBTkQgZmlyc3ROYW1lID0gJyR7ZmwuZmlyc3ROYW1lfSdgIDogJyc7XG4gICAgZmx0ciArPSAoZmwubGFzdE5hbWUpID8gYCBBTkQgbGFzdE5hbWUgPSAnJHtmbC5sYXN0TmFtZX0nYCA6ICcnO1xuICAgIGZsdHIgKz0gKGZsLnBob25lKSA/IGAgQU5EIHBob25lID0gJyR7ZmwucGhvbmV9J2AgOiAnJztcbiAgICBmbHRyICs9IChmbC5vcGVyYXRvcikgPyBgIEFORCBwaG9uZSBMSUtFICclJHtmbC5vcGVyYXRvcn0lJ2AgOiAnJztcbiAgICBmbHRyICs9IChmbC5zZXgpID8gYCBBTkQgc2V4ID0gJyR7Zmwuc2V4fSdgIDogJyc7XG4gICAgZmx0ciArPSAoZmwubGFzdE5ldCkgPyBgIEFORCBsYXN0TmV0ID0gJyR7ZmwubGFzdE5ldH0nYCA6ICcnO1xuICAgIGZsdHIgKz0gKGZsLmNpdHkpID8gYCBBTkQgQWRkcmVzcy5jaXR5ID0gJyR7Q2l0eVtmbC5jaXR5XX0nYCA6ICcnO1xuXG4gICAgY29uc3Qgc3FsOnN0cmluZyA9IGBTRUxFQ1QgQ2FzaGllci4qLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBZGRyZXNzLiogXG4gICAgICAgICAgICAgICAgICAgICAgICAgIEZST00gQ2FzaGllciwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWRkcmVzcyBcbiAgICAgICAgICAgICAgICAgICAgICAgICBXSEVSRSBDYXNoaWVyLmFkZHJJRCA9IEFkZHJlc3MuSURcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtmbHRyfTtgO1xuICAgIGNvbnNvbGUubG9nKCfQmNC90YTQvtGA0LzQsNGG0LjRjyDQviDQstGB0LXRhSDQutCw0YHRgdC40YDQsNGFINGB0L7Qs9C70LDRgdC90L4g0LfQsNC00LDQvdC90L7QvNGDINGE0LjQu9GM0YLRgNGDOicpO1xuICAgIC8vIGNvbnNvbGUubG9nKHNxbCk7XG4gICAgdGhpcy5kYi5lYWNoKHNxbCwgKGVycjogYW55LCByb3c6IGFueSkgPT4ge1xuICAgICAgaWYgKHJvdykge1xuICAgICAgICBjb25zb2xlLmxvZyhwYXJjZUNhc2hpZXIocm93KSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogZ2V0VGFyZ2V0Q2FzaGllcnMxXG4gICAqL1xuICBwdWJsaWMgZ2V0VGFyZ2V0Q2FzaGllcnMxKCk6dm9pZCB7XG4gICAgY29uc29sZS5sb2coJ9CU0LDQvWkg0L/QviDRg9GB0ZbRhSDQutCw0YHQuNGA0LDRhSDQvNCw0LPQsNC30LjQvdGDINC30LAg0LLRgdGOINGW0YHRgtC+0YDRltGOINGA0L7QsdC+0YLQuCDQvNCw0LPQsNC30LjQvdGW0LIgQVRCINGDINC80ZbRgdGC0ZYg0JvRjNCy0ZbQsiwg0Y/QutGWINC80LDRjtGC0Ywg0LHRltC70YzRiNC1IDUg0YDQvtC60ZbQsiDQtNC+0YHQstGW0LTRgyDRgtCwINGA0LDQvdGW0YjQtSDQv9GA0LDRhtGO0LLQsNC70Lgg0YMgU2lscG8g0LDQsdC+IEFyc2VuOicpO1xuICAgIGNvbnN0IHNxbDpzdHJpbmcgPSBgU0VMRUNUIENhc2hpZXIuKiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWRkcmVzcy4qIFxuICAgICAgICAgICAgICAgICAgICAgICAgICBGUk9NIENhc2hpZXIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3MgXG4gICAgICAgICAgICAgICAgICAgICAgICAgV0hFUkUgQ2FzaGllci5hZGRySUQgPSBBZGRyZXNzLklEIEFORFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENhc2hpZXIuc2hvcElEIElOIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU0VMRUNUIFNob3AuaWQgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRlJPTSBTaG9wLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3MgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBXSEVSRSBTaG9wLmFkZHJJRCA9IEFkZHJlc3MuSUQgQU5EIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWRkcmVzcy5DaXR5ID0gJyR7Q2l0eVtDaXR5LtCb0YzQstC+0LJdfScpIEFORCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENhc2hpZXIubGFzdE5ldCBJTiAoJHtOZXQu0KFp0LvRjNC/0L59ICwgJHtOZXQu0JDRgNGB0LXQvX0pIEFORCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENhc2hpZXIuc3RhcnRXb3JrPD0nMjAxNi0wMS0wMSdgO1xuICAgIC8vIGNvbnNvbGUubG9nKHNxbCk7XG4gICAgdGhpcy5kYi5lYWNoKHNxbCwgKGVycjogYW55LCByb3c6IGFueSkgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zb2xlLmxvZyhwYXJjZUNhc2hpZXIocm93KSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogZ2V0VGFyZ2V0Q2FzaGllcnMyXG4gICAqL1xuICBwdWJsaWMgZ2V0VGFyZ2V0Q2FzaGllcnMyKCk6dm9pZCB7XG4gICAgY29uc29sZS5sb2coJ9CU0LDQvWkg0L/QviDRg9GB0ZbRhSDQutCw0YHQuNGA0LDRhSDQvNCw0LPQsNC30LjQvdGDIEFUQiDQt9CwINCw0LTRgNC10YHQvtGOINCo0LXQstC10L3QutCwIDEwMCwg0Y/QutGWINC/0YDQsNGG0Y7RjtGC0Ywg0L3QsCDQutCw0YHQsNGFINC3INC90LXQv9Cw0YDQvdC40Lwg0YfQuNGB0LvQvtC8INGJ0L7Qv9C+0L3QtdC00ZbQu9C60LAg0YMg0L3RltGH0L3RgyDQt9C80ZbQvdGDICgyMzowMCAtIDA3OjAwKScpO1xuICAgIGNvbnN0IHNxbDpzdHJpbmcgPSBgU0VMRUNUIENhc2hpZXIuKiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWRkcmVzcy4qIFxuICAgICAgICAgICAgICAgICAgICAgICAgICBGUk9NIENhc2hpZXIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3MgXG4gICAgICAgICAgICAgICAgICAgICAgICAgV0hFUkUgQ2FzaGllci5hZGRySUQgPSBBZGRyZXNzLklEIEFORCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDYXNoaWVyLnNob3BJRCBJTiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNFTEVDVCBTaG9wLmlkIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEZST00gU2hvcCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBZGRyZXNzIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgV0hFUkUgU2hvcC5hZGRySUQgPSBBZGRyZXNzLklEIEFORCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3Muc3RyZWV0ID0gJ9GD0LsuINCo0LXQstGH0LXQvdC60L4nIEFORCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3MuYnVpbGRpbmcgPSAxMDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSBBTkQgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENhc2hpZXIuaWQgSU4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU0VMRUNUIENhc2hSZWdpc3Rlci5jYXNoaWVySUQgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEZST00gQ2FzaFJlZ2lzdGVyIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFdIRVJFIENhc2hSZWdpc3Rlci5jYXNoQm94TnVtYmVyJSAyIEFORCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKENhc2hSZWdpc3Rlci50cmFuc2FjdGlvblRpbWUgQkVUV0VFTiAnMDA6MDA6MDAnIEFORCAnMDc6MDA6MDAnKSBPUiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKENhc2hSZWdpc3Rlci50cmFuc2FjdGlvblRpbWUgQkVUV0VFTiAnMjM6MDA6MDAnIEFORCAnMjM6NTk6NTknKSkgQU5EIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJmdGltZSgnJXcnLCBDYXNoUmVnaXN0ZXIudHJhbnNhY3Rpb25EYXRlKSA9ICcxJylgO1xuICAgIC8vIGNvbnNvbGUubG9nKHNxbCk7XG4gICAgdGhpcy5kYi5lYWNoKHNxbCwgKGVycjogYW55LCByb3c6IGFueSkgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zb2xlLmxvZyhwYXJjZUNhc2hpZXIocm93KSk7XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==