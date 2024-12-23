async function fetchJWT(): Promise<string> {
    const apiKey = localStorage.getItem('apiKey');

    const resp = await fetch('https://mp.speechmatics.com/v1/api_keys?type=rt', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            ttl: 86400,
        }),
    });
    if (!resp.ok) {
        throw new Error('Bad response from API', { cause: resp });
    }

    const jwt = (await resp.json()).key_value;
    localStorage.setItem('jwt', jwt);

    return jwt;
}

export { fetchJWT };
