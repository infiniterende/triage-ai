import React, { useState, useEffect, useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Room, createLocalAudioTrack, RemoteParticipant } from "livekit-client";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";
import VoiceMode from "./VoiceMode";
import "../styles/VoiceAgent.css";

type LiveKitModalProps = {
  setShowSupport: Dispatch<SetStateAction<boolean>>;
};

const LiveKitModal = ({ setShowSupport }: LiveKitModalProps) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [isSubmittingName, setIsSubmittingName] = useState<boolean>(true);
  const [name, setName] = useState<string>("");
  const [token, setToken] = useState<string>("");
  console.log("y", token);
  console.log(process.env.NEXT_PUBLIC_API_URL);
  const getToken = useCallback(async (userName: string) => {
    try {
      console.log("run");
      const API_BASE_URL = "http://localhost:8000";
      const ENDPOINT = "https://agilance-api.onrender.com";
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}/getToken?name=${userName}`,
      );
      // const response = await fetch(
      //   `http://localhost:8000/getToken?name=${userName}`,
      // );
      console.log("t", response);
      const data = await response.json();
      const token = await data.token;
      setToken(token);
      setIsSubmittingName(false);
    } catch (error) {
      console.error(error);
    }
  }, []);

  console.log(isSubmittingName);
  const handleNameSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("submitted:", name);
    await getToken(name);
    setIsSubmittingName(false);
  };
  console.log(token);
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="support-room">
          {isSubmittingName ? (
            <form onSubmit={handleNameSubmit} className="name-form">
              <h2 className="text-xl">
                Enter your name to connect with Triage
              </h2>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />

              <button type="submit">Connect</button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => setShowSupport(false)}
              >
                Cancel
              </button>
            </form>
          ) : token ? (
            <LiveKitRoom
              serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
              token={token}
              connect={true}
              audio={true}
              video={false}
              onDisconnected={() => {
                setShowSupport(false);
                setIsSubmittingName(true);
              }}
            >
              <RoomAudioRenderer />
              <VoiceMode />
            </LiveKitRoom>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default LiveKitModal;
