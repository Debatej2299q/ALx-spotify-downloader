async function fetchSong() {
    const input = document.getElementById('songUrl').value.trim();
    const resultCard = document.getElementById('resultCard');
    const loader = document.getElementById('loader');
    const searchBtn = document.getElementById('searchBtn');

    if (!input) return;

    loader.classList.remove('hidden');
    resultCard.classList.add('hidden');
    searchBtn.disabled = true;

    try {
        // Step 1: Resolve Search to a Spotify URL if it's just text
        let spotifyUrl = input;
        
        if (!input.includes("spotify.com")) {
            // We use the iTunes API (which has no CORS limits) to find the track first
            const searchRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(input)}&entity=song&limit=1`);
            const searchData = await searchRes.json();
            
            if (searchData.results.length === 0) {
                throw new Error("Song not found");
            }
            
            // We build a search query for the API since we don't have the direct Spotify link
            spotifyUrl = input; 
        }

        // Step 2: Use a CORS Proxy to talk to the SpotDown API
        // This 'cors-anywhere' or similar proxy helps bypass the browser block
        const proxy = "https://api.allorigins.win/get?url=";
        const targetApi = `https://spotdown.org/api/song-details?url=${encodeURIComponent(spotifyUrl)}`;
        
        const response = await fetch(`${proxy}${encodeURIComponent(targetApi)}`);
        const rawData = await response.json();
        
        // AllOrigins wraps the result in a 'contents' string, so we parse it
        const data = JSON.parse(rawData.contents);

        if (data.status === "success" || data.id) {
            document.getElementById('songTitle').innerText = data.title;
            document.getElementById('artistName').innerText = data.artist;
            document.getElementById('albumArt').src = data.cover;
            
            const downloadBtn = document.getElementById('downloadLink');
            // Check if the API gives a direct link, otherwise point to their download page
            downloadBtn.href = data.download_url || `https://spotdown.org/download/${data.id}`;
            
            resultCard.classList.remove('hidden');
        } else {
            alert("API found no results for this query.");
        }

    } catch (error) {
        console.error(error);
        alert("Connection blocked or Song not found. Try pasting the full Spotify Link instead.");
    } finally {
        loader.classList.add('hidden');
        searchBtn.disabled = false;
    }
}
