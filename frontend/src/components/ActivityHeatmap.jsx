import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { getMetrics } from "../services/api";

function Cell({ v }) {
  const colors = ["#0f172a", "#111827", "#172554", "#233b6b", "#3b82f6", "#00e5ff"];
  const idx = Math.min(colors.length - 1, Math.floor(v * 3));
  return (
    <div
      style={{
        width: 26,
        height: 18,
        background: colors[idx],
        borderRadius: 4,
        margin: 2,
        border: "1px solid #444"
      }}
      title={`${v} hits`}
    />
  );
}

export default function ActivityHeatmap() {
  const [heat, setHeat] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function fetch() {
      const m = await getMetrics();
      if (!mounted) return;
      setHeat(m.heatmap || Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0)));
    }
    fetch();
    const t = setInterval(fetch, 5000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <Card sx={{ borderRadius: 3, background: "rgba(0,0,0,0.45)" }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: "#8AE0FF" }}>
            Activity Heatmap
          </Typography>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 12 }}>
            {heat.map((row, ri) => (
              <div key={ri} style={{ display: "flex" }}>
                {row.map((v, ci) => (
                  <Cell v={v} key={ci} />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
