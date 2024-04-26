import React, { useState, useEffect } from 'react';
import axiosApi from "../axiosApi";

const Test: React.FC = () => {
  const [location, setLocation] = useState({ latitude: 0, longitude: 0 });
  const [address, setAddress] = useState('');
  const [answer, setAnswer] = useState('')
  const [googleLoaded, setGoogleLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBYC2OQsUtPSmgzdy3CxoTS5o9nPrnWh40&libraries=places`;
    script.async = true;
    script.onload = () => {
      setGoogleLoaded(true);
    };
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (address) {
      axiosApi.post('/ask', { address, answer: String })
        .then(response => {
          console.log('Server response:', response.data.answer);
          setAnswer(response.data.answer);
        })
        .catch(error => {
          console.error('Error sending address:', error);
        });
    }
  }, [address, axiosApi]);


  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }

  const showPosition = (position: GeolocationPosition) => {
    const { latitude, longitude } = position.coords;
    setLocation({ latitude, longitude });

    if (!googleLoaded) return;

    const geocoder = new window.google.maps.Geocoder();
    const latlng = new window.google.maps.LatLng(latitude, longitude);
    geocoder.geocode({ 'location': latlng }, (results, status) => {
      if (status === window.google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          setAddress(results[0].formatted_address);
        } else {
          alert("Address not found");
        }
      } else {
        alert("Geocoder failed due to: " + status);
      }
    });
  }

  return (
    <div>
      <h1>Geolocation and Google Places API Example</h1>
      <p>Click the button to get your current location and address.</p>
      <button onClick={getLocation}>Get Location</button>
      <p>
        Latitude: {location.latitude}<br />
        Longitude: {location.longitude}<br />
        Address: {address}<br/>
        Answer: {answer}
      </p>
    </div>
  );
}

export default Test;
