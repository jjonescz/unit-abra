import { formatISO } from "date-fns";
import fetch from "node-fetch";

const endpoint = 'https://rezervace.flexibee.eu/v2/c/rezervace8';
const auth = 'Basic dGVhbTg6dGVhbTgtSld0YWs='; // user: team8

let checking = false;
export let lastCheck;
export let lastError;

let states = {};

/** Starts a background task that periodically checks sensors.
 * 
 * @remarks If a car leaves, shortens the reservation.
 */
export function startChecking() {
    if (!checking) {
        checking = true;
        doChecking();
    }
}

async function doChecking() {
    console.log('Sensor checking started.');

    while (checking) {
        try {
            // Get states of sensors.
            const response = await fetch('https://rezervace.s3.eu-central-1.amazonaws.com/parking8.json');
            const data = await response.json();

            // Find changes.
            for (const [sensor, value] of Object.entries(data)) {
                if (value !== states[sensor]) {
                    console.log('Found change of sensor', sensor, 'to', value);

                    await onChange(sensor, value);
                }
            }

            states = data;

            lastError = null;
        } catch (error) {
            console.log('Sensor checking failed', error);

            lastError = error;
        }

        // Remember when we last checked.
        lastCheck = new Date();

        // Sleep 1 minute.
        await new Promise(resolve => setTimeout(resolve, 1 * 1000));
    }
}

/** Called whenever `sensor` is changed to `value`. */
async function onChange(sensor, value) {
    // Car arrived, nothing to do.
    if (value) return;

    const now = formatISO(new Date());

    // Check reservation for this slot.
    const filter = `zakazka = "code:${sensor}" and zahajeni <= now() and dokonceni > now()`;
    const response = await fetch(`${endpoint}/udalost/(${filter}).json`, {
        headers: {
            'Authorization': auth
        }
    });
    const data = await response.json();

    // Cancel them.
    const reservations = data.winstrom.udalost;
    if (reservations && reservations.length !== 0) {
        const updates = reservations.map(u => ({
            id: u.id,
            predmet: "Sensor switched off",
            dokonceni: now
        }));

        console.log('Cancelling reservation...');

        const response = await fetch(`${endpoint}/udalost.json`, {
            method: 'POST',
            headers: {
                'Authorization': auth,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ winstrom: { udalost: updates } })
        });

        console.log('Cancelled reservations', JSON.stringify(await response.json()));
    }
}
