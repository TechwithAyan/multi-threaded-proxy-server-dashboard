import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardContent, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { getMetrics } from "../services/api";

export default function RealTimeChart() {
  const [series, setSeries] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function fetch() {
      const m = await getMetrics();
      if (!mounted) return;
      setSeries(m.rpsSeries || []);
    }
    fetch();
    const t = setInterval(fetch, 2000);
    return () => { mounted = false; clearInterval(t); };
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <Card sx={{ background: "linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))", borderRadius: 3, boxShadow: "0 8px 30px rgba(0,0,0,0.6)", border: "1px solid rgba(100,100,255,0.12)" }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: "#00E5FF", mb: 1 }}>Real-time Requests (req/sec)</Typography>
          <div style={{ height: 200 }}>
            <ResponsiveContainer>
              <LineChart data={series}>
                <CartesianGrid stroke="#14213d" strokeDasharray="3 3" />
                <XAxis dataKey="t" tick={{ fill: "#9fb7d7" }} />
                <YAxis tick={{ fill: "#9fb7d7" }} />
                <Tooltip />
                <Line type="monotone" dataKey="v" stroke="#00E5FF" strokeWidth={3} dot={false} isAnimationActive={true} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
