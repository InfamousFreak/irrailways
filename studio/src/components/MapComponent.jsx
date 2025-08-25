"use client";

import React, { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { fromLonLat } from "ol/proj";
import { Style, Stroke, Fill, Circle, Text } from "ol/style";
import Overlay from "ol/Overlay";
import { bbox } from "ol/extent";

export default function MapComponent({ geoJsonData, viewState }) {
  const mapElement = useRef();
  const mapRef = useRef();
  const popupElement = useRef();
  const popupCloser = useRef();
  const [popupContent, setPopupContent] = useState("");

  useEffect(() => {
    // Initialize map on first render
    const map = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            // Layer 1: Satellite imagery
            url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            attributions: "Tiles &copy; Esri",
          }),
        }),
        new TileLayer({
          source: new XYZ({
            // Layer 2: Labels and place names (on top)
            url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            attributions: "Labels &copy; Esri",
          }),
        }),
      ],
      view: new View({
        center: fromLonLat([80.9215191, 26.8320867]), // Initial center
        zoom: 17,
      }),
    });
    mapRef.current = map;

    // Create a popup overlay
    const popup = new Overlay({
      element: popupElement.current,
      autoPan: {
        animation: {
          duration: 250,
        },
      },
    });
    map.addOverlay(popup);

    popupCloser.current.onclick = () => {
      popup.setPosition(undefined);
      popupCloser.current.blur();
      return false;
    };

    // --- Map click event to show popup ---
    map.on("click", (evt) => {
      const feature = map.forEachFeatureAtPixel(
        evt.pixel,
        (feature) => feature
      );
      if (feature) {
        const coordinates = evt.coordinate;
        const properties = feature.getProperties();
        let content = ``;

        // Add feature name
        if (properties.name) {
          content += `<strong>${properties.name}</strong>`;
        }

        // Add altitude
        const geometry = feature.getGeometry();
        const firstCoord = geometry.getFirstCoordinate();
        if (firstCoord.length > 2) {
          content += `<br/>Altitude: ${firstCoord[2]} meters`;
        }

        setPopupContent(content);
        popup.setPosition(coordinates);
      } else {
        popup.setPosition(undefined);
      }
    });

    return () => map.setTarget(undefined);
  }, []);

  // Effect to handle data changes
  useEffect(() => {
    if (geoJsonData && mapRef.current) {
      // Remove previous vector layers
      mapRef.current
        .getLayers()
        .getArray()
        .filter((layer) => layer instanceof VectorLayer)
        .forEach((layer) => mapRef.current.removeLayer(layer));

      const vectorSource = new VectorSource({
        // Tell OpenLayers the source data is in WGS 84 (EPSG:4326).
        features: new GeoJSON().readFeatures(geoJsonData, {
          dataProjection: "EPSG:4326",
          featureProjection: "EPSG:3857",
        }),
      });

      // --- Visually Appealing Styles ---
      const style = (feature) => {
        const geometryType = feature.getGeometry().getType();
        if (geometryType === "LineString") {
          return new Style({
            stroke: new Stroke({
              color: "#00BFFF", // Bright blue for lines
              width: 4,
            }),
          });
        } else if (geometryType === "Point") {
          // Get the name for the marker label
          const name = feature.getProperties().name || "";
          return new Style({
            image: new Circle({
              radius: 7,
              fill: new Fill({
                color: "#FFD700", // Gold color for points
              }),
              stroke: new Stroke({
                color: "#FFFFFF",
                width: 2,
              }),
            }),
            text: new Text({
              font: "14px Calibri,sans-serif",
              text: name,
              fill: new Fill({
                color: "#fff",
              }),
              stroke: new Stroke({
                color: "#000",
                width: 3,
              }),
              offsetY: -15, // Position the label above the marker
            }),
          });
        }
        return null;
      };

      const vectorLayer = new VectorLayer({
        source: vectorSource,
        style: style,
      });

      mapRef.current.addLayer(vectorLayer);

      // Zoom to the data extent
      const extent = vectorSource.getExtent();
      //   if (extent) {
      //     mapRef.current.getView().fit(extent, {
      //       padding: [50, 50, 50, 50],
      //       duration: 1000,
      //     });
      //   }
    }
  }, [geoJsonData]);

  // --- Effect to handle programmatic view changes from search ---
  useEffect(() => {
    // Check if the map exists and a new viewState is provided
    if (viewState && mapRef.current) {
      const view = mapRef.current.getView();

      // Animate the view to the new center and zoom level
      view.animate({
        center: fromLonLat([viewState.longitude, viewState.latitude]),
        zoom: viewState.zoom,
        duration: viewState.transitionDuration || 1000, // Animate for 1 second
      });
    }
  }, [viewState]); // This effect runs only when the viewState prop changes

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={mapElement} style={{ width: "100%", height: "100%" }}></div>
      <div ref={popupElement} className="ol-popup">
        <a href="#" ref={popupCloser} className="ol-popup-closer"></a>
        <div
          id="popup-content"
          dangerouslySetInnerHTML={{ __html: popupContent }}></div>
      </div>
    </div>
  );
}
