// file: components/admin/team-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { createTeamMemberSchema, type CreateTeamMemberInput } from "@/lib/validations";
import { cn } from "@/lib/utils";
import type { TeamMember } from "@prisma/client";

interface TeamFormProps {
  member?: TeamMember;
}

export function TeamForm({ member }: TeamFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateTeamMemberInput>({
    resolver: zodResolver(createTeamMemberSchema),
    defaultValues: member
      ? {
          name: member.name,
          role: member.role,
          bio: member.bio,
          photoUrl: member.photoUrl || "",
          email: member.email || "",
          order: member.order,
          isLeadership: member.isLeadership,
        }
      : {
          name: "",
          role: "",
          bio: "",
          photoUrl: "",
          email: "",
          order: 0,
          isLeadership: false,
        },
  });

  const isLeadership = watch("isLeadership");

  const onSubmit = async (data: CreateTeamMemberInput) => {
    setIsSubmitting(true);
    try {
      const url = member ? `/api/admin/team/${member.id}` : "/api/admin/team";
      const method = member ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to save");
      }

      toast({
        title: member ? "Updated" : "Created",
        description: `"${data.name}" has been ${member ? "updated" : "added"}.`,
      });

      router.push("/admin/team");
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader><CardTitle>Member Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" {...register("name")} className={cn(errors.name && "border-destructive")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Input id="role" placeholder="e.g., Party Leader" {...register("role")} className={cn(errors.role && "border-destructive")} />
              {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio *</Label>
            <Textarea id="bio" rows={4} placeholder="Short biography..." {...register("bio")} className={cn(errors.bio && "border-destructive")} />
            {errors.bio && <p className="text-sm text-destructive">{errors.bio.message}</p>}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="photoUrl">Photo URL</Label>
              <Input id="photoUrl" type="url" placeholder="https://..." {...register("photoUrl")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (public)</Label>
              <Input id="email" type="email" {...register("email")} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input id="order" type="number" {...register("order", { valueAsNumber: true })} />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Checkbox 
                id="isLeadership" 
                checked={isLeadership}
                onCheckedChange={(checked) => setValue("isLeadership", checked as boolean)}
              />
              <Label htmlFor="isLeadership" className="cursor-pointer">Leadership position</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Save className="mr-2 h-4 w-4" />{member ? "Update" : "Add"} Member</>}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
