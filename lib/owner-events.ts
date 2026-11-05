import type { CleaningRecord, PaidStay } from "@/lib/owner-types";

export type OwnerEventKind = "check-in" | "check-out" | "cleaning";
export type OwnerEvent = {
  id: string;
  kind: OwnerEventKind;
  date: string;
  time: string;
  timestamp: number;
  by: string;
  stayId: string;
  photos: readonly string[];
};

function parisTimestamp(date:string,time:string) {
  if(!Number.isFinite(Date.parse(`${date}T${time || "00:00"}:00Z`)))return NaN;
  const offset=new Intl.DateTimeFormat("en",{timeZone:"Europe/Paris",timeZoneName:"shortOffset"}).formatToParts(new Date(`${date}T12:00:00Z`)).find(part=>part.type==="timeZoneName")?.value;
  const hours=Number(offset?.replace("GMT", "") || 1);
  return Date.parse(`${date}T${time || "00:00"}:00Z`)-hours*3600000;
}

/** Completed operations only. Never infer completion from a booking's scheduled dates. */
export function completedOwnerEvents(stays: readonly PaidStay[], cleanings: readonly CleaningRecord[], now = Date.now()): OwnerEvent[] {
  const events: OwnerEvent[] = [];
  for (const stay of stays) {
    for (const kind of ["check-in", "check-out"] as const) {
      const incoming = kind === "check-in";
      const stamp = incoming ? stay.checkedInAt : stay.checkedOutAt;
      const by = (incoming ? stay.checkedInBy : stay.checkedOutBy) || "";
      if (!stamp && !by) continue;
      let date = incoming ? stay.checkIn : stay.checkOut;
      let time = (incoming ? stay.checkInTime : stay.checkOutTime) || "";
      const timestamp = time || !stamp ? parisTimestamp(date,time) : Date.parse(stamp);
      if(stamp && !time && Number.isFinite(timestamp)) {
        const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Paris",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(new Date(timestamp));
        const part=(kind:string)=>parts.find(part=>part.type===kind)?.value;
        date=`${part("year")}-${part("month")}-${part("day")}`;
        time=`${part("hour")}:${part("minute")}`;
      }
      events.push({id:`${stay.id}:${kind}`, kind, date, time, timestamp, by, stayId:stay.id, photos:(incoming ? stay.checkInPhotos : stay.checkOutPhotos) || []});
    }
  }
  for (const row of cleanings) {
    events.push({id:`cleaning:${row.id}`,kind:"cleaning",date:row.date,time:row.time,timestamp:parisTimestamp(row.date,row.time),by:row.cleanerId,stayId:row.stayId,photos:row.photos});
  }
  return events.filter(event=>Number.isFinite(event.timestamp) && event.timestamp<=now).sort((a,b)=>b.timestamp-a.timestamp || a.id.localeCompare(b.id));
}
