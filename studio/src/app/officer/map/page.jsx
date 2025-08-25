"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";

export default function CableGisMapPage() {
  const [plans, setPlans] = useState([]);
  const [selectedPlanFileName, setSelectedPlanFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [mapViewState, setMapViewState] = useState(null);

  // Dynamically import the MapComponent to prevent SSR issues
  const Map = useMemo(
    () =>
      dynamic(
        () => import("@/components/MapComponent"), // Adjust path if needed
        {
          loading: () => <p>Map is loading...</p>,
          ssr: false,
        }
      ),
    []
  );

  // Fetch the list of plans (this logic remains the same)
  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:3001/api/plans");
        if (!response.ok) throw new Error("Failed to fetch cable plans.");
        const data = await response.json();
        setPlans(data);
      } catch (error) {
        console.error("Error fetching plans:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // Fetch the GeoJSON data for the selected plan (this logic remains the same)
  useEffect(() => {
    if (!selectedPlanFileName) {
      setGeoJsonData(null);
      return;
    }
    const fetchGeoJsonData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:3001/api/geojson/${encodeURIComponent(
            selectedPlanFileName
          )}`
        );
        if (!response.ok) throw new Error("Failed to fetch GeoJSON data.");
        const simplifiedGeoJson = await response.json();
        setGeoJsonData(simplifiedGeoJson);
      } catch (error) {
        console.error("Error fetching or displaying GeoJSON:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGeoJsonData();
  }, [selectedPlanFileName]);

  // --- useEffect for handling search ---
  useEffect(() => {
    if (searchTerm === "") {
      setSearchResults([]);
      return;
    }

    if (geoJsonData && geoJsonData.features) {
      const results = geoJsonData.features.filter(
        (feature) =>
          // We only want to search for Points (markers)
          feature.geometry.type === "Point" &&
          feature.properties.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
      setSearchResults(results);
    }
  }, [searchTerm, geoJsonData]);

  const handleMarkerSelect = (marker) => {
    const [longitude, latitude] = marker.geometry.coordinates;

    // Trigger the MapComponent to fly to the new location
    setMapViewState({
      longitude,
      latitude,
      zoom: 16, // Zoom in closer to the marker
      pitch: 45,
      transitionDuration: 1000, // Animate for 1 second
    });

    // Clear the search results
    setSearchTerm("");
    setSearchResults([]);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-10rem)]">
      <div className="md:w-1/4 lg:w-1/5">
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cable-plan">Cable Plan</Label>
              <Select
                onValueChange={setSelectedPlanFileName}
                value={selectedPlanFileName}>
                <SelectTrigger id="cable-plan">
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.length > 0 ? (
                    plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.fileName}>
                        {plan.planName}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No plans available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="marker-search">Search Markers</Label>
              <input
                id="marker-search"
                type="text"
                placeholder="Type to search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              {searchResults.length > 0 && (
                <ul className="max-h-40 overflow-y-auto rounded-md border">
                  {searchResults.map((marker, index) => (
                    <li
                      key={index}
                      onClick={() => handleMarkerSelect(marker)}
                      className="cursor-pointer p-2 hover:bg-accent">
                      {marker.properties.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex-1 h-full">
        <Card className="h-full">
          <CardContent className="p-2 h-full">
            <Map geoJsonData={geoJsonData} viewState={mapViewState} />
            {isLoading && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "60%",
                  transform: "translate(-50%, -50%)",
                  background: "white",
                  padding: "10px",
                  borderRadius: "5px",
                  zIndex: 1000,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                }}>
                <p>Loading Data...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
