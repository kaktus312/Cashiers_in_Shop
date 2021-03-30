"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PNMAX = exports.PNMIN = exports.Task = void 0;
var Task;
(function (Task) {
    Task["cashierCreate"] = "--cashierCreate";
    Task["getCashierById"] = "--getCashierById";
    Task["cashierUpdate"] = "--cashierUpdate";
    Task["cashierDelete"] = "--cashierDelete";
    Task["useFilter1"] = "--useFilter1";
    Task["useFilter2"] = "--useFilter2";
    Task["getAllCashiers"] = "--getAllCashiers";
    Task["getTargetCashiers1"] = "--getTargetCashiers1";
    Task["getTargetCashiers2"] = "--getTargetCashiers2";
})(Task = exports.Task || (exports.Task = {}));
exports.PNMIN = 450000;
exports.PNMAX = 999999;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvY29uc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsSUFBWSxJQVVYO0FBVkQsV0FBWSxJQUFJO0lBQ1oseUNBQWlDLENBQUE7SUFDakMsMkNBQW1DLENBQUE7SUFDbkMseUNBQWlDLENBQUE7SUFDakMseUNBQWlDLENBQUE7SUFDakMsbUNBQTJCLENBQUE7SUFDM0IsbUNBQTJCLENBQUE7SUFDM0IsMkNBQW1DLENBQUE7SUFDbkMsbURBQTJDLENBQUE7SUFDM0MsbURBQTJDLENBQUE7QUFDL0MsQ0FBQyxFQVZXLElBQUksR0FBSixZQUFJLEtBQUosWUFBSSxRQVVmO0FBRVksUUFBQSxLQUFLLEdBQVUsTUFBTSxDQUFDO0FBQ3RCLFFBQUEsS0FBSyxHQUFVLE1BQU0sQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGNvbnN0YW50c1xuZXhwb3J0IGVudW0gVGFzayB7XG4gICAgY2FzaGllckNyZWF0ZSA9ICctLWNhc2hpZXJDcmVhdGUnLFxuICAgIGdldENhc2hpZXJCeUlkID0gJy0tZ2V0Q2FzaGllckJ5SWQnLFxuICAgIGNhc2hpZXJVcGRhdGUgPSAnLS1jYXNoaWVyVXBkYXRlJyxcbiAgICBjYXNoaWVyRGVsZXRlID0gJy0tY2FzaGllckRlbGV0ZScsXG4gICAgdXNlRmlsdGVyMSA9ICctLXVzZUZpbHRlcjEnLFxuICAgIHVzZUZpbHRlcjIgPSAnLS11c2VGaWx0ZXIyJyxcbiAgICBnZXRBbGxDYXNoaWVycyA9ICctLWdldEFsbENhc2hpZXJzJyxcbiAgICBnZXRUYXJnZXRDYXNoaWVyczEgPSAnLS1nZXRUYXJnZXRDYXNoaWVyczEnLFxuICAgIGdldFRhcmdldENhc2hpZXJzMiA9ICctLWdldFRhcmdldENhc2hpZXJzMicsXG59XG5cbmV4cG9ydCBjb25zdCBQTk1JTjpudW1iZXIgPSA0NTAwMDA7XG5leHBvcnQgY29uc3QgUE5NQVg6bnVtYmVyID0gOTk5OTk5O1xuIl19