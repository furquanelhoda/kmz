// GAIA-Scout Pro Web Application
class GaiaScoutApp {
    constructor() {
        this.camera = null;
        this.canvas = null;
        this.ctx = null;
        this.models = {};
        this.map = null;
        this.currentDepth = 0.5;
        this.detections = [];
        this.userLocation = { lat: 36.7538, lng: 3.0588 }; // Algiers
        
        this.init();
    }

    async init() {
        await this.setupCamera();
        await this.setupMap();
        this.setupEventListeners();
        this.startScanning();
    }

    async setupCamera() {
        try {
            const video = document.getElementById('camera');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    facingMode: 'environment'
                }
            });
            
            video.srcObject = stream;
            this.camera = stream;
            
            // Setup canvas for processing
            this.canvas = document.getElementById('canvas');
            this.ctx = this.canvas.getContext('2d');
        } catch (error) {
            console.error('Camera setup failed:', error);
            this.showError('Camera access required for scanning');
        }
    }

    setupMap() {
        // Initialize Leaflet map
        this.map = L.map('map').setView([this.userLocation.lat, this.userLocation.lng], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Add user location marker
        L.marker([this.userLocation.lat, this.userLocation.lng])
            .addTo(this.map)
            .bindPopup('Your Location')
            .openPopup();

        // Load KMZ file handler
        document.getElementById('kmz-upload').addEventListener('change', (e) => {
            this.handleKMZUpload(e.target.files[0]);
        });
    }

    setupEventListeners() {
        // Depth slider
        const depthSlider = document.getElementById('depth-slider');
        depthSlider.addEventListener('input', (e) => {
            this.currentDepth = parseFloat(e.target.value);
            document.getElementById('depth-value').textContent = `${this.currentDepth}m`;
            this.updateGPRVisualization();
        });

        // Layer buttons
        document.querySelectorAll('.layer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.layer-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentDepth = parseFloat(e.target.dataset.depth);
                document.getElementById('depth-slider').value = this.currentDepth;
                document.getElementById('depth-value').textContent = `${this.currentDepth}m`;
                this.updateGPRVisualization();
            });
        });

        // Auth form
        document.getElementById('auth-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAuth(e.target);
        });
    }

    startScanning() {
        const video = document.getElementById('camera');
        const scanStatus = document.getElementById('scan-status');
        
        const scanLoop = () => {
            if (video.readyState === 4) {
                // Simulate AI detection
                this.performAIDetection(video);
                
                // Update depth indicator
                document.getElementById('depth-indicator').innerHTML = 
                    `<span>${this.currentDepth.toFixed(1)}m depth</span>`;
            }
            
            requestAnimationFrame(scanLoop);
        };
        
        scanLoop();
        
        // Update scan status
        scanStatus.innerHTML = '<i class="fas fa-circle" style="color: #00ff88;"></i><span>Scanning</span>';
    }

    async performAIDetection(video) {
        // Simulate AI processing
        const detectionProbability = Math.random();
        
        if (detectionProbability > 0.8) {
            const detection = {
                type: this.getRandomArtifact(),
                confidence: Math.random() * 0.3 + 0.7,
                x: Math.random() * 0.8 + 0.1,
                y: Math.random() * 0.8 + 0.1,
                width: 0.2,
                height: 0.2
            };
            
            this.addDetection(detection);
            this.addToDiscoveries(detection);
        }
    }

    getRandomArtifact() {
        const artifacts = ['🏺 Pottery', '💰 Coin', '🏛️ Structure', '⚱️ Burial', '🔧 Tool', '💍 Jewelry', '📜 Inscription'];
        return artifacts[Math.floor(Math.random() * artifacts.length)];
    }

    addDetection(detection) {
        const overlay = document.getElementById('detection-overlay');
        const box = document.createElement('div');
        box.className = 'detection-box';
        box.style.left = `${detection.x * 100}%`;
        box.style.top = `${detection.y * 100}%`;
        box.style.width = `${detection.width * 100}%`;
        box.style.height = `${detection.height * 100}%`;
        
        const label = document.createElement('div');
        label.className = 'detection-label';
        label.textContent = `${detection.type} ${(detection.confidence * 100).toFixed(0)}%`;
        label.style.left = '0';
        label.style.top = '-20px';
        
        box.appendChild(label);
        overlay.appendChild(box);
        
        // Remove after 3 seconds
        setTimeout(() => box.remove(), 3000);
    }

    addToDiscoveries(detection) {
        const list = document.getElementById('discoveries-list');
        const item = document.createElement('div');
        item.className = 'discovery-item';
        item.innerHTML = `
            <div class="discovery-icon">${detection.type.split(' ')[0]}</div>
            <div class="discovery-info">
                <h4>${detection.type}</h4>
                <p>Depth: ${this.currentDepth.toFixed(1)}m • Confidence: ${(detection.confidence * 100).toFixed(0)}%</p>
            </div>
        `;
        
        list.insertBefore(item, list.firstChild);
        
        // Keep only 5 recent discoveries
        while (list.children.length > 5) {
            list.removeChild(list.lastChild);
        }
    }

    updateGPRVisualization() {
        // Simulate GPR data based on depth
        const gprData = this.generateGPRData(this.currentDepth);
        
        // Update map overlay
        if (this.map) {
            this.updateMapOverlay(gprData);
        }
    }

    generateGPRData(depth) {
        const data = [];
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                const lat = this.userLocation.lat + (i - 5) * 0.001;
                const lng = this.userLocation.lng + (j - 5) * 0.001;
                
                // Simulate density based on depth
                const baseDensity = 0.5 + depth * 0.1;
                const noise = (Math.random() - 0.5) * 0.3;
                const density = Math.max(0, Math.min(1, baseDensity + noise));
                
                data.push({ lat, lng, density });
            }
        }
        return data;
    }

    updateMapOverlay(gprData) {
        // Clear previous overlay
        if (this.mapOverlay) {
            this.map.removeLayer(this.mapOverlay);
        }
        
        // Create heatmap overlay
        const heatmapData = gprData.map(point => [point.lat, point.lng, point.density]);
        
        // Simulate heatmap with circles
        this.mapOverlay = L.layerGroup(
            gprData.map(point => {
                const color = this.getDensityColor(point.density);
                return L.circleMarker([point.lat, point.lng], {
                    radius: 10,
                    fillColor: color,
                    color: color,
                    weight: 1,
                    opacity: 0.8,
                    fillOpacity: 0.6
                });
            })
        ).addTo(this.map);
    }

    getDensityColor(density) {
        if (density < 0.3) return '#87CEEB';
        if (density < 0.7) return '#FF6347';
        return '#000000';
    }

    handleKMZUpload(file) {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                // Parse KMZ/KML (simplified)
                this.parseKMZData(e.target.result);
            };
            reader.readAsText(file);
        }
    }

    parseKMZData(data) {
        // Simplified KMZ parsing - add markers
        console.log('KMZ data loaded:', data.length);
        
        // Add sample archaeological sites
        const sites = [
            { name: 'Roman Ruins', lat: 36.7538, lng: 3.0588 },
            { name: 'Ancient Cemetery', lat: 36.7638, lng: 3.0688 }
        ];
        
        sites.forEach(site => {
            L.marker([site.lat, site.lng])
                .addTo(this.map)
                .bindPopup(`<b>${site.name}</b><br>Registered archaeological site`);
        });
    }

    toggleAuth() {
        const modal = document.getElementById('auth-modal');
        modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
    }

    handleAuth(form) {
        // Simulate authentication
        const email = form.elements[0].value;
        const password = form.elements[1].value;
        
        if (email && password) {
            document.querySelector('.user-controls button').innerHTML = 
                '<i class="fas fa-user"></i> ' + email.split('@')[0];
            this.toggleAuth();
        }
    }

    showError(message) {
        alert(message);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GaiaScoutApp();
});

// PWA Support
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}