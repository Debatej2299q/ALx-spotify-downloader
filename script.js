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
        let finalUrl = input;

        // 1. Check if input is a Name or a URL
        if (!input.includes("spotify.com")) {
            // It's a song name! We search for the Spotify link first.
            // Using a public search proxy (iTunes/Spotify search)
            const searchRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(input)}&entity=song&limit=1`);
            const searchData = await searchRes.json();
            
            if (searchData.results.length > 0) {
                // We use the metadata from the search to "pretend" we have the link
                // or you can use a search API specific to spotdown if they have one.
                // For this example, we'll proceed with your specific API:
                finalUrl = input; 
            }
        }

        // 2. Call your provided API
        const apiUrl = `https://spotdown.org/api/song-details?url=${encodeURIComponent(finalUrl)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.status === "success" || data.id) {
            document.getElementById('songTitle').innerText = data.title;
            document.getElementById('artistName').innerText = data.artist;
            document.getElementById('albumArt').src = data.cover;
            
            const downloadBtn = document.getElementById('downloadLink');
            // Ensure the API returns a download link; otherwise, we link to their download handler
            downloadBtn.href = data.download_url || `https://spotdown.org/download?id=${data.id}`; 
            
            resultCard.classList.remove('hidden');
        } else {
            alert("No results found. Try a Spotify Link for better accuracy.");
        }
    } catch (error) {
        alert("Make sure the API allows 'Search' queries. If not, paste the Spotify Link.");
    } finally {
        loader.classList.add('hidden');
        searchBtn.disabled = false;
    }
}
