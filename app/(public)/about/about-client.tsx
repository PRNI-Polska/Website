// file: app/(public)/about/about-client.tsx
"use client";

import Image from "next/image";
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
  quote?: string | null;
  photoUrl: string | null;
  email: string | null;
  isLeadership: boolean;
}

const FOUNDING_LEADER: TeamMember = {
  id: "_founding_leader",
  name: "Karol Małszycki",
  role: "Prezes Naczelny Ruchu",
  bio: "",
  quote: `\u201ETolerancja jest cech\u0105 ludzi bez przekona\u0144\u201D \u2013 G.K. Chesterton`,
  photoUrl: "/team/karol.png",
  email: null,
  isLeadership: true,
};

interface AboutPageClientProps {
  teamMembers: TeamMember[];
}

export default function AboutPageClient({ teamMembers }: AboutPageClientProps) {
  const { t } = useI18n();

  const hasFounder = teamMembers.some(
    (m) => m.name === FOUNDING_LEADER.name
  );
  const allMembers = hasFounder
    ? teamMembers
    : [FOUNDING_LEADER, ...teamMembers];

  const leadership = allMembers.filter((m) => m.isLeadership);
  const team = allMembers.filter((m) => !m.isLeadership);

  const values = ["nationalism", "integralism", "sovereignty", "order"];

  return (
    <div className="relative min-h-screen">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        aria-hidden="true"
        style={{
          backgroundImage: "url('/sword.png')",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "auto 110vh",
          opacity: 0.07,
        }}
      />

      <div className="relative z-10 container-custom py-12">
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

        {/* Photo gallery */}
        <section className="max-w-5xl mx-auto mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { src: "/photos/flag-sea-1.png", alt: "PRNI flag by the sea" },
              { src: "/photos/flag-sea-2.png", alt: "PRNI flag at the coast" },
              { src: "/photos/flag-beach.png", alt: "PRNI flag on the beach" },
              { src: "/photos/flag-march.png", alt: "PRNI march with the flag" },
            ].map((photo) => (
              <div
                key={photo.src}
                className="relative rounded-lg overflow-hidden aspect-[3/4]"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover"
                  style={{ filter: "brightness(1.3) contrast(1.15)" }}
                />
              </div>
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

      </div>
    </div>
  );
}

interface TeamMemberCardProps {
  member: {
    id: string;
    name: string;
    role: string;
    bio: string;
    quote?: string | null;
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
            <AvatarImage
              src={member.photoUrl}
              alt={member.name}
              className="object-cover object-top"
            />
          )}
          <AvatarFallback className={featured ? "text-2xl" : "text-lg"}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <CardTitle className={featured ? "text-xl" : "text-lg"}>
          {member.name}
        </CardTitle>
        <CardDescription className="font-medium">
          {member.role}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {member.bio && (
          <p className={`text-muted-foreground ${featured ? "" : "text-sm"} line-clamp-3`}>
            {member.bio}
          </p>
        )}
        {member.quote && (
          <p className={`italic text-muted-foreground/80 ${featured ? "text-sm" : "text-xs"} ${member.bio ? "mt-3" : ""}`}>
            {member.quote}
          </p>
        )}
        {member.email && (
          <a
            href={`mailto:${member.email}`}
            className="inline-flex items-center gap-1 mt-3 text-sm text-foreground hover:underline"
          >
            <Mail className="h-4 w-4" />
            Contact
          </a>
        )}
      </CardContent>
    </Card>
  );
}
