"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
const models_1 = require("./models");
const db = new db_1.ShopDB('db.sqlite');
const newCashier = {
    id: null,
    personnelNumber: '457931',
    employeeName: {
        lastName: 'Бабенко',
        firstName: 'Анна',
        patronymic: 'Николаевна',
    },
    sex: models_1.Sex.female,
    phone: '380962571542',
    addr: {
        city: models_1.City.Одесса,
        street: 'ул. Бенюка',
        building: 45,
        litera: null,
        apartment: null,
    },
    birthday: null,
    shopID: 17,
    startWork: new Date(2021, 2, 18),
    endWork: null,
    lastNet: models_1.Net.Comfy,
};
db.getTargetCashiers1();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUlBLDZCQUE4QjtBQUM5QixxQ0FFa0I7QUFHbEIsTUFBTSxFQUFFLEdBQUcsSUFBSSxXQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7QUFHbkMsTUFBTSxVQUFVLEdBQVk7SUFDMUIsRUFBRSxFQUFFLElBQUk7SUFDUixlQUFlLEVBQUUsUUFBUTtJQUN6QixZQUFZLEVBQUU7UUFDWixRQUFRLEVBQUUsU0FBUztRQUNuQixTQUFTLEVBQUUsTUFBTTtRQUNqQixVQUFVLEVBQUUsWUFBWTtLQUN6QjtJQUNELEdBQUcsRUFBRSxZQUFHLENBQUMsTUFBTTtJQUNmLEtBQUssRUFBRSxjQUFjO0lBQ3JCLElBQUksRUFBRTtRQUNKLElBQUksRUFBRSxhQUFJLENBQUMsTUFBTTtRQUNqQixNQUFNLEVBQUUsWUFBWTtRQUNwQixRQUFRLEVBQUUsRUFBRTtRQUNaLE1BQU0sRUFBRSxJQUFJO1FBQ1osU0FBUyxFQUFFLElBQUk7S0FDaEI7SUFDRCxRQUFRLEVBQUUsSUFBSTtJQUNkLE1BQU0sRUFBRSxFQUFFO0lBQ1YsU0FBUyxFQUFFLElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO0lBQ2hDLE9BQU8sRUFBRSxJQUFJO0lBQ2IsT0FBTyxFQUFFLFlBQUcsQ0FBQyxLQUFLO0NBQ25CLENBQUM7QUErQkYsRUFBRSxDQUFDLGtCQUFrQixFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBhcHAgbWFpbiBwb2ludDtcbi8vIGNhbiBoYXZlIGZ1bGwgQVBJIHJvdXRpbmcgZm9yIENSVUQgKHdpbGwgYmUgcGx1cykgT1IgaW4gc2ltcGxpZmllZCB2ZXJzaW9uOlxuLy8gY2FuIG9ubHkgY2FsbCBnZXRBbGxDYXNoaWVycyArIGdldFRhcmdldENhc2hpZXJzMSArIGdldFRhcmdldENhc2hpZXJzMiBhbmQgbG9nIG91dHB1dCBvZiBib3RoXG4vLyBJbXBvcnQgZGVwZW5kZW5jaWVzXG5pbXBvcnQgeyBTaG9wREIgfSBmcm9tICcuL2RiJztcbmltcG9ydCB7XG4gIElDYXNoaWVyLCBTZXgsIENpdHksIE5ldCxcbn0gZnJvbSAnLi9tb2RlbHMnO1xuXG4vLyBjb25uZWN0aW5nIHRvIHRoZSBzaG9wIERCIChsb2dpbiBhbmQgcGFzc3dvcmQgbm90IHJlcXVpcmUpXG5jb25zdCBkYiA9IG5ldyBTaG9wREIoJ2RiLnNxbGl0ZScpO1xuXG4vLyBjcmVhdGVpbmcgYSBuZXcgQ2FzaGVpclxuY29uc3QgbmV3Q2FzaGllcjpJQ2FzaGllciA9IHtcbiAgaWQ6IG51bGwsXG4gIHBlcnNvbm5lbE51bWJlcjogJzQ1NzkzMScsXG4gIGVtcGxveWVlTmFtZToge1xuICAgIGxhc3ROYW1lOiAn0JHQsNCx0LXQvdC60L4nLFxuICAgIGZpcnN0TmFtZTogJ9CQ0L3QvdCwJyxcbiAgICBwYXRyb255bWljOiAn0J3QuNC60L7Qu9Cw0LXQstC90LAnLFxuICB9LFxuICBzZXg6IFNleC5mZW1hbGUsXG4gIHBob25lOiAnMzgwOTYyNTcxNTQyJyxcbiAgYWRkcjoge1xuICAgIGNpdHk6IENpdHku0J7QtNC10YHRgdCwLFxuICAgIHN0cmVldDogJ9GD0LsuINCR0LXQvdGO0LrQsCcsXG4gICAgYnVpbGRpbmc6IDQ1LFxuICAgIGxpdGVyYTogbnVsbCxcbiAgICBhcGFydG1lbnQ6IG51bGwsXG4gIH0sXG4gIGJpcnRoZGF5OiBudWxsLFxuICBzaG9wSUQ6IDE3LFxuICBzdGFydFdvcms6IG5ldyBEYXRlKDIwMjEsIDIsIDE4KSxcbiAgZW5kV29yazogbnVsbCxcbiAgbGFzdE5ldDogTmV0LkNvbWZ5LFxufTtcblxuLy8gYWRkaW5nIGNyZWF0ZWQgQ2FzaGllciB0byB0aGUgREJcbi8vIG5ld0Nhc2hpZXIuaWQgPSBkYi5hZGRDYXNoaWVyKG5ld0Nhc2hpZXIpO1xuXG4vLyBnZXR0aW5nIGluZm9ybWF0aW9uIGFib3V0IGNhc2hpZXIgd2l0aCBpZD0xOSBhbmQgdXBkYXRpbmcgaXRcbi8vIGNvbnN0IHRtcENhc2hpZXI6UHJvbWlzZTxJQ2FzaGllcj4gPSBkYi5nZXRDYXNoaWVyQnlJZCgxOSk7XG4vLyB0bXBDYXNoaWVyLnRoZW4oKHZhbHVlcykgPT4ge1xuLy8gICBjb25zdCBjYXNoaWVyOklDYXNoaWVyID0gdmFsdWVzO1xuLy8gICBjb25zb2xlLmxvZyhjYXNoaWVyKTtcblxuLy8gICAvLyB1cGRhdGluZyBpbmZvcm1hdGlvbiBhYm91dCBjYXNoaWVyXG4vLyAgIGNhc2hpZXIuYmlydGhkYXkgPSBuZXcgRGF0ZSgxOTgzLCAwLCAzKTsgLy8gTW9udGggaW4gMC0xMVxuLy8gICBjYXNoaWVyLmFkZHIuYnVpbGRpbmcgPSA0NTtcbi8vICAgY2FzaGllci5hZGRyLmFwYXJ0bWVudCA9IDE1O1xuLy8gICBjb25zb2xlLmxvZyhjYXNoaWVyKTtcbi8vIGRiLnVwZGF0ZUNhc2hpZXIoY2FzaGllcik7XG4vLyB9KTtcblxuLy8gKGFzeW5jICgpID0+IHtcbi8vICAgY29uc3QgdG1wQ2FzaGllciA9IFByb21pc2UuYWxsKFtkYi5nZXRDYXNoaWVyQnlJZCgxOSldKS50aGVuKCh2YWx1ZXMpID0+IGNvbnNvbGUubG9nKHZhbHVlcykpO1xuLy8gfSkoKTtcblxuLy8gZGVsZXRpbmcgaW5mb3JtYXRpb24gYWJvdXQgY2FzaGllciB3aXRoIHNvbWUgaWRcbi8vIGRiLmRlbCgyMCk7XG4vLyBkYi5jb21wbGV0RGVsZXRlQ2FzaGllcigyMCk7XG5cbi8vIGdldHRpbmcgaW5mbyBhYm91dCBhbGwgY2FzaGllcnNcbi8vIGRiLmdldEFsbENhc2hpZXJzKCk7XG5cbi8vIGdldHRpbmcgaW5mb3JtYXRpb24gYWJvdXQgY2FzaGllciB3aXRoIGEgc3BlY2lhbCBmaWx0ZXJfMVxuZGIuZ2V0VGFyZ2V0Q2FzaGllcnMxKCk7XG5cbi8vIGdldHRpbmcgaW5mb3JtYXRpb24gYWJvdXQgY2FzaGllciB3aXRoIGEgc3BlY2lhbCBmaWx0ZXJfMlxuLy8gZGIuZ2V0VGFyZ2V0Q2FzaGllcnMyKCk7XG5cbi8vIGNsb3NlIERCIGFuZCBjb25uZWN0aW9uXG4vLyBkYi5jbG9zZSgpO1xuIl19