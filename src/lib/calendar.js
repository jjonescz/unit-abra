const endpoint = "/receptionist/reservations.json?";

export async function getReservations(authorization, date) {
    const query = new URLSearchParams({
        date: date.toISOString()
    });
    const response = await fetch(`${endpoint}${query}`, {
        headers: {
            authorization: authorization
        }
    });
    if (response.ok) {
        return await response.json();
    }
}

export async function deleteReservation(authorization, id) {
    // Delete reservation on server.
    const query = new URLSearchParams({
        id: id,
    });
    const response = await fetch(`${endpoint}${query}`, {
        method: 'DELETE',
        headers: {
            authorization: authorization
        }
    });
    if (response.ok) {
        return true;
    }
    else { return false; }
}

export async function createReservation(authorization, date, duration, slot, user) {
    // Create new reservation on server.
    const query = new URLSearchParams({
        user: `team8.${user}`
    });
    const reservation = {
        start: date.toISOString(),
        duration: duration,
        slot: slot
    };
    const response = await fetch(`${endpoint}${query}`, {
        method: 'PUT',
        headers: {
            authorization: authorization
        },
        body: JSON.stringify(reservation)
    });
    if (response.ok) {
        return await response.json();

    }
    else {
        return false;
    }
}
