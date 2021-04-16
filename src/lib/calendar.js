const endpoint = "/receptionist/reservations.json?";

export async function getReservations(authorization, date) {
    const query = new URLSearchParams({
        date: date
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
