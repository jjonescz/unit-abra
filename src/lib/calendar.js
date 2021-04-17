const endpoint = "/receptionist/reservations.json";

export async function getReservations(authorization, date) {
    const query = new URLSearchParams({
        date: date.toISOString()
    });
    return await fetch(`${endpoint}?${query}`, {
        headers: {
            authorization: authorization
        }
    });
}

export async function deleteReservation(authorization, id) {
    // Delete reservation on server.
    const query = new URLSearchParams({
        id: id
    });
    return await fetch(`${endpoint}?${query}`, {
        method: 'DELETE',
        headers: {
            authorization: authorization
        }
    });
}

export async function createReservation(authorization, date, duration, slot, user) {
    // Create new reservation on server.
    const reservation = {
        user: `team8.${user}`,
        start: date.toISOString(),
        duration: duration,
        slot: slot
    };
    return await fetch(`${endpoint}`, {
        method: 'PUT',
        headers: {
            authorization: authorization
        },
        body: JSON.stringify(reservation)
    });
}
