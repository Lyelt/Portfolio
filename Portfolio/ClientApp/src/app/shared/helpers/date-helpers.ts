export class DateHelper {
    static subtractMonths(months: number): Date {
        let d = new Date();
        d.setMonth(d.getMonth() - months);
        return d;
    }
}