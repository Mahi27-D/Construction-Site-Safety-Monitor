const socket = io();
        let isStreaming = false;
        let devMode = false;

        function startStream() {
            fetch('/start_stream', { method: 'POST' })
                .then(response => response.json())
                .then(data => {
                    isStreaming = true;
                    document.getElementById('videoFeed').src = '/video_feed?t=' + new Date().getTime();
                    document.getElementById('videoFeed').style.display = 'block';
                    document.getElementById('placeholder').style.display = 'none';
                    document.getElementById('startBtn').disabled = true;
                    document.getElementById('stopBtn').disabled = false;
                    document.getElementById('statusIndicator').classList.add('active');
                    document.getElementById('statusIndicator').classList.remove('inactive');
                });
        }

        function stopStream() {
            isStreaming = false;
            const videoFeed = document.getElementById('videoFeed');
            videoFeed.src = '';
            videoFeed.style.display = 'none';
            document.getElementById('placeholder').style.display = 'block';
            document.getElementById('startBtn').disabled = false;
            document.getElementById('stopBtn').disabled = true;
            document.getElementById('statusIndicator').classList.remove('active');
            document.getElementById('statusIndicator').classList.add('inactive');
            
            fetch('/stop_stream', { method: 'POST' })
                .then(response => response.json())
                .then(data => console.log('Stream stopped:', data.message))
                .catch(error => console.error('Error stopping stream:', error));
        }

        function toggleDevMode() {
            fetch('/toggle_dev_mode', { method: 'POST' })
                .then(response => response.json())
                .then(data => {
                    devMode = data.dev_mode;
                    const btn = document.getElementById('devModeBtn');
                    const indicator = document.getElementById('devModeIndicator');
                    if (devMode) {
                        btn.classList.add('active');
                        indicator.style.display = 'inline-flex';
                    } else {
                        btn.classList.remove('active');
                        indicator.style.display = 'none';
                    }
                    alert(data.message);
                })
                .catch(error => console.error('Error toggling dev mode:', error));
        }

        socket.on('alert', function(data) {
            const alertList = document.getElementById('alertList');
            
            if (alertList.querySelector('p')) {
                alertList.innerHTML = '';
            }
            
            const alertItem = document.createElement('div');
            alertItem.className = 'alert-item';
            
            const time = new Date(data.timestamp).toLocaleTimeString();
            const devModeTag = data.dev_mode ? ' <span style="color: var(--accent-orange);">[DEV]</span>' : '';
            alertItem.innerHTML = `
                <div class="alert-time"><i class="fas fa-exclamation-triangle"></i> ${time}${devModeTag}</div>
                <div class="alert-message">${data.description}</div>
            `;
            
            alertList.insertBefore(alertItem, alertList.firstChild);
            updateStats();
        });

        socket.on('detection_update', function(data) {
            const statusDiv = document.getElementById('complianceStatus');
            if (data.is_compliant) {
                statusDiv.className = 'compliance-status compliant';
                statusDiv.innerHTML = '<i class="fas fa-check-circle"></i> ALL COMPLIANT';
            } else {
                statusDiv.className = 'compliance-status non-compliant';
                statusDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> NON-COMPLIANT DETECTED';
            }
            
            const personsDiv = document.getElementById('currentPersons');
            if (data.detection_details && data.detection_details.has_person) {
                const details = data.detection_details;
                const statusIcon = details.is_compliant ? 
                    '<i class="fas fa-check-circle" style="color: var(--accent-green);"></i>' : 
                    '<i class="fas fa-times-circle" style="color: var(--accent-red);"></i>';
                
                let ppeHtml = '';
                if (details.detected_ppe.length > 0) {
                    ppeHtml += '<div style="margin-top: 8px;">Detected: ';
                    ppeHtml += details.detected_ppe.map(ppe => 
                        `<span class="ppe-badge">${ppe}</span>`
                    ).join('');
                    ppeHtml += '</div>';
                }
                
                if (details.missing_ppe.length > 0) {
                    ppeHtml += '<div style="margin-top: 4px;">Missing: ';
                    ppeHtml += details.missing_ppe.map(ppe => 
                        `<span class="ppe-badge missing">${ppe}</span>`
                    ).join('');
                    ppeHtml += '</div>';
                }
                
                personsDiv.innerHTML = `
                    <div class="person-details ${details.is_compliant ? '' : 'non-compliant'}">
                        <div style="font-weight: 600; font-size: 14px;">
                            ${statusIcon} Current Detection
                        </div>
                        ${ppeHtml}
                    </div>
                `;
            } else {
                personsDiv.innerHTML = '<p style="color: var(--text-secondary);">No persons detected</p>';
            }
        });

        function updateStats() {
            fetch('/stats')
                .then(response => response.json())
                .then(data => {
                    document.getElementById('totalDetections').textContent = data.total_detections;
                    document.getElementById('nonCompliantCount').textContent = data.non_compliant_count;
                    document.getElementById('totalAlerts').textContent = data.total_alerts;
                    
                    devMode = data.dev_mode;
                    const indicator = document.getElementById('devModeIndicator');
                    const btn = document.getElementById('devModeBtn');
                    if (devMode) {
                        indicator.style.display = 'inline-flex';
                        if (btn) btn.classList.add('active');
                    } else {
                        indicator.style.display = 'none';
                        if (btn) btn.classList.remove('active');
                    }
                })
                .catch(error => console.error('Error fetching stats:', error));
        }

        document.addEventListener('DOMContentLoaded', function() {
            updateStats();
            setInterval(updateStats, 5000);
            document.getElementById('statusIndicator').classList.add('inactive');
        });