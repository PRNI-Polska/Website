// file: app/(public)/manifesto/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { Separator } from "@/components/ui/separator";

const declarationSections = [
  {
    id: 1,
    titlePl: "Naród jako najwyższa wartość polityczna",
    titleEn: "The Nation as the Highest Political Value",
    titleDe: "Die Nation als höchster politischer Wert",
    contentPl: "Uznajemy naród za najwyższą wartość polityczną. Naród pojmujemy jako byt historyczny i kulturowy, stojący ponad interesami jednostek oraz grup społecznych.",
    contentEn: "We recognize the nation as the highest political value. We understand the nation as a historical and cultural entity, standing above the interests of individuals and social groups.",
    contentDe: "Wir erkennen die Nation als den höchsten politischen Wert an. Wir verstehen die Nation als eine historische und kulturelle Einheit, die über den Interessen von Einzelpersonen und sozialen Gruppen steht.",
  },
  {
    id: 2,
    titlePl: "Jedność ideowa i kulturowa",
    titleEn: "Ideological and Cultural Unity",
    titleDe: "Ideologische und kulturelle Einheit",
    contentPl: "Opowiadamy się za zachowaniem jedności ideowej i kulturowej wspólnoty narodowej. Uznajemy konieczność obrony jednej, polskiej tradycji narodowej jako fundamentu tożsamości i ciągłości narodu.",
    contentEn: "We advocate for the preservation of ideological and cultural unity of the national community. We recognize the necessity of defending a single Polish national tradition as the foundation of the nation's identity and continuity.",
    contentDe: "Wir setzen uns für die Bewahrung der ideologischen und kulturellen Einheit der nationalen Gemeinschaft ein. Wir erkennen die Notwendigkeit an, eine einzige polnische nationale Tradition als Grundlage der Identität und Kontinuität der Nation zu verteidigen.",
  },
  {
    id: 3,
    titlePl: "Antyliberalizm",
    titleEn: "Anti-Liberalism",
    titleDe: "Antiliberalismus",
    contentPl: "Odrzucamy liberalizm polityczny, oparty na skrajnym pluralizmie i indywidualizmie, jak również liberalizm kulturowy, prowadzący do relatywizacji wartości i osłabienia więzi narodowych.",
    contentEn: "We reject political liberalism, based on extreme pluralism and individualism, as well as cultural liberalism, leading to the relativization of values and the weakening of national bonds.",
    contentDe: "Wir lehnen den politischen Liberalismus ab, der auf extremem Pluralismus und Individualismus basiert, sowie den kulturellen Liberalismus, der zur Relativierung von Werten und zur Schwächung nationaler Bindungen führt.",
  },
  {
    id: 4,
    titlePl: "Degeneracja moralna współczesnego społeczeństwa",
    titleEn: "Moral Degeneration of Modern Society",
    titleDe: "Moralische Degeneration der modernen Gesellschaft",
    contentPl: "Sprzeciwiamy się ogarniającym świat globalizmowi oraz międzynarodowym korporacjom wspierającym liberalne i progresywne inicjatywy mające na celu destabilizację i kontrolę narodów, w wyniku których współczesne społeczeństwa poddawane są procesowi głębokiej erozji moralnej i aksjologicznej — jeśli proces ten nie zostanie powstrzymany, doprowadzi on do destrukcji ładu społecznego i tożsamości narodowej.",
    contentEn: "We oppose the globalism engulfing the world and international corporations supporting liberal and progressive initiatives aimed at destabilizing and controlling nations, as a result of which modern societies are subjected to a process of deep moral and axiological erosion — if this process is not stopped, it will lead to the destruction of social order and national identity.",
    contentDe: "Wir lehnen den die Welt erfassenden Globalismus und internationale Konzerne ab, die liberale und progressive Initiativen unterstützen, die auf die Destabilisierung und Kontrolle von Nationen abzielen, wodurch moderne Gesellschaften einem Prozess tiefer moralischer und axiologischer Erosion ausgesetzt sind — wenn dieser Prozess nicht gestoppt wird, wird er zur Zerstörung der sozialen Ordnung und der nationalen Identität führen.",
  },
  {
    id: 5,
    titlePl: "Gospodarka podporządkowana narodowi",
    titleEn: "Economy Subordinated to the Nation",
    titleDe: "Wirtschaft im Dienste der Nation",
    contentPl: "Uznajemy, że gospodarka powinna służyć narodowi. Nie opowiadamy się ani za skrajnym wolnym rynkiem, ani za socjalizmem. Dopuszczamy interwencję państwa tam, gdzie wymaga tego interes narodowy lub stabilność społeczna.",
    contentEn: "We recognize that the economy should serve the nation. We advocate neither for extreme free market nor for socialism. We allow state intervention where national interest or social stability requires it.",
    contentDe: "Wir erkennen an, dass die Wirtschaft der Nation dienen sollte. Wir befürworten weder einen extremen freien Markt noch den Sozialismus. Wir erlauben staatliche Eingriffe dort, wo das nationale Interesse oder die soziale Stabilität es erfordert.",
  },
  {
    id: 6,
    titlePl: "Zasady współpracy międzynarodowej",
    titleEn: "Principles of International Cooperation",
    titleDe: "Grundsätze der internationalen Zusammenarbeit",
    contentPl: "Opowiadamy się za współpracą międzynarodową opartą na poszanowaniu suwerenności, samostanowienia oraz pełnej niezależności politycznej i gospodarczej państw. Wszelkie formy integracji ponadnarodowej uznajemy za dopuszczalne wyłącznie wówczas, gdy nie naruszają one nadrzędności interesu narodowego, nie ograniczają kompetencji państwa w kluczowych obszarach oraz pozostają oparte na dobrowolności i równoprawności uczestników.",
    contentEn: "We advocate for international cooperation based on respect for sovereignty, self-determination, and full political and economic independence of states. We consider all forms of supranational integration admissible only when they do not violate the supremacy of national interest, do not limit state competences in key areas, and remain based on voluntariness and equality of participants.",
    contentDe: "Wir befürworten internationale Zusammenarbeit auf der Grundlage der Achtung von Souveränität, Selbstbestimmung und vollständiger politischer und wirtschaftlicher Unabhängigkeit der Staaten. Wir betrachten alle Formen supranationaler Integration nur dann als zulässig, wenn sie den Vorrang des nationalen Interesses nicht verletzen, die staatlichen Kompetenzen in Schlüsselbereichen nicht einschränken und auf Freiwilligkeit und Gleichberechtigung der Teilnehmer basieren.",
  },
  {
    id: 7,
    titlePl: "Bezpieczeństwo i obronność państwa",
    titleEn: "State Security and Defense",
    titleDe: "Staatliche Sicherheit und Verteidigung",
    contentPl: "Uznajemy, że bezpieczeństwo państwa powinno opierać się na zdolności do samodzielnej obrony oraz na współpracy międzynarodowej o wyłącznie obronnym charakterze. Sprzeciwiamy się polityce ekspansji militarnej, wykorzystywaniu sojuszy wojskowych jako narzędzi presji politycznej oraz działaniom prowadzącym do destabilizacji ładu międzynarodowego. Trwałe bezpieczeństwo może być budowane jedynie w oparciu o równowagę sił, odpowiedzialność państw oraz poszanowanie ich suwerenności.",
    contentEn: "We recognize that state security should be based on the ability for self-defense and on international cooperation of exclusively defensive nature. We oppose policies of military expansion, the use of military alliances as tools of political pressure, and actions leading to the destabilization of international order. Lasting security can only be built on the basis of balance of power, state responsibility, and respect for their sovereignty.",
    contentDe: "Wir erkennen an, dass die staatliche Sicherheit auf der Fähigkeit zur Selbstverteidigung und auf internationaler Zusammenarbeit ausschließlich defensiver Natur basieren sollte. Wir lehnen eine Politik der militärischen Expansion, den Einsatz von Militärbündnissen als Instrumente politischen Drucks und Handlungen ab, die zur Destabilisierung der internationalen Ordnung führen. Dauerhafte Sicherheit kann nur auf der Grundlage eines Kräftegleichgewichts, staatlicher Verantwortung und der Achtung ihrer Souveränität aufgebaut werden.",
  },
  {
    id: 8,
    titlePl: "Państwo organiczne",
    titleEn: "The Organic State",
    titleDe: "Der organische Staat",
    contentPl: "Uznajemy państwo za organiczny wyraz woli narodu. Państwo nie jest neutralnym arbitrem pomiędzy konkurującymi interesami, lecz narzędziem realizacji interesu narodowego.",
    contentEn: "We recognize the state as an organic expression of the nation's will. The state is not a neutral arbiter between competing interests, but a tool for realizing the national interest.",
    contentDe: "Wir erkennen den Staat als organischen Ausdruck des Willens der Nation an. Der Staat ist kein neutraler Schiedsrichter zwischen konkurrierenden Interessen, sondern ein Instrument zur Verwirklichung des nationalen Interesses.",
  },
];

