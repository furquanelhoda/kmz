class GaiaScoutApp {
    constructor() {
        this.camera = null;
        this.canvas = null;
        this.ctx = null;
        this.map = null;
        this.currentLocation = null;
        this.watchId = null;
        this.userMarker = null;
        this.kmzLayer = null;
        this.detections = [];
        this.discoveries = [];
    }

    async init() {
        await this.showLoading();
        await this.setupCamera();
        await this.getExactLocation();
        await this.setupMap();
        this.setupEventListeners();
        this.startScanning();
        this.hideLoading();
    }

    async showLoading() {
        await new Promise(resolve => setTimeout(resolve, 1500));
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('app').style.display = 'block';
    }

    hideLoading() {
        document.getElementById('loading-screen').style.display = 'none';
    }

    async setupCamera() {
        try {
            const video = document.getElementById('camera');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'environment'
                }
            });
            
            video.srcObject = stream;
            this.camera = stream;
            
            this.canvas = document.getElementById('canvas');
            this.ctx = this.canvas.getContext('2d');
            
        } catch (error) {
            console.error('Camera setup failed:', error);
            this.showMessage('Camera access required', 'error');
        }
    }

    async getExactLocation() {
        if (!navigator.geolocation) {
            this.showMessage('Geolocation not supported', 'error');
            this.setFallbackLocation();
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, options);
            });

            this.currentLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy
            };

            this.updateLocationDisplay();
            this.startWatchingLocation();

        } catch (error) {
            console.error('Location error:', error);
            this.setFallbackLocation();
        }
    }

    setFallbackLocation() {
        this.currentLocation = { lat: 36.7538, lng: 3.0588, accuracy: 0 };
        this.updateLocationDisplay();
    }

    startWatchingLocation() {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
        }

        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                this.currentLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };
                this.updateLocationDisplay();
                this.updateMapPosition();
            },
            (error) => console.error('Watch error:', error),
            { enableHighAccuracy: true }
        );
    }

    updateLocationDisplay() {
        const status = document.getElementById('location-status');
        if (this.currentLocation) {
            status.innerHTML = `
                <i class="fas fa-map-marker-alt" style="color: #00ff88;"></i>
                <span>${this.currentLocation.lat.toFixed(6)}, ${this.currentLocation.lng.toFixed(6)}</span>
                <span style="margin-left: 1rem;">±${this.currentLocation.accuracy.toFixed(0)}m</span>
            `;
            status.className = 'location-status active';
        }
    }

    async setupMap() {
        if (!this.currentLocation) return;

        this.map = L.map('map').setView([this.currentLocation.lat, this.currentLocation.lng], 16);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        this.addUserLocationMarker();
    }

    addUserLocationMarker() {
        if (!this.map || !this.currentLocation) return;

        if (this.userMarker) {
            this.userMarker.setLatLng([this.currentLocation.lat, this.currentLocation.lng]);
        } else {
            this.userMarker = L.marker([this.currentLocation.lat, this.currentLocation.lng], {
                icon: L.divIcon({
                    className: 'user-location-marker',
                    html: '<i class="fas fa-crosshairs"></i>',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                })
            }).addTo(this.map).bindPopup('Your Location');
        }
    }

    updateMapPosition() {
        if (this.map && this.currentLocation) {
            this.map.setView([this.currentLocation.lat, this.currentLocation.lng], 16);
            this.addUserLocationMarker();
        }
    }

    setupEventListeners() {
        // Depth slider
        const depthSlider = document.getElementById('depth-slider');
        depthSlider.addEventListener('input', (e) => {
            this.currentDepth = parseFloat(e.target.value);
            document.getElementById('depth-value').textContent = `${this.currentDepth}m`;
            this.updateAnalysis();
        });

        // Depth buttons
        document.querySelectorAll('.depth-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.depth-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentDepth = parseFloat(e.target.dataset.depth);
                depthSlider.value = this.currentDepth;
                document.getElementById('depth-value').textContent = `${this.currentDepth}m`;
                this.updateAnalysis();
            });
        });

        // Image upload
        document.getElementById('image-upload').addEventListener('change', (e) => {
            this.handleImageAnalysis(e.target.files[0]);
        });

        // KMZ upload
        document.getElementById('kmz-upload').addEventListener('change', (e) => {
            this.handleKMZUpload(e.target.files[0]);
        });

        // Sync location button
        window.syncLocationWithMap = () => {
            if (this.currentLocation && this.map) {
                this.map.setView([this.currentLocation.lat, this.currentLocation.lng], 16);
                this.showMessage('Location synced with map', 'success');
            }
        };

        // Auth form
        document.getElementById('auth-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAuth(e.target);
        });
    }

    startScanning() {
        const video = document.getElementById('camera');
        const scanLoop = () => {
            if (video.readyState === 4) {
                this.performRealTimeAnalysis(video);
            }
            requestAnimationFrame(scanLoop);
        };
        scanLoop();
    }

    performRealTimeAnalysis(video) {
        // Simulate AI detection
        if (Math.random() > 0.95) {
            const detection = {
                type: this.getRandomArtifact(),
                confidence: Math.random() * 0.3 + 0.7,
                x: Math.random() * 0.8 + 0.1,
                y: Math.random() * 0.8 + 0.1,
                depth: (Math.random() * 3 + 0.5).toFixed(1)
            };
            
            this.addDetection(detection);
            this.addDiscovery(detection);
            this.updateAnalysis();
        }
    }

    getRandomArtifact() {
        const artifacts = {
            ar: ["🏺 فخار", "💰 عملة", "🏛️ مبنى", "⚱️ دفن", "🔧 أداة", "💍 حلي"],
            fr: ["🏺 Poterie", "💰 Monnaie", "🏛️ Bâtiment", "⚱️ Sépulture", "🔧 Outil", "💍 Bijou"],
            en: ["🏺 Pottery", "💰 Coin", "🏛️ Structure", "⚱️ Burial", "🔧 Tool", "💍 Jewelry"]
        };
        return artifacts[currentLanguage][Math.floor(Math.random() * artifacts[currentLanguage].length)];
    }

    addDetection(detection) {
        const overlay = document.getElementById('detection-overlay');
        const box = document.createElement('div');
        box.className = 'detection-box';
        box.style.left = `${detection.x * 100}%`;
        box.style.top = `${detection.y * 100}%`;
        box.style.width = '60px';
        box.style.height = '60px';
        
        const label = document.createElement('div');
        label.className = 'detection-label';
        label.textContent = `${detection.type} ${(detection.confidence * 100).toFixed(0)}%`;
        
        box.appendChild(label);
        overlay.appendChild(box);
        
        setTimeout(() => box.remove(), 3000);
    }

    addDiscovery(detection) {
        this.discoveries.unshift({
            ...detection,
            timestamp: new Date().toLocaleString(),
            coordinates: this.currentLocation
        });

        this.updateDiscoveriesList();
        this.updateAnalysis();
    }

    updateDiscoveriesList() {
        const list = document.getElementById('discoveries-list');
        list.innerHTML = '';

        this.discoveries.slice(0, 5).forEach(item => {
            const div = document.createElement('div');
            div.className = 'discovery-item';
            div.innerHTML = `
                <div class="discovery-icon">${item.type.split(' ')[0]}</div>
                <div class="discovery-info">
                    <h4>${item.type}</h4>
                    <p>${item.depth}m • ${(item.confidence * 100).toFixed(0)}%</p>
                </div>
            `;
            list.appendChild(div);
        });
    }

    updateAnalysis() {
        // Simulate professional analysis
        const soilTypes = {
            ar: ["تربة رملية", "تربة طينية", "تربة صخرية", "تربة مخلوطة"],
            fr: ["Sableux", "Argileux", "Rocheux", "Mixte"],
            en: ["Sandy", "Clay", "Rocky", "Mixed"]
        };

        const periods = {
            ar: ["العصر الروماني", "العصر الإسلامي", "العصر الفينيقي", "العصر النيوليتي"],
            fr: ["Romain", "Islamique", "Phénicien", "Néolithique"],
            en: ["Roman", "Islamic", "Phoenician", "Neolithic"]
        };

        document.getElementById('soil-type').textContent = soilTypes[currentLanguage][Math.floor(Math.random() * 4)];
        document.getElementById('probability-bar').style.width = `${(Math.random() * 0.4 + 0.6) * 100}%`;
        document.getElementById('historical-period').textContent = periods[currentLanguage][Math.floor(Math.random() * 4)];
        
        // Update main displays
        document.getElementById('detected-count').textContent = this.discoveries.length;
        document.getElementById('confidence-display').textContent = `${(Math.random() * 0.3 + 0.7) * 100}%`;
        document.getElementById('depth-display').textContent = `${this.currentDepth}m`;
    }

    async handleImageAnalysis(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            this.performProfessionalAnalysis(reader.result);
        };
        reader.readAsDataURL(file);
    }

    performProfessionalAnalysis(imageData) {
        // Simulate deep analysis
        setTimeout(() => {
            this.showMessage('Analysis complete!', 'success');
            this.updateAnalysis();
        }, 2000);
    }

    async handleKMZUpload(file) {
        if (!file) return;

        try {
            const text = await file.text();
            this.parseKMZData(text);
        } catch (error) {
            console.error('KMZ error:', error);
            this.showMessage('Error reading KMZ file', 'error');
        }
    }

    parseKMZData(data) {
        // Simple KMZ parsing - extract coordinates
        const coordMatch = data.match(/<coordinates>([^<]+)<\/coordinates>/);
        if (coordMatch) {
            const coords = coordMatch[1].trim().split(',');
            if (coords.length >= 2) {
                const lat = parseFloat(coords[1]);
                const lng = parseFloat(coords[0]);
                if (!isNaN(lat) && !isNaN(lng)) {
                    this.currentLocation = { lat, lng, accuracy: 0 };
                    this.updateMapPosition();
                    this.showMessage('KMZ loaded successfully!', 'success');
                }
            }
        }
    }

    handleAuth(form) {
        form.reset();
        toggleAuth();
        this.showMessage('Welcome back!', 'success');
    }

    toggleAuth() {
        const modal = document.getElementById('auth-modal');
        modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
    }

    showMessage(text, type = 'info') {
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        document.body.appendChild(message);
        setTimeout(() => message.remove(), 3000);
    }
}

// Global functions
function toggleAuth() {
    app.toggleAuth();
}

function closeAnalysisModal() {
    document.getElementById('analysis-modal').style.display = 'none';
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new GaiaScoutApp();
});