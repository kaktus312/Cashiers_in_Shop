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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZGIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EscUNBQW1DO0FBQ25DLHFDQUVrQjtBQUNsQixtQ0FBbUQ7QUEyQm5ELE1BQWEsTUFBTTtJQUdqQixZQUFZLE1BQWE7UUFDdkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNwQixJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksa0JBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBS00sS0FBSztRQUNWLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDbEIsQ0FBQztJQUtNLFVBQVUsQ0FBQyxPQUFnQjtRQUNoQyxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNoQixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNaLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEVBQUU7WUFDakMsSUFBSSxHQUFHLEdBQVU7O3dDQUVpQixhQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7MENBQ3JCLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTTs0Q0FDakIsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFROzBDQUN2QixPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU07NkNBQ2hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUM7WUFFbEUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBTyxFQUFFLEdBQU8sRUFBRSxFQUFFO2dCQUNwQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNqQixJQUFJLEdBQUcsRUFBRTtvQkFDUCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNqQixPQUFPO2lCQUNSO2dCQUNELElB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QUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQVEsRUFBRSxHQUFRLEVBQUUsRUFBRTtZQUN2QyxJQUFJLEdBQUcsRUFBRTtnQkFDUCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNqQixPQUFPO2FBQ1I7WUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNqQyxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQTVURCx3QkE0VEMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBtYWluIG1ldGhvZHMgKENSVUQpICsgZGIgY29ubmVjdGlvbjsgaW1wb3J0cyBzdHVmZiBmcm9tIG1vZGVscy50c1xuaW1wb3J0IHsgRGF0YWJhc2UgfSBmcm9tICdzcWxpdGUzJztcbmltcG9ydCB7XG4gIElDYXNoaWVyLCBOZXQsIFNleCwgQ2l0eSxcbn0gZnJvbSAnLi9tb2RlbHMnO1xuaW1wb3J0IHsgZGF0ZUZvcm1hdCwgcGFyY2VDYXNoaWVyIH0gZnJvbSAnLi91dGlscyc7XG5cbi8vIGNvbnN0IHNxbGl0ZTMgPSByZXF1aXJlKCdzcWxpdGUzJykudmVyYm9zZSgpO1xuLy8gY29uc3Qgc3FsaXRlMyA9IHJlcXVpcmUoJ3NxbGl0ZTMnKS52ZXJib3NlKCk7XG4vLyBjb25zdCBkYiA9IG5ldyBzcWxpdGUzLkRhdGFiYXNlKCc6bWVtb3J5OicpO1xuLy8gY29uc3QgZGIgPSBuZXcgc3FsaXRlMy5EYXRhYmFzZSgnLi9kYi5zcWxpdGUnKTtcblxuLy8gZGIuc2VyaWFsaXplKCgpID0+IHtcbi8vICAgY29uc3QgcmVzID0gZGIuZ2V0KCdTRUxFQ1QgbmFtZSBGUk9NIHNxbGl0ZV9tYXN0ZXIgV0hFUkUgdHlwZT1cInRhYmxlXCIgQU5EIG5hbWU9PycsICdsb3JlbScpO1xuLy8gICBpZiAoIXJlcykge1xuLy8gICAgIGRiLnJ1bignQ1JFQVRFIFRBQkxFIGxvcmVtIChpbmZvIFRFWFQpJyk7XG4vLyAgIH1cblxuLy8gICBjb25zdCBzdG10ID0gZGIucHJlcGFyZSgnSU5TRVJUIElOVE8gbG9yZW0gVkFMVUVTICg/KScpO1xuLy8gICBmb3IgKGxldCBpID0gMDsgaSA8IDEwOyBpICs9IDEpIHtcbi8vICAgICBzdG10LnJ1bihgSXBzdW0gJHtpfWApO1xuLy8gICB9XG4vLyAgIHN0bXQuZmluYWxpemUoKTtcblxuLy8gZGIuZWFjaCgnU0VMRUNUIHJvd2lkIEFTIGlkLCBpbmZvIEZST00gbG9yZW0nLChlcnI6IGFueSwgcm93OiB7IGlkOiBzdHJpbmc7IGluZm86IHN0cmluZzsgfSkgPT4ge1xuLy8gICAgIGNvbnNvbGUubG9nKGAke3Jvdy5pZH06ICR7cm93LmluZm99YCk7XG4vLyAgIH0pO1xuLy8gfSk7XG5cbi8vIGRiLmNsb3NlKCk7XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvcHJlZmVyLWRlZmF1bHQtZXhwb3J0XG5leHBvcnQgY2xhc3MgU2hvcERCIHtcbiAgcHJpdmF0ZSBkYjpEYXRhYmFzZTtcblxuICBjb25zdHJ1Y3RvcihkYlBhdGg6c3RyaW5nKSB7XG4gICAgY29uc29sZS5sb2coZGJQYXRoKTtcbiAgICB0aGlzLmRiID0gbmV3IERhdGFiYXNlKGRiUGF0aCk7XG4gIH1cblxuICAvKipcbiAgICAgICAqIENsb3NlIG9wZW5lZCBEQlxuICAgICAgICovXG4gIHB1YmxpYyBjbG9zZSgpOnZvaWQge1xuICAgIHRoaXMuZGIuY2xvc2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgICAgICogQWRkIGEgbmV3IENhc2hpZXIgaW4gdG8gdGhlIERCXG4gICAgICAgKi9cbiAgcHVibGljIGFkZENhc2hpZXIoY2FzaGllcjpJQ2FzaGllcik6UHJvbWlzZTxudW1iZXI+IHtcbiAgICBsZXQgYWRkcklEID0gLTE7XG4gICAgbGV0IGlkID0gLTE7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXN1bHQsIHJlaikgPT4ge1xuICAgICAgbGV0IHNxbDpzdHJpbmcgPSBgU0VMRUNUIElEXG4gICAgICAgICAgICAgICAgICAgICAgICBGUk9NIEFkZHJlc3NcbiAgICAgICAgICAgICAgICAgICAgICAgIFdIRVJFIGNpdHkgPSAnJHtDaXR5W2Nhc2hpZXIuYWRkci5jaXR5XX0nIEFORCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0cmVldCA9ICcke2Nhc2hpZXIuYWRkci5zdHJlZXR9JyBBTkQgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWlsZGluZyA9ICcke2Nhc2hpZXIuYWRkci5idWlsZGluZ30nIEFORFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGl0ZXJhID0gJyR7Y2FzaGllci5hZGRyLmxpdGVyYX0nIEFORCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwYXJ0bWVudCA9ICcke2Nhc2hpZXIuYWRkci5hcGFydG1lbnR9JztgO1xuXG4gICAgICB0aGlzLmRiLmdldChzcWwsIChlcnI6YW55LCByZXM6YW55KSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKHNxbCk7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVzKSB7XG4gICAgICAgICAgYWRkcklEID0gcmVzLklEO1xuXG4gICAgICAgICAgY29uc29sZS5sb2coYGFkZHJJRCA9ICR7YWRkcklEfWApO1xuICAgICAgICAgIGlmIChhZGRySUQgPCAwKSB7XG4gICAgICAgICAgICBzcWwgPSBgSU5TRVJUIElOVE8gQWRkcmVzcyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaXR5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyZWV0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGRpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXRlcmEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcGFydG1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVkFMVUVTIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcke0NpdHlbY2FzaGllci5hZGRyLmNpdHldfScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnJHtjYXNoaWVyLmFkZHIuc3RyZWV0fScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnJHtjYXNoaWVyLmFkZHIuYnVpbGRpbmd9JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcke2Nhc2hpZXIuYWRkci5saXRlcmF9JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcke2Nhc2hpZXIuYWRkci5hcGFydG1lbnR9J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClgO1xuICAgICAgICAgICAgdGhpcy5kYi5ydW4oc3FsLCAocmVzSW5zOmFueSwgZXJySW5zOmFueSkgPT4ge1xuICAgICAgICAgICAgICBpZiAoZXJySW5zKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJySW5zKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgc3FsID0gJ1NFTEVDVCBJRCBGUk9NIEFkZHJlc3MgV0hFUkUgcm93aWQgPSBsYXN0X2luc2VydF9yb3dpZCgpOyc7XG4gICAgICAgICAgICAgIHRoaXMuZGIuZ2V0KHNxbCwgKGVycjphbnksIGFkZHJJZFJvdzpudW1iZXIpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhzcWwpO1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGFkZHJJRCA9IGFkZHJJZFJvdztcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgbmV3IGFkZHJJRCA9ICR7YWRkcklEfWApO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzcWwgPSBgSU5TRVJUIElOVE8gQ2FzaGllciAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZXJzb25uZWxOdW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdHJvbnltaWMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwaG9uZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZHJJRCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJpcnRoZGF5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvcElELFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRXb3JrLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdE5ldFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFZBTFVFUyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnJHtjYXNoaWVyLnBlcnNvbm5lbE51bWJlcn0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyR7Y2FzaGllci5lbXBsb3llZU5hbWUubGFzdE5hbWV9JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcke2Nhc2hpZXIuZW1wbG95ZWVOYW1lLmZpcnN0TmFtZX0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyR7Y2FzaGllci5lbXBsb3llZU5hbWUucGF0cm9ueW1pY30nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyR7Y2FzaGllci5zZXh9JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcke2Nhc2hpZXIucGhvbmV9JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcke2FkZHJJRH0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyR7ZGF0ZUZvcm1hdChjYXNoaWVyLmJpcnRoZGF5KX0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyR7Y2FzaGllci5zaG9wSUR9JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcke2RhdGVGb3JtYXQoY2FzaGllci5zdGFydFdvcmspfScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnJHtjYXNoaWVyLmxhc3ROZXR9J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApYDtcbiAgICAgICAgICB0aGlzLmRiLnJ1bihzcWwsIChlcnI6YW55LCByZXM6YW55KSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhzcWwpO1xuICAgICAgICAgICAgY29uc29sZS5sb2cocmVzKTtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5sb2coYNCU0LDQvdC90YvQtSDQv9C+INC60LDRgdGB0LjRgNGDICR7Y2FzaGllci5lbXBsb3llZU5hbWUubGFzdE5hbWV9INGD0YHQv9C10YjQvdC+INC00L7QsdCw0LLQu9C10L3Ri2ApO1xuICAgICAgICAgICAgc3FsID0gYFNFTEVDVCAgaWQgXG4gICAgICAgICAgICAgICAgICAgIEZST00gQ2FzaGllciBcbiAgICAgICAgICAgICAgICAgICAgV0hFUkUgcm93aWQ9bGFzdF9pbnNlcnRfcm93aWQoKSBPUiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcGVyc29ubmVsTnVtYmVyID0gJyR7Y2FzaGllci5wZXJzb25uZWxOdW1iZXJ9J2A7XG4gICAgICAgICAgICB0aGlzLmRiLmdldChzcWwsIChlcnI6YW55LCByZXM6YW55KSA9PiB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKHNxbCk7XG4gICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAocmVzKSB7XG4gICAgICAgICAgICAgICAgaWQgPSByZXMuaWQ7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYE5ldyBDYXNoaWVyJ3MgaWQgaXMgJHtpZH1gKTtcbiAgICAgICAgICAgICAgICByZXN1bHQoaWQpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICAgICAqIEdldCBpbmZvcm1hdGlvbiBhYm91dCBhIENhc2hpZXIgYnkgSURcbiAgICAgICAqL1xuICBwdWJsaWMgZ2V0Q2FzaGllckJ5SWQoaWQ6bnVtYmVyKTpQcm9taXNlPElDYXNoaWVyPiB7XG4gICAgY29uc3Qgc3FsOnN0cmluZyA9IGBTRUxFQ1QgQ2FzaGllci4qLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3MuY2l0eSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBZGRyZXNzLnN0cmVldCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBZGRyZXNzLmJ1aWxkaW5nLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3MubGl0ZXJhLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3MuYXBhcnRtZW50IFxuICAgICAgICAgICAgICAgICAgICAgICAgRlJPTSAgQ2FzaGllciwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBZGRyZXNzIFxuICAgICAgICAgICAgICAgICAgICAgICAgV0hFUkUgQ2FzaGllci5hZGRySUQgPSBBZGRyZXNzLklEIEFORCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENhc2hpZXIuaWQ9JHtpZH07YDtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlcywgcmVqKSA9PiB7XG4gICAgICB0aGlzLmRiLmdldChzcWwsIChlcnI6IGFueSwgcm93OiBhbnkpID0+IHtcbiAgICAgICAgaWYgKHJvdykge1xuICAgICAgICAgIGNvbnN0IGNhc2hpZXI6SUNhc2hpZXIgPSBwYXJjZUNhc2hpZXIocm93KTtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyhg0JTQsNC90L3Ri9C1INC+INC60LDRgdGB0LjRgNC1INGBIGlkICR7aWR9OlxcbmAsIGNhc2hpZXIpO1xuICAgICAgICAgIHJlcyhjYXNoaWVyKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICAgICAqIFVwZGF0ZSBpbmZvcm1hdGlvbiBhYm91dCBhIENhc2hpZXJcbiAgICAgICAqL1xuICBwdWJsaWMgdXBkYXRlQ2FzaGllcihjYXNoaWVyOklDYXNoaWVyKTp2b2lkIHtcbiAgICBsZXQgc3FsOnN0cmluZyA9IGBTRUxFQ1QgYWRkcklEIFxuICAgICAgICAgICAgICAgICAgICAgICAgRlJPTSBDYXNoaWVyIFxuICAgICAgICAgICAgICAgICAgICAgICAgV0hFUkUgaWQ9JyR7Y2FzaGllci5pZH0nYDtcbiAgICB0aGlzLmRiLmdldChzcWwsIChlcnI6YW55LCBhZGRySWRSb3c6YW55KSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgIGNvbnNvbGUubG9nKHNxbCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUubG9nKGFkZHJJZFJvdyk7XG5cbiAgICAgIHNxbCA9IGBVUERBVEUgQWRkcmVzcyBcbiAgICAgICAgICAgICAgICBTRVQgY2l0eSA9ICcke0NpdHlbY2FzaGllci5hZGRyLmNpdHldfScsIFxuICAgICAgICAgICAgICAgICAgICBzdHJlZXQgPSAnJHtjYXNoaWVyLmFkZHIuc3RyZWV0fScsIFxuICAgICAgICAgICAgICAgICAgICBidWlsZGluZyA9ICcke2Nhc2hpZXIuYWRkci5idWlsZGluZ30nLCBcbiAgICAgICAgICAgICAgICAgICAgbGl0ZXJhID0gJyR7Y2FzaGllci5hZGRyLmxpdGVyYX0nLCBcbiAgICAgICAgICAgICAgICAgICAgYXBhcnRtZW50ID0gJyR7Y2FzaGllci5hZGRyLmFwYXJ0bWVudH0nIFxuICAgICAgICAgICAgICAgIFdIRVJFIGlkPSR7YWRkcklkUm93LmFkZHJJRH1gO1xuICAgICAgdGhpcy5kYi5nZXQoc3FsLCAoZXJyVXBkQWRkcjphbnksIHJlc1JvdzpudW1iZXIpID0+IHtcbiAgICAgICAgaWYgKGVyclVwZEFkZHIpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhlcnJVcGRBZGRyKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coc3FsKTtcblxuICAgICAgICBzcWwgPSBgVVBEQVRFIENhc2hpZXIgXG4gICAgICAgICAgICAgICAgICBTRVQgcGVyc29ubmVsTnVtYmVyID0gJyR7Y2FzaGllci5wZXJzb25uZWxOdW1iZXJ9JywgXG4gICAgICAgICAgICAgICAgICAgICAgbGFzdE5hbWUgPSAnJHtjYXNoaWVyLmVtcGxveWVlTmFtZS5sYXN0TmFtZX0nLCBcbiAgICAgICAgICAgICAgICAgICAgICBmaXJzdE5hbWUgPSAnJHtjYXNoaWVyLmVtcGxveWVlTmFtZS5maXJzdE5hbWV9JywgXG4gICAgICAgICAgICAgICAgICAgICAgcGF0cm9ueW1pYyA9ICcke2Nhc2hpZXIuZW1wbG95ZWVOYW1lLnBhdHJvbnltaWN9JywgXG4gICAgICAgICAgICAgICAgICAgICAgc2V4ID0gJyR7U2V4W2Nhc2hpZXIuc2V4XSBhcyB1bmtub3duIGFzIG51bWJlcn0nLCBcbiAgICAgICAgICAgICAgICAgICAgICBwaG9uZSA9ICcke2Nhc2hpZXIucGhvbmV9JywgXG4gICAgICAgICAgICAgICAgICAgICAgYWRkcklEID0gJyR7YWRkcklkUm93LmFkZHJJRH0nLCBcbiAgICAgICAgICAgICAgICAgICAgICBiaXJ0aGRheSA9ICcke2RhdGVGb3JtYXQoY2FzaGllci5iaXJ0aGRheSl9JywgXG4gICAgICAgICAgICAgICAgICAgICAgc2hvcElEID0gJyR7Y2FzaGllci5zaG9wSUR9JywgXG4gICAgICAgICAgICAgICAgICAgICAgc3RhcnRXb3JrID0gJyR7Y2FzaGllci5zdGFydFdvcmt9JywgXG4gICAgICAgICAgICAgICAgICAgICAgbGFzdE5ldCA9ICcke05ldFtjYXNoaWVyLmxhc3ROZXRdIGFzIHVua25vd24gYXMgbnVtYmVyfScgXG4gICAgICAgICAgICAgICAgV0hFUkUgaWQ9JyR7Y2FzaGllci5pZH0nYDtcbiAgICAgICAgY29uc29sZS5sb2coc3FsKTtcbiAgICAgICAgdGhpcy5kYi5ydW4oc3FsLCAocmVzVWRhdGU6YW55LCBlcnJVcGRhdGU6YW55KSA9PiB7XG4gICAgICAgICAgaWYgKGVyclVwZGF0ZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyVXBkYXRlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc29sZS5sb2coYNCU0LDQvdC90YvQtSDQutCw0YHRgdC40YDQsCAke2Nhc2hpZXIuZW1wbG95ZWVOYW1lLmxhc3ROYW1lfSDRg9GB0L/QtdGI0L3QviDQvtCx0L3QvtCy0LvQtdC90YtgKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgICAqIE1hcmsgc29tZSBDYXNoaWVyIGFzIGEgZGVsZXRlZCB3aXRob3V0IGRlbGV0aW5nIGZyb20gdGhlIERCXG4gICAgICovXG4gIHB1YmxpYyBkZWxDYXNoaWVyKGlkOm51bWJlcik6dm9pZCB7XG4gICAgY29uc3Qgc3FsID0gYFVQREFURSBDYXNoaWVyIFNFVCBkZWxldGVkID0gMSBXSEVSRSBpZD0nJHtpZH0nYDtcbiAgICB0aGlzLmRiLnJ1bihzcWwsIChyZXM6YW55LCBlcnI6YW55KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhzcWwpO1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zb2xlLmxvZyhg0JjQvdGE0L7RgNC80LDRhtC40Y8g0L4g0LrQsNGB0YHQuNGA0LUg0YEgJHtpZH0g0YPRgdC/0LXRiNC90L4g0YPQtNCw0LvQtdC90LBgKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgICAqIERlbGV0ZSBhIENhc2hpZXIgZnJvbSB0aGUgREJcbiAgICAgKi9cbiAgcHVibGljIGNvbXBsZXREZWxldGVDYXNoaWVyKGlkOm51bWJlcik6dm9pZCB7XG4gICAgY29uc3Qgc3FsID0gYERFTEVURSBGUk9NIENhc2hpZXIgV0hFUkUgaWQ9JyR7aWR9J2A7XG4gICAgdGhpcy5kYi5ydW4oc3FsLCAocmVzOmFueSwgZXJyOmFueSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coc3FsKTtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc29sZS5sb2coYNCY0L3RhNC+0YDQvNCw0YbQuNGPINC+INC60LDRgdGB0LjRgNC1INGBICR7aWR9INGD0YHQv9C10YjQvdC+INGD0LTQsNC70LXQvdCwYCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGluZm9ybWF0aW9uIGFib3V0IGFsbCBDYXNoaWVycyBpbiB0aGUgU2hvcFxuICAgKi9cbiAgcHVibGljIGdldEFsbENhc2hpZXJzKCk6dm9pZCB7XG4gICAgY29uc3Qgc3FsOnN0cmluZyA9IGBTRUxFQ1QgQ2FzaGllci4qLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBZGRyZXNzLiogXG4gICAgICAgICAgICAgICAgICAgICAgICAgIEZST00gQ2FzaGllciwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWRkcmVzcyBcbiAgICAgICAgICAgICAgICAgICAgICAgICBXSEVSRSBDYXNoaWVyLmFkZHJJRCA9IEFkZHJlc3MuSUQ7YDtcbiAgICBjb25zb2xlLmxvZygn0JjQvdGE0L7RgNC80LDRhtC40Y8g0L4g0LLRgdC10YUg0LrQsNGB0YHQuNGA0LDRhTonKTtcbiAgICB0aGlzLmRiLmVhY2goc3FsLCAoZXJyOiBhbnksIHJvdzogYW55KSA9PiB7XG4gICAgICBpZiAocm93KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHBhcmNlQ2FzaGllcihyb3cpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBnZXRUYXJnZXRDYXNoaWVyczFcbiAgICovXG4gIHB1YmxpYyBnZXRUYXJnZXRDYXNoaWVyczEoKTp2b2lkIHtcbiAgICBjb25zb2xlLmxvZygn0JTQsNC9aSDQv9C+INGD0YHRltGFINC60LDRgdC40YDQsNGFINC80LDQs9Cw0LfQuNC90YMg0LfQsCDQstGB0Y4g0ZbRgdGC0L7RgNGW0Y4g0YDQvtCx0L7RgtC4INC80LDQs9Cw0LfQuNC90ZbQsiBBVEIg0YMg0LzRltGB0YLRliDQm9GM0LLRltCyLCDRj9C60ZYg0LzQsNGO0YLRjCDQsdGW0LvRjNGI0LUgNSDRgNC+0LrRltCyINC00L7RgdCy0ZbQtNGDINGC0LAg0YDQsNC90ZbRiNC1INC/0YDQsNGG0Y7QstCw0LvQuCDRgyBTaWxwbyDQsNCx0L4gQXJzZW46Jyk7XG4gICAgY29uc3Qgc3FsOnN0cmluZyA9IGBTRUxFQ1QgQ2FzaGllci4qLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBZGRyZXNzLiogXG4gICAgICAgICAgICAgICAgICAgICAgICAgIEZST00gQ2FzaGllciwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWRkcmVzcyBcbiAgICAgICAgICAgICAgICAgICAgICAgICBXSEVSRSBDYXNoaWVyLmFkZHJJRCA9IEFkZHJlc3MuSUQgQU5EXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ2FzaGllci5zaG9wSUQgSU4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTRUxFQ1QgU2hvcC5pZCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBGUk9NIFNob3AsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWRkcmVzcyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFdIRVJFIFNob3AuYWRkcklEID0gQWRkcmVzcy5JRCBBTkQgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBZGRyZXNzLkNpdHkgPSAnJHtDaXR5W0NpdHku0JvRjNCy0L7Qsl19JykgQU5EIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ2FzaGllci5sYXN0TmV0IElOICgke05ldC7QoWnQu9GM0L/Qvn0gLCAke05ldC7QkNGA0YHQtdC9fSkgQU5EIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ2FzaGllci5zdGFydFdvcms8PScyMDE2LTAxLTAxJ2A7XG4gICAgY29uc29sZS5sb2coc3FsKTtcbiAgICB0aGlzLmRiLmVhY2goc3FsLCAoZXJyOiBhbnksIHJvdzogYW55KSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUubG9nKHBhcmNlQ2FzaGllcihyb3cpKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBnZXRUYXJnZXRDYXNoaWVyczJcbiAgICovXG4gIHB1YmxpYyBnZXRUYXJnZXRDYXNoaWVyczIoKTp2b2lkIHtcbiAgICBjb25zb2xlLmxvZygn0JTQsNC9aSDQv9C+INGD0YHRltGFINC60LDRgdC40YDQsNGFINC80LDQs9Cw0LfQuNC90YMgQVRCINC30LAg0LDQtNGA0LXRgdC+0Y4g0KjQtdCy0LXQvdC60LAgMTAwLCDRj9C60ZYg0L/RgNCw0YbRjtGO0YLRjCDQvdCwINC60LDRgdCw0YUg0Lcg0L3QtdC/0LDRgNC90LjQvCDRh9C40YHQu9C+0Lwg0YnQvtC/0L7QvdC10LTRltC70LrQsCDRgyDQvdGW0YfQvdGDINC30LzRltC90YMgKDIzOjAwIC0gMDc6MDApJyk7XG4gICAgY29uc3Qgc3FsOnN0cmluZyA9IGBTRUxFQ1QgQ2FzaGllci4qLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBZGRyZXNzLiogXG4gICAgICAgICAgICAgICAgICAgICAgICAgIEZST00gQ2FzaGllciwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWRkcmVzcyBcbiAgICAgICAgICAgICAgICAgICAgICAgICBXSEVSRSBDYXNoaWVyLmFkZHJJRCA9IEFkZHJlc3MuSUQgQU5EIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENhc2hpZXIuc2hvcElEIElOIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU0VMRUNUIFNob3AuaWQgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRlJPTSBTaG9wLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3MgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBXSEVSRSBTaG9wLmFkZHJJRCA9IEFkZHJlc3MuSUQgQU5EIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWRkcmVzcy5zdHJlZXQgPSAn0YPQuy4g0KjQtdCy0YfQtdC90LrQvicgQU5EIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWRkcmVzcy5idWlsZGluZyA9IDEwMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIEFORCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ2FzaGllci5pZCBJTiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTRUxFQ1QgQ2FzaFJlZ2lzdGVyLmNhc2hpZXJJRCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRlJPTSBDYXNoUmVnaXN0ZXIgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgV0hFUkUgQ2FzaFJlZ2lzdGVyLmNhc2hCb3hOdW1iZXIlIDIgQU5EIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICgoQ2FzaFJlZ2lzdGVyLnRyYW5zYWN0aW9uVGltZSBCRVRXRUVOICcwMDowMDowMCcgQU5EICcwNzowMDowMCcpIE9SIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoQ2FzaFJlZ2lzdGVyLnRyYW5zYWN0aW9uVGltZSBCRVRXRUVOICcyMzowMDowMCcgQU5EICcyMzo1OTo1OScpKSBBTkQgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0cmZ0aW1lKCcldycsIENhc2hSZWdpc3Rlci50cmFuc2FjdGlvbkRhdGUpID0gJzEnKWA7XG4gICAgY29uc29sZS5sb2coc3FsKTtcbiAgICB0aGlzLmRiLmVhY2goc3FsLCAoZXJyOiBhbnksIHJvdzogYW55KSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUubG9nKHBhcmNlQ2FzaGllcihyb3cpKTtcbiAgICB9KTtcbiAgfVxufVxuIl19