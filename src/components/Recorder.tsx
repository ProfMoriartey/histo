// ~/components/Recorder.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { useUploadThing } from "~/utils/uploadthing";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";

export function Recorder({ patientId }: { patientId: string }) {
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const chunks = useRef<BlobPart[]>([]);
  const [status, setStatus] = useState<"idle" | "recording" | "processing">(
    "idle",
  );
  const [transcriptOverride, setTranscriptOverride] = useState("");

  const { startUpload } = useUploadThing("audioRecording");

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) return;
  }, []);

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const r = new MediaRecorder(stream, { mimeType: "audio/webm" });
    chunks.current = [];
    r.ondataavailable = (e) => chunks.current.push(e.data);
    r.onstop = async () => {
      setStatus("processing");
      const blob = new Blob(chunks.current, { type: "audio/webm" });
      const file = new File([blob], `rec-${Date.now()}.webm`, {
        type: "audio/webm",
      });

      // If offline, register a background sync task or queue locally (simplified here)
      const uploaded = await startUpload([file]);
      const url = uploaded?.[0]?.url;
      if (!url) {
        setStatus("idle");
        alert("Upload failed");
        return;
      }

      const res = await fetch("/api/visits/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          audioUrl: url,
          transcriptOverride: transcriptOverride || undefined,
        }),
      });
      if (!res.ok) {
        setStatus("idle");
        alert("Create visit failed");
        return;
      }
      const { visitId } = await res.json();
      window.location.href = `/visits/${visitId}`; // to review/edit page
    };

    r.start();
    setRecorder(r);
    setStatus("recording");
  }

  function stop() {
    recorder?.stop();
    recorder?.stream.getTracks().forEach((t) => t.stop());
    setRecorder(null);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {status !== "recording" ? (
          <Button onClick={start}>Start Recording</Button>
        ) : (
          <Button variant="destructive" onClick={stop}>
            Stop
          </Button>
        )}
        <span className="text-muted-foreground text-sm">{status}</span>
      </div>

      <div className="space-y-1">
        <Label htmlFor="override">Optional: paste a manual transcript</Label>
        <Textarea
          id="override"
          value={transcriptOverride}
          onChange={(e) => setTranscriptOverride(e.target.value)}
        />
      </div>
    </div>
  );
}
