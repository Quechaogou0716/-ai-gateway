"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, Trash2, Check, Loader2 } from "lucide-react";

export default function AdminSettingsPage() {
  const [qrCode, setQrCode] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setQrCode(d.settings?.payment_qr_base64 || ""))
      .catch(() => toast.error("加载设置失败"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "payment_qr_base64", value: qrCode }),
      });
      if (res.ok) {
        toast.success("收款码已保存");
      } else {
        toast.error("保存失败");
      }
    } catch {
      toast.error("网络错误");
    }
    setSaving(false);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("图片不能超过 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setQrCode(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleClear() {
    setQrCode("");
  }

  if (loading) {
    return (
      <div className="max-w-2xl space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">系统设置</h1>
        <div className="glass rounded-2xl p-8 shadow-apple text-center">
          <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">系统设置</h1>
        <p className="text-sm text-muted-foreground mt-1">管理收款码等全局设置</p>
      </div>

      <div className="glass rounded-2xl p-6 shadow-apple space-y-4">
        <h2 className="text-lg font-semibold">收款二维码</h2>
        <p className="text-sm text-muted-foreground">
          上传你的微信或支付宝收款码，用户充值时会显示此二维码。扫码后用户填写交易流水号提交审核。
        </p>

        {qrCode ? (
          <div className="relative inline-block">
            <img
              src={qrCode}
              alt="收款码"
              className="w-56 h-56 rounded-xl border border-border object-contain bg-white"
            />
            <button
              onClick={handleClear}
              className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md hover:opacity-80 transition-opacity"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-56 h-56 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
          >
            <Upload className="w-6 h-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">点击上传收款码</span>
            <span className="text-[10px] text-muted-foreground/60">
              支持 JPG、PNG，不超过 2MB
            </span>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        <div className="flex gap-2">
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="rounded-xl"
          >
            <Upload className="w-4 h-4 mr-2" />
            {qrCode ? "更换图片" : "选择图片"}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !qrCode}
            className="rounded-xl"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            保存设置
          </Button>
        </div>

        <p className="text-[11px] text-muted-foreground">
          提示：在微信/支付宝中打开收款码 → 截图保存 → 在此上传。建议使用固定金额收款码与套餐金额一致。
        </p>
      </div>
    </div>
  );
}
