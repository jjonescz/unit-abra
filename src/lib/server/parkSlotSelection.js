import { add, addMinutes } from 'date-fns';

function isManagerSlot(slot) {
    return slot <= 106
}

// start: Date, duration: int(minutes)
export async function getManagerReleaseSlot(reservations, slot, start, duration) {
    const end = add(start, { minutes: duration })
    var resultSlot = slot

    reservations.map(r => {
        const rEnd = addMinutes(r.start, r.duration);
        if (r.slot == slot && r.volno) {
            // does reservation collide with given start and duration
            if (r.start < end && rEnd > start)
                resultSlot = -1
        }
    });

    return resultSlot
}

// start: Date, duration: int(minutes)
export async function getFreeSlot(reservations, start, duration) {
    const end = add(start, { minutes: duration })

    var parkingSlots = {};
    for (let i = 101; i <= 120; i++) {
        free = true
        if (isManagerSlot(i)) free = false
        parkingSlots[i] = {
            free: free,
            // max Date value - 1
            nextReservation: new Date(8640000000000000 - 1),
            // min Date value + 1
            prevReservation: new Date(-8640000000000000 + 1)
        }
    }

    reservations.sort(function (a, b) {
        if (!a.volno && b.volno)
            return 1
        if (a.volno && !b.volno)
            return -1
        return a.start.getTime() - b.start.getTime()
    })

    console.log(reservations)

    reservations.map(r => {
        const rEnd = addMinutes(r.start, r.duration)
        var parkingSlot = parkingSlots[r.slot]
        if (isManagerSlot(r.slot) && r.volno) {
            // is some of manager slots free
            if (r.start <= start && rEnd >= end) {
                parkingSlot.free = true
                parkingSlot.prevReservation = r.start
                parkingSlot.nextReservation = rEnd
            }
        } else {
            // does reservation collide with given start and duration
            if (r.start < end && rEnd > start)
                parkingSlot.free = false
            // find earliest next reservation for parking slot
            if (r.start >= end && r.start < parkingSlot.nextReservation)
                parkingSlot.nextReservation = r.start
            // find latest prev reservation for parking slot
            if (rEnd <= start && rEnd > parkingSlot.prevReservation) {
                parkingSlot.prevReservation = rEnd
            }
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
