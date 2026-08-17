"use client";

import { useState } from "react";
import type { Dimensions } from "@/lib/products";
import { useT } from "@/lib/i18n/context";

export default function RoomFitCalculator({ dimensions }: { dimensions: Dimensions }) {
  const t = useT();
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
          t("This piece is {width} cm wide — wider than your {room} cm room width.", {
            width: dimensions.widthCm,
            room: rw,
          })
        );
      } else if (dimensions.widthCm + MARGIN_CM > rw) {
        messages.push(
          t("It'll fit, but leaves less than {margin} cm of clearance along that wall.", {
            margin: MARGIN_CM,
          })
        );
      }
    }

    if (Number.isFinite(rd) && rd > 0) {
      if (dimensions.depthCm > rd) {
        ok = false;
        messages.push(
          t("This piece is {depth} cm deep — deeper than your {room} cm room depth.", {
            depth: dimensions.depthCm,
            room: rd,
          })
        );
      }
    }

    if (Number.isFinite(dw) && dw > 0) {
      const smallestSide = Math.min(dimensions.widthCm, dimensions.depthCm, dimensions.heightCm);
      if (smallestSide > dw) {
        ok = false;
        messages.push(
          t(
            "Every side of this piece (smallest: {smallest} cm) is wider than your {door} cm door — it may not fit through.",
            { smallest: smallestSide, door: dw }
          )
        );
      }
    }

    if (messages.length === 0) {
      messages.push(t("Looks like a comfortable fit for the numbers you entered."));
    }

    setResult({ ok, messages });
  }

  return (
    <form onSubmit={handleCheck} className="flex flex-col gap-4">
      <p className="text-sm text-ink/60">
        {t("Enter your space in centimeters to check against this piece's {dims} footprint.", {
          dims: `${dimensions.widthCm} × ${dimensions.depthCm} × ${dimensions.heightCm} cm`,
        })}
      </p>
      <div className="grid grid-cols-3 gap-3">
        <label className="flex flex-col gap-1.5 text-sm">
          {t("Room width (cm)")}
          <input
            type="number"
            min={0}
            value={roomWidth}
            onChange={(e) => setRoomWidth(e.target.value)}
            className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          {t("Room depth (cm)")}
          <input
            type="number"
            min={0}
            value={roomDepth}
            onChange={(e) => setRoomDepth(e.target.value)}
            className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          {t("Door width (cm)")}
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
        {t("Check fit")}
      </button>

      {result && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            result.ok
              ? "bg-walnut-50 text-walnut-600"
              : "bg-danger-50 text-danger-500"
          }`}
        >
          <p className="font-medium">{result.ok ? t("✅ Should fit") : t("⚠️ Check the numbers")}</p>
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
