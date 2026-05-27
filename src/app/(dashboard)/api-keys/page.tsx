"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { FadeInUp } from "@/components/motion/fade-in-up";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/motion/stagger-list";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Plus,
  Copy,
  Check,
  Trash2,
  Key,
  Clock,
  EyeOff,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

interface ApiKeyData {
  id: string;
  name: string;
  prefix: string;
  enabled: boolean;
  lastUsedAt: string | null;
  createdAt: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchKeys = useCallback(async () => {
    const res = await fetch("/api/user/api-keys");
    const data = await res.json();
    setKeys(data.apiKeys || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  async function handleCreate() {
    if (!newKeyName.trim()) return;
    setCreating(true);
    const res = await fetch("/api/user/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newKeyName }),
    });
    const data = await res.json();
    setCreating(false);
    if (data.fullKey) {
      setNewKey(data.fullKey);
      setNewKeyName("");
      fetchKeys();
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/user/api-keys/${id}`, { method: "DELETE" });
    toast.success("API Key 已删除");
    fetchKeys();
  }

  function copyKey() {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setCopied(true);
      toast.success("已复制到剪贴板");
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <FadeInUp>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              API Keys
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              管理你的 API 密钥
            </p>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            size="sm"
            className="rounded-xl"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            创建 Key
          </Button>
        </div>
      </FadeInUp>

      <StaggerContainer className="space-y-3">
        {keys.map((key) => (
          <StaggerItem key={key.id}>
            <div className="glass rounded-xl p-4 shadow-apple flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Key className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{key.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    ai-{key.prefix}...
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {key.lastUsedAt && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(key.lastUsedAt), "MM/dd HH:mm", {
                      locale: zhCN,
                    })}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(key.id)}
                >
                  <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            </div>
          </StaggerItem>
        ))}
        {!loading && keys.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Key className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">还没有 API Key</p>
            <Button
              onClick={() => setCreateOpen(true)}
              variant="link"
              size="sm"
              className="mt-1"
            >
              创建第一个 Key
            </Button>
          </div>
        )}
      </StaggerContainer>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-0 gap-0">
          <AnimatePresence mode="wait">
            {newKey ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6"
              >
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 20,
                    }}
                    className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4"
                  >
                    <Check className="w-7 h-7 text-emerald-500" />
                  </motion.div>
                  <DialogTitle className="text-lg font-semibold mb-2">
                    API Key 已创建
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mb-4">
                    请立即复制你的 Key，此密钥仅显示一次
                  </p>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary font-mono text-sm break-all">
                    <code className="flex-1 text-left">{newKey}</code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg shrink-0"
                      onClick={copyKey}
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    onClick={() => {
                      setNewKey(null);
                      setCreateOpen(false);
                    }}
                    className="w-full mt-4 rounded-xl"
                  >
                    我已保存，完成
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-6"
              >
                <DialogTitle className="text-lg font-semibold mb-4">
                  创建新的 API Key
                </DialogTitle>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Key 名称</Label>
                    <Input
                      placeholder="例如：我的应用"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="h-11 rounded-xl"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCreate();
                      }}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      onClick={() => setCreateOpen(false)}
                      className="rounded-xl"
                    >
                      取消
                    </Button>
                    <Button
                      onClick={handleCreate}
                      disabled={creating || !newKeyName.trim()}
                      className="rounded-xl"
                    >
                      {creating ? "创建中..." : "创建"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
}
