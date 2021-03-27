"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parceCashier = exports.dateFormat = exports.addressBuild = exports.nameBuild = void 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBSUEscUNBQTBDO0FBRTFDLFNBQWdCLFNBQVMsQ0FBQyxTQUFnQixFQUFFLFFBQWUsRUFBRSxVQUFpQjtJQUM1RSxPQUFPO1FBQ0wsU0FBUztRQUNULFFBQVE7UUFDUixVQUFVO0tBQ1gsQ0FBQztBQUNKLENBQUM7QUFORCw4QkFNQztBQUVELFNBQWdCLFlBQVksQ0FBQyxLQUFVLEVBQUUsT0FBYyxFQUFFLFNBQWdCLEVBQ3ZFLE9BQWUsRUFBRSxVQUFrQjtJQUNuQyxPQUFPO1FBQ0wsSUFBSSxFQUFFLEtBQUs7UUFDWCxNQUFNLEVBQUUsT0FBTztRQUNmLFFBQVEsRUFBRSxTQUFTO1FBQ25CLE1BQU0sRUFBRSxPQUFPLElBQUksSUFBSTtRQUN2QixTQUFTLEVBQUUsVUFBVSxJQUFJLElBQUk7S0FDOUIsQ0FBQztBQUNKLENBQUM7QUFURCxvQ0FTQztBQUVELFNBQWdCLFVBQVUsQ0FBQyxJQUFjLEVBQUUsTUFBYztJQUN2RCxJQUFJLE9BQU8sR0FBVSxFQUFFLENBQUM7SUFDeEIsSUFBSSxJQUFJLEVBQUU7UUFDUixNQUFNLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLEVBQUUsb0JBQW9CLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN6RSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFaEMsSUFBSSxFQUFFLEdBQW1CLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDN0MsRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFckIsSUFBSSxFQUFFLEdBQW1CLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN4QyxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUVyQixRQUFRLE1BQU0sRUFBRTtZQUNkLFFBQVE7WUFDUixLQUFLLFlBQVk7Z0JBQ2YsT0FBTyxHQUFHLEdBQUcsSUFBSSxJQUFJLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQztnQkFDaEMsTUFBTTtZQUNSLEtBQUssWUFBWTtnQkFDZixPQUFPLEdBQUcsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDO2dCQUNoQyxNQUFNO1NBQ1Q7S0FDRjtJQUVELE9BQU8sT0FBTyxDQUFDO0FBQ2pCLENBQUM7QUF4QkQsZ0NBd0JDO0FBRUQsU0FBZ0IsWUFBWSxDQUFDLEdBQU87SUFDbEMsTUFBTSxPQUFPLEdBQVk7UUFDdkIsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFO1FBQ1YsZUFBZSxFQUFFLEdBQUcsQ0FBQyxlQUFlO1FBQ3BDLFlBQVksRUFBRTtZQUNaLFNBQVMsRUFBRSxHQUFHLENBQUMsU0FBUztZQUN4QixRQUFRLEVBQUUsR0FBRyxDQUFDLFFBQVE7WUFDdEIsVUFBVSxFQUFFLEdBQUcsQ0FBQyxVQUFVO1NBQzNCO1FBQ0QsR0FBRyxFQUFFLFlBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFtQjtRQUNuQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEtBQUs7UUFDaEIsSUFBSSxFQUFFO1lBQ0osSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJO1lBQ2QsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNO1lBQ2xCLFFBQVEsRUFBRSxHQUFHLENBQUMsUUFBUTtZQUN0QixNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU07WUFDbEIsU0FBUyxFQUFFLEdBQUcsQ0FBQyxTQUFTO1NBQ3pCO1FBQ0QsUUFBUSxFQUFFLEdBQUcsQ0FBQyxRQUFRO1FBQ3RCLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTTtRQUNsQixTQUFTLEVBQUUsR0FBRyxDQUFDLFNBQVM7UUFDeEIsT0FBTyxFQUFFLEdBQUcsQ0FBQyxPQUFPO1FBQ3BCLE9BQU8sRUFBRSxZQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBbUI7S0FDNUMsQ0FBQztJQUNGLE9BQU8sT0FBTyxDQUFDO0FBQ2pCLENBQUM7QUF6QkQsb0NBeUJDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gaGVscGVycywgdXRpbHMsIGV0Yy4gKGxvZ2dlcnMsIHRpbWUgcGFyc2VyIGV0Yy4gLSBpZiB0aGVyZSBhcmUgYW55KVxuaW1wb3J0IHR5cGUge1xuICBOYW1lLCBBZGRyZXNzLCBJQ2FzaGllcixcbn0gZnJvbSAnLi9tb2RlbHMnO1xuaW1wb3J0IHsgU2V4LCBOZXQsIENpdHkgfSBmcm9tICcuL21vZGVscyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBuYW1lQnVpbGQoZmlyc3ROYW1lOnN0cmluZywgbGFzdE5hbWU6c3RyaW5nLCBwYXRyb255bWljOnN0cmluZyk6TmFtZSB7XG4gIHJldHVybiB7XG4gICAgZmlyc3ROYW1lLFxuICAgIGxhc3ROYW1lLFxuICAgIHBhdHJvbnltaWMsXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRyZXNzQnVpbGQoX2NpdHk6Q2l0eSwgX3N0cmVldDpzdHJpbmcsIF9idWlsZGluZzpudW1iZXIsXG4gIF9saXRlcmE/OnN0cmluZywgX2FwYXJ0bWVudD86bnVtYmVyKTpBZGRyZXNzIHtcbiAgcmV0dXJuIHtcbiAgICBjaXR5OiBfY2l0eSxcbiAgICBzdHJlZXQ6IF9zdHJlZXQsXG4gICAgYnVpbGRpbmc6IF9idWlsZGluZyxcbiAgICBsaXRlcmE6IF9saXRlcmEgfHwgbnVsbCxcbiAgICBhcGFydG1lbnQ6IF9hcGFydG1lbnQgfHwgbnVsbCxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRhdGVGb3JtYXQoZGF0ZTpEYXRlfG51bGwsIGZvcm1hdD86c3RyaW5nKTpzdHJpbmcge1xuICBsZXQgdG1wRGF0ZTpzdHJpbmcgPSAnJztcbiAgaWYgKGRhdGUpIHtcbiAgICBjb25zdCBpbnRsID0gbmV3IEludGwuTnVtYmVyRm9ybWF0KCdydS1ydScsIHsgbWluaW11bUludGVnZXJEaWdpdHM6IDIgfSk7XG4gICAgY29uc3QgeXl5eSA9IGRhdGUuZ2V0RnVsbFllYXIoKTtcblxuICAgIGxldCBtbTpudW1iZXIgfCBzdHJpbmcgPSBkYXRlLmdldE1vbnRoKCkgKyAxO1xuICAgIG1tID0gaW50bC5mb3JtYXQobW0pO1xuXG4gICAgbGV0IGRkOm51bWJlciB8IHN0cmluZyA9IGRhdGUuZ2V0RGF0ZSgpO1xuICAgIGRkID0gaW50bC5mb3JtYXQoZGQpO1xuXG4gICAgc3dpdGNoIChmb3JtYXQpIHtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICBjYXNlICd5eXl5LWRkLW1tJzpcbiAgICAgICAgdG1wRGF0ZSA9IGAke3l5eXl9LSR7bW19LSR7ZGR9YDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdkZC5tbS55eXl5JzpcbiAgICAgICAgdG1wRGF0ZSA9IGAke2RkfS4ke21tfS4ke3l5eXl9YDtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRtcERhdGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJjZUNhc2hpZXIocm93OmFueSk6SUNhc2hpZXIge1xuICBjb25zdCBjYXNoaWVyOklDYXNoaWVyID0ge1xuICAgIGlkOiByb3cuaWQsXG4gICAgcGVyc29ubmVsTnVtYmVyOiByb3cucGVyc29ubmVsTnVtYmVyLFxuICAgIGVtcGxveWVlTmFtZToge1xuICAgICAgZmlyc3ROYW1lOiByb3cuZmlyc3ROYW1lLFxuICAgICAgbGFzdE5hbWU6IHJvdy5sYXN0TmFtZSxcbiAgICAgIHBhdHJvbnltaWM6IHJvdy5wYXRyb255bWljLFxuICAgIH0sXG4gICAgc2V4OiBTZXhbcm93LnNleF0gYXMgdW5rbm93biBhcyBTZXgsXG4gICAgcGhvbmU6IHJvdy5waG9uZSxcbiAgICBhZGRyOiB7XG4gICAgICBjaXR5OiByb3cuY2l0eSxcbiAgICAgIHN0cmVldDogcm93LnN0cmVldCxcbiAgICAgIGJ1aWxkaW5nOiByb3cuYnVpbGRpbmcsXG4gICAgICBsaXRlcmE6IHJvdy5saXRlcmEsXG4gICAgICBhcGFydG1lbnQ6IHJvdy5hcGFydG1lbnQsXG4gICAgfSxcbiAgICBiaXJ0aGRheTogcm93LmJpcnRoZGF5LFxuICAgIHNob3BJRDogcm93LnNob3BJRCxcbiAgICBzdGFydFdvcms6IHJvdy5zdGFydFdvcmssXG4gICAgZW5kV29yazogcm93LmVuZFdvcmssXG4gICAgbGFzdE5ldDogTmV0W3Jvdy5sYXN0TmV0XSBhcyB1bmtub3duIGFzIE5ldCxcbiAgfTtcbiAgcmV0dXJuIGNhc2hpZXI7XG59XG4iXX0=