const lastFetch = new Map();
const fetchQueue = new Set();

const FETCH_COOLDOWN = 5 * 60000; // 5 minutes

function fetchMembers(guild) {
    const now = Date.now();
    const last = lastFetch.get(guild.id) ?? 0;

    if (now - last < FETCH_COOLDOWN) return;
    if (fetchQueue.has(guild.id)) return;
    fetchQueue.add(guild.id);
    guild.members.fetch()
        .then(() => {
        lastFetch.set(guild.id, Date.now());
        console.log(`Fetched members for ${guild.name}`);
        })
        .catch(err => console.error(`Failed to fetch members for ${guild.name}:`, err))
        .finally(() => fetchQueue.delete(guild.id));
}

module.exports = { fetchMembers };