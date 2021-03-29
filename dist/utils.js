"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseArgs = exports.showHelp = exports.randomPhone = exports.randomPN = exports.parceCashier = exports.dateFormat = exports.addressBuild = exports.nameBuild = void 0;
const const_1 = require("./const");
const models_1 = require("./models");
function nameBuild(firstName, lastName, patronymic) {
    return {
        firstName,
        lastName,
        patronymic,
    };
}
exports.nameBuild = nameBuild;
function addressBuild(_city, _street, _building, _litera, _apartment) {
    return {
        city: _city,
        street: _street,
        building: _building,
        litera: _litera || null,
        apartment: _apartment || null,
    };
}
exports.addressBuild = addressBuild;
function dateFormat(date, format) {
    let tmpDate = '';
    if (date) {
        const intl = new Intl.NumberFormat('ru-ru', { minimumIntegerDigits: 2 });
        const yyyy = date.getFullYear();
        let mm = date.getMonth() + 1;
        mm = intl.format(mm);
        let dd = date.getDate();
        dd = intl.format(dd);
        switch (format) {
            default:
            case 'yyyy-dd-mm':
                tmpDate = `${yyyy}-${mm}-${dd}`;
                break;
            case 'dd.mm.yyyy':
                tmpDate = `${dd}.${mm}.${yyyy}`;
                break;
        }
    }
    return tmpDate;
}
exports.dateFormat = dateFormat;
function parceCashier(row) {
    const cashier = {
        id: row.id,
        personnelNumber: row.personnelNumber,
        employeeName: {
            firstName: row.firstName,
            lastName: row.lastName,
            patronymic: row.patronymic,
        },
        sex: models_1.Sex[row.sex],
        phone: row.phone,
        addr: {
            city: row.city,
            street: row.street,
            building: row.building,
            litera: row.litera,
            apartment: row.apartment,
        },
        birthday: row.birthday,
        shopID: row.shopID,
        startWork: row.startWork,
        endWork: row.endWork,
        lastNet: models_1.Net[row.lastNet],
    };
    return cashier;
}
exports.parceCashier = parceCashier;
function randomPN() {
    return Math.floor(Math.random() * (const_1.PNMAX - const_1.PNMIN + 1) + const_1.PNMIN);
}
exports.randomPN = randomPN;
function randomPhone() {
    const operator = Math.floor(Math.random() * (99 - 50) + 50);
    const number = Math.floor(Math.random() * (9999999 - 1000000) + 1000000);
    return `380${operator}${number}`;
}
exports.randomPhone = randomPhone;
function showHelp() {
    console.log(`Please, use one from the next options:
              ${const_1.Task.cashierCreate} lastName firstName city street building apartment,
              ${const_1.Task.cashierUpdate} id patronymic building apartment, 
              ${const_1.Task.getCashierById} id,
              ${const_1.Task.cashierDelete} id, 
              ${const_1.Task.getAllCashiers}, 
              ${const_1.Task.useFilter1}, 
              ${const_1.Task.useFilter2}, 
              ${const_1.Task.getTargetCashiers1},  
              ${const_1.Task.getTargetCashiers2}
              something like this:
              --cashierCreate Бобкова Наталья Харьков 'ул. Каштановая' 18 36 
              --cashierUpdate 57 Валентиновна 34 28
              --getCashierById 41  
              --cashierDelete 38
              --useFilter1
              --useFilter2
              --getTargetCashiers1
              or 
              --getTargetCashiers2
              `);
}
exports.showHelp = showHelp;
function parseArgs() {
}
exports.parseArgs = parseArgs;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsbUNBQTZDO0FBSTdDLHFDQUEwQztBQUUxQyxTQUFnQixTQUFTLENBQUMsU0FBZ0IsRUFBRSxRQUFlLEVBQUUsVUFBaUI7SUFDNUUsT0FBTztRQUNMLFNBQVM7UUFDVCxRQUFRO1FBQ1IsVUFBVTtLQUNYLENBQUM7QUFDSixDQUFDO0FBTkQsOEJBTUM7QUFFRCxTQUFnQixZQUFZLENBQUMsS0FBVSxFQUFFLE9BQWMsRUFBRSxTQUFnQixFQUN2RSxPQUFlLEVBQUUsVUFBa0I7SUFDbkMsT0FBTztRQUNMLElBQUksRUFBRSxLQUFLO1FBQ1gsTUFBTSxFQUFFLE9BQU87UUFDZixRQUFRLEVBQUUsU0FBUztRQUNuQixNQUFNLEVBQUUsT0FBTyxJQUFJLElBQUk7UUFDdkIsU0FBUyxFQUFFLFVBQVUsSUFBSSxJQUFJO0tBQzlCLENBQUM7QUFDSixDQUFDO0FBVEQsb0NBU0M7QUFFRCxTQUFnQixVQUFVLENBQUMsSUFBYyxFQUFFLE1BQWM7SUFDdkQsSUFBSSxPQUFPLEdBQVUsRUFBRSxDQUFDO0lBQ3hCLElBQUksSUFBSSxFQUFFO1FBQ1IsTUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxFQUFFLG9CQUFvQixFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDekUsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRWhDLElBQUksRUFBRSxHQUFtQixJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzdDLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRXJCLElBQUksRUFBRSxHQUFtQixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDeEMsRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMs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bWUgcGFyc2VyIGV0Yy4gLSBpZiB0aGVyZSBhcmUgYW55KVxuaW1wb3J0IHsgUE5NQVgsIFBOTUlOLCBUYXNrIH0gZnJvbSAnLi9jb25zdCc7XG5pbXBvcnQgdHlwZSB7XG4gIE5hbWUsIEFkZHJlc3MsIElDYXNoaWVyLFxufSBmcm9tICcuL21vZGVscyc7XG5pbXBvcnQgeyBTZXgsIE5ldCwgQ2l0eSB9IGZyb20gJy4vbW9kZWxzJztcblxuZXhwb3J0IGZ1bmN0aW9uIG5hbWVCdWlsZChmaXJzdE5hbWU6c3RyaW5nLCBsYXN0TmFtZTpzdHJpbmcsIHBhdHJvbnltaWM6c3RyaW5nKTpOYW1lIHtcbiAgcmV0dXJuIHtcbiAgICBmaXJzdE5hbWUsXG4gICAgbGFzdE5hbWUsXG4gICAgcGF0cm9ueW1pYyxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZHJlc3NCdWlsZChfY2l0eTpDaXR5LCBfc3RyZWV0OnN0cmluZywgX2J1aWxkaW5nOm51bWJlcixcbiAgX2xpdGVyYT86c3RyaW5nLCBfYXBhcnRtZW50PzpudW1iZXIpOkFkZHJlc3Mge1xuICByZXR1cm4ge1xuICAgIGNpdHk6IF9jaXR5LFxuICAgIHN0cmVldDogX3N0cmVldCxcbiAgICBidWlsZGluZzogX2J1aWxkaW5nLFxuICAgIGxpdGVyYTogX2xpdGVyYSB8fCBudWxsLFxuICAgIGFwYXJ0bWVudDogX2FwYXJ0bWVudCB8fCBudWxsLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGF0ZUZvcm1hdChkYXRlOkRhdGV8bnVsbCwgZm9ybWF0PzpzdHJpbmcpOnN0cmluZyB7XG4gIGxldCB0bXBEYXRlOnN0cmluZyA9ICcnO1xuICBpZiAoZGF0ZSkge1xuICAgIGNvbnN0IGludGwgPSBuZXcgSW50bC5OdW1iZXJGb3JtYXQoJ3J1LXJ1JywgeyBtaW5pbXVtSW50ZWdlckRpZ2l0czogMiB9KTtcbiAgICBjb25zdCB5eXl5ID0gZGF0ZS5nZXRGdWxsWWVhcigpO1xuXG4gICAgbGV0IG1tOm51bWJlciB8IHN0cmluZyA9IGRhdGUuZ2V0TW9udGgoKSArIDE7XG4gICAgbW0gPSBpbnRsLmZvcm1hdChtbSk7XG5cbiAgICBsZXQgZGQ6bnVtYmVyIHwgc3RyaW5nID0gZGF0ZS5nZXREYXRlKCk7XG4gICAgZGQgPSBpbnRsLmZvcm1hdChkZCk7XG5cbiAgICBzd2l0Y2ggKGZvcm1hdCkge1xuICAgICAgZGVmYXVsdDpcbiAgICAgIGNhc2UgJ3l5eXktZGQtbW0nOlxuICAgICAgICB0bXBEYXRlID0gYCR7eXl5eX0tJHttbX0tJHtkZH1gO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2RkLm1tLnl5eXknOlxuICAgICAgICB0bXBEYXRlID0gYCR7ZGR9LiR7bW19LiR7eXl5eX1gO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdG1wRGF0ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcmNlQ2FzaGllcihyb3c6YW55KTpJQ2FzaGllciB7XG4gIGNvbnN0IGNhc2hpZXI6SUNhc2hpZXIgPSB7XG4gICAgaWQ6IHJvdy5pZCxcbiAgICBwZXJzb25uZWxOdW1iZXI6IHJvdy5wZXJzb25uZWxOdW1iZXIsXG4gICAgZW1wbG95ZWVOYW1lOiB7XG4gICAgICBmaXJzdE5hbWU6IHJvdy5maXJzdE5hbWUsXG4gICAgICBsYXN0TmFtZTogcm93Lmxhc3ROYW1lLFxuICAgICAgcGF0cm9ueW1pYzogcm93LnBhdHJvbnltaWMsXG4gICAgfSxcbiAgICBzZXg6IFNleFtyb3cuc2V4XSBhcyB1bmtub3duIGFzIFNleCxcbiAgICBwaG9uZTogcm93LnBob25lLFxuICAgIGFkZHI6IHtcbiAgICAgIGNpdHk6IHJvdy5jaXR5LFxuICAgICAgc3RyZWV0OiByb3cuc3RyZWV0LFxuICAgICAgYnVpbGRpbmc6IHJvdy5idWlsZGluZyxcbiAgICAgIGxpdGVyYTogcm93LmxpdGVyYSxcbiAgICAgIGFwYXJ0bWVudDogcm93LmFwYXJ0bWVudCxcbiAgICB9LFxuICAgIGJpcnRoZGF5OiByb3cuYmlydGhkYXksXG4gICAgc2hvcElEOiByb3cuc2hvcElELFxuICAgIHN0YXJ0V29yazogcm93LnN0YXJ0V29yayxcbiAgICBlbmRXb3JrOiByb3cuZW5kV29yayxcbiAgICBsYXN0TmV0OiBOZXRbcm93Lmxhc3ROZXRdIGFzIHVua25vd24gYXMgTmV0LFxuICB9O1xuICByZXR1cm4gY2FzaGllcjtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSByYW5kb20gaW50ZWdlciBiZXR3ZWVuIG1pbiBhbmQgbWF4IChpbmNsdXNpdmUpXG4gKiBAcmV0dXJucyByYW5kb21seSBnZW5lcmF0ZWQgaW50ZWdlclxuICovXG5leHBvcnQgZnVuY3Rpb24gcmFuZG9tUE4oKTogbnVtYmVyIHtcbiAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChQTk1BWCAtIFBOTUlOICsgMSkgKyBQTk1JTik7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgcmFuZG9tIHBob25lIG51bWJlclxuICogQHJldHVybnMgcmFuZG9tbHkgZ2VuZXJhdGVkIGludGVnZXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJhbmRvbVBob25lKCk6IHN0cmluZyB7XG4gIGNvbnN0IG9wZXJhdG9yID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKDk5IC0gNTApICsgNTApO1xuICBjb25zdCBudW1iZXIgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoOTk5OTk5OSAtIDEwMDAwMDApICsgMTAwMDAwMCk7XG4gIHJldHVybiBgMzgwJHtvcGVyYXRvcn0ke251bWJlcn1gO1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIGhhbHAgdG9waWMgZm9yIGNvbW1hbmQgbGluZSB1c2FnZVxuICovXG5leHBvcnQgZnVuY3Rpb24gc2hvd0hlbHAoKTp2b2lkIHtcbiAgY29uc29sZS5sb2coYFBsZWFzZSwgdXNlIG9uZSBmcm9tIHRoZSBuZXh0IG9wdGlvbnM6XG4gICAgICAgICAgICAgICR7VGFzay5jYXNoaWVyQ3JlYXRlfSBsYXN0TmFtZSBmaXJzdE5hbWUgY2l0eSBzdHJlZXQgYnVpbGRpbmcgYXBhcnRtZW50LFxuICAgICAgICAgICAgICAke1Rhc2suY2FzaGllclVwZGF0ZX0gaWQgcGF0cm9ueW1pYyBidWlsZGluZyBhcGFydG1lbnQsIFxuICAgICAgICAgICAgICAke1Rhc2suZ2V0Q2FzaGllckJ5SWR9IGlkLFxuICAgICAgICAgICAgICAke1Rhc2suY2FzaGllckRlbGV0ZX0gaWQsIFxuICAgICAgICAgICAgICAke1Rhc2suZ2V0QWxsQ2FzaGllcnN9LCBcbiAgICAgICAgICAgICAgJHtUYXNrLnVzZUZpbHRlcjF9LCBcbiAgICAgICAgICAgICAgJHtUYXNrLnVzZUZpbHRlcjJ9LCBcbiAgICAgICAgICAgICAgJHtUYXNrLmdldFRhcmdldENhc2hpZXJzMX0sICBcbiAgICAgICAgICAgICAgJHtUYXNrLmdldFRhcmdldENhc2hpZXJzMn1cbiAgICAgICAgICAgICAgc29tZXRoaW5nIGxpa2UgdGhpczpcbiAgICAgICAgICAgICAgLS1jYXNoaWVyQ3JlYXRlINCR0L7QsdC60L7QstCwINCd0LDRgtCw0LvRjNGPINCl0LDRgNGM0LrQvtCyICfRg9C7LiDQmtCw0YjRgtCw0L3QvtCy0LDRjycgMTggMzYgXG4gICAgICAgICAgICAgIC0tY2FzaGllclVwZGF0ZSA1NyDQktCw0LvQtdC90YLQuNC90L7QstC90LAgMzQgMjhcbiAgICAgICAgICAgICAgLS1nZXRDYXNoaWVyQnlJZCA0MSAgXG4gICAgICAgICAgICAgIC0tY2FzaGllckRlbGV0ZSAzOFxuICAgICAgICAgICAgICAtLXVzZUZpbHRlcjFcbiAgICAgICAgICAgICAgLS11c2VGaWx0ZXIyXG4gICAgICAgICAgICAgIC0tZ2V0VGFyZ2V0Q2FzaGllcnMxXG4gICAgICAgICAgICAgIG9yIFxuICAgICAgICAgICAgICAtLWdldFRhcmdldENhc2hpZXJzMlxuICAgICAgICAgICAgICBgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQXJncygpOnZvaWQge1xuXG59XG4iXX0=