// file: app/(public)/about/page.tsx
import { Mail, Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about our party, our history, and meet our leadership team.",
};

async function getTeamMembers() {
  return prisma.teamMember.findMany({
    orderBy: [
      { isLeadership: "desc" },
      { order: "asc" },
    ],
  });
}

export default async function AboutPage() {
  const teamMembers = await getTeamMembers();
  
  const leadership = teamMembers.filter((m) => m.isLeadership);
  const team = teamMembers.filter((m) => !m.isLeadership);

  return (
    <div className="container-custom py-12">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
          About Our Party
        </h1>
        <p className="text-xl text-muted-foreground">
          Building a better future together through integrity, 
          transparency, and dedicated service to our community.
        </p>
      </div>

      {/* Mission & Values */}
      <section className="max-w-4xl mx-auto mb-16">
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>
                We are committed to creating a society where every citizen has 
                the opportunity to thrive. Through progressive policies, ethical 
                governance, and community engagement, we work towards a future 
                that benefits all members of our society.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Our Vision</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>
                We envision a nation where equality, justice, and prosperity 
                are not just ideals but lived realities. A place where government 
                works for the people, where the environment is protected, and 
                where every voice matters.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Core Values */}
      <section className="max-w-4xl mx-auto mb-16">
        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-center mb-8">
          Our Core Values
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Integrity", description: "Honest and transparent in all our actions" },
            { title: "Equality", description: "Fair treatment and opportunities for all" },
            { title: "Progress", description: "Forward-thinking solutions for tomorrow" },
            { title: "Unity", description: "Working together for the common good" },
          ].map((value) => (
            <Card key={value.title} className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">{value.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="my-16" />

      {/* Leadership Team */}
      {leadership.length > 0 && (
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-2">
              Our Leadership
            </h2>
            <p className="text-muted-foreground">
              Meet the dedicated individuals leading our movement forward.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {leadership.map((member) => (
              <TeamMemberCard key={member.id} member={member} featured />
            ))}
          </div>
        </section>
      )}

      {/* Team Members */}
      {team.length > 0 && (
        <section>
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-2">
              Our Team
            </h2>
            <p className="text-muted-foreground">
              The dedicated people working to make our vision a reality.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {team.map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        </section>
      )}

      {/* No team members message */}
      {teamMembers.length === 0 && (
        <Card className="max-w-xl mx-auto">
          <CardContent className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Team information coming soon.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface TeamMemberCardProps {
  member: {
    id: string;
    name: string;
    role: string;
    bio: string;
    photoUrl: string | null;
    email: string | null;
  };
  featured?: boolean;
}

function TeamMemberCard({ member, featured }: TeamMemberCardProps) {
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className={featured ? "text-center" : ""}>
      <CardHeader className={featured ? "items-center" : ""}>
        <Avatar className={featured ? "h-24 w-24 mb-4" : "h-16 w-16"}>
          {member.photoUrl && (
            <AvatarImage src={member.photoUrl} alt={member.name} />
          )}
          <AvatarFallback className={featured ? "text-2xl" : "text-lg"}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <CardTitle className={featured ? "text-xl" : "text-lg"}>
          {member.name}
        </CardTitle>
        <CardDescription className="font-medium text-primary">
          {member.role}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className={`text-muted-foreground ${featured ? "" : "text-sm"} line-clamp-3`}>
          {member.bio}
        </p>
        {member.email && (
          <a
            href={`mailto:${member.email}`}
            className="inline-flex items-center gap-1 mt-3 text-sm text-primary hover:underline"
          >
            <Mail className="h-4 w-4" />
            Contact
          </a>
        )}
      </CardContent>
    </Card>
  );
}
