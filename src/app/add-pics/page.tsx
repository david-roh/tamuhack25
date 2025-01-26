"use client";

import { useEffect, useState } from "react";
import "./styles.css";

export default function Page() {
    const [flightNumber, setFlightNumber] = useState('null')
  useEffect(() => {
    const video = document.getElementById("cam-viewfinder") as HTMLVideoElement;

    // get flight number 
    const params = new URLSearchParams(window.location.search); 
    const flightNumber = params.get("flightNumber");
    if(flightNumber)
        setFlightNumber(flightNumber);

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          video.srcObject = stream;
          video.play();
        })
        .catch(err => {
          console.error("Error accessing the camera: ", err);
        });
    }
  }, []);

  return (
    <div className="root">
      <div className="row-cam">
        <video id="cam-viewfinder" className="cam-viewfinder"></video>
      </div>
      <div className="row-mic">
        <label className="flex items-center cursor-pointer mic-toggle-label">
          <div className="relative">
            <input type="checkbox" id="mic-toggle" className="sr-only" onChange={handleMicToggle} />
            <div className="block w-14 h-8 rounded-full mic-toggle-bg"></div>
            <div className="dot absolute top-1 bg-white w-6 h-6 rounded-full"></div>
          </div>
          <div className="ml-3 text-gray-700 font-medium">Toggle Microphone</div>
        </label>
        <div className="current-seat-num">12R</div>
      </div>
      <div className="row-btns">
        <button className="w-full rounded-lg btn btn-neutral">Delete Last Photo</button>
        <button className="w-full rounded-lg btn btn-primary" onClick={handleAddPhoto}>Add Photo</button>
      </div>
      <div className="row-done">
        <button className="w-full rounded-lg btn btn-primary">I'm Done</button>
      </div>
    </div>
  );
}

function handleAddPhoto() {
  alert("yoop");
}

function handleMicToggle() {
  // here
}