import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { motion } from "framer-motion";
import { getLogs } from "../services/api";

export default function LogsTable() {
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    let mounted = true;
    async function f() {
      const l = await getLogs(50);
      if (!mounted) return;
      setLogs(l || []);
    }
    f();
    const t = setInterval(f, 3000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, []);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
      <Card sx={{ borderRadius: 3, background: "rgba(10,12,20,0.45)", border: "1px solid rgba(0,229,255,0.06)" }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: "#7CE6FF" }}>Proxy Logs</Typography>
          <Table size="small" sx={{ mt: 1 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: "#9fb7d7" }}>Time</TableCell>
                <TableCell sx={{ color: "#9fb7d7" }}>Client</TableCell>
                <TableCell sx={{ color: "#9fb7d7" }}>Host</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} sx={{ color: "#9fb7d7" }}>No logs</TableCell>
                </TableRow>
              ) : logs.map((r, i) => (
                <TableRow key={i} sx={{ "&:hover": { background: "rgba(255,255,255,0.02)" } }}>
                  <TableCell sx={{ color: "#E6F7FF" }}>{r.timestamp || r.time || "-"}</TableCell>
                  <TableCell sx={{ color: "#E6F7FF" }}>{r.client?.[0] ?? JSON.stringify(r.client) ?? "-"}</TableCell>
                  <TableCell sx={{ color: "#E6F7FF" }}>{r.host ?? r.url ?? "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
