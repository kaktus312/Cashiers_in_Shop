// TS types, interfaces, enums etc
export enum City {
    'Киев'
   ,'Харьков'
   ,'Одесса'
   ,'Львов'
   ,'Кривой Рог'
   ,'Мариуполь'
   ,'Винница'
   ,'Херсон'
   ,'Полтава'
   ,'Чернигов'
   ,'Черкассы'
   ,'Житомир'
   ,'Сумы'
   ,'Хмельницкий'
   ,'Ровно'
   ,'Ивано-Франковск'
   ,'Тернополь'
   ,'Луцк'
   ,'Ужгород'
}

export enum Net {
    'АТБ-Маркет'
   ,'Сiльпо'
   ,'Ашан'
   ,'Арсен'
   ,'Эльдорадо'
   ,'Comfy'
   ,'Эпицентр К'
   ,'Metro Cash&Carry'
   ,'Fozzy Group'
}

export enum Sex {
    'female', 
    'male'
}

export type Address  = {
    city:City
    street:string
    building:number | null
    litera?:string | null
    apartment?:number | null
}

export type Name = {
    firstName:string,
    lastName:string,
    patronymic?:string
}

export interface IShop {
    id:number
    shopNumber: number;
    addrID: Address;
    workTime: string;
}

export interface ICashier {
    id:number | null
    personnelNumber: number | string
    employeeName: Name  
    readonly sex:Sex
    phone:string
    addr:Address
    birthday:Date | null
    shopID:number
    startWork:Date
    endWork:Date | null
    lastNet: Net
}

export interface ICashRegister {
    readonly id:number
    cashBoxNumber:number
    cashierID:number
    value:number
    transaction_Time:Date
}

export type SqlFilter = {
    lastName?:string
    firstName?:string
    phone?:string
    sex?:Sex
    lastNet?:Net
    operator?:string
    city?:City
}