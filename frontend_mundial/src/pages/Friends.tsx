import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Chip,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { createGroup, getMyGroup, joinGroup, leaveGroup } from "../api/groupApi";
import { getPools } from "../api/poolsApi";
import { useApp } from "../context/AppContext";
import type { FriendGroup } from "../types/friendGroup";
import { validateCode, validateRequired, type FieldErrors } from "../utils/validation";

const POOL_CODE = "AMIGOS2026";
type FriendField = "newGroupName" | "joinCode";
type Msg = { text: string; severity: "success" | "error" | "info" } | null;

export default function Friends() {
  const { user } = useApp();
  const [groups, setGroups] = useState<FriendGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [membersText, setMembersText] = useState<string[]>([]);
  const [errors, setErrors] = useState<FieldErrors<FriendField>>({});
  const [msg, setMsg] = useState<Msg>(null);
  const [loading, setLoading] = useState(false);

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === selectedGroupId) ?? null,
    [groups, selectedGroupId]
  );

  const refresh = useCallback(async () => {
    if (!user) return;

    const mine = (await getMyGroup(POOL_CODE, user.id)) ?? [];
    setGroups(mine);

    if (!selectedGroupId && mine[0]) setSelectedGroupId(mine[0].id);
    if (selectedGroupId && !mine.some((group) => group.id === selectedGroupId)) {
      setSelectedGroupId("");
      setMembersText([]);
    }
  }, [selectedGroupId, user]);

  const loadMembers = useCallback(async (group: FriendGroup) => {
    const pools = await getPools();
    const pool = pools.find((item) => item.code === POOL_CODE);

    if (!pool) {
      setMembersText(group.memberIds.slice());
      return;
    }

    setMembersText(
      group.memberIds.map((id) => {
        const member = pool.members.find((item) => item.user.id === id);
        return member ? `${member.user.name} (${member.user.id})` : id;
      })
    );
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (selectedGroup) void loadMembers(selectedGroup);
  }, [loadMembers, selectedGroup]);

  if (!user) return <Alert severity="warning">Debes iniciar sesión.</Alert>;

  const onCreate = async () => {
    const nameError = validateRequired(newGroupName, "El nombre del grupo", 4);
    setErrors((current) => ({ ...current, newGroupName: nameError || undefined }));
    if (nameError) return;

    try {
      setLoading(true);
      setMsg(null);

      const group = await createGroup(POOL_CODE, user.id, newGroupName.trim());
      setNewGroupName("");
      setMsg({ text: `Grupo creado. Código de invitación: ${group.code}`, severity: "success" });
      await refresh();
      setSelectedGroupId(group.id);
      await loadMembers(group);
    } catch (e) {
      const message = e instanceof Error ? e.message : "No se pudo crear el grupo.";
      setMsg({ text: message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const onJoin = async () => {
    const codeError = validateCode(joinCode, "El código del grupo");
    setErrors((current) => ({ ...current, joinCode: codeError || undefined }));
    if (codeError) return;

    try {
      setLoading(true);
      setMsg(null);

      const group = await joinGroup(POOL_CODE, user.id, joinCode.trim().toUpperCase());
      if (!group) {
        setMsg({ text: "Código inválido o grupo inexistente.", severity: "error" });
        return;
      }

      setJoinCode("");
      setMsg({ text: `Te uniste al grupo ${group.name}.`, severity: "success" });
      await refresh();
      setSelectedGroupId(group.id);
      await loadMembers(group);
    } catch (e) {
      const message = e instanceof Error ? e.message : "No se pudo unir al grupo.";
      setMsg({ text: message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const onLeave = async () => {
    if (!selectedGroup) return;

    try {
      setLoading(true);
      const ok = await leaveGroup(POOL_CODE, user.id, selectedGroup.id);
      setMsg(
        ok
          ? { text: "Saliste del grupo.", severity: "success" }
          : { text: "No se pudo salir del grupo.", severity: "error" }
      );
      setSelectedGroupId("");
      setMembersText([]);
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  const onCopyCode = async () => {
    if (!selectedGroup) return;

    try {
      await navigator.clipboard.writeText(selectedGroup.code);
      setMsg({ text: "Código copiado.", severity: "success" });
    } catch {
      setMsg({ text: "No se pudo copiar el código.", severity: "error" });
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Grupos de amigos</Typography>

      <Alert severity="info">
        Crea grupos, comparte códigos de invitación y controla la participación de los usuarios.
      </Alert>

      {msg && <Alert severity={msg.severity}>{msg.text}</Alert>}

      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <Paper sx={{ p: 2.5, flex: 1 }}>
          <Typography variant="h6">Crear grupo</Typography>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Nombre del grupo"
              value={newGroupName}
              onChange={(event) => setNewGroupName(event.target.value)}
              error={Boolean(errors.newGroupName)}
              helperText={errors.newGroupName || "Ejemplo: Familia Mundialista"}
              disabled={loading}
              fullWidth
            />
            <Button variant="contained" onClick={onCreate} disabled={loading}>
              Crear grupo
            </Button>
          </Stack>
        </Paper>

        <Paper sx={{ p: 2.5, flex: 1 }}>
          <Typography variant="h6">Unirse con código</Typography>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Código de invitación"
              value={joinCode}
              onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
              error={Boolean(errors.joinCode)}
              helperText={errors.joinCode || "Pide el código al creador del grupo."}
              disabled={loading}
              fullWidth
            />
            <Button variant="outlined" onClick={onJoin} disabled={loading}>
              Unirme
            </Button>
          </Stack>
        </Paper>
      </Stack>

      <Paper sx={{ p: 2.5 }}>
        <Typography variant="h6">Mis grupos</Typography>

        {groups.length === 0 ? (
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Aún no perteneces a ningún grupo.
          </Typography>
        ) : (
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              select
              label="Selecciona un grupo"
              value={selectedGroupId}
              onChange={(event) => setSelectedGroupId(event.target.value)}
              fullWidth
            >
              {groups.map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.name} · {group.code}
                </MenuItem>
              ))}
            </TextField>

            {selectedGroup && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Typography sx={{ fontWeight: 800 }}>{selectedGroup.name}</Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Chip label={`Código ${selectedGroup.code}`} />
                    <Chip label={`${selectedGroup.memberIds.length} miembros`} variant="outlined" />
                    <Chip
                      label={selectedGroup.ownerId === user.id ? "Creador" : "Miembro"}
                      color={selectedGroup.ownerId === user.id ? "success" : "default"}
                      variant="outlined"
                    />
                  </Stack>

                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Button variant="outlined" onClick={onCopyCode}>
                      Copiar código
                    </Button>
                    <Button variant="outlined" color="error" onClick={onLeave} disabled={loading}>
                      Salir del grupo
                    </Button>
                  </Stack>

                  <Typography sx={{ fontWeight: 700, mt: 1 }}>Miembros</Typography>
                  {membersText.length === 0 ? (
                    <Typography color="text.secondary">Sin miembros cargados.</Typography>
                  ) : (
                    membersText.map((member) => (
                      <Typography key={member} color="text.secondary">
                        {member}
                      </Typography>
                    ))
                  )}
                </Stack>
              </Paper>
            )}
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}
