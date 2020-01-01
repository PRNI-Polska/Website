// file: app/(public)/about/about-client.tsx
"use client";

import { Mail, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/lib/i18n";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  photoUrl: string | null;
  email: string | null;
  isLeadership: boolean;
}

interface AboutPageClientProps {
  teamMembers: TeamMember[];
}

export default function AboutPageClient({ teamMembers }: AboutPageClientProps) {
  const { t } = useI18n();
  
  const leadership = teamMembers.filter((m) => m.isLeadership);
  const team = teamMembers.filter((m) => !m.isLeadership);

  const values = ["nationalism", "integralism", "sovereignty", "order"];

  return (
    <div className="container-custom py-12">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
          {t("about.title")}
        </h1>
        <p className="text-xl text-muted-foreground">
          {t("about.subtitle")}
        </p>
      </div>

      {/* Mission & Vision */}
      <section className="max-w-4xl mx-auto mb-16">
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>{t("about.mission.title")}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              {t("about.mission.text").split("\n").map((paragraph, i) => (
                <p key={i} className={i > 0 ? "mt-4" : ""}>
                  {paragraph}
                </p>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("about.vision.title")}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              {t("about.vision.text").split("\n").map((paragraph, i) => (
                <p key={i} className={i > 0 ? "mt-4" : ""}>
                  {paragraph}
                </p>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Core Values */}
      <section className="max-w-4xl mx-auto mb-16">
        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-center mb-8">
          {t("about.values.title")}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((key) => (
            <Card key={key} className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">
                  {t(`about.value.${key}.title`)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t(`about.value.${key}.text`)}
                </p>
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
              {t("about.leadership")}
            </h2>
            <p className="text-muted-foreground">
              {t("about.leadership.subtitle")}
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
              {t("about.team")}
            </h2>
            <p className="text-muted-foreground">
              {t("about.team.subtitle")}
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
              {t("about.team.coming")}
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
