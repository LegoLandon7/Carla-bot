// data
const lastFetch = new Map();
const fetchQueue = new Set();

const FETCH_COOLDOWN = 5 * 60000; // 5 minutes

// fetch guild members
function fetchMembers(guild) {
    // dates
    const now = Date.now();
    const last = lastFetch.get(guild.id) ?? 0;

    // checks
    if (now - last < FETCH_COOLDOWN) return;
    if (fetchQueue.has(guild.id)) return;
    fetchQueue.add(guild.id);

    // fetch
    guild.members.fetch()
        .then(() => {
        lastFetch.set(guild.id, Date.now());
        console.log(`Fetched members for ${guild.name}`);
        })
        .catch(err => console.error(`Failed to fetch members for ${guild.name}:`, err))
        .finally(() => fetchQueue.delete(guild.id));
}

// exports
module.exports = { fetchMembers };