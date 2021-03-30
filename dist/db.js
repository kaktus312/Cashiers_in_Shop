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
                    this.db.run(sql, (resIns, errIns) => {
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
                return;
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZGIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EscUNBQW1DO0FBQ25DLHFDQUVrQjtBQUNsQixtQ0FBbUQ7QUFHbkQsTUFBYSxNQUFNO0lBR2pCLFlBQVksTUFBYTtRQUV2QixJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksa0JBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBS00sS0FBSztRQUNWLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDaEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFLTSxVQUFVLENBQUMsT0FBZ0I7UUFDaEMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDaEIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDWixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFO1lBQ2pDLElBQUksR0FBRyxHQUFVOzt3Q0FFaUIsYUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDOzBDQUNyQixPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU07NENBQ2pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUTswQ0FDdkIsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNOzZDQUNoQixPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDO1lBRWxFLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQU8sRUFBRSxHQUFPLEVBQUUsRUFBRTtnQkFFcEMsSUFBSSxHQUFHLEVBQUU7b0JBQ1AsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDakIsT0FBTztpQkFDUjtnQkFDRCxJQUFJLEdBQUcsRUFBRTtvQkFDUCxNQUFNLEdBQUcsR0FBRyxDQUFDLEVB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QUNMLENBQUM7SUFLTSxrQkFBa0I7UUFDdkIsT0FBTyxDQUFDLEdBQUcsQ0FBQywwSkFBMEosQ0FBQyxDQUFDO1FBQ3hLLE1BQU0sR0FBRyxHQUFVOzs7Ozs7Ozs7OzJFQVVvRCxhQUFJLENBQUMsYUFBSSxDQUFDLEtBQUssQ0FBQzsrRUFDWixZQUFHLENBQUMsTUFBTSxNQUFNLFlBQUcsQ0FBQyxLQUFLO3lGQUNmLENBQUM7UUFFdEYsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBUSxFQUFFLEdBQVEsRUFBRSxFQUFFO1lBQ3ZDLElBQUksR0FBRyxFQUFFO2dCQUNQLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2pCLE9BQU87YUFDUjtZQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUtNLGtCQUFrQjtRQUN2QixPQUFPLENBQUMsR0FBRyxDQUFDLDZJQUE2SSxDQUFDLENBQUM7UUFDM0osTUFBTSxHQUFHLEdBQVU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7NEdBbUJxRixDQUFDO1FBRXpHLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQVEsRUFBRSxHQUFRLEVBQUUsRUFBRTtZQUN2QyxJQUFJLEdBQUcsRUFBRTtnQkFDUCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNqQixPQUFPO2FBQ1I7WUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNqQyxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQXpWRCx3QkF5VkMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBtYWluIG1ldGhvZHMgKENSVUQpICsgZGIgY29ubmVjdGlvbjsgaW1wb3J0cyBzdHVmZiBmcm9tIG1vZGVscy50c1xuaW1wb3J0IHsgRGF0YWJhc2UgfSBmcm9tICdzcWxpdGUzJztcbmltcG9ydCB7XG4gIElDYXNoaWVyLCBOZXQsIFNleCwgQ2l0eSwgU3FsRmlsdGVyLFxufSBmcm9tICcuL21vZGVscyc7XG5pbXBvcnQgeyBkYXRlRm9ybWF0LCBwYXJjZUNhc2hpZXIgfSBmcm9tICcuL3V0aWxzJztcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9wcmVmZXItZGVmYXVsdC1leHBvcnRcbmV4cG9ydCBjbGFzcyBTaG9wREIge1xuICBwcml2YXRlIGRiOkRhdGFiYXNlO1xuXG4gIGNvbnN0cnVjdG9yKGRiUGF0aDpzdHJpbmcpIHtcbiAgICAvLyBjb25zb2xlLmxvZyhkYlBhdGgpO1xuICAgIHRoaXMuZGIgPSBuZXcgRGF0YWJhc2UoZGJQYXRoKTtcbiAgfVxuXG4gIC8qKlxuICAgICAgICogQ2xvc2Ugb3BlbmVkIERCXG4gICAgICAgKi9cbiAgcHVibGljIGNsb3NlKCk6dm9pZCB7XG4gICAgdGhpcy5kYi5jbG9zZSgpO1xuICAgIGNvbnNvbGUubG9nKCdEQiB3YXMgY2xvc2VkIHN1Y2Nlc3NmdWxseScpO1xuICB9XG5cbiAgLyoqXG4gICAgICAgKiBBZGQgYSBuZXcgQ2FzaGllciBpbiB0byB0aGUgREJcbiAgICAgICAqL1xuICBwdWJsaWMgYWRkQ2FzaGllcihjYXNoaWVyOklDYXNoaWVyKTpQcm9taXNlPG51bWJlcj4ge1xuICAgIGxldCBhZGRySUQgPSAtMTtcbiAgICBsZXQgaWQgPSAtMTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc3VsdCwgcmVqKSA9PiB7XG4gICAgICBsZXQgc3FsOnN0cmluZyA9IGBTRUxFQ1QgSURcbiAgICAgICAgICAgICAgICAgICAgICAgIEZST00gQWRkcmVzc1xuICAgICAgICAgICAgICAgICAgICAgICAgV0hFUkUgY2l0eSA9ICcke0NpdHlbY2FzaGllci5hZGRyLmNpdHldfScgQU5EIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyZWV0ID0gJyR7Y2FzaGllci5hZGRyLnN0cmVldH0nIEFORCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkaW5nID0gJyR7Y2FzaGllci5hZGRyLmJ1aWxkaW5nfScgQU5EXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXRlcmEgPSAnJHtjYXNoaWVyLmFkZHIubGl0ZXJhfScgQU5EIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBhcnRtZW50ID0gJyR7Y2FzaGllci5hZGRyLmFwYXJ0bWVudH0nO2A7XG5cbiAgICAgIHRoaXMuZGIuZ2V0KHNxbCwgKGVycjphbnksIHJvdzphbnkpID0+IHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coc3FsKTtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyb3cpIHtcbiAgICAgICAgICBhZGRySUQgPSByb3cuSUQ7XG4gICAgICAgIH1cbiAgICAgICAgLy8gY29uc29sZS5sb2coYGFkZHJJRCA9ICR7YWRkcklEfWApO1xuICAgICAgICBpZiAoYWRkcklEIDwgMCkge1xuICAgICAgICAgIHNxbCA9IGBJTlNFUlQgSU5UTyBBZGRyZXNzIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNpdHksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJlZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWlsZGluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpdGVyYSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwYXJ0bWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBWQUxVRVMgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyR7Q2l0eVtjYXNoaWVyLmFkZHIuY2l0eV19JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcke2Nhc2hpZXIuYWRkci5zdHJlZXR9JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcke2Nhc2hpZXIuYWRkci5idWlsZGluZ30nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyR7Y2FzaGllci5hZGRyLmxpdGVyYX0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyR7Y2FzaGllci5hZGRyLmFwYXJ0bWVudH0nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKWA7XG4gICAgICAgICAgdGhpcy5kYi5ydW4oc3FsLCAocmVzSW5zOmFueSwgZXJySW5zOmFueSkgPT4ge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coc3FsKTtcbiAgICAgICAgICAgIGlmIChlcnJJbnMpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJySW5zKTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3FsID0gJ1NFTEVDVCBJRCBGUk9NIEFkZHJlc3MgV0hFUkUgcm93aWQgPSBsYXN0X2luc2VydF9yb3dpZCgpOyc7XG4gICAgICAgICAgICB0aGlzLmRiLmdldChzcWwsIChlcnI6YW55LCBhZGRySWRSb3c6bnVtYmVyKSA9PiB7XG4gICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHNxbCk7XG4gICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBhZGRySUQgPSBhZGRySWRSb3c7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBuZXcgYWRkcklEID0gJHthZGRySUR9YCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBzcWwgPSBgSU5TRVJUIElOVE8gQ2FzaGllciAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZXJzb25uZWxOdW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdHJvbnltaWMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwaG9uZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZHJJRCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJpcnRoZGF5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvcElELFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRXb3JrLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdE5ldFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFZBTFVFUyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnJHtjYXNoaWVyLnBlcnNvbm5lbE51bWJlcn0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyR7Y2FzaGllci5lbXBsb3llZU5hbWUubGFzdE5hbWV9JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcke2Nhc2hpZXIuZW1wbG95ZWVOYW1lLmZpcnN0TmFtZX0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyR7Y2FzaGllci5lbXBsb3llZU5hbWUucGF0cm9ueW1pY30nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyR7Y2FzaGllci5zZXh9JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcke2Nhc2hpZXIucGhvbmV9JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcke2FkZHJJRH0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyR7ZGF0ZUZvcm1hdChjYXNoaWVyLmJpcnRoZGF5KX0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyR7Y2FzaGllci5zaG9wSUR9JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcke2RhdGVGb3JtYXQoY2FzaGllci5zdGFydFdvcmspfScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnJHtjYXNoaWVyLmxhc3ROZXR9J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApYDtcbiAgICAgICAgdGhpcy5kYi5ydW4oc3FsLCAoZXJyOmFueSwgcmVzOmFueSkgPT4ge1xuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHNxbCk7XG4gICAgICAgICAgLy8gY29uc29sZS5sb2cocmVzKTtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zb2xlLmxvZyhg0JTQsNC90L3Ri9C1INC/0L4g0LrQsNGB0YHQuNGA0YMgJHtjYXNoaWVyLmVtcGxveWVlTmFtZS5sYXN0TmFtZX0g0YPRgdC/0LXRiNC90L4g0LTQvtCx0LDQstC70LXQvdGLYCk7XG4gICAgICAgICAgc3FsID0gYFNFTEVDVCAgaWQgXG4gICAgICAgICAgICAgICAgICAgIEZST00gQ2FzaGllciBcbiAgICAgICAgICAgICAgICAgICAgV0hFUkUgcm93aWQ9bGFzdF9pbnNlcnRfcm93aWQoKSBPUiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcGVyc29ubmVsTnVtYmVyID0gJyR7Y2FzaGllci5wZXJzb25uZWxOdW1iZXJ9J2A7XG4gICAgICAgICAgdGhpcy5kYi5nZXQoc3FsLCAoZXJyOmFueSwgcmVzOmFueSkgPT4ge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coc3FsKTtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlcykge1xuICAgICAgICAgICAgICBpZCA9IHJlcy5pZDtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coYE5ldyBDYXNoaWVyJ3MgaWQgaXMgJHtpZH1gKTtcbiAgICAgICAgICAgICAgcmVzdWx0KGlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgICAgICogR2V0IGluZm9ybWF0aW9uIGFib3V0IGEgQ2FzaGllciBieSBJRFxuICAgICAgICovXG4gIHB1YmxpYyBnZXRDYXNoaWVyQnlJZChpZDpudW1iZXIpOlByb21pc2U8SUNhc2hpZXI+IHtcbiAgICBjb25zdCBzcWw6c3RyaW5nID0gYFNFTEVDVCBDYXNoaWVyLiosIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWRkcmVzcy5jaXR5LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3Muc3RyZWV0LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3MuYnVpbGRpbmcsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWRkcmVzcy5saXRlcmEsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWRkcmVzcy5hcGFydG1lbnQgXG4gICAgICAgICAgICAgICAgICAgICAgICBGUk9NICBDYXNoaWVyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3MgXG4gICAgICAgICAgICAgICAgICAgICAgICBXSEVSRSBDYXNoaWVyLmFkZHJJRCA9IEFkZHJlc3MuSUQgQU5EIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ2FzaGllci5pZD0ke2lkfTtgO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IHtcbiAgICAgIHRoaXMuZGIuZ2V0KHNxbCwgKGVycjogYW55LCByb3c6IGFueSkgPT4ge1xuICAgICAgICBpZiAocm93KSB7XG4gICAgICAgICAgY29uc3QgY2FzaGllcjpJQ2FzaGllciA9IHBhcmNlQ2FzaGllcihyb3cpO1xuICAgICAgICAgIHJlcyhjYXNoaWVyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhg0JTQsNC90L3Ri9C1INC+INC60LDRgdGB0LjRgNC1INGBIGlkICR7aWR9INC90LUg0L3QsNC50LTQtdC90YtgKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICAgICAqIFVwZGF0ZSBpbmZvcm1hdGlvbiBhYm91dCBhIENhc2hpZXJcbiAgICAgICAqL1xuICBwdWJsaWMgdXBkYXRlQ2FzaGllcihjYXNoaWVyOklDYXNoaWVyKTp2b2lkIHtcbiAgICBsZXQgc3FsOnN0cmluZyA9IGBTRUxFQ1QgYWRkcklEIFxuICAgICAgICAgICAgICAgICAgICAgICAgRlJPTSBDYXNoaWVyIFxuICAgICAgICAgICAgICAgICAgICAgICAgV0hFUkUgaWQ9JyR7Y2FzaGllci5pZH0nYDtcbiAgICB0aGlzLmRiLmdldChzcWwsIChlcnI6YW55LCBhZGRySWRSb3c6YW55KSA9PiB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhzcWwpO1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBjb25zb2xlLmxvZyhhZGRySWRSb3cpO1xuXG4gICAgICBzcWwgPSBgVVBEQVRFIEFkZHJlc3MgXG4gICAgICAgICAgICAgICAgU0VUIGNpdHkgPSAnJHtDaXR5W2Nhc2hpZXIuYWRkci5jaXR5XX0nLCBcbiAgICAgICAgICAgICAgICAgICAgc3RyZWV0ID0gJyR7Y2FzaGllci5hZGRyLnN0cmVldH0nLCBcbiAgICAgICAgICAgICAgICAgICAgYnVpbGRpbmcgPSAnJHtjYXNoaWVyLmFkZHIuYnVpbGRpbmd9JywgXG4gICAgICAgICAgICAgICAgICAgIGxpdGVyYSA9ICcke2Nhc2hpZXIuYWRkci5saXRlcmF9JywgXG4gICAgICAgICAgICAgICAgICAgIGFwYXJ0bWVudCA9ICcke2Nhc2hpZXIuYWRkci5hcGFydG1lbnR9JyBcbiAgICAgICAgICAgICAgICBXSEVSRSBpZD0ke2FkZHJJZFJvdy5hZGRySUR9YDtcbiAgICAgIHRoaXMuZGIuZ2V0KHNxbCwgKGVyclVwZEFkZHI6YW55LCByZXNSb3c6bnVtYmVyKSA9PiB7XG4gICAgICAgIGlmIChlcnJVcGRBZGRyKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coZXJyVXBkQWRkcik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHNxbCk7XG5cbiAgICAgICAgc3FsID0gYFVQREFURSBDYXNoaWVyIFxuICAgICAgICAgICAgICAgICAgU0VUIHBlcnNvbm5lbE51bWJlciA9ICcke2Nhc2hpZXIucGVyc29ubmVsTnVtYmVyfScsIFxuICAgICAgICAgICAgICAgICAgICAgIGxhc3ROYW1lID0gJyR7Y2FzaGllci5lbXBsb3llZU5hbWUubGFzdE5hbWV9JywgXG4gICAgICAgICAgICAgICAgICAgICAgZmlyc3ROYW1lID0gJyR7Y2FzaGllci5lbXBsb3llZU5hbWUuZmlyc3ROYW1lfScsIFxuICAgICAgICAgICAgICAgICAgICAgIHBhdHJvbnltaWMgPSAnJHtjYXNoaWVyLmVtcGxveWVlTmFtZS5wYXRyb255bWljfScsIFxuICAgICAgICAgICAgICAgICAgICAgIHNleCA9ICcke1NleFtjYXNoaWVyLnNleF0gYXMgdW5rbm93biBhcyBudW1iZXJ9JywgXG4gICAgICAgICAgICAgICAgICAgICAgcGhvbmUgPSAnJHtjYXNoaWVyLnBob25lfScsIFxuICAgICAgICAgICAgICAgICAgICAgIGFkZHJJRCA9ICcke2FkZHJJZFJvdy5hZGRySUR9JywgXG4gICAgICAgICAgICAgICAgICAgICAgYmlydGhkYXkgPSAnJHtkYXRlRm9ybWF0KGNhc2hpZXIuYmlydGhkYXkpfScsIFxuICAgICAgICAgICAgICAgICAgICAgIHNob3BJRCA9ICcke2Nhc2hpZXIuc2hvcElEfScsIFxuICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0V29yayA9ICcke2Nhc2hpZXIuc3RhcnRXb3JrfScsIFxuICAgICAgICAgICAgICAgICAgICAgIGxhc3ROZXQgPSAnJHtOZXRbY2FzaGllci5sYXN0TmV0XSBhcyB1bmtub3duIGFzIG51bWJlcn0nIFxuICAgICAgICAgICAgICAgIFdIRVJFIGlkPScke2Nhc2hpZXIuaWR9J2A7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHNxbCk7XG4gICAgICAgIHRoaXMuZGIucnVuKHNxbCwgKHJlc1VkYXRlOmFueSwgZXJyVXBkYXRlOmFueSkgPT4ge1xuICAgICAgICAgIGlmIChlcnJVcGRhdGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVyclVwZGF0ZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnNvbGUubG9nKGDQlNCw0L3QvdGL0LUg0LrQsNGB0YHQuNGA0LAgJHtjYXNoaWVyLmVtcGxveWVlTmFtZS5sYXN0TmFtZX0g0YPRgdC/0LXRiNC90L4g0L7QsdC90L7QstC70LXQvdGLYCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICAgKiBNYXJrIHNvbWUgQ2FzaGllciBhcyBhIGRlbGV0ZWQgd2l0aG91dCBkZWxldGluZyBmcm9tIHRoZSBEQlxuICAgICAqL1xuICBwdWJsaWMgZGVsQ2FzaGllcihpZDpudW1iZXIpOnZvaWQge1xuICAgIGNvbnN0IHNxbCA9IGBVUERBVEUgQ2FzaGllciBTRVQgZGVsZXRlZCA9IDEgV0hFUkUgaWQ9JyR7aWR9J2A7XG4gICAgdGhpcy5kYi5ydW4oc3FsLCAocmVzOmFueSwgZXJyOmFueSkgPT4ge1xuICAgICAgLy8gY29uc29sZS5sb2coc3FsKTtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc29sZS5sb2coYNCY0L3RhNC+0YDQvNCw0YbQuNGPINC+INC60LDRgdGB0LjRgNC1INGBIGlkPSAke2lkfSDRg9GB0L/QtdGI0L3QviDRg9C00LDQu9C10L3QsGApO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAgICogRGVsZXRlIGEgQ2FzaGllciBmcm9tIHRoZSBEQlxuICAgICAqL1xuICBwdWJsaWMgY29tcGxldERlbGV0ZUNhc2hpZXIoaWQ6bnVtYmVyKTp2b2lkIHtcbiAgICBjb25zdCBzcWwgPSBgREVMRVRFIEZST00gQ2FzaGllciBXSEVSRSBpZD0nJHtpZH0nYDtcbiAgICB0aGlzLmRiLnJ1bihzcWwsIChyZXM6YW55LCBlcnI6YW55KSA9PiB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhzcWwpO1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zb2xlLmxvZyhg0JjQvdGE0L7RgNC80LDRhtC40Y8g0L4g0LrQsNGB0YHQuNGA0LUg0YEgJHtpZH0g0YPRgdC/0LXRiNC90L4g0YPQtNCw0LvQtdC90LBgKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgaW5mb3JtYXRpb24gYWJvdXQgYWxsIENhc2hpZXJzIGluIHRoZSBTaG9wXG4gICAqL1xuICBwdWJsaWMgZ2V0QWxsQ2FzaGllcnMoKTp2b2lkIHtcbiAgICBjb25zdCBzcWw6c3RyaW5nID0gYFNFTEVDVCBDYXNoaWVyLiosIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3MuKiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgRlJPTSBDYXNoaWVyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBZGRyZXNzIFxuICAgICAgICAgICAgICAgICAgICAgICAgIFdIRVJFIENhc2hpZXIuYWRkcklEID0gQWRkcmVzcy5JRDtgO1xuICAgIGNvbnNvbGUubG9nKCfQmNC90YTQvtGA0LzQsNGG0LjRjyDQviDQstGB0LXRhSDQutCw0YHRgdC40YDQsNGFOicpO1xuICAgIHRoaXMuZGIuZWFjaChzcWwsIChlcnI6IGFueSwgcm93OiBhbnkpID0+IHtcbiAgICAgIGlmIChyb3cpIHtcbiAgICAgICAgY29uc29sZS5sb2cocGFyY2VDYXNoaWVyKHJvdykpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBpbmZvcm1hdGlvbiBhYm91dCBhbGwgQ2FzaGllcnMgaW4gdGhlIFNob3AgYWNjb3JkaW4gc29tZSBmaWx0ZXJcbiAgICovXG4gIHB1YmxpYyBnZXRBbGxGaWx0cmVkQ2FzaGllcnMoZmw6U3FsRmlsdGVyKTp2b2lkIHtcbiAgICBsZXQgZmx0cjpzdHJpbmcgPSAoZmwuZmlyc3ROYW1lKSA/IGAgQU5EIGZpcnN0TmFtZSA9ICcke2ZsLmZpcnN0TmFtZX0nYCA6ICcnO1xuICAgIGZsdHIgKz0gKGZsLmxhc3ROYW1lKSA/IGAgQU5EIGxhc3ROYW1lID0gJyR7ZmwubGFzdE5hbWV9J2AgOiAnJztcbiAgICBmbHRyICs9IChmbC5waG9uZSkgPyBgIEFORCBwaG9uZSA9ICcke2ZsLnBob25lfSdgIDogJyc7XG4gICAgZmx0ciArPSAoZmwub3BlcmF0b3IpID8gYCBBTkQgcGhvbmUgTElLRSAnJSR7Zmwub3BlcmF0b3J9JSdgIDogJyc7XG4gICAgZmx0ciArPSAoZmwuc2V4KSA/IGAgQU5EIHNleCA9ICcke2ZsLnNleH0nYCA6ICcnO1xuICAgIGZsdHIgKz0gKGZsLmxhc3ROZXQpID8gYCBBTkQgbGFzdE5ldCA9ICcke2ZsLmxhc3ROZXR9J2AgOiAnJztcbiAgICBmbHRyICs9IChmbC5jaXR5KSA/IGAgQU5EIEFkZHJlc3MuY2l0eSA9ICcke0NpdHlbZmwuY2l0eV19J2AgOiAnJztcblxuICAgIGNvbnN0IHNxbDpzdHJpbmcgPSBgU0VMRUNUIENhc2hpZXIuKiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWRkcmVzcy4qIFxuICAgICAgICAgICAgICAgICAgICAgICAgICBGUk9NIENhc2hpZXIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3MgXG4gICAgICAgICAgICAgICAgICAgICAgICAgV0hFUkUgQ2FzaGllci5hZGRySUQgPSBBZGRyZXNzLklEXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7Zmx0cn07YDtcbiAgICBjb25zb2xlLmxvZygn0JjQvdGE0L7RgNC80LDRhtC40Y8g0L4g0LLRgdC10YUg0LrQsNGB0YHQuNGA0LDRhSDRgdC+0LPQu9Cw0YHQvdC+INC30LDQtNCw0L3QvdC+0LzRgyDRhNC40LvRjNGC0YDRgzonKTtcbiAgICAvLyBjb25zb2xlLmxvZyhzcWwpO1xuICAgIHRoaXMuZGIuZWFjaChzcWwsIChlcnI6IGFueSwgcm93OiBhbnkpID0+IHtcbiAgICAgIGlmIChyb3cpIHtcbiAgICAgICAgY29uc29sZS5sb2cocGFyY2VDYXNoaWVyKHJvdykpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIGdldFRhcmdldENhc2hpZXJzMVxuICAgKi9cbiAgcHVibGljIGdldFRhcmdldENhc2hpZXJzMSgpOnZvaWQge1xuICAgIGNvbnNvbGUubG9nKCfQlNCw0L1pINC/0L4g0YPRgdGW0YUg0LrQsNGB0LjRgNCw0YUg0LzQsNCz0LDQt9C40L3RgyDQt9CwINCy0YHRjiDRltGB0YLQvtGA0ZbRjiDRgNC+0LHQvtGC0Lgg0LzQsNCz0LDQt9C40L3RltCyIEFUQiDRgyDQvNGW0YHRgtGWINCb0YzQstGW0LIsINGP0LrRliDQvNCw0Y7RgtGMINCx0ZbQu9GM0YjQtSA1INGA0L7QutGW0LIg0LTQvtGB0LLRltC00YMg0YLQsCDRgNCw0L3RltGI0LUg0L/RgNCw0YbRjtCy0LDQu9C4INGDIFNpbHBvINCw0LHQviBBcnNlbjonKTtcbiAgICBjb25zdCBzcWw6c3RyaW5nID0gYFNFTEVDVCBDYXNoaWVyLiosIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3MuKiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgRlJPTSBDYXNoaWVyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBZGRyZXNzIFxuICAgICAgICAgICAgICAgICAgICAgICAgIFdIRVJFIENhc2hpZXIuYWRkcklEID0gQWRkcmVzcy5JRCBBTkRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDYXNoaWVyLnNob3BJRCBJTiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNFTEVDVCBTaG9wLmlkIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEZST00gU2hvcCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBZGRyZXNzIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgV0hFUkUgU2hvcC5hZGRySUQgPSBBZGRyZXNzLklEIEFORCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3MuQ2l0eSA9ICcke0NpdHlbQ2l0eS7Qm9GM0LLQvtCyXX0nKSBBTkQgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDYXNoaWVyLmxhc3ROZXQgSU4gKCR7TmV0LtChadC70YzQv9C+fSAsICR7TmV0LtCQ0YDRgdC10L19KSBBTkQgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDYXNoaWVyLnN0YXJ0V29yazw9JzIwMTYtMDEtMDEnYDtcbiAgICAvLyBjb25zb2xlLmxvZyhzcWwpO1xuICAgIHRoaXMuZGIuZWFjaChzcWwsIChlcnI6IGFueSwgcm93OiBhbnkpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc29sZS5sb2cocGFyY2VDYXNoaWVyKHJvdykpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIGdldFRhcmdldENhc2hpZXJzMlxuICAgKi9cbiAgcHVibGljIGdldFRhcmdldENhc2hpZXJzMigpOnZvaWQge1xuICAgIGNvbnNvbGUubG9nKCfQlNCw0L1pINC/0L4g0YPRgdGW0YUg0LrQsNGB0LjRgNCw0YUg0LzQsNCz0LDQt9C40L3RgyBBVEIg0LfQsCDQsNC00YDQtdGB0L7RjiDQqNC10LLQtdC90LrQsCAxMDAsINGP0LrRliDQv9GA0LDRhtGO0Y7RgtGMINC90LAg0LrQsNGB0LDRhSDQtyDQvdC10L/QsNGA0L3QuNC8INGH0LjRgdC70L7QvCDRidC+0L/QvtC90LXQtNGW0LvQutCwINGDINC90ZbRh9C90YMg0LfQvNGW0L3RgyAoMjM6MDAgLSAwNzowMCknKTtcbiAgICBjb25zdCBzcWw6c3RyaW5nID0gYFNFTEVDVCBDYXNoaWVyLiosIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3MuKiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgRlJPTSBDYXNoaWVyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBZGRyZXNzIFxuICAgICAgICAgICAgICAgICAgICAgICAgIFdIRVJFIENhc2hpZXIuYWRkcklEID0gQWRkcmVzcy5JRCBBTkQgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ2FzaGllci5zaG9wSUQgSU4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTRUxFQ1QgU2hvcC5pZCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBGUk9NIFNob3AsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWRkcmVzcyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFdIRVJFIFNob3AuYWRkcklEID0gQWRkcmVzcy5JRCBBTkQgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBZGRyZXNzLnN0cmVldCA9ICfRg9C7LiDQqNC10LLRh9C10L3QutC+JyBBTkQgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBZGRyZXNzLmJ1aWxkaW5nID0gMTAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgQU5EIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDYXNoaWVyLmlkIElOIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNFTEVDVCBDYXNoUmVnaXN0ZXIuY2FzaGllcklEIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBGUk9NIENhc2hSZWdpc3RlciBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBXSEVSRSBDYXNoUmVnaXN0ZXIuY2FzaEJveE51bWJlciUgMiBBTkQgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKChDYXNoUmVnaXN0ZXIudHJhbnNhY3Rpb25UaW1lIEJFVFdFRU4gJzAwOjAwOjAwJyBBTkQgJzA3OjAwOjAwJykgT1IgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChDYXNoUmVnaXN0ZXIudHJhbnNhY3Rpb25UaW1lIEJFVFdFRU4gJzIzOjAwOjAwJyBBTkQgJzIzOjU5OjU5JykpIEFORCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyZnRpbWUoJyV3JywgQ2FzaFJlZ2lzdGVyLnRyYW5zYWN0aW9uRGF0ZSkgPSAnMScpYDtcbiAgICAvLyBjb25zb2xlLmxvZyhzcWwpO1xuICAgIHRoaXMuZGIuZWFjaChzcWwsIChlcnI6IGFueSwgcm93OiBhbnkpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc29sZS5sb2cocGFyY2VDYXNoaWVyKHJvdykpO1xuICAgIH0pO1xuICB9XG59XG4iXX0=