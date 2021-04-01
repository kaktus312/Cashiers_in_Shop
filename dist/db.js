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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZGIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EscUNBQW1DO0FBQ25DLHFDQUVrQjtBQUNsQixtQ0FBbUQ7QUFHbkQsTUFBYSxNQUFNO0lBR2pCLFlBQVksTUFBYTtRQUV2QixJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksa0JBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBS00sS0FBSztRQUNWLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDaEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFLTSxVQUFVLENBQUMsT0FBZ0I7UUFDaEMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDaEIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDWixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFO1lBQ2pDLElBQUksR0FBRyxHQUFVOzt3Q0FFaUIsYUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDOzBDQUNyQixPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU07NENBQ2pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUTswQ0FDdkIsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNOzZDQUNoQixPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDO1lBRWxFLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQU8sRUFBRSxHQUFPLEVBQUUsRUFBRTtnQkFFcEMsSUFBSSxHQUFHLEVBQUU7b0JBQ1AsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDakIsT0FBTztpQkFDUjtnQkFDRCxJQUFJLEdBQUcsRUFBRTtvQkFDUCxNQUFNLEdBQUcsR0FBRyxDQUFDLEVB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Q0FBQztJQUNMLENBQUM7SUFLTSxrQkFBa0I7UUFDdkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyw2SUFBNkksQ0FBQyxDQUFDO1FBQzNKLE1BQU0sR0FBRyxHQUFVOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRHQW1CcUYsQ0FBQztRQUV6RyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFRLEVBQUUsR0FBUSxFQUFFLEVBQUU7WUFDdkMsSUFBSSxHQUFHLEVBQUU7Z0JBQ1AsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDakIsT0FBTzthQUNSO1lBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDakMsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUF6V0Qsd0JBeVdDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gbWFpbiBtZXRob2RzIChDUlVEKSArIGRiIGNvbm5lY3Rpb247IGltcG9ydHMgc3R1ZmYgZnJvbSBtb2RlbHMudHNcbmltcG9ydCB7IERhdGFiYXNlIH0gZnJvbSAnc3FsaXRlMyc7XG5pbXBvcnQge1xuICBJQ2FzaGllciwgTmV0LCBTZXgsIENpdHksIFNxbEZpbHRlcixcbn0gZnJvbSAnLi9tb2RlbHMnO1xuaW1wb3J0IHsgZGF0ZUZvcm1hdCwgcGFyY2VDYXNoaWVyIH0gZnJvbSAnLi91dGlscyc7XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvcHJlZmVyLWRlZmF1bHQtZXhwb3J0XG5leHBvcnQgY2xhc3MgU2hvcERCIHtcbiAgcHJpdmF0ZSBkYjpEYXRhYmFzZTtcblxuICBjb25zdHJ1Y3RvcihkYlBhdGg6c3RyaW5nKSB7XG4gICAgLy8gY29uc29sZS5sb2coZGJQYXRoKTtcbiAgICB0aGlzLmRiID0gbmV3IERhdGFiYXNlKGRiUGF0aCk7XG4gIH1cblxuICAvKipcbiAgICAgICAqIENsb3NlIG9wZW5lZCBEQlxuICAgICAgICovXG4gIHB1YmxpYyBjbG9zZSgpOnZvaWQge1xuICAgIHRoaXMuZGIuY2xvc2UoKTtcbiAgICBjb25zb2xlLmxvZygnREIgd2FzIGNsb3NlZCBzdWNjZXNzZnVsbHknKTtcbiAgfVxuXG4gIC8qKlxuICAgICAgICogQWRkIGEgbmV3IENhc2hpZXIgaW4gdG8gdGhlIERCXG4gICAgICAgKi9cbiAgcHVibGljIGFkZENhc2hpZXIoY2FzaGllcjpJQ2FzaGllcik6UHJvbWlzZTxudW1iZXI+IHtcbiAgICBsZXQgYWRkcklEID0gLTE7XG4gICAgbGV0IGlkID0gLTE7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXN1bHQsIHJlaikgPT4ge1xuICAgICAgbGV0IHNxbDpzdHJpbmcgPSBgU0VMRUNUIElEXG4gICAgICAgICAgICAgICAgICAgICAgICBGUk9NIEFkZHJlc3NcbiAgICAgICAgICAgICAgICAgICAgICAgIFdIRVJFIGNpdHkgPSAnJHtDaXR5W2Nhc2hpZXIuYWRkci5jaXR5XX0nIEFORCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0cmVldCA9ICcke2Nhc2hpZXIuYWRkci5zdHJlZXR9JyBBTkQgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWlsZGluZyA9ICcke2Nhc2hpZXIuYWRkci5idWlsZGluZ30nIEFORFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGl0ZXJhID0gJyR7Y2FzaGllci5hZGRyLmxpdGVyYX0nIEFORCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwYXJ0bWVudCA9ICcke2Nhc2hpZXIuYWRkci5hcGFydG1lbnR9JztgO1xuXG4gICAgICB0aGlzLmRiLmdldChzcWwsIChlcnI6YW55LCByb3c6YW55KSA9PiB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHNxbCk7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAocm93KSB7XG4gICAgICAgICAgYWRkcklEID0gcm93LklEO1xuICAgICAgICB9XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGBhZGRySUQgPSAke2FkZHJJRH1gKTtcbiAgICAgICAgaWYgKGFkZHJJRCA8IDApIHtcbiAgICAgICAgICBzcWwgPSBgSU5TRVJUIElOVE8gQWRkcmVzcyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaXR5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyZWV0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGRpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXRlcmEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcGFydG1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVkFMVUVTIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcke0NpdHlbY2FzaGllci5hZGRyLmNpdHldfScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnJHtjYXNoaWVyLmFkZHIuc3RyZWV0fScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnJHtjYXNoaWVyLmFkZHIuYnVpbGRpbmd9JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcke2Nhc2hpZXIuYWRkci5saXRlcmF9JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcke2Nhc2hpZXIuYWRkci5hcGFydG1lbnR9J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClgO1xuICAgICAgICAgIHRoaXMuZGIucnVuKHNxbCwgKGVyckluczphbnkpID0+IHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHNxbCk7XG4gICAgICAgICAgICBpZiAoZXJySW5zKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycklucyk7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNxbCA9ICdTRUxFQ1QgSUQgRlJPTSBBZGRyZXNzIFdIRVJFIHJvd2lkID0gbGFzdF9pbnNlcnRfcm93aWQoKTsnO1xuICAgICAgICAgICAgdGhpcy5kYi5nZXQoc3FsLCAoZXJyOmFueSwgYWRkcklkUm93OmFueSkgPT4ge1xuICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhzcWwpO1xuICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYWRkcklEID0gYWRkcklkUm93LklEO1xuICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhgbmV3IGFkZHJJRCA9ICR7YWRkcklEfWApO1xuICAgICAgICAgICAgICBjb25zdCBuZXdDYXNoaWVySUQ6UHJvbWlzZTxudW1iZXI+ID0gdGhpcy5jYXNoaWVySW5zZXJ0KGNhc2hpZXIsIGFkZHJJRCk7XG4gICAgICAgICAgICAgIG5ld0Nhc2hpZXJJRC50aGVuKCh2YWwpID0+IHtcbiAgICAgICAgICAgICAgICBpZCA9IHZhbDtcbiAgICAgICAgICAgICAgICByZXN1bHQoaWQpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IG5ld0Nhc2hpZXJJRDpQcm9taXNlPG51bWJlcj4gPSB0aGlzLmNhc2hpZXJJbnNlcnQoY2FzaGllciwgYWRkcklEKTtcbiAgICAgICAgICBuZXdDYXNoaWVySUQudGhlbigodmFsKSA9PiB7XG4gICAgICAgICAgICBpZCA9IHZhbDtcbiAgICAgICAgICAgIHJlc3VsdChpZCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBjYXNoaWVySW5zZXJ0KGNhc2hpZXI6IElDYXNoaWVyLCBhZGRySUQ6bnVtYmVyKTpQcm9taXNlPG51bWJlcj4ge1xuICAgIGxldCBuZXdDYXNoaWVySUQgPSAtMTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc2x0KSA9PiB7XG4gICAgICBsZXQgc3FsOnN0cmluZyA9IGBJTlNFUlQgSU5UTyBDYXNoaWVyIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlcnNvbm5lbE51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3ROYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3ROYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0cm9ueW1pYyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNleCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBob25lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkcklELFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmlydGhkYXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG9wSUQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydFdvcmssXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0TmV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVkFMVUVTIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcke2Nhc2hpZXIucGVyc29ubmVsTnVtYmVyfScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnJHtjYXNoaWVyLmVtcGxveWVlTmFtZS5sYXN0TmFtZX0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyR7Y2FzaGllci5lbXBsb3llZU5hbWUuZmlyc3ROYW1lfScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnJHtjYXNoaWVyLmVtcGxveWVlTmFtZS5wYXRyb255bWljfScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnJHtjYXNoaWVyLnNleH0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyR7Y2FzaGllci5waG9uZX0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyR7YWRkcklEfScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnJHtkYXRlRm9ybWF0KGNhc2hpZXIuYmlydGhkYXkpfScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnJHtjYXNoaWVyLnNob3BJRH0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyR7ZGF0ZUZvcm1hdChjYXNoaWVyLnN0YXJ0V29yayl9JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcke2Nhc2hpZXIubGFzdE5ldH0nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClgO1xuICAgICAgdGhpcy5kYi5ydW4oc3FsLCAocmVzOmFueSwgZXJyOmFueSkgPT4ge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhzcWwpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhyZXMpO1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc3FsID0gYFNFTEVDVCAgaWQgXG4gICAgICAgICAgICAgICAgIEZST00gQ2FzaGllciBcbiAgICAgICAgICAgICAgICBXSEVSRSBwZXJzb25uZWxOdW1iZXIgPSAnJHtjYXNoaWVyLnBlcnNvbm5lbE51bWJlcn0nYDtcbiAgICAgICAgdGhpcy5kYi5nZXQoc3FsLCAoZXJyU2VsOmFueSwgcmVzU2VsOmFueSkgPT4ge1xuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHNxbCk7XG4gICAgICAgICAgaWYgKGVyclNlbCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyU2VsKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHJlc1NlbCkge1xuICAgICAgICAgICAgbmV3Q2FzaGllcklEID0gcmVzU2VsLmlkO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYE5ldyBDYXNoaWVyJ3MgaWQgaXMgJHtuZXdDYXNoaWVySUR9YCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhg0JTQsNC90L3Ri9C1INC/0L4g0LrQsNGB0YHQuNGA0YMgJHtjYXNoaWVyLmVtcGxveWVlTmFtZS5sYXN0TmFtZX0g0YPRgdC/0LXRiNC90L4g0LTQvtCx0LDQstC70LXQvdGLYCk7XG4gICAgICAgICAgICByZXNsdChuZXdDYXNoaWVySUQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgICAgICogR2V0IGluZm9ybWF0aW9uIGFib3V0IGEgQ2FzaGllciBieSBJRFxuICAgICAgICovXG4gIHB1YmxpYyBnZXRDYXNoaWVyQnlJZChpZDpudW1iZXIpOlByb21pc2U8SUNhc2hpZXI+IHtcbiAgICBjb25zdCBzcWw6c3RyaW5nID0gYFNFTEVDVCBDYXNoaWVyLiosIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWRkcmVzcy5jaXR5LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3Muc3RyZWV0LCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3MuYnVpbGRpbmcsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWRkcmVzcy5saXRlcmEsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWRkcmVzcy5hcGFydG1lbnQgXG4gICAgICAgICAgICAgICAgICAgICAgICBGUk9NICBDYXNoaWVyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3MgXG4gICAgICAgICAgICAgICAgICAgICAgICBXSEVSRSBDYXNoaWVyLmFkZHJJRCA9IEFkZHJlc3MuSUQgQU5EIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ2FzaGllci5pZD0ke2lkfTtgO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IHtcbiAgICAgIHRoaXMuZGIuZ2V0KHNxbCwgKGVycjogYW55LCByb3c6IGFueSkgPT4ge1xuICAgICAgICBpZiAocm93KSB7XG4gICAgICAgICAgY29uc3QgY2FzaGllcjpJQ2FzaGllciA9IHBhcmNlQ2FzaGllcihyb3cpO1xuICAgICAgICAgIHJlcyhjYXNoaWVyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhg0JTQsNC90L3Ri9C1INC+INC60LDRgdGB0LjRgNC1INGBIGlkICR7aWR9INC90LUg0L3QsNC50LTQtdC90YtgKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICAgICAqIFVwZGF0ZSBpbmZvcm1hdGlvbiBhYm91dCBhIENhc2hpZXJcbiAgICAgICAqL1xuICBwdWJsaWMgdXBkYXRlQ2FzaGllcihjYXNoaWVyOklDYXNoaWVyKTp2b2lkIHtcbiAgICBsZXQgc3FsOnN0cmluZyA9IGBTRUxFQ1QgYWRkcklEIFxuICAgICAgICAgICAgICAgICAgICAgICAgRlJPTSBDYXNoaWVyIFxuICAgICAgICAgICAgICAgICAgICAgICAgV0hFUkUgaWQ9JyR7Y2FzaGllci5pZH0nYDtcbiAgICB0aGlzLmRiLmdldChzcWwsIChlcnI6YW55LCBhZGRySWRSb3c6YW55KSA9PiB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhzcWwpO1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBjb25zb2xlLmxvZyhhZGRySWRSb3cpO1xuXG4gICAgICBzcWwgPSBgVVBEQVRFIEFkZHJlc3MgXG4gICAgICAgICAgICAgICAgU0VUIGNpdHkgPSAnJHtDaXR5W2Nhc2hpZXIuYWRkci5jaXR5XX0nLCBcbiAgICAgICAgICAgICAgICAgICAgc3RyZWV0ID0gJyR7Y2FzaGllci5hZGRyLnN0cmVldH0nLCBcbiAgICAgICAgICAgICAgICAgICAgYnVpbGRpbmcgPSAnJHtjYXNoaWVyLmFkZHIuYnVpbGRpbmd9JywgXG4gICAgICAgICAgICAgICAgICAgIGxpdGVyYSA9ICcke2Nhc2hpZXIuYWRkci5saXRlcmF9JywgXG4gICAgICAgICAgICAgICAgICAgIGFwYXJ0bWVudCA9ICcke2Nhc2hpZXIuYWRkci5hcGFydG1lbnR9JyBcbiAgICAgICAgICAgICAgICBXSEVSRSBpZD0ke2FkZHJJZFJvdy5hZGRySUR9YDtcbiAgICAgIHRoaXMuZGIuZ2V0KHNxbCwgKGVyclVwZEFkZHI6YW55LCByZXNSb3c6bnVtYmVyKSA9PiB7XG4gICAgICAgIGlmIChlcnJVcGRBZGRyKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coZXJyVXBkQWRkcik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHNxbCk7XG5cbiAgICAgICAgc3FsID0gYFVQREFURSBDYXNoaWVyIFxuICAgICAgICAgICAgICAgICAgU0VUIHBlcnNvbm5lbE51bWJlciA9ICcke2Nhc2hpZXIucGVyc29ubmVsTnVtYmVyfScsIFxuICAgICAgICAgICAgICAgICAgICAgIGxhc3ROYW1lID0gJyR7Y2FzaGllci5lbXBsb3llZU5hbWUubGFzdE5hbWV9JywgXG4gICAgICAgICAgICAgICAgICAgICAgZmlyc3ROYW1lID0gJyR7Y2FzaGllci5lbXBsb3llZU5hbWUuZmlyc3ROYW1lfScsIFxuICAgICAgICAgICAgICAgICAgICAgIHBhdHJvbnltaWMgPSAnJHtjYXNoaWVyLmVtcGxveWVlTmFtZS5wYXRyb255bWljfScsIFxuICAgICAgICAgICAgICAgICAgICAgIHNleCA9ICcke1NleFtjYXNoaWVyLnNleF0gYXMgdW5rbm93biBhcyBudW1iZXJ9JywgXG4gICAgICAgICAgICAgICAgICAgICAgcGhvbmUgPSAnJHtjYXNoaWVyLnBob25lfScsIFxuICAgICAgICAgICAgICAgICAgICAgIGFkZHJJRCA9ICcke2FkZHJJZFJvdy5hZGRySUR9JywgXG4gICAgICAgICAgICAgICAgICAgICAgYmlydGhkYXkgPSAnJHtkYXRlRm9ybWF0KGNhc2hpZXIuYmlydGhkYXkpfScsIFxuICAgICAgICAgICAgICAgICAgICAgIHNob3BJRCA9ICcke2Nhc2hpZXIuc2hvcElEfScsIFxuICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0V29yayA9ICcke2Nhc2hpZXIuc3RhcnRXb3JrfScsIFxuICAgICAgICAgICAgICAgICAgICAgIGxhc3ROZXQgPSAnJHtOZXRbY2FzaGllci5sYXN0TmV0XSBhcyB1bmtub3duIGFzIG51bWJlcn0nIFxuICAgICAgICAgICAgICAgIFdIRVJFIGlkPScke2Nhc2hpZXIuaWR9J2A7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHNxbCk7XG4gICAgICAgIHRoaXMuZGIucnVuKHNxbCwgKHJlc1VkYXRlOmFueSwgZXJyVXBkYXRlOmFueSkgPT4ge1xuICAgICAgICAgIGlmIChlcnJVcGRhdGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVyclVwZGF0ZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnNvbGUubG9nKGDQlNCw0L3QvdGL0LUg0LrQsNGB0YHQuNGA0LAgJHtjYXNoaWVyLmVtcGxveWVlTmFtZS5sYXN0TmFtZX0g0YPRgdC/0LXRiNC90L4g0L7QsdC90L7QstC70LXQvdGLYCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICAgKiBNYXJrIHNvbWUgQ2FzaGllciBhcyBhIGRlbGV0ZWQgd2l0aG91dCBkZWxldGluZyBmcm9tIHRoZSBEQlxuICAgICAqL1xuICBwdWJsaWMgZGVsQ2FzaGllcihpZDpudW1iZXIpOnZvaWQge1xuICAgIGNvbnN0IHNxbCA9IGBVUERBVEUgQ2FzaGllciBTRVQgZGVsZXRlZCA9IDEgV0hFUkUgaWQ9JyR7aWR9J2A7XG4gICAgdGhpcy5kYi5ydW4oc3FsLCAocmVzOmFueSwgZXJyOmFueSkgPT4ge1xuICAgICAgLy8gY29uc29sZS5sb2coc3FsKTtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc29sZS5sb2coYNCY0L3RhNC+0YDQvNCw0YbQuNGPINC+INC60LDRgdGB0LjRgNC1INGBIGlkPSAke2lkfSDRg9GB0L/QtdGI0L3QviDRg9C00LDQu9C10L3QsGApO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAgICogRGVsZXRlIGEgQ2FzaGllciBmcm9tIHRoZSBEQlxuICAgICAqL1xuICBwdWJsaWMgY29tcGxldERlbGV0ZUNhc2hpZXIoaWQ6bnVtYmVyKTp2b2lkIHtcbiAgICBjb25zdCBzcWwgPSBgREVMRVRFIEZST00gQ2FzaGllciBXSEVSRSBpZD0nJHtpZH0nYDtcbiAgICB0aGlzLmRiLnJ1bihzcWwsIChyZXM6YW55LCBlcnI6YW55KSA9PiB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhzcWwpO1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zb2xlLmxvZyhg0JjQvdGE0L7RgNC80LDRhtC40Y8g0L4g0LrQsNGB0YHQuNGA0LUg0YEgJHtpZH0g0YPRgdC/0LXRiNC90L4g0YPQtNCw0LvQtdC90LBgKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgaW5mb3JtYXRpb24gYWJvdXQgYWxsIENhc2hpZXJzIGluIHRoZSBTaG9wXG4gICAqL1xuICBwdWJsaWMgZ2V0QWxsQ2FzaGllcnMoKTp2b2lkIHtcbiAgICBjb25zdCBzcWw6c3RyaW5nID0gYFNFTEVDVCBDYXNoaWVyLiosIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3MuKiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgRlJPTSBDYXNoaWVyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBZGRyZXNzIFxuICAgICAgICAgICAgICAgICAgICAgICAgIFdIRVJFIENhc2hpZXIuYWRkcklEID0gQWRkcmVzcy5JRDtgO1xuICAgIGNvbnNvbGUubG9nKCfQmNC90YTQvtGA0LzQsNGG0LjRjyDQviDQstGB0LXRhSDQutCw0YHRgdC40YDQsNGFOicpO1xuICAgIHRoaXMuZGIuZWFjaChzcWwsIChlcnI6IGFueSwgcm93OiBhbnkpID0+IHtcbiAgICAgIGlmIChyb3cpIHtcbiAgICAgICAgY29uc29sZS5sb2cocGFyY2VDYXNoaWVyKHJvdykpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBpbmZvcm1hdGlvbiBhYm91dCBhbGwgQ2FzaGllcnMgaW4gdGhlIFNob3AgYWNjb3JkaW4gc29tZSBmaWx0ZXJcbiAgICovXG4gIHB1YmxpYyBnZXRBbGxGaWx0cmVkQ2FzaGllcnMoZmw6U3FsRmlsdGVyKTp2b2lkIHtcbiAgICBsZXQgZmx0cjpzdHJpbmcgPSAoZmwuZmlyc3ROYW1lKSA/IGAgQU5EIGZpcnN0TmFtZSA9ICcke2ZsLmZpcnN0TmFtZX0nYCA6ICcnO1xuICAgIGZsdHIgKz0gKGZsLmxhc3ROYW1lKSA/IGAgQU5EIGxhc3ROYW1lID0gJyR7ZmwubGFzdE5hbWV9J2AgOiAnJztcbiAgICBmbHRyICs9IChmbC5waG9uZSkgPyBgIEFORCBwaG9uZSA9ICcke2ZsLnBob25lfSdgIDogJyc7XG4gICAgZmx0ciArPSAoZmwub3BlcmF0b3IpID8gYCBBTkQgcGhvbmUgTElLRSAnJSR7Zmwub3BlcmF0b3J9JSdgIDogJyc7XG4gICAgZmx0ciArPSAoZmwuc2V4KSA/IGAgQU5EIHNleCA9ICcke2ZsLnNleH0nYCA6ICcnO1xuICAgIGZsdHIgKz0gKGZsLmxhc3ROZXQpID8gYCBBTkQgbGFzdE5ldCA9ICcke2ZsLmxhc3ROZXR9J2AgOiAnJztcbiAgICBmbHRyICs9IChmbC5jaXR5KSA/IGAgQU5EIEFkZHJlc3MuY2l0eSA9ICcke0NpdHlbZmwuY2l0eV19J2AgOiAnJztcblxuICAgIGNvbnN0IHNxbDpzdHJpbmcgPSBgU0VMRUNUIENhc2hpZXIuKiwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWRkcmVzcy4qIFxuICAgICAgICAgICAgICAgICAgICAgICAgICBGUk9NIENhc2hpZXIsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3MgXG4gICAgICAgICAgICAgICAgICAgICAgICAgV0hFUkUgQ2FzaGllci5hZGRySUQgPSBBZGRyZXNzLklEXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7Zmx0cn07YDtcbiAgICBjb25zb2xlLmxvZygn0JjQvdGE0L7RgNC80LDRhtC40Y8g0L4g0LLRgdC10YUg0LrQsNGB0YHQuNGA0LDRhSDRgdC+0LPQu9Cw0YHQvdC+INC30LDQtNCw0L3QvdC+0LzRgyDRhNC40LvRjNGC0YDRgzonKTtcbiAgICAvLyBjb25zb2xlLmxvZyhzcWwpO1xuICAgIHRoaXMuZGIuZWFjaChzcWwsIChlcnI6IGFueSwgcm93OiBhbnkpID0+IHtcbiAgICAgIGlmIChyb3cpIHtcbiAgICAgICAgY29uc29sZS5sb2cocGFyY2VDYXNoaWVyKHJvdykpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIGdldFRhcmdldENhc2hpZXJzMVxuICAgKi9cbiAgcHVibGljIGdldFRhcmdldENhc2hpZXJzMSgpOnZvaWQge1xuICAgIGNvbnNvbGUubG9nKCfQlNCw0L1pINC/0L4g0YPRgdGW0YUg0LrQsNGB0LjRgNCw0YUg0LzQsNCz0LDQt9C40L3RgyDQt9CwINCy0YHRjiDRltGB0YLQvtGA0ZbRjiDRgNC+0LHQvtGC0Lgg0LzQsNCz0LDQt9C40L3RltCyIEFUQiDRgyDQvNGW0YHRgtGWINCb0YzQstGW0LIsINGP0LrRliDQvNCw0Y7RgtGMINCx0ZbQu9GM0YjQtSA1INGA0L7QutGW0LIg0LTQvtGB0LLRltC00YMg0YLQsCDRgNCw0L3RltGI0LUg0L/RgNCw0YbRjtCy0LDQu9C4INGDIFNpbHBvINCw0LHQviBBcnNlbjonKTtcbiAgICBjb25zdCBzcWw6c3RyaW5nID0gYFNFTEVDVCBDYXNoaWVyLiosIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3MuKiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgRlJPTSBDYXNoaWVyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBZGRyZXNzIFxuICAgICAgICAgICAgICAgICAgICAgICAgIFdIRVJFIENhc2hpZXIuYWRkcklEID0gQWRkcmVzcy5JRCBBTkRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDYXNoaWVyLnNob3BJRCBJTiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNFTEVDVCBTaG9wLmlkIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEZST00gU2hvcCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBZGRyZXNzIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgV0hFUkUgU2hvcC5hZGRySUQgPSBBZGRyZXNzLklEIEFORCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3MuQ2l0eSA9ICcke0NpdHlbQ2l0eS7Qm9GM0LLQvtCyXX0nKSBBTkQgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDYXNoaWVyLmxhc3ROZXQgSU4gKCR7TmV0LtChadC70YzQv9C+fSAsICR7TmV0LtCQ0YDRgdC10L19KSBBTkQgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDYXNoaWVyLnN0YXJ0V29yazw9JzIwMTYtMDEtMDEnYDtcbiAgICAvLyBjb25zb2xlLmxvZyhzcWwpO1xuICAgIHRoaXMuZGIuZWFjaChzcWwsIChlcnI6IGFueSwgcm93OiBhbnkpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc29sZS5sb2cocGFyY2VDYXNoaWVyKHJvdykpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIGdldFRhcmdldENhc2hpZXJzMlxuICAgKi9cbiAgcHVibGljIGdldFRhcmdldENhc2hpZXJzMigpOnZvaWQge1xuICAgIGNvbnNvbGUubG9nKCfQlNCw0L1pINC/0L4g0YPRgdGW0YUg0LrQsNGB0LjRgNCw0YUg0LzQsNCz0LDQt9C40L3RgyBBVEIg0LfQsCDQsNC00YDQtdGB0L7RjiDQqNC10LLQtdC90LrQsCAxMDAsINGP0LrRliDQv9GA0LDRhtGO0Y7RgtGMINC90LAg0LrQsNGB0LDRhSDQtyDQvdC10L/QsNGA0L3QuNC8INGH0LjRgdC70L7QvCDRidC+0L/QvtC90LXQtNGW0LvQutCwINGDINC90ZbRh9C90YMg0LfQvNGW0L3RgyAoMjM6MDAgLSAwNzowMCknKTtcbiAgICBjb25zdCBzcWw6c3RyaW5nID0gYFNFTEVDVCBDYXNoaWVyLiosIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3MuKiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgRlJPTSBDYXNoaWVyLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBZGRyZXNzIFxuICAgICAgICAgICAgICAgICAgICAgICAgIFdIRVJFIENhc2hpZXIuYWRkcklEID0gQWRkcmVzcy5JRCBBTkQgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ2FzaGllci5zaG9wSUQgSU4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTRUxFQ1QgU2hvcC5pZCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBGUk9NIFNob3AsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWRkcmVzcyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFdIRVJFIFNob3AuYWRkcklEID0gQWRkcmVzcy5JRCBBTkQgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBZGRyZXNzLnN0cmVldCA9ICfRg9C7LiDQqNC10LLRh9C10L3QutC+JyBBTkQgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBZGRyZXNzLmJ1aWxkaW5nID0gMTAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgQU5EIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDYXNoaWVyLmlkIElOIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNFTEVDVCBDYXNoUmVnaXN0ZXIuY2FzaGllcklEIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBGUk9NIENhc2hSZWdpc3RlciBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBXSEVSRSBDYXNoUmVnaXN0ZXIuY2FzaEJveE51bWJlciUgMiBBTkQgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKChDYXNoUmVnaXN0ZXIudHJhbnNhY3Rpb25UaW1lIEJFVFdFRU4gJzAwOjAwOjAwJyBBTkQgJzA3OjAwOjAwJykgT1IgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChDYXNoUmVnaXN0ZXIudHJhbnNhY3Rpb25UaW1lIEJFVFdFRU4gJzIzOjAwOjAwJyBBTkQgJzIzOjU5OjU5JykpIEFORCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyZnRpbWUoJyV3JywgQ2FzaFJlZ2lzdGVyLnRyYW5zYWN0aW9uRGF0ZSkgPSAnMScpYDtcbiAgICAvLyBjb25zb2xlLmxvZyhzcWwpO1xuICAgIHRoaXMuZGIuZWFjaChzcWwsIChlcnI6IGFueSwgcm93OiBhbnkpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc29sZS5sb2cocGFyY2VDYXNoaWVyKHJvdykpO1xuICAgIH0pO1xuICB9XG59XG4iXX0=