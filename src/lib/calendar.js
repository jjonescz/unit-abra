const endpoint = "/receptionist/reservations.json?";

export async function getReservations(authorization, date) {
    const query = new URLSearchParams({
        date: date.toISOString()
    });
    console.log(`${endpoint}${query}`);
    const response = await fetch(`${endpoint}${query}`, {
        headers: {
            authorization: authorization
        }
    });
    if (response.ok) {
        return await response.json();
    }
}

export async function deleteReservation(authorization, date) {
    const query = new URLSearchParams({
        date: date.toISOString()
    });
    console.log(`${endpoint}${query}`);
    const response = await fetch(`${endpoint}${query}`, {
        headers: {
            authorization: authorization
        }
    });
    if (response.ok) {
        return await response.json();
    }
}

export async function createReservation(authorization, date, duration, slot) {
    // Create new reservation on server.
    const query = new URLSearchParams({
        user: 'team8.uzivatel1'
    });
    const reservation = {
        start: date.toISOString(),
        duration: duration,
        slot: slot
    };
    const response = await fetch(`/receptionist/reservations.json?${query}`, {
        method: 'PUT',
        headers: {
            authorization: authorization
        },
        body: JSON.stringify(reservation)
    });
    if (response.ok) {
        return true;
    }
    else {
        return false;
    }
}
