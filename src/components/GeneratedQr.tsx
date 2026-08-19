"use client";
import { QRCodeSVG } from "qrcode.react";

export default function GeneratedQr({ value }: { value: string }) {
  return <QRCodeSVG value={value} size={150} bgColor="#ffffff" fgColor="#1d4ff0" level="M" />;
}
