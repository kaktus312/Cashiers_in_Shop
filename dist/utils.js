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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBSUEscUNBQTBDO0FBRTFDLFNBQWdCLFNBQVMsQ0FBQyxTQUFnQixFQUFFLFFBQWUsRUFBRSxVQUFpQjtJQUM1RSxPQUFPO1FBQ0wsU0FBUztRQUNULFFBQVE7UUFDUixVQUFVO0tBQ1gsQ0FBQztBQUNKLENBQUM7QUFORCw4QkFNQztBQUVELFNBQWdCLFlBQVksQ0FBQyxLQUFVLEVBQUUsT0FBYyxFQUFFLFNBQWdCLEVBQ3ZFLE9BQWUsRUFBRSxVQUFrQjtJQUNuQyxPQUFPO1FBQ0wsSUFBSSxFQUFFLEtBQUs7UUFDWCxNQUFNLEVBQUUsT0FBTztRQUNmLFFBQVEsRUFBRSxTQUFTO1FBQ25CLE1BQU0sRUFBRSxPQUFPLElBQUksSUFBSTtRQUN2QixTQUFTLEVBQUUsVUFBVSxJQUFJLElBQUk7S0FDOUIsQ0FBQztBQUNKLENBQUM7QUFURCxvQ0FTQztBQUVELFNBQWdCLFVBQVUsQ0FBQyxJQUFjLEVBQUUsTUFBYztJQUN2RCxJQUFJLE9BQU8sR0FBVSxFQUFFLENBQUM7SUFDeEIsSUFBSSxJQUFJLEVBQUU7UUFDUixNQUFNLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLEVBQUUsb0JBQW9CLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN6RSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFaEMsSUFBSSxFQUFFLEdBQW1CLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDN0MsRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFckIsSUFBSSxFQUFFLEdBQW1CLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN4QyxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUVyQixRQUFRLE1BQU0sRUFBRTtZQUNkLFFBQVE7WUFDUixLQUFLLFlBQVk7Z0JBQ2YsT0FBTyxHQUFHLEdBQUcsSUFBSSxJQUFJLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQztnQkFDaEMsTUFBTTtZQUNSLEtBQUssWUFBWTtnQkFDZixPQUFPLEdBQUcsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDO2dCQUNoQyxNQUFNO1NBQ1Q7S0FDRjtJQUVELE9BQU8sT0FBTyxDQUFDO0FBQ2pCLENBQUM7QUF4QkQsZ0NBd0JDO0FBRUQsU0FBZ0IsWUFBWSxDQUFDLEdBQU87SUFDbEMsTUFBTSxPQUFPLEdBQVk7UUFDdkIsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFO1FBQ1YsZUFBZSxFQUFFLEdBQUcsQ0FBQyxlQUFlO1FBQ3BDLFlBQVksRUFBRTtZQUNaLFNBQVMsRUFBRSxHQUFHLENBQUMsU0FBUztZQUN4QixRQUFRLEVBQUUsR0FBRyxDQUFDLFFBQVE7WUFDdEIsVUFBVSxFQUFFLEdBQUcsQ0FBQyxVQUFVO1NBQzNCO1FBQ0QsR0FBRyxFQUFFLFlBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFtQjtRQUNuQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEtBQUs7UUFDaEIsSUFBSSxFQUFFO1lBQ0osSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJO1lBQ2QsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNO1lBQ2xCLFFBQVEsRUFBRSxHQUFHLENBQUMsUUFBUTtZQUN0QixNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU07WUFDbEIsU0FBUyxFQUFFLEdBQUcsQ0FBQyxTQUFTO1NBQ3pCO1FBQ0QsUUFBUSxFQUFFLEdBQUcsQ0FBQyxRQUFRO1FBQ3RCLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTTtRQUNsQixTQUFTLEVBQUUsR0FBRyxDQUFDLFNBQVM7UUFDeEIsT0FBTyxFQUFFLEdBQUcsQ0FBQyxPQUFPO1FBQ3BCLE9BQU8sRUFBRSxZQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBbUI7S0FDNUMsQ0FBQztJQUNGLE9BQU8sT0FBTyxDQUFDO0FBQ2pCLENBQUM7QUF6QkQsb0NBeUJDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gaGVscGVycywgdXRpbHMsIGV0Yy4gKGxvZ2dlcnMsIHRpbWUgcGFyc2VyIGV0Yy4gLSBpZiB0aGVyZSBhcmUgYW55KVxyXG5pbXBvcnQgdHlwZSB7XHJcbiAgTmFtZSwgQWRkcmVzcywgSUNhc2hpZXIsXHJcbn0gZnJvbSAnLi9tb2RlbHMnO1xyXG5pbXBvcnQgeyBTZXgsIE5ldCwgQ2l0eSB9IGZyb20gJy4vbW9kZWxzJztcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBuYW1lQnVpbGQoZmlyc3ROYW1lOnN0cmluZywgbGFzdE5hbWU6c3RyaW5nLCBwYXRyb255bWljOnN0cmluZyk6TmFtZSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGZpcnN0TmFtZSxcclxuICAgIGxhc3ROYW1lLFxyXG4gICAgcGF0cm9ueW1pYyxcclxuICB9O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gYWRkcmVzc0J1aWxkKF9jaXR5OkNpdHksIF9zdHJlZXQ6c3RyaW5nLCBfYnVpbGRpbmc6bnVtYmVyLFxyXG4gIF9saXRlcmE/OnN0cmluZywgX2FwYXJ0bWVudD86bnVtYmVyKTpBZGRyZXNzIHtcclxuICByZXR1cm4ge1xyXG4gICAgY2l0eTogX2NpdHksXHJcbiAgICBzdHJlZXQ6IF9zdHJlZXQsXHJcbiAgICBidWlsZGluZzogX2J1aWxkaW5nLFxyXG4gICAgbGl0ZXJhOiBfbGl0ZXJhIHx8IG51bGwsXHJcbiAgICBhcGFydG1lbnQ6IF9hcGFydG1lbnQgfHwgbnVsbCxcclxuICB9O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZGF0ZUZvcm1hdChkYXRlOkRhdGV8bnVsbCwgZm9ybWF0PzpzdHJpbmcpOnN0cmluZyB7XHJcbiAgbGV0IHRtcERhdGU6c3RyaW5nID0gJyc7XHJcbiAgaWYgKGRhdGUpIHtcclxuICAgIGNvbnN0IGludGwgPSBuZXcgSW50bC5OdW1iZXJGb3JtYXQoJ3J1LXJ1JywgeyBtaW5pbXVtSW50ZWdlckRpZ2l0czogMiB9KTtcclxuICAgIGNvbnN0IHl5eXkgPSBkYXRlLmdldEZ1bGxZZWFyKCk7XHJcblxyXG4gICAgbGV0IG1tOm51bWJlciB8IHN0cmluZyA9IGRhdGUuZ2V0TW9udGgoKSArIDE7XHJcbiAgICBtbSA9IGludGwuZm9ybWF0KG1tKTtcclxuXHJcbiAgICBsZXQgZGQ6bnVtYmVyIHwgc3RyaW5nID0gZGF0ZS5nZXREYXRlKCk7XHJcbiAgICBkZCA9IGludGwuZm9ybWF0KGRkKTtcclxuXHJcbiAgICBzd2l0Y2ggKGZvcm1hdCkge1xyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICBjYXNlICd5eXl5LWRkLW1tJzpcclxuICAgICAgICB0bXBEYXRlID0gYCR7eXl5eX0tJHttbX0tJHtkZH1gO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdkZC5tbS55eXl5JzpcclxuICAgICAgICB0bXBEYXRlID0gYCR7ZGR9LiR7bW19LiR7eXl5eX1gO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRtcERhdGU7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBwYXJjZUNhc2hpZXIocm93OmFueSk6SUNhc2hpZXIge1xyXG4gIGNvbnN0IGNhc2hpZXI6SUNhc2hpZXIgPSB7XHJcbiAgICBpZDogcm93LmlkLFxyXG4gICAgcGVyc29ubmVsTnVtYmVyOiByb3cucGVyc29ubmVsTnVtYmVyLFxyXG4gICAgZW1wbG95ZWVOYW1lOiB7XHJcbiAgICAgIGZpcnN0TmFtZTogcm93LmZpcnN0TmFtZSxcclxuICAgICAgbGFzdE5hbWU6IHJvdy5sYXN0TmFtZSxcclxuICAgICAgcGF0cm9ueW1pYzogcm93LnBhdHJvbnltaWMsXHJcbiAgICB9LFxyXG4gICAgc2V4OiBTZXhbcm93LnNleF0gYXMgdW5rbm93biBhcyBTZXgsXHJcbiAgICBwaG9uZTogcm93LnBob25lLFxyXG4gICAgYWRkcjoge1xyXG4gICAgICBjaXR5OiByb3cuY2l0eSxcclxuICAgICAgc3RyZWV0OiByb3cuc3RyZWV0LFxyXG4gICAgICBidWlsZGluZzogcm93LmJ1aWxkaW5nLFxyXG4gICAgICBsaXRlcmE6IHJvdy5saXRlcmEsXHJcbiAgICAgIGFwYXJ0bWVudDogcm93LmFwYXJ0bWVudCxcclxuICAgIH0sXHJcbiAgICBiaXJ0aGRheTogcm93LmJpcnRoZGF5LFxyXG4gICAgc2hvcElEOiByb3cuc2hvcElELFxyXG4gICAgc3RhcnRXb3JrOiByb3cuc3RhcnRXb3JrLFxyXG4gICAgZW5kV29yazogcm93LmVuZFdvcmssXHJcbiAgICBsYXN0TmV0OiBOZXRbcm93Lmxhc3ROZXRdIGFzIHVua25vd24gYXMgTmV0LFxyXG4gIH07XHJcbiAgcmV0dXJuIGNhc2hpZXI7XHJcbn1cclxuIl19