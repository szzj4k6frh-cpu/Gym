export function dateKey(date) {
 return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function parseDateKey(key) {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(key))throw new RangeError('Ungültiges Datum');
 const [y,m,d]=key.split('-').map(Number);const result=new Date(y,m-1,d,12);
 if(dateKey(result)!==key)throw new RangeError('Ungültiges Datum');return result;
}
export const weekday=date=>(date.getDay()+6)%7;
export function addDays(date,count) {return new Date(date.getFullYear(),date.getMonth(),date.getDate()+count,12);}
export function weekDates(date) {return Array.from({length:7},(_,i)=>addDays(date,i-weekday(date)));}
