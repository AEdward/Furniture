"use client";

import { useState } from "react";
import type { Dimensions } from "@/lib/products";

export default function RoomFitCalculator({ dimensions }: { dimensions: Dimensions }) {
  const [roomWidth, setRoomWidth] = useState("");
  const [roomDepth, setRoomDepth] = useState("");
  const [doorWidth, setDoorWidth] = useState("");
  const [result, setResult] = useState<{ ok: boolean; messages: string[] } | null>(null);

  function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    const messages: string[] = [];
    let ok = true;

    const rw = Number(roomWidth);
    const rd = Number(roomDepth);
    const dw = Number(doorWidth);

    const MARGIN_CM = 60; // walking/clearance space recommended around the piece

    if (Number.isFinite(rw) && rw > 0) {
      if (dimensions.widthCm > rw) {
        ok = false;
        messages.push(
          `This piece is ${dimensions.widthCm} cm wide — wider than your ${rw} cm room width.`
        );
      } else if (dimensions.widthCm + MARGIN_CM > rw) {
        messages.push(
          `It'll fit, but leaves less than ${MARGIN_CM} cm of clearance along that wall.`
        );
      }
    }

    if (Number.isFinite(rd) && rd > 0) {
      if (dimensions.depthCm > rd) {
        ok = false;
        messages.push(
          `This piece is ${dimensions.depthCm} cm deep — deeper than your ${rd} cm room depth.`
        );
      }
    }

    if (Number.isFinite(dw) && dw > 0) {
      const smallestSide = Math.min(dimensions.widthCm, dimensions.depthCm, dimensions.heightCm);
      if (smallestSide > dw) {
        ok = false;
        messages.push(
          `Every side of this piece (smallest: ${smallestSide} cm) is wider than your ${dw} cm door — it may not fit through.`
        );
      }
    }

    if (messages.length === 0) {
      messages.push("Looks like a comfortable fit for the numbers you entered.");
    }

    setResult({ ok, messages });
  }

  return (
    <form onSubmit={handleCheck} className="flex flex-col gap-4">
      <p className="text-sm text-ink/60">
        Enter your space in centimeters to check against this piece's{" "}
        {dimensions.widthCm} × {dimensions.depthCm} × {dimensions.heightCm} cm footprint.
      </p>
      <div className="grid grid-cols-3 gap-3">
        <label className="flex flex-col gap-1.5 text-sm">
          Room width (cm)
          <input
            type="number"
            min={0}
            value={roomWidth}
            onChange={(e) => setRoomWidth(e.target.value)}
            className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          Room depth (cm)
          <input
            type="number"
            min={0}
            value={roomDepth}
            onChange={(e) => setRoomDepth(e.target.value)}
            className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          Door width (cm)
          <input
            type="number"
            min={0}
            value={doorWidth}
            onChange={(e) => setDoorWidth(e.target.value)}
            className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
          />
        </label>
      </div>
      <button type="submit" className="btn-secondary self-start">
        Check fit
      </button>

      {result && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            result.ok
              ? "bg-walnut-50 text-walnut-600"
              : "bg-terracotta-50 text-terracotta-500"
          }`}
        >
          <p className="font-medium">{result.ok ? "✅ Should fit" : "⚠️ Check the numbers"}</p>
          <ul className="mt-1 list-inside list-disc space-y-1">
            {result.messages.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}
