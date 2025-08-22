import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Box, TextField, Button, List, ListItem, ListItemText, IconButton, Dialog, DialogTitle, DialogActions } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { motion } from "framer-motion";
import { getBlacklist, addBlacklist, removeBlacklist } from "../services/api";
import { toast } from "react-toastify";

export default function BlacklistManager() {
  const [list, setList] = useState([]);
  const [domain, setDomain] = useState("");
  const [confirm, setConfirm] = useState({ open: false, target: null });

  useEffect(() => { fetchList(); }, []);

  async function fetchList() {
    const l = await getBlacklist();
    setList(l || []);
  }

  async function handleAdd() {
    if (!domain.trim()) return toast.info("Enter domain");
    const ok = await addBlacklist(domain.trim());
    if (ok) {
      toast.success("Added to blacklist");
      setDomain("");
      fetchList();
    } else {
      toast.error("Failed (api)");
    }
  }

  function handleRemove(domainToRemove) {
    setConfirm({ open: true, target: domainToRemove });
  }

  async function confirmRemove() {
    const ok = await removeBlacklist(confirm.target);
    if (ok) toast.success("Removed");
    else toast.error("Failed to remove");
    setConfirm({ open: false, target: null });
    fetchList();
  }

  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
      <Card sx={{ borderRadius: 3, background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,0,255,0.12)", boxShadow: "0 8px 30px rgba(255,0,255,0.06)" }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: "#FF39D8", mb: 1 }}>Blacklist Manager</Typography>
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <TextField size="small" placeholder="example.com" value={domain} onChange={e => setDomain(e.target.value)} sx={{ flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: 1 }} />
            <Button variant="contained" onClick={handleAdd} sx={{ background: "#7C6CFF" }}>ADD</Button>
          </Box>
          <List sx={{ maxHeight: 200, overflow: "auto" }}>
            {list.map((d, i) => (
              <ListItem key={i} secondaryAction={
                <IconButton edge="end" onClick={() => handleRemove(d)} aria-label="delete">
                  <DeleteIcon sx={{ color: "#FF6B9A" }} />
                </IconButton>
              }>
                <ListItemText primary={d} primaryTypographyProps={{ color: "#E6E6FF" }} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
      <Dialog open={confirm.open} onClose={() => setConfirm({ open: false, target: null })}>
        <DialogTitle>Remove {confirm.target} from blacklist?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirm({ open: false, target: null })}>Cancel</Button>
          <Button onClick={confirmRemove} color="error">Remove</Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}
