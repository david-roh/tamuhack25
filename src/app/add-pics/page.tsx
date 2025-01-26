"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./styles.css";
import Link from 'next/link';

interface FormData {
  itemName: string;
  itemDescription: string;
  flightNumber: string;
  seatNumber: string;
  itemImage?: File;
}

// Move SpeechRecognition type definition outside component
type SpeechRecognitionType = any; // TODO: Replace with proper type

export default function Page() {
  const router = useRouter();
  const [flightNumber, setFlightNumber] = useState("\u2014");
  const [speechReg, setSpeechReg] = useState<SpeechRecognitionType | null>(null);
  const [seatNum, setSeatNum] = useState("\u2014");
  const [formData, setFormData] = useState({
    flightNumber: "",
    seatNum: "",
    photo: null,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Initialize speech recognition in useEffect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.lang = "en-US";
        recognition.interimResults = false;

        recognition.onresult = (event) => {
          console.info(event.results);
          const result = event.results[event.resultIndex];
          if (result.isFinal) {
            const transcript = result[0].transcript
              .replace(/\s/g, "")
              .replace(/[^0-9A-Z]/g, "");
            console.log(`Speech recognized: ${transcript}`);
            if (!/\d+[A-Z]$/.test(transcript)) {
              console.log("Invalid transcript.");
              return;
            }
            const matches = transcript.match(/\d+[A-Z]$/);
            if (matches !== null) {
              const seat = matches[0];
              console.log(`Seats recognized: ${seat}`);
              setSeatNum(seat);
            }
          }
        };

        setSpeechReg(recognition);
      }
    }
  }, []);

  function handleAddPhoto(event: React.MouseEvent<HTMLButtonElement>) {
    const addBtn = event.target as HTMLButtonElement;
    const video = document.getElementById("cam-viewfinder") as HTMLVideoElement;
    addBtn.disabled = true;
    video.pause();
    document.querySelector(".root > .row-cam")?.classList.remove("cam-flash");
    window.requestAnimationFrame(() => document.querySelector(".root > .row-cam")?.classList.add("cam-flash"));

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

            if (!response.ok) {
              addBtn.disabled = false;
              video.play();
              throw new Error(data.error || "Failed to submit item");
            }
          }
          catch (error) {
            addBtn.disabled = false;
            video.play();
            throw new Error("Failed to submit item");
          }

          addBtn.disabled = false;
          video.play();
        }
      }, "image/jpeg");
    }
  }
  
  function handleMicToggle(event: React.ChangeEvent<HTMLInputElement>) {
    if (!speechReg) return;
    
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

    // Camera
    const video = document.getElementById("cam-viewfinder") as HTMLVideoElement;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
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
          <div className="ml-3 text-gray-200 font-medium">Microphone</div>
        </label>
        <div className="current-seat-num">
          <input
            type="text"
            value={seatNum}
            onChange={evt => setSeatNum(evt.target.value)}
            onFocus={evt => {if (evt.target.value === "\u2014") {evt.target.value = "";}}}
            onBlur={evt => {evt.target.value = evt.target.value.trim(); if (evt.target.value === "") {evt.target.value = "\u2014";}}} />
        </div>
      </div>
      <div className="row-btns">
        <button className="w-full rounded-lg btn btn-neutral">Delete Last Photo</button>
        <button className="w-full rounded-lg btn btn-primary" onClick={handleAddPhoto}>Add Photo</button>
      </div>
      <div className="row-done">
        <button className="w-full rounded-lg btn donebtn"><Link href={`/gallery?flightNumber=${flightNumber}`}>I'm Done</Link></button>
      </div>
    </div>
  );
}

// Add these to fix TypeScript errors
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}