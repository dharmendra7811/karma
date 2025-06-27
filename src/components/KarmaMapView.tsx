import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { CommunityActivity } from '../lib/activityService';

interface KarmaMapViewProps {
  activities?: CommunityActivity[];
}

const KarmaMapView: React.FC<KarmaMapViewProps> = ({ activities = [] }) => {
  // Convert activities to JavaScript for injection
  const activitiesJson = JSON.stringify(
    activities
      .filter(activity => activity.latitude && activity.longitude)
      .map(activity => ({
        id: activity.id,
        lat: activity.latitude,
        lng: activity.longitude,
        title: activity.title,
        description: activity.description,
        location: activity.location,
        date: activity.activity_date,
        time: activity.activity_time,
        status: activity.status,
        participants: activity.current_participants,
        maxParticipants: activity.max_participants,
        creator:
          activity.creator?.full_name ||
          activity.creator?.username ||
          'Anonymous',
      })),
  );

  //   const getStatusColor = (status: string) => {
  //     switch (status) {
  //       case 'upcoming':
  //         return '#10B981';
  //       case 'ongoing':
  //         return '#3B82F6';
  //       case 'completed':
  //         return '#6B7280';
  //       default:
  //         return '#10B981';
  //     }
  //   };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Karma Community Activities Map</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
            body { 
                margin: 0; 
                padding: 0; 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            #map { height: 100vh; width: 100%; }
            .custom-marker {
                border: 3px solid white;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                box-shadow: 0 3px 6px rgba(0,0,0,0.4);
                cursor: pointer;
                transition: transform 0.2s;
            }
            .custom-marker:hover {
                transform: scale(1.1);
            }
            .upcoming { background-color: #10B981; }
            .ongoing { background-color: #3B82F6; }
            .completed { background-color: #6B7280; }
            .info-control {
                background: rgba(255,255,255,0.95);
                padding: 12px 16px;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                border: 1px solid rgba(16, 185, 129, 0.2);
            }
            .info-control h4 {
                margin: 0 0 8px 0;
                color: #059669;
                font-size: 16px;
                font-weight: bold;
            }
            .info-control p {
                margin: 0;
                color: #6B7280;
                font-size: 13px;
            }
            .legend {
                background: rgba(255,255,255,0.95);
                padding: 10px;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                font-size: 12px;
            }
            .legend-item {
                display: flex;
                align-items: center;
                margin: 4px 0;
            }
            .legend-color {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                margin-right: 8px;
                border: 1px solid white;
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
            // Get activities data
            const activities = ${activitiesJson};
            
            // Initialize map - start with San Francisco if no activities
            const defaultCenter = activities.length > 0 
                ? [activities[0].lat, activities[0].lng]
                : [37.78825, -122.4324];
            
            const map = L.map('map').setView(defaultCenter, 12);
            
            // Add satellite imagery from Esri
          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
}).addTo(map);

            
            // Auto-fit map to activities if available
            if (activities.length > 0) {
                const group = new L.featureGroup();
                
                activities.forEach(function(activity) {
                    // Create custom marker
                    const markerIcon = L.divIcon({
                        html: '🌟',
                        className: 'custom-marker ' + activity.status,
                        iconSize: [32, 32],
                        iconAnchor: [16, 16]
                    });
                    
                    // Create popup content
                    const popupContent = \`
                        <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; min-width: 200px;">
                            <h3 style="margin: 0 0 8px 0; color: #059669; font-size: 16px;">\${activity.title}</h3>
                            <p style="margin: 4px 0; color: #6B7280; line-height: 1.4;">\${activity.description}</p>
                            <div style="margin: 8px 0; padding: 8px 0; border-top: 1px solid #E5E7EB;">
                                <p style="margin: 2px 0; font-size: 13px;"><strong>📅 Date:</strong> \${activity.date} at \${activity.time}</p>
                                <p style="margin: 2px 0; font-size: 13px;"><strong>📍 Location:</strong> \${activity.location}</p>
                                <p style="margin: 2px 0; font-size: 13px;"><strong>👥 Participants:</strong> \${activity.participants}\${activity.maxParticipants ? '/' + activity.maxParticipants : ''}</p>
                                <p style="margin: 2px 0; font-size: 13px;"><strong>👤 Organizer:</strong> \${activity.creator}</p>
                                <div style="margin-top: 8px;">
                                    <span style="
                                        background: \${activity.status === 'upcoming' ? '#F0FDF4' : activity.status === 'ongoing' ? '#EFF6FF' : '#F9FAFB'};
                                        color: \${activity.status === 'upcoming' ? '#059669' : activity.status === 'ongoing' ? '#1D4ED8' : '#6B7280'};
                                        padding: 4px 8px;
                                        border-radius: 12px;
                                        font-size: 11px;
                                        font-weight: bold;
                                        text-transform: uppercase;
                                    ">\${activity.status}</span>
                                </div>
                            </div>
                        </div>
                    \`;
                    
                    // Add marker to map
                    const marker = L.marker([activity.lat, activity.lng], {icon: markerIcon})
                        .bindPopup(popupContent, { 
                            maxWidth: 300,
                            className: 'custom-popup'
                        })
                        .addTo(map);
                    
                    group.addLayer(marker);
                });
                
                // Fit map to show all markers
                if (activities.length > 1) {
                    map.fitBounds(group.getBounds().pad(0.1));
                }
            }
            
            // Add app info control
            const info = L.control({position: 'topright'});
            info.onAdd = function (map) {
                this._div = L.DomUtil.create('div', 'info-control');
                this._div.innerHTML = '<h4>🆓 Karma Community Map</h4><p>' + activities.length + ' activities available</p>';
                return this._div;
            };
            info.addTo(map);
            
            // Add legend
            const legend = L.control({position: 'bottomleft'});
            legend.onAdd = function (map) {
                const div = L.DomUtil.create('div', 'legend');
                div.innerHTML = \`
                    <strong>Activity Status:</strong><br>
                    <div class="legend-item">
                        <div class="legend-color" style="background-color: #10B981;"></div>
                        <span>Upcoming</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background-color: #3B82F6;"></div>
                        <span>Ongoing</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background-color: #6B7280;"></div>
                        <span>Completed</span>
                    </div>
                \`;
                return div;
            };
            legend.addTo(map);
            
            // Add scale
            L.control.scale().addTo(map);
        </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});

export default KarmaMapView;
