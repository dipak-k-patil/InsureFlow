import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Lock, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, getSignedAvatarUrl } from "@/hooks/useProfile";
import { useQueryClient } from "@tanstack/react-query";
import { BrandKitManager } from "@/components/BrandKitManager";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Palette } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const qc = useQueryClient();
  const [form, setForm] = useState({ full_name: "", phone: "", agency_name: "" });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pw, setPw] = useState({ a: "", b: "" });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        phone: profile.phone ?? "",
        agency_name: profile.agency_name ?? "",
      });
    }
  }, [profile]);

  useEffect(() => {
    getSignedAvatarUrl(profile?.avatar_url).then(setAvatarUrl);
  }, [profile?.avatar_url]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").update(form).eq("id", user!.id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      const path = `${user!.id}/avatar-${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (error) throw error;
      const { error: upErr } = await supabase.from("profiles").update({ avatar_url: path }).eq("id", user!.id);
      if (upErr) throw upErr;
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Avatar updated");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const changePassword = async () => {
    if (pw.a.length < 8) return toast.error("Password must be at least 8 characters");
    if (pw.a !== pw.b) return toast.error("Passwords do not match");
    const { error } = await supabase.auth.updateUser({ password: pw.a });
    if (error) return toast.error(error.message);
    setPw({ a: "", b: "" });
    toast.success("Password changed");
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings & Brand Assets</h1>
        <p className="text-muted-foreground mt-1">Manage your account, security, and reusable agency Brand Kits</p>
      </div>

      <Tabs defaultValue="brand-kits" className="w-full">
        <TabsList className="grid grid-cols-2 max-w-md mb-6">
          <TabsTrigger value="brand-kits" className="gap-2">
            <Palette className="w-4 h-4" /> Brand Kits
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" /> Account & Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="brand-kits" className="mt-0">
          <BrandKitManager />
        </TabsContent>

        <TabsContent value="profile" className="mt-0 space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10"><User className="w-5 h-5 text-primary" /></div>
              <h2 className="text-lg font-semibold text-foreground">Profile</h2>
            </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-lg font-semibold text-primary overflow-hidden">
            {avatarUrl ? <img src={avatarUrl} alt="Profile avatar" className="w-full h-full object-cover" /> : (form.full_name || user?.email || "U").slice(0, 2).toUpperCase()}
          </div>
          <label className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md border border-border cursor-pointer hover:bg-muted/40">
            <Upload className="w-4 h-4" /> Upload avatar
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); }} />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Full Name</Label>
            <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Agency Name</Label>
            <Input value={form.agency_name} onChange={(e) => setForm({ ...form, agency_name: e.target.value })} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Email</Label>
            <Input value={user?.email ?? ""} disabled />
          </div>
        </div>
        <Button onClick={saveProfile} disabled={saving}>{saving ? "Saving..." : "Save Profile"}</Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10"><Lock className="w-5 h-5 text-primary" /></div>
          <h2 className="text-lg font-semibold text-foreground">Security</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>New Password</Label>
            <Input type="password" value={pw.a} onChange={(e) => setPw({ ...pw, a: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Confirm Password</Label>
            <Input type="password" value={pw.b} onChange={(e) => setPw({ ...pw, b: e.target.value })} />
          </div>
        </div>
        <Button variant="outline" onClick={changePassword}>Change Password</Button>
      </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
