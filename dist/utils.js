"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkArgs = exports.showHelp = exports.randomPhone = exports.randomPN = exports.parceCashier = exports.dateFormat = exports.addressBuild = exports.nameBuild = void 0;
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
              --getTargetCashiers2
              `);
}
exports.showHelp = showHelp;
function checkArgs() {
    const arg = process.argv[2];
    const argNum = process.argv.length;
    const task = (Object.values(const_1.Task).includes(arg)) ? arg : undefined;
    if ((task === const_1.Task.cashierCreate) && (argNum >= 9))
        return task;
    if ((task === const_1.Task.cashierUpdate) && (argNum >= 7))
        return task;
    if (((task === const_1.Task.cashierDelete) || (task === const_1.Task.getCashierById)) && (argNum >= 4)) {
        return task;
    }
    return task;
}
exports.checkArgs = checkArgs;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsbUNBQTZDO0FBSTdDLHFDQUEwQztBQUUxQyxTQUFnQixTQUFTLENBQUMsU0FBZ0IsRUFBRSxRQUFlLEVBQUUsVUFBaUI7SUFDNUUsT0FBTztRQUNMLFNBQVM7UUFDVCxRQUFRO1FBQ1IsVUFBVTtLQUNYLENBQUM7QUFDSixDQUFDO0FBTkQsOEJBTUM7QUFFRCxTQUFnQixZQUFZLENBQUMsS0FBVSxFQUFFLE9BQWMsRUFBRSxTQUFnQixFQUN2RSxPQUFlLEVBQUUsVUFBa0I7SUFDbkMsT0FBTztRQUNMLElBQUksRUFBRSxLQUFLO1FBQ1gsTUFBTSxFQUFFLE9BQU87UUFDZixRQUFRLEVBQUUsU0FBUztRQUNuQixNQUFNLEVBQUUsT0FBTyxJQUFJLElBQUk7UUFDdkIsU0FBUyxFQUFFLFVBQVUsSUFBSSxJQUFJO0tBQzlCLENBQUM7QUFDSixDQUFDO0FBVEQsb0NBU0M7QUFFRCxTQUFnQixVQUFVLENBQUMsSUFBYyxFQUFFLE1BQWM7SUFDdkQsSUFBSSxPQUFPLEdBQVUsRUFBRSxDQUFDO0lBQ3hCLElBQUksSUFBSSxFQUFFO1FBQ1IsTUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxFQUFFLG9CQUFvQixFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDekUsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRWhDLElBQUksRUFBRSxHQUFtQixJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzdDLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRXJCLElBQUksRUFBRSxHQUFtQixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDeEMsRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMs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QUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUMxQyxNQUFNLElBQUksR0FBb0IsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFlBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztJQUdwRixJQUFJLENBQUMsSUFBSSxLQUFLLFlBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUM7UUFBRSxPQUFPLElBQUksQ0FBQztJQUNoRSxJQUFJLENBQUMsSUFBSSxLQUFLLFlBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUM7UUFBRSxPQUFPLElBQUksQ0FBQztJQUNoRSxJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssWUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLFlBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxFQUFFO1FBQ3RGLE9BQU8sSUFBSSxDQUFDO0tBQ2I7SUFDRCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUM7QUFaRCw4QkFZQyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGhlbHBlcnMsIHV0aWxzLCBldGMuIChsb2dnZXJzLCB0aW1lIHBhcnNlciBldGMuIC0gaWYgdGhlcmUgYXJlIGFueSlcbmltcG9ydCB7IFBOTUFYLCBQTk1JTiwgVGFzayB9IGZyb20gJy4vY29uc3QnO1xuaW1wb3J0IHR5cGUge1xuICBOYW1lLCBBZGRyZXNzLCBJQ2FzaGllcixcbn0gZnJvbSAnLi9tb2RlbHMnO1xuaW1wb3J0IHsgU2V4LCBOZXQsIENpdHkgfSBmcm9tICcuL21vZGVscyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBuYW1lQnVpbGQoZmlyc3ROYW1lOnN0cmluZywgbGFzdE5hbWU6c3RyaW5nLCBwYXRyb255bWljOnN0cmluZyk6TmFtZSB7XG4gIHJldHVybiB7XG4gICAgZmlyc3ROYW1lLFxuICAgIGxhc3ROYW1lLFxuICAgIHBhdHJvbnltaWMsXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRyZXNzQnVpbGQoX2NpdHk6Q2l0eSwgX3N0cmVldDpzdHJpbmcsIF9idWlsZGluZzpudW1iZXIsXG4gIF9saXRlcmE/OnN0cmluZywgX2FwYXJ0bWVudD86bnVtYmVyKTpBZGRyZXNzIHtcbiAgcmV0dXJuIHtcbiAgICBjaXR5OiBfY2l0eSxcbiAgICBzdHJlZXQ6IF9zdHJlZXQsXG4gICAgYnVpbGRpbmc6IF9idWlsZGluZyxcbiAgICBsaXRlcmE6IF9saXRlcmEgfHwgbnVsbCxcbiAgICBhcGFydG1lbnQ6IF9hcGFydG1lbnQgfHwgbnVsbCxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRhdGVGb3JtYXQoZGF0ZTpEYXRlfG51bGwsIGZvcm1hdD86c3RyaW5nKTpzdHJpbmcge1xuICBsZXQgdG1wRGF0ZTpzdHJpbmcgPSAnJztcbiAgaWYgKGRhdGUpIHtcbiAgICBjb25zdCBpbnRsID0gbmV3IEludGwuTnVtYmVyRm9ybWF0KCdydS1ydScsIHsgbWluaW11bUludGVnZXJEaWdpdHM6IDIgfSk7XG4gICAgY29uc3QgeXl5eSA9IGRhdGUuZ2V0RnVsbFllYXIoKTtcblxuICAgIGxldCBtbTpudW1iZXIgfCBzdHJpbmcgPSBkYXRlLmdldE1vbnRoKCkgKyAxO1xuICAgIG1tID0gaW50bC5mb3JtYXQobW0pO1xuXG4gICAgbGV0IGRkOm51bWJlciB8IHN0cmluZyA9IGRhdGUuZ2V0RGF0ZSgpO1xuICAgIGRkID0gaW50bC5mb3JtYXQoZGQpO1xuXG4gICAgc3dpdGNoIChmb3JtYXQpIHtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICBjYXNlICd5eXl5LWRkLW1tJzpcbiAgICAgICAgdG1wRGF0ZSA9IGAke3l5eXl9LSR7bW19LSR7ZGR9YDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdkZC5tbS55eXl5JzpcbiAgICAgICAgdG1wRGF0ZSA9IGAke2RkfS4ke21tfS4ke3l5eXl9YDtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRtcERhdGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJjZUNhc2hpZXIocm93OmFueSk6SUNhc2hpZXIge1xuICBjb25zdCBjYXNoaWVyOklDYXNoaWVyID0ge1xuICAgIGlkOiByb3cuaWQsXG4gICAgcGVyc29ubmVsTnVtYmVyOiByb3cucGVyc29ubmVsTnVtYmVyLFxuICAgIGVtcGxveWVlTmFtZToge1xuICAgICAgZmlyc3ROYW1lOiByb3cuZmlyc3ROYW1lLFxuICAgICAgbGFzdE5hbWU6IHJvdy5sYXN0TmFtZSxcbiAgICAgIHBhdHJvbnltaWM6IHJvdy5wYXRyb255bWljLFxuICAgIH0sXG4gICAgc2V4OiBTZXhbcm93LnNleF0gYXMgdW5rbm93biBhcyBTZXgsXG4gICAgcGhvbmU6IHJvdy5waG9uZSxcbiAgICBhZGRyOiB7XG4gICAgICBjaXR5OiByb3cuY2l0eSxcbiAgICAgIHN0cmVldDogcm93LnN0cmVldCxcbiAgICAgIGJ1aWxkaW5nOiByb3cuYnVpbGRpbmcsXG4gICAgICBsaXRlcmE6IHJvdy5saXRlcmEsXG4gICAgICBhcGFydG1lbnQ6IHJvdy5hcGFydG1lbnQsXG4gICAgfSxcbiAgICBiaXJ0aGRheTogcm93LmJpcnRoZGF5LFxuICAgIHNob3BJRDogcm93LnNob3BJRCxcbiAgICBzdGFydFdvcms6IHJvdy5zdGFydFdvcmssXG4gICAgZW5kV29yazogcm93LmVuZFdvcmssXG4gICAgbGFzdE5ldDogTmV0W3Jvdy5sYXN0TmV0XSBhcyB1bmtub3duIGFzIE5ldCxcbiAgfTtcbiAgcmV0dXJuIGNhc2hpZXI7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgcmFuZG9tIGludGVnZXIgYmV0d2VlbiBtaW4gYW5kIG1heCAoaW5jbHVzaXZlKVxuICogQHJldHVybnMgcmFuZG9tbHkgZ2VuZXJhdGVkIGludGVnZXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJhbmRvbVBOKCk6IG51bWJlciB7XG4gIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoUE5NQVggLSBQTk1JTiArIDEpICsgUE5NSU4pO1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHJhbmRvbSBwaG9uZSBudW1iZXJcbiAqIEByZXR1cm5zIHJhbmRvbWx5IGdlbmVyYXRlZCBpbnRlZ2VyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByYW5kb21QaG9uZSgpOiBzdHJpbmcge1xuICBjb25zdCBvcGVyYXRvciA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICg5OSAtIDUwKSArIDUwKTtcbiAgY29uc3QgbnVtYmVyID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKDk5OTk5OTkgLSAxMDAwMDAwKSArIDEwMDAwMDApO1xuICByZXR1cm4gYDM4MCR7b3BlcmF0b3J9JHtudW1iZXJ9YDtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBoZWxwIHRvcGljIGZvciBjb21tYW5kIGxpbmUgdXNhZ2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNob3dIZWxwKCk6dm9pZCB7XG4gIGNvbnNvbGUubG9nKGBQbGVhc2UsIHVzZSBvbmUgZnJvbSB0aGUgbmV4dCBvcHRpb25zOlxuICAgICAgICAgICAgICAke1Rhc2suY2FzaGllckNyZWF0ZX0gbGFzdE5hbWUgZmlyc3ROYW1lIGNpdHkgc3RyZWV0IGJ1aWxkaW5nIGFwYXJ0bWVudCxcbiAgICAgICAgICAgICAgJHtUYXNrLmNhc2hpZXJVcGRhdGV9IGlkIHBhdHJvbnltaWMgYnVpbGRpbmcgYXBhcnRtZW50LCBcbiAgICAgICAgICAgICAgJHtUYXNrLmdldENhc2hpZXJCeUlkfSBpZCxcbiAgICAgICAgICAgICAgJHtUYXNrLmNhc2hpZXJEZWxldGV9IGlkLCBcbiAgICAgICAgICAgICAgJHtUYXNrLmdldEFsbENhc2hpZXJzfSwgXG4gICAgICAgICAgICAgICR7VGFzay51c2VGaWx0ZXIxfSwgXG4gICAgICAgICAgICAgICR7VGFzay51c2VGaWx0ZXIyfSwgXG4gICAgICAgICAgICAgICR7VGFzay5nZXRUYXJnZXRDYXNoaWVyczF9LCAgXG4gICAgICAgICAgICAgICR7VGFzay5nZXRUYXJnZXRDYXNoaWVyczJ9XG5cbiAgICAgICAgICAgICAgc29tZXRoaW5nIGxpa2UgdGhpczpcbiAgICAgICAgICAgICAgLS1jYXNoaWVyQ3JlYXRlINCR0L7QsdC60L7QstCwINCd0LDRgtCw0LvRjNGPINCl0LDRgNGM0LrQvtCyICfRg9C7LiDQmtCw0YjRgtCw0L3QvtCy0LDRjycgMTggMzYgXG4gICAgICAgICAgICAgIC0tY2FzaGllclVwZGF0ZSA1NyDQktCw0LvQtdC90YLQuNC90L7QstC90LAgMzQgMjhcbiAgICAgICAgICAgICAgLS1nZXRDYXNoaWVyQnlJZCA0MSAgXG4gICAgICAgICAgICAgIC0tY2FzaGllckRlbGV0ZSAzOFxuICAgICAgICAgICAgICAtLXVzZUZpbHRlcjFcbiAgICAgICAgICAgICAgLS11c2VGaWx0ZXIyXG4gICAgICAgICAgICAgIC0tZ2V0VGFyZ2V0Q2FzaGllcnMxXG4gICAgICAgICAgICAgIC0tZ2V0VGFyZ2V0Q2FzaGllcnMyXG4gICAgICAgICAgICAgIGApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tBcmdzKCk6VGFzayB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IGFyZzphbnkgPSBwcm9jZXNzLmFyZ3ZbMl07XG4gIGNvbnN0IGFyZ051bTpudW1iZXIgPSBwcm9jZXNzLmFyZ3YubGVuZ3RoO1xuICBjb25zdCB0YXNrOlRhc2sgfCB1bmRlZmluZWQgPSAoT2JqZWN0LnZhbHVlcyhUYXNrKS5pbmNsdWRlcyhhcmcpKSA/IGFyZyA6IHVuZGVmaW5lZDtcbiAgLy8gY29uc29sZS5sb2codGFzaywgcHJvY2Vzcy5hcmd2WzJdKTtcblxuICBpZiAoKHRhc2sgPT09IFRhc2suY2FzaGllckNyZWF0ZSkgJiYgKGFyZ051bSA+PSA5KSkgcmV0dXJuIHRhc2s7XG4gIGlmICgodGFzayA9PT0gVGFzay5jYXNoaWVyVXBkYXRlKSAmJiAoYXJnTnVtID49IDcpKSByZXR1cm4gdGFzaztcbiAgaWYgKCgodGFzayA9PT0gVGFzay5jYXNoaWVyRGVsZXRlKSB8fCAodGFzayA9PT0gVGFzay5nZXRDYXNoaWVyQnlJZCkpICYmIChhcmdOdW0gPj0gNCkpIHtcbiAgICByZXR1cm4gdGFzaztcbiAgfVxuICByZXR1cm4gdGFzaztcbn1cbiJdfQ==