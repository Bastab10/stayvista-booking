    // Check if mapToken and mapboxgl are available
if (!mapToken) {
    console.error('Mapbox token is not available');
    // Show error message to user
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        mapContainer.innerHTML = '<div class="alert alert-danger">Map is currently unavailable. Please check back later.</div>';
    }
} else if (!mapboxgl) {
    console.error('Mapbox GL is not loaded');
    // Show error message to user
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        mapContainer.innerHTML = '<div class="alert alert-danger">Map loading failed. Please refresh the page.</div>';
    }
} else {
    // Initialize map with proper error handling
    try {
        mapboxgl.accessToken = mapToken;

        const map = new mapboxgl.Map({
            container: 'map', // container ID
            style: 'mapbox://styles/mapbox/streets-v12', // stylesheet location
            center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
            zoom: 9 // starting zoom
        });

        // Add marker with error handling
        const marker = new mapboxgl.Marker({color: "red"})
            .setLngLat(listing.geometry.coordinates) //listing.geometry.coordinates
            .setPopup(new mapboxgl.Popup({offset: 25})
            .setHTML(`<h4>${listing.title}</h4><p>Exact location will be provided after booking<p/>`))
            .addTo(map);

        console.log('Map initialized successfully');

    } catch (error) {
        console.error('Error initializing map:', error);
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            mapContainer.innerHTML = '<div class="alert alert-danger">Unable to load map. Please try again later.</div>';
        }
    }
}
