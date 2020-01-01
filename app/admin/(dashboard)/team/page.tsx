// file: app/admin/(dashboard)/team/page.tsx
import Link from "next/link";
import { Plus, Edit, MoreHorizontal, Star } from "lucide-react";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DeleteButton } from "@/components/admin/delete-button";

async function getTeamMembers() {
  return prisma.teamMember.findMany({
    orderBy: [{ isLeadership: "desc" }, { order: "asc" }],
  });
}

export default async function AdminTeamPage() {
  const members = await getTeamMembers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Team Members</h1>
          <p className="text-muted-foreground">Manage leadership and team</p>
        </div>
        <Button asChild>
          <Link href="/admin/team/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Members</CardTitle>
          <CardDescription>{members.length} total members</CardDescription>
        </CardHeader>
        <CardContent>
          {members.length > 0 ? (
            <div className="space-y-4">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      {member.photoUrl && <AvatarImage src={member.photoUrl} alt={member.name} />}
                      <AvatarFallback>
                        {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/team/${member.id}`} className="font-medium hover:text-primary">
                          {member.name}
                        </Link>
                        {member.isLeadership && (
                          <Badge variant="secondary" className="gap-1">
                            <Star className="h-3 w-3" />
                            Leadership
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/team/${member.id}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DeleteButton id={member.id} title={member.name} endpoint="/api/admin/team" />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No team members yet.</p>
              <Button asChild>
                <Link href="/admin/team/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Member
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
