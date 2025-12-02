"use client";

import { useForm } from "react-hook-form";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usersApi } from "@/api/users";

interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export function ProfileContent() {
  const { user, setAuth } = useAuthStore();
  const { toast } = useToast();
  const { register, handleSubmit } = useForm<ProfileForm>({
    defaultValues: {
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
      phone: user?.phone || ""
    }
  });

  const onSubmit = async (data: ProfileForm) => {
    if (!user) return;
    try {
      const updatedUser = await usersApi.update(user.id, data);
      const token = localStorage.getItem("token")!;
      setAuth(updatedUser, token);
      toast({ title: "Profile updated!" });
    } catch {
      toast({ title: "Error updating profile", variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input {...register("firstName")} className="w-full px-3 py-2 border rounded-md" />
      <input {...register("lastName")} className="w-full px-3 py-2 border rounded-md" />
      <input {...register("email")} className="w-full px-3 py-2 border rounded-md" />
      <input {...register("phone")} className="w-full px-3 py-2 border rounded-md" />
      <Button type="submit" className="w-full mt-2">Save Changes</Button>
    </form>
  );
}
