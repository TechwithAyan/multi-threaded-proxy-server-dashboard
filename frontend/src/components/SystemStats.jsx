import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Grid } from "@mui/material";
import { motion } from "framer-motion";
import { getMetrics } from "../services/api";

function Ring({ value, label, color }) {
  const radius = 40, stroke = 8;
  const normalized = Math.min(100, Math.max(0, value));
  const circumference = 2 * Math.PI * radius;
  const dash = (normalized / 100) * circumference;
  return (
    <div style={{ textAlign: "center" }}>
      <svg width="110" height="110">
        <defs>
          <linearGradient id={`g-${label}`} x1="0" x2="1">
            <stop offset="0" stopColor={color} stopOpacity="0.9" />
            <stop offset="1" stopColor="#00E5FF" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <g transform="translate(55,55)">
          <circle r={radius} stroke="#111827" strokeWidth={stroke} fill="transparent" />
          <circle r={radius} stroke={`url(#g-${label})`} strokeWidth={stroke} fill="transparent"
            strokeDasharray={`${dash} ${circumference - dash}`} strokeLinecap="round" transform="rotate(-90)" />
        </g>
      </svg>
      <div style={{ marginTop: -18 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#E6F7FF" }}>{value}%</div>
        <div style={{ fontSize: 12, color: "#9fb7d7" }}>{label}</div>
      </div>
    </div>
  );
}

export default function SystemStats() {
  const [metrics, setMetrics] = useState({ cpu: 0, ram: 0 });

  useEffect(() => {
    let mounted = true;
    async function fetch() {
      const m = await getMetrics();
      if (!mounted) return;
      setMetrics({ cpu: m.cpu || 30, ram: m.ram || 60 });
    }
    fetch();
    const t = setInterval(fetch, 3000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <Card sx={{ p: 2, borderRadius: 3, background: "rgba(255,255,255,0.02)" }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: "#7CE6FF" }}>System Stats</Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}><Ring value={metrics.cpu} label="CPU" color="#FF7A7A" /></Grid>
            <Grid item xs={6}><Ring value={metrics.ram} label="RAM" color="#7C6CFF" /></Grid>
          </Grid>
        </CardContent>
      </Card>
    </motion.div>
  );
}
