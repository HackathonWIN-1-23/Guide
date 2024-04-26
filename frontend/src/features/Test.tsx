import {Button, Container, TextField} from '@mui/material';
import React, { useState, useEffect } from 'react';
import axiosApi from "../axiosApi";

const Test: React.FC = () => {
  const [location, setLocation] = useState({ latitude: 0, longitude: 0 });
  const [address, setAddress] = useState('');
  const [inputAddress, setInputAddress] = useState('');
  const [answer, setAnswer] = useState('')
  const [googleLoaded, setGoogleLoaded] = useState(false);

  // useEffect(() => {
  //   if (inputAddress) {
  //     setAddress(inputAddress);
  //   }
  // }, [inputAddress]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBYC2OQsUtPSmgzdy3CxoTS5o9nPrnWh40&libraries=places`;
    script.async = true;
    script.onload = () => {
      setGoogleLoaded(true);
    };
    document.body.appendChild(script);
  }, []);

  const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputAddress(event.target.value);
  }

  const handleSubmit = () => {
    setAddress(inputAddress);
  }

  useEffect(() => {
    if (address) {
      axiosApi.post('/ask', { address, answer: String })
        .then(response => {
          console.log('Server response:', response.data.answer);
          setAnswer(response.data.answer);

          const audio = new Audio(response.data.answer);
          audio.play();

          // const audioElement = document.getElementById('audioPlayer') as HTMLAudioElement;
          // if (audioElement) {
          //   audioElement.play();
          // }
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
    <Container style={{ textAlign: 'center', paddingTop: '20px' }} >
      <h1>Гид по Кыргызстану</h1>
      <p>Нажмите на кнопку, чтобы получить информацию о ближайших достопримечательностях</p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <TextField
          variant="outlined"
          label="Введите адрес"
          value={inputAddress}
          onChange={handleAddressChange}
          style={{ marginRight: '10px' }}
        />
        <Button variant="contained" style={{ padding: '10px', fontSize: '16px', cursor: 'pointer' }} onClick={handleSubmit}>Отправить</Button>
      </div>
      <Button variant="contained" style={{ padding: '10px', fontSize: '16px', cursor: 'pointer', margin: '10px 0' }} onClick={getLocation}>Узнать информацию</Button>
      <p style={{ fontSize: '18px' }}>Широта: {location.latitude}</p>
      <p style={{ fontSize: '18px' }}>Долгота: {location.longitude}</p>
      <p style={{ fontSize: '18px' }}>Адрес: {address}</p>
      {/*<p style={{ fontSize: '18px' }}>Ответ: {answer}</p>*/}
      {/*<audio autoPlay={Boolean(answer)}>*/}
      {/*  <source src={answer} type="audio/mpeg"/>*/}
      {/*    Your browser does not support the audio element.*/}
      {/*</audio>*/}
    </Container>
  );
}

export default Test;
