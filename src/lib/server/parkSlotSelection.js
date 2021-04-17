import { add, addMinutes } from 'date-fns';

// start: Date, duration: int(minutes)
// TODO: Handle free and full manager slots
export async function getFreeSlot(reservations, start, duration) {
    const end = add(start, { minutes: duration })

    var parkingSlots = {};
    for (let i = 101; i <= 120; i++) {
        parkingSlots[i] = {
            free: true,
            // max Date value - 1
            nextReservation: new Date(8640000000000000 - 1),
            // min Date value + 1
            prevReservation: new Date(-8640000000000000 + 1)
        }
    }

    reservations.map(r => {
        const rEnd = addMinutes(r.start, r.duration);

        var parkingSlot = parkingSlots[r.slot]
        // does reservation collide with given start and duration
        if (r.start < end && rEnd > start)
            parkingSlot.free = false
        // find earliest next reservation for parking slot
        if (r.start >= end && r.start < parkingSlot.nextReservation)
            parkingSlot.nextReservation = new Date(r.start.getTime())
        // find latest prev reservation for parking slot
        if (rEnd <= start && rEnd > parkingSlot.prevReservation) {
            parkingSlot.prevReservation = new Date(rEnd.getTime())
        }
    });

    var slotCandidate = -1
    var maxPrevReservation = new Date(-8640000000000000)

    for (let i = 101; i <= 120; i++) {
        if (!parkingSlots[i].free)
            continue

        // current reservations can immediately follow/precide one already scheduled
        // select this slot to keep minimize gaps in time schedule
        if (start.getTime() === parkingSlots[i].prevReservation.getTime() ||
            end.getTime() === parkingSlots[i].nextReservation.getTime()) {
            return i;
        }

        if (maxPrevReservation < parkingSlots[i].prevReservation) {
            slotCandidate = i
            maxPrevReservation = parkingSlots[i].prevReservation
        }
    }
    // returns -1 if there is no empty parking slot
    return slotCandidate
}
