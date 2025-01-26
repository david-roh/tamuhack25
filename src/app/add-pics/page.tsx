"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./styles.css";

interface FormData {
  itemName: string;
  itemDescription: string;
  flightNumber: string;
  seatNumber: string;
  itemImage?: File;
}

export default function Page() {
  const router = useRouter();
  const [flightNumber, setFlightNumber] = useState("\u2014");
  window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const [speechReg, setSpeechReg] = useState<SpeechRecognition>(new SpeechRecognition());
  const [seatNum, setSeatNum] = useState("\u2014");
  const [formData, setFormData] = useState({
    flightNumber: "",
    seatNum: "",
    photo: null,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleAddPhoto(event: React.MouseEvent<HTMLButtonElement>) {
    const addBtn = event.target as HTMLButtonElement;
    addBtn.disabled = true;

    const video = document.getElementById("cam-viewfinder") as HTMLVideoElement;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
  
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(async blob => {
        if (blob) {
          const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
          const formData = new FormData();
          formData.append("itemName", "");
          formData.append("itemDescription", "");
          formData.append("flightNumber", flightNumber);
          formData.append("seatNumber", seatNum);
          formData.append("itemImage", file);
          
          const response = await fetch("/api/lost-items", {
            method: "POST",
            body: formData
          });
          
          try {
            const data = await response.json();
          }
          catch (error) {
            throw new Error("Failed to submit item");
          }

          addBtn.disabled = false;
    
          if (!response.ok) {
            throw new Error(data.error || "Failed to submit item");
          }
        }
      }, "image/jpeg");
    }
  }
  
  function handleMicToggle(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.checked) {
      speechReg.start();
    } else {
      speechReg.stop();
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');
  
      try {
        const formDataToSend = new FormData();
        
        // Add all form fields to FormData
        Object.entries(formData).forEach(([key, value]) => {
          if (value) {
            formDataToSend.append(key, value);
          }
        });
  
        const response = await fetch('/api/lost-items', {
          method: 'POST',
          body: formDataToSend,
        });
  
        const data = await response.json();
  
        if (!response.ok) {
          throw new Error(data.error || 'Failed to submit item');
        }
  
        // toast.success('Item submitted successfully!');
        router.push('/staff');
      } catch (err: any) {
        // toast.error(err.message || 'Failed to submit item');
        setError(err.message || 'Failed to submit item');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    // get flight number and makes sure not null
    const params = new URLSearchParams(window.location.search); 
    const fNum = params.get("flightNumber");
    if (flightNumber) setFlightNumber(fNum === null ? "\u2014" : fNum);

    // Row number speech recognition
    speechReg.continuous = true;
    speechReg.lang = "en-US";
    speechReg.interimResults = false;

    speechReg.onresult = (event) => {
      console.info(event.results);
      const result = event.results[event.resultIndex];
      if (result.isFinal) {
        const transcript = result[0].transcript
          .replace(/\s/g, "")
          .replace(/[^0-9LR]/g, "");
        console.log(`Speech recognized: ${transcript}`);
        if (!/\d+[LR]$/.test(transcript)) {
          console.log("Invalid transcript.");
          return;
        }
        const matches = transcript.match(/\d+[LR]$/);
        if (matches !== null) {
          const seat = matches[0];
          console.log(`Seats recognized: ${seat}`);
          setSeatNum(seat);
        }
      }
    };

    // Camera
    const video = document.getElementById("cam-viewfinder") as HTMLVideoElement;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.width = video.videoWidth;
          video.height = video.videoHeight;
          video.play();
        };
      })
      .catch(err => {
        console.error("Error accessing the camera: ", err);
      });
    }
  }, []);

  return (
    <div className="root">
      <div className="row-header">
        <a href="/flightAttendant" className="btn btn-neutral">&#x2B05; Back</a>
        <h1 className="text-2xl font-bold text-center">{flightNumber}</h1>
      </div>
      <div className="row-cam">
        <video id="cam-viewfinder" className="cam-viewfinder"></video>
      </div>
      <div className="row-mic">
        <label className="flex items-center cursor-pointer mic-toggle-label">
          <div className="relative">
            <input type="checkbox" id="mic-toggle" className="sr-only" onChange={event => handleMicToggle(event)} />
            <div className="block w-14 h-8 rounded-full mic-toggle-bg"></div>
            <div className="dot absolute top-1 bg-white w-6 h-6 rounded-full"></div>
          </div>
          <div className="ml-3 text-gray-700 font-medium">Microphone</div>
        </label>
        <div className="current-seat-num">{seatNum}</div>
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