export default function ManifestoPage() {
  const { locale } = useI18n();

  const getTitle = (section: typeof declarationSections[0]) => {
    if (locale === "de") return section.titleDe;
    if (locale === "en") return section.titleEn;
    return section.titlePl;
  };

  const getContent = (section: typeof declarationSections[0]) => {
    if (locale === "de") return section.contentDe;
    if (locale === "en") return section.contentEn;
    return section.contentPl;
  };

  const pageTitle = locale === "de" 
    ? "Ideologische Erklärung" 
    : locale === "en" 
      ? "Ideological Declaration" 
      : "Deklaracja Ideowa";

  const pageSubtitle = locale === "de"
    ? "Grundsätze des Nationalen Integralismus"
    : locale === "en"
      ? "Principles of National Integralism"
      : "Narodowego Integralizmu";

  return (
    <div className="container-custom py-12">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-2">
          {pageTitle}
        </h1>
        <p className="text-xl text-muted-foreground">
          {pageSubtitle}
        </p>
      </div>

      <Separator className="max-w-2xl mx-auto mb-12" />

      {/* Declaration Sections */}
      <div className="max-w-4xl mx-auto space-y-6">
        {declarationSections.map((section) => (
          <Card key={section.id} className="hover-lift">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg md:text-xl font-heading flex items-start gap-3">
                <span className="text-primary font-bold">§ {section.id}.</span>
                <span>{getTitle(section)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {getContent(section)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto mt-12 text-center">
        <Separator className="mb-8" />
        <p className="text-sm text-muted-foreground">
          {locale === "de" 
            ? "Polski Ruch Narodowo-Integralistyczny" 
            : locale === "en"
              ? "Polish National-Integralist Movement"
              : "Polski Ruch Narodowo-Integralistyczny"}
        </p>
      </div>
    </div>
  );
}
