//src\pages\LocationPicker.jsx

import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { updateDeliveryPartnerLocation } from "../Services/deliveryPartner";

function LocationMarker({ setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return null;
}

export default function LocationPicker() {
  const [position, setPosition] = useState(null);

  // ✅ Auto detect current location
  
  useEffect(() => {
  if (!position) return;

  const sendLocation = async () => {
    try {
      await updateDeliveryPartnerLocation({
        user: 37, // ✅ fixed
        latitude: position.lat,
        longitude: position.lng,
      });

      console.log("Location sent ✅");
    } catch (err) {
      console.error("API error ❌", err);
    }
  };

  sendLocation();
}, [position]);

  const handleSubmit = async () => {
  if (!position) {
    alert("Please select location");
    return;
  }

  try {
    await updateDeliveryPartnerLocation({
      user: 37, // ✅ fixed
      latitude: position.lat,
      longitude: position.lng,
    });

    alert("Location Updated ✅");
  } catch (error) {
    console.error(error);
    alert("API Failed ❌");
  }
};

  return (
    <div className="h-screen relative">
  <MapContainer
    center={[19.076, 72.8777]}
    zoom={13}
    className="h-full w-full"
  >
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <LocationMarker setPosition={setPosition} />
    {position && <Marker position={position} />}
  </MapContainer>

  {/* Floating button */}
  <div className="absolute bottom-0 left-0 right-0 p-4 bg-white">
    <button
      onClick={handleSubmit}
      className="w-full bg-orange-500 text-white py-3 rounded-xl shadow-lg"
    >
      Confirm Location
    </button>
  </div>
</div>
  );
}
