"use client";
import { useState, useRef } from "react";
import "./styles.css";
import LoadingSkeleton from "./LoadingSkeleton";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { FaCircle } from "react-icons/fa";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Disc } from "lucide-react";
import localFont from "next/font/local";

const poppins = localFont({
  src: "./fonts/Poppins-Medium.ttf",
  variable: "--font-poppins",
  weight: "100 900",
});

export default function Home() {
  const [quotation, setQuotation] = useState<BibleVerse | null>(null);
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      setLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/wav" });
        console.log(audioBlob);
        const formData = new FormData();
        formData.append("file", audioBlob, "audio.wav");

        if (quotation) {
          formData.append("book", quotation.book);
          formData.append("chapter", quotation.chapter.toString());
          formData.append("verse", quotation.verse.toString());
          formData.append("text", quotation.text);
        }

        console.log(formData.get("file"));

        const response = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        console.log(data);
        if (data.quotation) {
          setQuotation(data.quotation);
        } else {
          console.error("Error:", data.error);
        }
        setLoading(false);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      setLoading(false);
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setRecording(false);
  };

  return (
    <section className="px-5">
      <header className="header">
        <h1 className={`title ${poppins.className}`}>Verse Catch</h1>
      </header>

      <div className="container">
        <main className="flex flex-col gap-32">
          {loading ? (
            <LoadingSkeleton />
          ) : (
            quotation && (
              <div>
                <div className="flex flex-col items-center justify-center">
                  <h1 className={`text-2xl font-bold ${poppins.className}`}>
                    {" "}
                    {quotation.book} {quotation.chapter} : {quotation.verse}{" "}
                  </h1>
                  <p className={`${poppins.className}`}> {quotation.text} </p>
                </div>
              </div>
            )
          )}
          <Card className="max-w-7xl px-10 py-5 flex flex-col justify-between gap-5 items-center">
            <div className="flex flex-col gap-10 justify-center items-center max-w-sm">
              {recording ? (
                <FaCircle className="text-red-500 w-8 h-8" />
              ) : (
                <Disc className="w-8 h-8" />
              )}
              <p className="text-sm ">
                Transcribing and detecting Bible quotations in real time
              </p>
            </div>
            <Button
              onClick={recording ? stopRecording : startRecording}
              disabled={false}
              className={recording ? "bg-red-500" : ""}
            >
              {recording ? <FaMicrophoneSlash /> : <FaMicrophone />}{" "}
              {recording ? "Stop Recording" : "Start Recording"}
            </Button>
          </Card>
        </main>
      </div>
    </section>
  );
}
