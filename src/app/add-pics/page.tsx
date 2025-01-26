"use client";

import { useEffect, useState } from "react";
import "./styles.css";
import {useRouter} from "next/router";

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
        .then((stream) => {
          video.srcObject = stream;
          video.play();
        })
        .catch((err) => {
          console.error("Error accessing the camera: ", err);
        });
    }
  }, []);

  return (
    <div className="root">
        <div className="text-black">
            FlightNumber: {flightNumber}
        </div>
      <div className="row-cam">
        <video id="cam-viewfinder" className="cam-viewfinder"></video>
      </div>
      <div className="row-mic">B</div>
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