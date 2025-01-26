"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import "./styles.css";

// Define proper types for SpeechRecognition
interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
      };
    };
  };
  resultIndex: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

function handleMicToggle(
  event: React.ChangeEvent<HTMLInputElement>, 
  speechReg: SpeechRecognitionInstance | null
) {
  if (!speechReg) return;
  
  if (event.target.checked) {
    speechReg.start();
  } else {
    speechReg.stop();
  }
}

export default function Page() {
  const router = useRouter();
  const [flightNumber, setFlightNumber] = useState("\u2014");
  const [seatNum, setSeatNum] = useState("\u2014");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [speechReg, setSpeechReg] = useState<SpeechRecognitionInstance | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.lang = "en-US";
        recognition.interimResults = false;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const result = event.results[event.resultIndex];
          if (result.isFinal) {
            const transcript = result[0].transcript.replace(/\s/g, "").replace(/[^0-9LR]/g, "");
            if (/\d+[LR]$/.test(transcript)) {
              setSeatNum(transcript);
            }
          }
        };

        setSpeechReg(recognition);
      }
    }
  }, []);

  // Initialize camera and handle URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fNum = params.get("flightNumber");
    if (fNum) setFlightNumber(fNum);

    const video = document.getElementById("cam-viewfinder") as HTMLVideoElement;
    if (!video) return;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          video.srcObject = stream;
          video.onloadedmetadata = () => video.play();
        })
        .catch(err => {
          console.error("Error accessing the camera: ", err);
          toast.error("Failed to access camera");
        });
    }

    // Cleanup function
    return () => {
      const video = document.getElementById("cam-viewfinder") as HTMLVideoElement;
      if (video && video.srcObject) {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleAddPhoto = () => {
    const video = document.getElementById("cam-viewfinder") as HTMLVideoElement;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        if (blob) {
          setImageFile(new File([blob], "photo.jpg", { type: "image/jpeg" }));
          toast.success("Photo captured!");
        }
      }, "image/jpeg");
    }
  };

  const handleSubmit = async () => {
    if (!imageFile || seatNum === "\u2014" || flightNumber === "\u2014") {
      toast.error("Please ensure all information is captured.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("flightNumber", flightNumber);
      formData.append("seatNumber", seatNum);
      formData.append("itemName", `Item from seat ${seatNum}`);
      formData.append("itemDescription", `Found at seat ${seatNum} on flight ${flightNumber}`);
      formData.append("itemImage", imageFile);

      const response = await fetch("/api/lost-items", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit item");
      }

      toast.success("Item submitted successfully!");
      router.push("/staff");
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

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
        <label className="mic-toggle-label">
          <input type="checkbox" id="mic-toggle" className="sr-only" onChange={event => handleMicToggle(event, speechReg)} />
          <span>Microphone</span>
        </label>
        <div className="current-seat-num">{seatNum}</div>
      </div>
      <div className="row-btns">
        <button className="btn btn-neutral" onClick={() => setImageFile(null)}>Delete Last Photo</button>
        <button className="btn btn-primary" onClick={handleAddPhoto}>Add Photo</button>
      </div>
      <div className="row-done">
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>{loading ? "Submitting..." : "I'm Done"}</button>
      </div>
    </div>
  );
}
