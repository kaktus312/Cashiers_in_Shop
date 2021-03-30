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
            this.db.get(sql, (err, row) => {
                console.log(sql);
                if (err) {
                    console.log(err);
                    return;
                }
                if (row) {
                    addrID = row.ID;
                }
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
                        console.log(sql);
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
            console.log(`Информация о кассире с id= ${id} успешно удалена`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZGIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EscUNBQW1DO0FBQ25DLHFDQUVrQjtBQUNsQixtQ0FBbUQ7QUFHbkQsTUFBYSxNQUFNO0lBR2pCLFlBQVksTUFBYTtRQUN2QixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxrQkFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFLTSxLQUFLO1FBQ1YsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNoQixPQUFPLENBQUMsR0FBRyxDQUFDLDRCQUE0QixDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUtNLFVBQVUsQ0FBQyxPQUFnQjtRQUNoQyxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNoQixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNaLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEVBQUU7WUFDakMsSUFBSSxHQUFHLEdBQVU7O3dDQUVpQixhQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7MENBQ3JCLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTTs0Q0FDakIsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFROzBDQUN2QixPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU07NkNBQ2hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUM7WUFFbEUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBTyxFQUFFLEdBQU8sRUFBRSxFQUFFO2dCQUNwQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNqQixJQUFJLEdBQUcsRUFBRTtvQkFDUCxPQUFPLENBQUMsR0FBRyxDQUFD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RUFBRSxDQUFDLEdBQVEsRUFBRSxHQUFRLEVBQUUsRUFBRTtZQUN2QyxJQUFJLEdBQUcsRUFBRTtnQkFDUCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNqQixPQUFPO2FBQ1I7WUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNqQyxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFLTSxrQkFBa0I7UUFDdkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyw2SUFBNkksQ0FBQyxDQUFDO1FBQzNKLE1BQU0sR0FBRyxHQUFVOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRHQW1CcUYsQ0FBQztRQUN6RyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQVEsRUFBRSxHQUFRLEVBQUUsRUFBRTtZQUN2QyxJQUFJLEdBQUcsRUFBRTtnQkFDUCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNqQixPQUFPO2FBQ1I7WUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNqQyxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQXpWRCx3QkF5VkMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBtYWluIG1ldGhvZHMgKENSVUQpICsgZGIgY29ubmVjdGlvbjsgaW1wb3J0cyBzdHVmZiBmcm9tIG1vZGVscy50c1xuaW1wb3J0IHsgRGF0YWJhc2UgfSBmcm9tICdzcWxpdGUzJztcbmltcG9ydCB7XG4gIElDYXNoaWVyLCBOZXQsIFNleCwgQ2l0eSwgU3FsRmlsdGVyLFxufSBmcm9tICcuL21vZGVscyc7XG5pbXBvcnQgeyBkYXRlRm9ybWF0LCBwYXJjZUNhc2hpZXIgfSBmcm9tICcuL3V0aWxzJztcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9wcmVmZXItZGVmYXVsdC1leHBvcnRcbmV4cG9ydCBjbGFzcyBTaG9wREIge1xuICBwcml2YXRlIGRiOkRhdGFiYXNlO1xuXG4gIGNvbnN0cnVjdG9yKGRiUGF0aDpzdHJpbmcpIHtcbiAgICBjb25zb2xlLmxvZyhkYlBhdGgpO1xuICAgIHRoaXMuZGIgPSBuZXcgRGF0YWJhc2UoZGJQYXRoKTtcbiAgfVxuXG4gIC8qKlxuICAgICAgICogQ2xvc2Ugb3BlbmVkIERCXG4gICAgICAgKi9cbiAgcHVibGljIGNsb3NlKCk6dm9pZCB7XG4gICAgdGhpcy5kYi5jbG9zZSgpO1xuICAgIGNvbnNvbGUubG9nKCdEQiB3YXMgY2xvc2VkIHN1Y2Nlc3NmdWxseScpO1xuICB9XG5cbiAgLyoqXG4gICAgICAgKiBBZGQgYSBuZXcgQ2FzaGllciBpbiB0byB0aGUgREJcbiAgICAgICAqL1xuICBwdWJsaWMgYWRkQ2FzaGllcihjYXNoaWVyOklDYXNoaWVyKTpQcm9taXNlPG51bWJlcj4ge1xuICAgIGxldCBhZGRySUQgPSAtMTtcbiAgICBsZXQgaWQgPSAtMTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc3VsdCwgcmVqKSA9PiB7XG4gICAgICBsZXQgc3FsOnN0cmluZyA9IGBTRUxFQ1QgSURcbiAgICAgICAgICAgICAgICAgICAgICAgIEZST00gQWRkcmVzc1xuICAgICAgICAgICAgICAgICAgICAgICAgV0hFUkUgY2l0eSA9ICcke0NpdHlbY2FzaGllci5hZGRyLmNpdHldfScgQU5EIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyZWV0ID0gJyR7Y2FzaGllci5hZGRyLnN0cmVldH0nIEFORCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkaW5nID0gJyR7Y2FzaGllci5hZGRyLmJ1aWxkaW5nfScgQU5EXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXRlcmEgPSAnJHtjYXNoaWVyLmFkZHIubGl0ZXJhfScgQU5EIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBhcnRtZW50ID0gJyR7Y2FzaGllci5hZGRyLmFwYXJ0bWVudH0nO2A7XG5cbiAgICAgIHRoaXMuZGIuZ2V0KHNxbCwgKGVycjphbnksIHJvdzphbnkpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coc3FsKTtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyb3cpIHtcbiAgICAgICAgICBhZGRySUQgPSByb3cuSUQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coYGFkZHJJRCA9ICR7YWRkcklEfWApO1xuICAgICAgICBpZiAoYWRkcklEIDwgMCkge1xuICAgICAgICAgIHNxbCA9IGBJTlNFUlQgSU5UTyBBZGRyZXNzIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNpdHksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJlZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWlsZGluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpdGVyYSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwYXJ0bWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBWQUxVRVMgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyR7Q2l0eVtjYXNoaWVyLmFkZHIuY2l0eV19JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcke2Nhc2hpZXIuYWRkci5zdHJlZXR9JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcke2Nhc2hpZXIuYWRkci5idWlsZGluZ30nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyR7Y2FzaGllci5hZGRyLmxpdGVyYX0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyR7Y2FzaGllci5hZGRyLmFwYXJ0bWVudH0nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKWA7XG4gICAgICAgICAgdGhpcy5kYi5ydW4oc3FsLCAocmVzSW5zOmFueSwgZXJySW5zOmFueSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coc3FsKTtcbiAgICAgICAgICAgIGlmIChlcnJJbnMpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJySW5zKTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3FsID0gJ1NFTEVDVCBJRCBGUk9NIEFkZHJlc3MgV0hFUkUgcm93aWQgPSBsYXN0X2luc2VydF9yb3dpZCgpOyc7XG4gICAgICAgICAgICB0aGlzLmRiLmdldChzcWwsIChlcnI6YW55LCBhZGRySWRSb3c6bnVtYmVyKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKHNxbCk7XG4gICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBhZGRySUQgPSBhZGRySWRSb3c7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBuZXcgYWRkcklEID0gJHthZGRySUR9YCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBzcWwgPSBgSU5TRVJUIElOVE8gQ2FzaGllciAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZXJzb25uZWxOdW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdHJvbnltaWMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwaG9uZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZHJJRCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJpcnRoZGF5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvcElELFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRXb3JrLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdE5ldFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFZBTFVFUyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnJHtjYXNoaWVyLnBlcnNvbm5lbE51bWJlcn0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyR7Y2FzaGllci5lbXBsb3llZU5hbWUubGFzdE5hbWV9JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcke2Nhc2hpZXIuZW1wbG95ZWVOYW1lLmZpcnN0TmFtZX0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyR7Y2FzaGllci5lbXBsb3llZU5hbWUucGF0cm9ueW1pY30nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyR7Y2FzaGllci5zZXh9JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcke2Nhc2hpZXIucGhvbmV9JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcke2FkZHJJRH0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyR7ZGF0ZUZvcm1hdChjYXNoaWVyLmJpcnRoZGF5KX0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyR7Y2FzaGllci5zaG9wSUR9JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcke2RhdGVGb3JtYXQoY2FzaGllci5zdGFydFdvcmspfScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnJHtjYXNoaWVyLmxhc3ROZXR9J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApYDtcbiAgICAgICAgdGhpcy5kYi5ydW4oc3FsLCAoZXJyOmFueSwgcmVzOmFueSkgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKHNxbCk7XG4gICAgICAgICAgY29uc29sZS5sb2cocmVzKTtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zb2xlLmxvZyhg0JTQsNC90L3Ri9C1INC/0L4g0LrQsNGB0YHQuNGA0YMgJHtjYXNoaWVyLmVtcGxveWVlTmFtZS5sYXN0TmFtZX0g0YPRgdC/0LXRiNC90L4g0LTQvtCx0LDQstC70LXQvdGLYCk7XG4gICAgICAgICAgc3FsID0gYFNFTEVDVCAgaWQgXG4gICAgICAgICAgICAgICAgICAgIEZST00gQ2FzaGllciBcbiAgICAgICAgICAgICAgICAgICAgV0hFUkUgcm93aWQ9bGFzdF9pbnNlcnRfcm93aWQoKSBPUiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcGVyc29ubmVsTnVtYmVyID0gJyR7Y2FzaGllci5wZXJzb25uZWxOdW1iZXJ9J2A7XG4gICAgICAgICAgdGhpcy5kYi5nZXQoc3FsLCAoZXJyOmFueSwgcmVzOmFueSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coc3FsKTtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlcykge1xuICAgICAgICAgICAgICBpZCA9IHJlcy5pZDtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coYE5ldyBDYXNoaWVyJ3MgaWQgaXMgJHtpZH1gKTtcbiAgICAgICAgICAgICAgcmVzdWx0KGlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgICAgICogR2V0IGluZm9ybWF0aW9uIGFib3V0IGEgQ2FzaGllciBieSBJRFxuICAgICAgICovXG4gIHB1YmxpYyBnZXRDYXNoaWVyQnlJZChpZDpudW1iZXIpOlByb21pc2U8SUNhc2hpZXI+IHtcbiAgICBjb25zdCBzcWw6c3RyaW5nID0gYFNFTEVDVCBDYXNoaWVyLiosIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWRkcmVzcy5jaXR5LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3Muc3RyZWV0LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3MuYnVpbGRpbmcsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWRkcmVzcy5saXRlcmEsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWRkcmVzcy5hcGFydG1lbnQgXG4gICAgICAgICAgICAgICAgICAgICAgICBGUk9NICBDYXNoaWVyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3MgXG4gICAgICAgICAgICAgICAgICAgICAgICBXSEVSRSBDYXNoaWVyLmFkZHJJRCA9IEFkZHJlc3MuSUQgQU5EIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ2FzaGllci5pZD0ke2lkfTtgO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IHtcbiAgICAgIHRoaXMuZGIuZ2V0KHNxbCwgKGVycjogYW55LCByb3c6IGFueSkgPT4ge1xuICAgICAgICBpZiAocm93KSB7XG4gICAgICAgICAgY29uc3QgY2FzaGllcjpJQ2FzaGllciA9IHBhcmNlQ2FzaGllcihyb3cpO1xuICAgICAgICAgIHJlcyhjYXNoaWVyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhg0JTQsNC90L3Ri9C1INC+INC60LDRgdGB0LjRgNC1INGBIGlkICR7aWR9INC90LUg0L3QsNC50LTQtdC90YtgKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICAgICAqIFVwZGF0ZSBpbmZvcm1hdGlvbiBhYm91dCBhIENhc2hpZXJcbiAgICAgICAqL1xuICBwdWJsaWMgdXBkYXRlQ2FzaGllcihjYXNoaWVyOklDYXNoaWVyKTp2b2lkIHtcbiAgICBsZXQgc3FsOnN0cmluZyA9IGBTRUxFQ1QgYWRkcklEIFxuICAgICAgICAgICAgICAgICAgICAgICAgRlJPTSBDYXNoaWVyIFxuICAgICAgICAgICAgICAgICAgICAgICAgV0hFUkUgaWQ9JyR7Y2FzaGllci5pZH0nYDtcbiAgICB0aGlzLmRiLmdldChzcWwsIChlcnI6YW55LCBhZGRySWRSb3c6YW55KSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgIGNvbnNvbGUubG9nKHNxbCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUubG9nKGFkZHJJZFJvdyk7XG5cbiAgICAgIHNxbCA9IGBVUERBVEUgQWRkcmVzcyBcbiAgICAgICAgICAgICAgICBTRVQgY2l0eSA9ICcke0NpdHlbY2FzaGllci5hZGRyLmNpdHldfScsIFxuICAgICAgICAgICAgICAgICAgICBzdHJlZXQgPSAnJHtjYXNoaWVyLmFkZHIuc3RyZWV0fScsIFxuICAgICAgICAgICAgICAgICAgICBidWlsZGluZyA9ICcke2Nhc2hpZXIuYWRkci5idWlsZGluZ30nLCBcbiAgICAgICAgICAgICAgICAgICAgbGl0ZXJhID0gJyR7Y2FzaGllci5hZGRyLmxpdGVyYX0nLCBcbiAgICAgICAgICAgICAgICAgICAgYXBhcnRtZW50ID0gJyR7Y2FzaGllci5hZGRyLmFwYXJ0bWVudH0nIFxuICAgICAgICAgICAgICAgIFdIRVJFIGlkPSR7YWRkcklkUm93LmFkZHJJRH1gO1xuICAgICAgdGhpcy5kYi5nZXQoc3FsLCAoZXJyVXBkQWRkcjphbnksIHJlc1JvdzpudW1iZXIpID0+IHtcbiAgICAgICAgaWYgKGVyclVwZEFkZHIpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhlcnJVcGRBZGRyKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coc3FsKTtcblxuICAgICAgICBzcWwgPSBgVVBEQVRFIENhc2hpZXIgXG4gICAgICAgICAgICAgICAgICBTRVQgcGVyc29ubmVsTnVtYmVyID0gJyR7Y2FzaGllci5wZXJzb25uZWxOdW1iZXJ9JywgXG4gICAgICAgICAgICAgICAgICAgICAgbGFzdE5hbWUgPSAnJHtjYXNoaWVyLmVtcGxveWVlTmFtZS5sYXN0TmFtZX0nLCBcbiAgICAgICAgICAgICAgICAgICAgICBmaXJzdE5hbWUgPSAnJHtjYXNoaWVyLmVtcGxveWVlTmFtZS5maXJzdE5hbWV9JywgXG4gICAgICAgICAgICAgICAgICAgICAgcGF0cm9ueW1pYyA9ICcke2Nhc2hpZXIuZW1wbG95ZWVOYW1lLnBhdHJvbnltaWN9JywgXG4gICAgICAgICAgICAgICAgICAgICAgc2V4ID0gJyR7U2V4W2Nhc2hpZXIuc2V4XSBhcyB1bmtub3duIGFzIG51bWJlcn0nLCBcbiAgICAgICAgICAgICAgICAgICAgICBwaG9uZSA9ICcke2Nhc2hpZXIucGhvbmV9JywgXG4gICAgICAgICAgICAgICAgICAgICAgYWRkcklEID0gJyR7YWRkcklkUm93LmFkZHJJRH0nLCBcbiAgICAgICAgICAgICAgICAgICAgICBiaXJ0aGRheSA9ICcke2RhdGVGb3JtYXQoY2FzaGllci5iaXJ0aGRheSl9JywgXG4gICAgICAgICAgICAgICAgICAgICAgc2hvcElEID0gJyR7Y2FzaGllci5zaG9wSUR9JywgXG4gICAgICAgICAgICAgICAgICAgICAgc3RhcnRXb3JrID0gJyR7Y2FzaGllci5zdGFydFdvcmt9JywgXG4gICAgICAgICAgICAgICAgICAgICAgbGFzdE5ldCA9ICcke05ldFtjYXNoaWVyLmxhc3ROZXRdIGFzIHVua25vd24gYXMgbnVtYmVyfScgXG4gICAgICAgICAgICAgICAgV0hFUkUgaWQ9JyR7Y2FzaGllci5pZH0nYDtcbiAgICAgICAgY29uc29sZS5sb2coc3FsKTtcbiAgICAgICAgdGhpcy5kYi5ydW4oc3FsLCAocmVzVWRhdGU6YW55LCBlcnJVcGRhdGU6YW55KSA9PiB7XG4gICAgICAgICAgaWYgKGVyclVwZGF0ZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyVXBkYXRlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc29sZS5sb2coYNCU0LDQvdC90YvQtSDQutCw0YHRgdC40YDQsCAke2Nhc2hpZXIuZW1wbG95ZWVOYW1lLmxhc3ROYW1lfSDRg9GB0L/QtdGI0L3QviDQvtCx0L3QvtCy0LvQtdC90YtgKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgICAqIE1hcmsgc29tZSBDYXNoaWVyIGFzIGEgZGVsZXRlZCB3aXRob3V0IGRlbGV0aW5nIGZyb20gdGhlIERCXG4gICAgICovXG4gIHB1YmxpYyBkZWxDYXNoaWVyKGlkOm51bWJlcik6dm9pZCB7XG4gICAgY29uc3Qgc3FsID0gYFVQREFURSBDYXNoaWVyIFNFVCBkZWxldGVkID0gMSBXSEVSRSBpZD0nJHtpZH0nYDtcbiAgICB0aGlzLmRiLnJ1bihzcWwsIChyZXM6YW55LCBlcnI6YW55KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhzcWwpO1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zb2xlLmxvZyhg0JjQvdGE0L7RgNC80LDRhtC40Y8g0L4g0LrQsNGB0YHQuNGA0LUg0YEgaWQ9ICR7aWR9INGD0YHQv9C10YjQvdC+INGD0LTQsNC70LXQvdCwYCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICAgKiBEZWxldGUgYSBDYXNoaWVyIGZyb20gdGhlIERCXG4gICAgICovXG4gIHB1YmxpYyBjb21wbGV0RGVsZXRlQ2FzaGllcihpZDpudW1iZXIpOnZvaWQge1xuICAgIGNvbnN0IHNxbCA9IGBERUxFVEUgRlJPTSBDYXNoaWVyIFdIRVJFIGlkPScke2lkfSdgO1xuICAgIHRoaXMuZGIucnVuKHNxbCwgKHJlczphbnksIGVycjphbnkpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKHNxbCk7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUubG9nKGDQmNC90YTQvtGA0LzQsNGG0LjRjyDQviDQutCw0YHRgdC40YDQtSDRgSAke2lkfSDRg9GB0L/QtdGI0L3QviDRg9C00LDQu9C10L3QsGApO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBpbmZvcm1hdGlvbiBhYm91dCBhbGwgQ2FzaGllcnMgaW4gdGhlIFNob3BcbiAgICovXG4gIHB1YmxpYyBnZXRBbGxDYXNoaWVycygpOnZvaWQge1xuICAgIGNvbnN0IHNxbDpzdHJpbmcgPSBgU0VMRUNUIENhc2hpZXIuKiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWRkcmVzcy4qIFxuICAgICAgICAgICAgICAgICAgICAgICAgICBGUk9NIENhc2hpZXIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3MgXG4gICAgICAgICAgICAgICAgICAgICAgICAgV0hFUkUgQ2FzaGllci5hZGRySUQgPSBBZGRyZXNzLklEO2A7XG4gICAgY29uc29sZS5sb2coJ9CY0L3RhNC+0YDQvNCw0YbQuNGPINC+INCy0YHQtdGFINC60LDRgdGB0LjRgNCw0YU6Jyk7XG4gICAgdGhpcy5kYi5lYWNoKHNxbCwgKGVycjogYW55LCByb3c6IGFueSkgPT4ge1xuICAgICAgaWYgKHJvdykge1xuICAgICAgICBjb25zb2xlLmxvZyhwYXJjZUNhc2hpZXIocm93KSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGluZm9ybWF0aW9uIGFib3V0IGFsbCBDYXNoaWVycyBpbiB0aGUgU2hvcCBhY2NvcmRpbiBzb21lIGZpbHRlclxuICAgKi9cbiAgcHVibGljIGdldEFsbEZpbHRyZWRDYXNoaWVycyhmbDpTcWxGaWx0ZXIpOnZvaWQge1xuICAgIGxldCBmbHRyOnN0cmluZyA9IChmbC5maXJzdE5hbWUpID8gYCBBTkQgZmlyc3ROYW1lID0gJyR7ZmwuZmlyc3ROYW1lfSdgIDogJyc7XG4gICAgZmx0ciArPSAoZmwubGFzdE5hbWUpID8gYCBBTkQgbGFzdE5hbWUgPSAnJHtmbC5sYXN0TmFtZX0nYCA6ICcnO1xuICAgIGZsdHIgKz0gKGZsLnBob25lKSA/IGAgQU5EIHBob25lID0gJyR7ZmwucGhvbmV9J2AgOiAnJztcbiAgICBmbHRyICs9IChmbC5vcGVyYXRvcikgPyBgIEFORCBwaG9uZSBMSUtFICclJHtmbC5vcGVyYXRvcn0lJ2AgOiAnJztcbiAgICBmbHRyICs9IChmbC5zZXgpID8gYCBBTkQgc2V4ID0gJyR7Zmwuc2V4fSdgIDogJyc7XG4gICAgZmx0ciArPSAoZmwubGFzdE5ldCkgPyBgIEFORCBsYXN0TmV0ID0gJyR7ZmwubGFzdE5ldH0nYCA6ICcnO1xuICAgIGZsdHIgKz0gKGZsLmNpdHkpID8gYCBBTkQgQWRkcmVzcy5jaXR5ID0gJyR7Q2l0eVtmbC5jaXR5XX0nYCA6ICcnO1xuXG4gICAgY29uc3Qgc3FsOnN0cmluZyA9IGBTRUxFQ1QgQ2FzaGllci4qLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBZGRyZXNzLiogXG4gICAgICAgICAgICAgICAgICAgICAgICAgIEZST00gQ2FzaGllciwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWRkcmVzcyBcbiAgICAgICAgICAgICAgICAgICAgICAgICBXSEVSRSBDYXNoaWVyLmFkZHJJRCA9IEFkZHJlc3MuSURcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtmbHRyfTtgO1xuICAgIGNvbnNvbGUubG9nKCfQmNC90YTQvtGA0LzQsNGG0LjRjyDQviDQstGB0LXRhSDQutCw0YHRgdC40YDQsNGFINGB0L7Qs9C70LDRgdC90L4g0LfQsNC00LDQvdC90L7QvNGDINGE0LjQu9GM0YLRgNGDOicpO1xuICAgIGNvbnNvbGUubG9nKHNxbCk7XG4gICAgdGhpcy5kYi5lYWNoKHNxbCwgKGVycjogYW55LCByb3c6IGFueSkgPT4ge1xuICAgICAgaWYgKHJvdykge1xuICAgICAgICBjb25zb2xlLmxvZyhwYXJjZUNhc2hpZXIocm93KSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogZ2V0VGFyZ2V0Q2FzaGllcnMxXG4gICAqL1xuICBwdWJsaWMgZ2V0VGFyZ2V0Q2FzaGllcnMxKCk6dm9pZCB7XG4gICAgY29uc29sZS5sb2coJ9CU0LDQvWkg0L/QviDRg9GB0ZbRhSDQutCw0YHQuNGA0LDRhSDQvNCw0LPQsNC30LjQvdGDINC30LAg0LLRgdGOINGW0YHRgtC+0YDRltGOINGA0L7QsdC+0YLQuCDQvNCw0LPQsNC30LjQvdGW0LIgQVRCINGDINC80ZbRgdGC0ZYg0JvRjNCy0ZbQsiwg0Y/QutGWINC80LDRjtGC0Ywg0LHRltC70YzRiNC1IDUg0YDQvtC60ZbQsiDQtNC+0YHQstGW0LTRgyDRgtCwINGA0LDQvdGW0YjQtSDQv9GA0LDRhtGO0LLQsNC70Lgg0YMgU2lscG8g0LDQsdC+IEFyc2VuOicpO1xuICAgIGNvbnN0IHNxbDpzdHJpbmcgPSBgU0VMRUNUIENhc2hpZXIuKiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWRkcmVzcy4qIFxuICAgICAgICAgICAgICAgICAgICAgICAgICBGUk9NIENhc2hpZXIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3MgXG4gICAgICAgICAgICAgICAgICAgICAgICAgV0hFUkUgQ2FzaGllci5hZGRySUQgPSBBZGRyZXNzLklEIEFORFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENhc2hpZXIuc2hvcElEIElOIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU0VMRUNUIFNob3AuaWQgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRlJPTSBTaG9wLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3MgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBXSEVSRSBTaG9wLmFkZHJJRCA9IEFkZHJlc3MuSUQgQU5EIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWRkcmVzcy5DaXR5ID0gJyR7Q2l0eVtDaXR5LtCb0YzQstC+0LJdfScpIEFORCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENhc2hpZXIubGFzdE5ldCBJTiAoJHtOZXQu0KFp0LvRjNC/0L59ICwgJHtOZXQu0JDRgNGB0LXQvX0pIEFORCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENhc2hpZXIuc3RhcnRXb3JrPD0nMjAxNi0wMS0wMSdgO1xuICAgIGNvbnNvbGUubG9nKHNxbCk7XG4gICAgdGhpcy5kYi5lYWNoKHNxbCwgKGVycjogYW55LCByb3c6IGFueSkgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zb2xlLmxvZyhwYXJjZUNhc2hpZXIocm93KSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogZ2V0VGFyZ2V0Q2FzaGllcnMyXG4gICAqL1xuICBwdWJsaWMgZ2V0VGFyZ2V0Q2FzaGllcnMyKCk6dm9pZCB7XG4gICAgY29uc29sZS5sb2coJ9CU0LDQvWkg0L/QviDRg9GB0ZbRhSDQutCw0YHQuNGA0LDRhSDQvNCw0LPQsNC30LjQvdGDIEFUQiDQt9CwINCw0LTRgNC10YHQvtGOINCo0LXQstC10L3QutCwIDEwMCwg0Y/QutGWINC/0YDQsNGG0Y7RjtGC0Ywg0L3QsCDQutCw0YHQsNGFINC3INC90LXQv9Cw0YDQvdC40Lwg0YfQuNGB0LvQvtC8INGJ0L7Qv9C+0L3QtdC00ZbQu9C60LAg0YMg0L3RltGH0L3RgyDQt9C80ZbQvdGDICgyMzowMCAtIDA3OjAwKScpO1xuICAgIGNvbnN0IHNxbDpzdHJpbmcgPSBgU0VMRUNUIENhc2hpZXIuKiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWRkcmVzcy4qIFxuICAgICAgICAgICAgICAgICAgICAgICAgICBGUk9NIENhc2hpZXIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3MgXG4gICAgICAgICAgICAgICAgICAgICAgICAgV0hFUkUgQ2FzaGllci5hZGRySUQgPSBBZGRyZXNzLklEIEFORCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDYXNoaWVyLnNob3BJRCBJTiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNFTEVDVCBTaG9wLmlkIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEZST00gU2hvcCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBZGRyZXNzIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgV0hFUkUgU2hvcC5hZGRySUQgPSBBZGRyZXNzLklEIEFORCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3Muc3RyZWV0ID0gJ9GD0LsuINCo0LXQstGH0LXQvdC60L4nIEFORCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3MuYnVpbGRpbmcgPSAxMDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSBBTkQgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENhc2hpZXIuaWQgSU4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU0VMRUNUIENhc2hSZWdpc3Rlci5jYXNoaWVySUQgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEZST00gQ2FzaFJlZ2lzdGVyIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFdIRVJFIENhc2hSZWdpc3Rlci5jYXNoQm94TnVtYmVyJSAyIEFORCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKENhc2hSZWdpc3Rlci50cmFuc2FjdGlvblRpbWUgQkVUV0VFTiAnMDA6MDA6MDAnIEFORCAnMDc6MDA6MDAnKSBPUiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKENhc2hSZWdpc3Rlci50cmFuc2FjdGlvblRpbWUgQkVUV0VFTiAnMjM6MDA6MDAnIEFORCAnMjM6NTk6NTknKSkgQU5EIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJmdGltZSgnJXcnLCBDYXNoUmVnaXN0ZXIudHJhbnNhY3Rpb25EYXRlKSA9ICcxJylgO1xuICAgIGNvbnNvbGUubG9nKHNxbCk7XG4gICAgdGhpcy5kYi5lYWNoKHNxbCwgKGVycjogYW55LCByb3c6IGFueSkgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zb2xlLmxvZyhwYXJjZUNhc2hpZXIocm93KSk7XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==