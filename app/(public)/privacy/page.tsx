// file: app/(public)/privacy/page.tsx
"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

const content = {
  pl: {
    title: "Polityka prywatności",
    lastUpdate: "Ostatnia aktualizacja: marzec 2026",
    siteLabel: "Serwis",

    s1Title: "1. Administrator danych",
    s1P1Before:
      "Administratorem danych osobowych przetwarzanych w związku z korzystaniem z serwisu internetowego",
    s1P1Mid: "jest",
    s1P1After: "(dalej: 'Administrator').",
    s1P2Before:
      "W sprawach dotyczących ochrony danych osobowych możesz skontaktować się z Administratorem pod adresem e-mail:",

    s2Title: "2. Jakie dane zbieramy i w jakim celu",
    s2Intro:
      "W zależności od tego, z jakiej funkcji serwisu korzystasz, możemy przetwarzać m.in.:",
    s2Items: [
      "dane techniczne i logi serwera (np. adres IP, data i czas żądania, typ przeglądarki) — w celu zapewnienia działania strony, bezpieczeństwa oraz rozwiązywania problemów technicznych;",
      "dane podane dobrowolnie w formularzach (np. imię i nazwisko, adres e-mail, treść wiadomości) — w celu udzielenia odpowiedzi lub realizacji zgłoszenia;",
      "dane związane z zapisem na newsletter (zwykle adres e-mail) — w celu wysyłki informacji, o ile wyraziłeś na to zgodę;",
      "dane z formularzy rekrutacyjnych — w celu rozpatrzenia aplikacji i kontaktu w sprawie członkostwa lub współpracy, w zakresie niezbędnym do tego procesu.",
    ],
    s2Legal:
      "Podstawą prawną przetwarzania może być m.in. wykonanie umowy lub podjęcie działań przed jej zawarciem na Twoje żądanie (art. 6 ust. 1 lit. b RODO), prawnie uzasadniony interes Administratora (art. 6 ust. 1 lit. f RODO), np. bezpieczeństwo IT i statystyka zanonimizowana, lub Twoja zgoda (art. 6 ust. 1 lit. a RODO), gdy jest wymagana.",

    s3Title: "3. Pliki cookie i podobne technologie",
    s3P: "Serwis może wykorzystywać pliki cookie oraz podobne mechanizmy (np. local storage) w celu zapewnienia podstawowego działania strony, zapamiętywania preferencji (np. języka) oraz — jeśli to wdrożone — w celach analitycznych. Możesz zarządzać plikami cookie w ustawieniach swojej przeglądarki.",

    s4Title: "4. Analityka",
    s4P: "Jeśli korzystamy z narzędzi analitycznych (np. do zrozumienia ruchu na stronie), dane mogą być zbierane w formie zagregowanej lub pseudonimizowanej. Szczegóły zależą od konkretnego narzędzia; w razie stosowania analityki wymagającej zgody, poprosimy o nią zgodnie z obowiązującym prawem.",

    s5Title: "5. Newsletter",
    s5PBefore:
      "Zapis na newsletter jest dobrowolny. Adres e-mail wykorzystujemy wyłącznie do wysyłki treści związanych z działalnością",
    s5PAfter:
      ", o ile nie wskażemy inaczej. Możesz w każdej chwili zrezygnować z otrzymywania wiadomości (link rezygnacji w stopce maila lub kontakt na adres podany powyżej).",

    s6Title: "6. Formularze kontaktowe",
    s6P: "Dane z formularza kontaktowego przetwarzamy w celu udzielenia odpowiedzi i obsługi korespondencji. Nie wykorzystujemy ich do marketingu bez odrębnej zgody, chyba że jednoznacznie z niej korzystasz.",

    s7Title: "7. Formularze rekrutacyjne",
    s7P: "Informacje przekazane w procesie rekrutacji lub zgłoszenia członkowskiego przetwarzamy wyłącznie w zakresie potrzebnym do rozpatrzenia zgłoszenia i dalszego kontaktu. Okres przechowywania zależy od charakteru procesu i obowiązujących przepisów; po jego zakończeniu dane usuwamy lub ograniczamy przetwarzanie, jeśli przepisy nie wymagają dłuższego archiwizowania.",

    s8Title: "8. Usługi podmiotów trzecich",
    s8Intro:
      "W związku z działalnością serwisu mogą być wykorzystywani dostawcy zewnętrzni, którzy przetwarzają dane w swoim imieniu lub jako podmioty przetwarzające na zlecenie Administratora, m.in.:",
    s8Stripe:
      "obsługa płatności online. Przy składaniu zamówienia lub darowizny dane płatnicze przetwarza Stripe zgodnie z własną polityką prywatności i regulaminem.",
    s8GelatoPre: "(lub powiązany operator realizacji) —",
    s8GelatoPost:
      "produkcja i wysyłka zamówień merchu. Dane niezbędne do realizacji dostawy (np. adres) mogą być przekazywane temu partnerowi wyłącznie w celu wykonania zamówienia.",
    s8Footer:
      "Zachęcamy do zapoznania się z dokumentami prywatności tych usług na ich stronach.",

    s9Title: "9. Okres przechowywania i bezpieczeństwo",
    s9P: "Przechowujemy dane tak długo, jak jest to niezbędne do realizacji celów, dla których zostały zebrane, oraz przez okres wymagany przepisami prawa. Stosujemy środki organizacyjne i techniczne odpowiednie do ryzyka, aby chronić dane przed nieuprawnionym dostępem, utratą lub zmianą.",

    s10Title: "10. Twoje prawa (RODO)",
    s10Intro:
      "Przysługują Ci m.in. następujące prawa w zakresie danych osobowych:",
    s10Rights: [
      {
        label: "Dostęp",
        desc: "uzyskanie informacji, czy i jakie dane przetwarzamy;",
      },
      { label: "Sprostowanie", desc: "poprawienie nieprawidłowych danych;" },
      {
        label: "Usunięcie ('prawo do bycia zapomnianym')",
        desc: "w przypadkach przewidzianych prawem;",
      },
      { label: "Ograniczenie przetwarzania", desc: "" },
      {
        label: "Przenoszenie danych",
        desc: "o ile dane przetwarzamy w sposób zautomatyzowany na podstawie zgody lub umowy;",
      },
      {
        label: "Sprzeciw",
        desc: "wobec przetwarzania opartego na prawnie uzasadnionym interesie, z przyczyn związanych z Twoją szczególną sytuacją;",
      },
      {
        label: "Cofnięcie zgody",
        desc: "w dowolnym momencie, bez wpływu na zgodność z prawem przetwarzania przed cofnięciem;",
      },
      {
        label: "Skarga",
        desc: "do organu nadzorczego (w Polsce: Prezes Urzędu Ochrony Danych Osobowych).",
      },
    ],
    s10Contact: "Aby skorzystać z praw, napisz na",

    s11Title: "11. Zmiany polityki",
    s11PBefore:
      "Możemy aktualizować niniejszą politykę, aby odzwierciedlić zmiany w serwisie lub w przepisach. Aktualna wersja będzie zawsze dostępna pod adresem",

    disclaimer:
      "Niniejszy dokument ma charakter informacyjny i nie zastępuje indywidualnej porady prawnej. W razie wątpliwości skonsultuj się z doradcą lub organem nadzorczym.",
  },

  en: {
    title: "Privacy Policy",
    lastUpdate: "Last updated: March 2026",
    siteLabel: "Website",

    s1Title: "1. Data Controller",
    s1P1Before:
      "The controller of personal data processed in connection with the use of the website",
    s1P1Mid: "is",
    s1P1After: '(hereinafter: the "Controller").',
    s1P2Before:
      "For matters related to personal data protection, you may contact the Controller at the following e-mail address:",

    s2Title: "2. What Data We Collect and Why",
    s2Intro:
      "Depending on which features of the website you use, we may process, among others:",
    s2Items: [
      "technical data and server logs (e.g. IP address, date and time of request, browser type) — to ensure the website functions properly, for security, and to resolve technical issues;",
      "data voluntarily provided via forms (e.g. name, e-mail address, message content) — to respond to your inquiry or process your submission;",
      "data related to newsletter subscription (typically an e-mail address) — to send information, provided you have given your consent;",
      "data from recruitment forms — to review your application and contact you regarding membership or collaboration, to the extent necessary for this process.",
    ],
    s2Legal:
      "The legal basis for processing may include, among others, the performance of a contract or taking steps prior to entering into a contract at your request (Art. 6(1)(b) GDPR), the legitimate interests of the Controller (Art. 6(1)(f) GDPR), such as IT security and anonymised statistics, or your consent (Art. 6(1)(a) GDPR) where required.",

    s3Title: "3. Cookies and Similar Technologies",
    s3P: "The website may use cookies and similar mechanisms (e.g. local storage) to ensure the basic functioning of the site, to remember your preferences (e.g. language), and — if implemented — for analytical purposes. You can manage cookies in your browser settings.",

    s4Title: "4. Analytics",
    s4P: "If we use analytics tools (e.g. to understand website traffic), data may be collected in aggregated or pseudonymised form. Details depend on the specific tool; where analytics require consent, we will request it in accordance with applicable law.",

    s5Title: "5. Newsletter",
    s5PBefore:
      "Subscribing to the newsletter is voluntary. We use your e-mail address solely to send content related to the activities of",
    s5PAfter:
      ", unless otherwise indicated. You may unsubscribe at any time (via the unsubscribe link in the e-mail footer or by contacting us at the address provided above).",

    s6Title: "6. Contact Forms",
    s6P: "We process data from the contact form in order to respond to your inquiry and manage correspondence. We do not use this data for marketing without separate consent, unless you have explicitly opted in.",

    s7Title: "7. Recruitment Forms",
    s7P: "Information submitted through recruitment or membership application processes is processed solely to the extent necessary to review the application and for further contact. The retention period depends on the nature of the process and applicable regulations; once complete, we delete the data or restrict processing unless legislation requires longer archiving.",

    s8Title: "8. Third-Party Services",
    s8Intro:
      "In connection with the operation of the website, external providers may be used who process data on their own behalf or as processors on behalf of the Controller, including:",
    s8Stripe:
      "online payment processing. When placing an order or making a donation, payment data is processed by Stripe in accordance with its own privacy policy and terms of service.",
    s8GelatoPre: "(or a related fulfilment operator) —",
    s8GelatoPost:
      "production and shipping of merchandise orders. Data necessary for delivery (e.g. address) may be shared with this partner solely for the purpose of fulfilling the order.",
    s8Footer:
      "We encourage you to review the privacy documents of these services on their respective websites.",

    s9Title: "9. Retention and Security",
    s9P: "We retain data for as long as necessary to fulfil the purposes for which it was collected and for the period required by law. We apply organisational and technical measures appropriate to the risk in order to protect data against unauthorised access, loss, or alteration.",

    s10Title: "10. Your Rights (GDPR)",
    s10Intro:
      "You have, among others, the following rights regarding your personal data:",
    s10Rights: [
      {
        label: "Access",
        desc: "obtaining information on whether and what data we process;",
      },
      { label: "Rectification", desc: "correcting inaccurate data;" },
      {
        label: 'Erasure ("right to be forgotten")',
        desc: "in cases provided for by law;",
      },
      { label: "Restriction of processing", desc: "" },
      {
        label: "Data portability",
        desc: "where we process data by automated means based on consent or a contract;",
      },
      {
        label: "Objection",
        desc: "to processing based on legitimate interests, on grounds relating to your particular situation;",
      },
      {
        label: "Withdrawal of consent",
        desc: "at any time, without affecting the lawfulness of processing carried out prior to withdrawal;",
      },
      {
        label: "Complaint",
        desc: "to a supervisory authority (in Poland: the President of the Office for Personal Data Protection — UODO).",
      },
    ],
    s10Contact: "To exercise your rights, write to",

    s11Title: "11. Policy Changes",
    s11PBefore:
      "We may update this policy to reflect changes in the website or in legislation. The current version will always be available at",

    disclaimer:
      "This document is for informational purposes only and does not constitute individual legal advice. If in doubt, consult a legal advisor or the relevant supervisory authority.",
  },

  de: {
    title: "Datenschutzerklärung",
    lastUpdate: "Letzte Aktualisierung: März 2026",
    siteLabel: "Website",

    s1Title: "1. Verantwortlicher",
    s1P1Before:
      "Verantwortlicher für die Verarbeitung personenbezogener Daten im Zusammenhang mit der Nutzung der Website",
    s1P1Mid: "ist",
    s1P1After: "(nachfolgend: 'Verantwortlicher').",
    s1P2Before:
      "In Angelegenheiten des Datenschutzes können Sie den Verantwortlichen unter folgender E-Mail-Adresse kontaktieren:",

    s2Title: "2. Welche Daten wir erheben und warum",
    s2Intro:
      "Je nachdem, welche Funktionen der Website Sie nutzen, können wir unter anderem folgende Daten verarbeiten:",
    s2Items: [
      "technische Daten und Serverprotokolle (z.\u00a0B. IP-Adresse, Datum und Uhrzeit der Anfrage, Browsertyp) — um den Betrieb der Website sicherzustellen, die Sicherheit zu gewährleisten und technische Probleme zu beheben;",
      "freiwillig in Formularen angegebene Daten (z.\u00a0B. Name, E-Mail-Adresse, Nachrichteninhalt) — um Ihre Anfrage zu beantworten oder Ihr Anliegen zu bearbeiten;",
      "Daten im Zusammenhang mit der Newsletter-Anmeldung (in der Regel eine E-Mail-Adresse) — um Informationen zu versenden, sofern Sie Ihre Einwilligung erteilt haben;",
      "Daten aus Bewerbungsformularen — um Ihre Bewerbung zu prüfen und Sie bezüglich Mitgliedschaft oder Zusammenarbeit zu kontaktieren, im dafür erforderlichen Umfang.",
    ],
    s2Legal:
      "Rechtsgrundlage der Verarbeitung kann unter anderem die Erfüllung eines Vertrags oder die Durchführung vorvertraglicher Maßnahmen auf Ihre Anfrage hin sein (Art. 6 Abs. 1 lit. b DSGVO), das berechtigte Interesse des Verantwortlichen (Art. 6 Abs. 1 lit. f DSGVO), z.\u00a0B. IT-Sicherheit und anonymisierte Statistiken, oder Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), sofern erforderlich.",

    s3Title: "3. Cookies und ähnliche Technologien",
    s3P: "Die Website kann Cookies und ähnliche Mechanismen (z.\u00a0B. Local Storage) verwenden, um die grundlegende Funktionalität der Seite sicherzustellen, Ihre Einstellungen (z.\u00a0B. Sprache) zu speichern und — sofern implementiert — für analytische Zwecke. Sie können Cookies in Ihren Browsereinstellungen verwalten.",

    s4Title: "4. Analytik",
    s4P: "Wenn wir Analysetools verwenden (z.\u00a0B. um den Website-Verkehr zu verstehen), können Daten in aggregierter oder pseudonymisierter Form erhoben werden. Die Einzelheiten hängen vom jeweiligen Tool ab; sofern für die Analyse eine Einwilligung erforderlich ist, werden wir diese gemäß geltendem Recht einholen.",

    s5Title: "5. Newsletter",
    s5PBefore:
      "Die Anmeldung zum Newsletter ist freiwillig. Ihre E-Mail-Adresse verwenden wir ausschließlich zum Versand von Inhalten im Zusammenhang mit den Aktivitäten von",
    s5PAfter:
      ", sofern nicht anders angegeben. Sie können sich jederzeit abmelden (über den Abmeldelink in der E-Mail-Fußzeile oder per Kontakt an die oben genannte Adresse).",

    s6Title: "6. Kontaktformulare",
    s6P: "Daten aus dem Kontaktformular verarbeiten wir, um Ihre Anfrage zu beantworten und die Korrespondenz zu verwalten. Wir verwenden diese Daten nicht für Marketingzwecke ohne gesonderte Einwilligung, es sei denn, Sie haben dem ausdrücklich zugestimmt.",

    s7Title: "7. Bewerbungsformulare",
    s7P: "Im Rahmen von Bewerbungs- oder Mitgliedschaftsverfahren übermittelte Informationen verarbeiten wir ausschließlich im erforderlichen Umfang zur Prüfung der Bewerbung und für die weitere Kontaktaufnahme. Die Aufbewahrungsfrist richtet sich nach der Art des Verfahrens und den geltenden Vorschriften; nach Abschluss löschen wir die Daten oder schränken die Verarbeitung ein, sofern gesetzliche Bestimmungen keine längere Archivierung erfordern.",

    s8Title: "8. Dienste Dritter",
    s8Intro:
      "Im Zusammenhang mit dem Betrieb der Website können externe Dienstleister eingesetzt werden, die Daten in eigenem Namen oder als Auftragsverarbeiter im Auftrag des Verantwortlichen verarbeiten, darunter:",
    s8Stripe:
      "Abwicklung von Online-Zahlungen. Bei Bestellungen oder Spenden werden Zahlungsdaten von Stripe gemäß dessen eigener Datenschutzrichtlinie und Nutzungsbedingungen verarbeitet.",
    s8GelatoPre: "(oder ein verbundener Fulfillment-Dienstleister) —",
    s8GelatoPost:
      "Produktion und Versand von Merchandise-Bestellungen. Für die Lieferung erforderliche Daten (z.\u00a0B. Adresse) können ausschließlich zum Zweck der Auftragsabwicklung an diesen Partner weitergegeben werden.",
    s8Footer:
      "Wir empfehlen Ihnen, die Datenschutzdokumente dieser Dienste auf deren jeweiligen Websites einzusehen.",

    s9Title: "9. Aufbewahrung und Sicherheit",
    s9P: "Wir bewahren Daten so lange auf, wie es zur Erfüllung der Zwecke, für die sie erhoben wurden, erforderlich ist, sowie für den gesetzlich vorgeschriebenen Zeitraum. Wir wenden dem Risiko angemessene organisatorische und technische Maßnahmen an, um Daten vor unbefugtem Zugriff, Verlust oder Veränderung zu schützen.",

    s10Title: "10. Ihre Rechte (DSGVO)",
    s10Intro:
      "Ihnen stehen unter anderem folgende Rechte in Bezug auf Ihre personenbezogenen Daten zu:",
    s10Rights: [
      {
        label: "Auskunft",
        desc: "Informationen darüber, ob und welche Daten wir verarbeiten;",
      },
      { label: "Berichtigung", desc: "Korrektur unrichtiger Daten;" },
      {
        label: "Löschung ('Recht auf Vergessenwerden')",
        desc: "in den gesetzlich vorgesehenen Fällen;",
      },
      { label: "Einschränkung der Verarbeitung", desc: "" },
      {
        label: "Datenübertragbarkeit",
        desc: "sofern wir Daten automatisiert auf Grundlage einer Einwilligung oder eines Vertrags verarbeiten;",
      },
      {
        label: "Widerspruch",
        desc: "gegen eine auf berechtigtem Interesse beruhende Verarbeitung, aus Gründen, die sich aus Ihrer besonderen Situation ergeben;",
      },
      {
        label: "Widerruf der Einwilligung",
        desc: "jederzeit, ohne dass die Rechtmäßigkeit der vor dem Widerruf erfolgten Verarbeitung berührt wird;",
      },
      {
        label: "Beschwerde",
        desc: "bei einer Aufsichtsbehörde (in Polen: Präsident des Amtes für den Schutz personenbezogener Daten — UODO).",
      },
    ],
    s10Contact: "Um Ihre Rechte auszuüben, schreiben Sie an",

    s11Title: "11. Änderungen der Datenschutzerklärung",
    s11PBefore:
      "Wir können diese Datenschutzerklärung aktualisieren, um Änderungen der Website oder der Gesetzgebung widerzuspiegeln. Die aktuelle Fassung ist stets verfügbar unter",

    disclaimer:
      "Dieses Dokument dient ausschließlich zu Informationszwecken und ersetzt keine individuelle Rechtsberatung. Im Zweifelsfall wenden Sie sich an einen Rechtsberater oder die zuständige Aufsichtsbehörde.",
  },
} as const;

type Locale = keyof typeof content;

export default function PrivacyPage() {
  const { t, locale } = useI18n();
  const org = `PRNI — ${t("party.name.full")}`;
  const c = content[locale as Locale] ?? content.pl;

  return (
    <div className="container-custom py-12 md:py-16">
      <article className="max-w-3xl mx-auto space-y-10">
        <header className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">
            {c.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {c.lastUpdate} · {c.siteLabel}:{" "}
            <a
              href="https://www.prni.org.pl"
              className="text-primary hover:underline underline-offset-4"
            >
              www.prni.org.pl
            </a>
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-heading font-semibold">
            {c.s1Title}
          </h2>
          <p className="text-foreground/90 leading-relaxed">
            {c.s1P1Before}{" "}
            <span className="text-foreground">www.prni.org.pl</span>{" "}
            {c.s1P1Mid}{" "}
            <strong className="text-foreground font-medium">{org}</strong>{" "}
            {c.s1P1After}
          </p>
          <p className="text-foreground/90 leading-relaxed">
            {c.s1P2Before}{" "}
            <a
              href="mailto:prni.official@gmail.com"
              className="text-primary hover:underline underline-offset-4"
            >
              prni.official@gmail.com
            </a>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-heading font-semibold">
            {c.s2Title}
          </h2>
          <p className="text-foreground/90 leading-relaxed">{c.s2Intro}</p>
          <ul className="list-disc pl-5 space-y-2 text-foreground/90 leading-relaxed text-muted-foreground">
            {c.s2Items.map((item, i) => (
              <li key={i}>
                <span className="text-foreground/90">{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {c.s2Legal}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-heading font-semibold">
            {c.s3Title}
          </h2>
          <p className="text-foreground/90 leading-relaxed">{c.s3P}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-heading font-semibold">
            {c.s4Title}
          </h2>
          <p className="text-foreground/90 leading-relaxed">{c.s4P}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-heading font-semibold">
            {c.s5Title}
          </h2>
          <p className="text-foreground/90 leading-relaxed">
            {c.s5PBefore} {org}
            {c.s5PAfter}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-heading font-semibold">
            {c.s6Title}
          </h2>
          <p className="text-foreground/90 leading-relaxed">{c.s6P}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-heading font-semibold">
            {c.s7Title}
          </h2>
          <p className="text-foreground/90 leading-relaxed">{c.s7P}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-heading font-semibold">
            {c.s8Title}
          </h2>
          <p className="text-foreground/90 leading-relaxed">{c.s8Intro}</p>
          <ul className="list-disc pl-5 space-y-2 text-foreground/90 leading-relaxed text-muted-foreground">
            <li>
              <span className="text-foreground/90">
                <strong className="text-foreground font-medium">Stripe</strong>{" "}
                — {c.s8Stripe}
              </span>
            </li>
            <li>
              <span className="text-foreground/90">
                <strong className="text-foreground font-medium">Gelato</strong>{" "}
                {c.s8GelatoPre} {c.s8GelatoPost}
              </span>
            </li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {c.s8Footer}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-heading font-semibold">
            {c.s9Title}
          </h2>
          <p className="text-foreground/90 leading-relaxed">{c.s9P}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-heading font-semibold">
            {c.s10Title}
          </h2>
          <p className="text-foreground/90 leading-relaxed">{c.s10Intro}</p>
          <ul className="list-disc pl-5 space-y-2 text-foreground/90 leading-relaxed text-muted-foreground">
            {c.s10Rights.map((r, i) => (
              <li key={i}>
                <span className="text-foreground/90">
                  <strong className="text-foreground font-medium">
                    {r.label}
                  </strong>
                  {r.desc ? ` — ${r.desc}` : ";"}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-foreground/90 leading-relaxed">
            {c.s10Contact}{" "}
            <a
              href="mailto:prni.official@gmail.com"
              className="text-primary hover:underline underline-offset-4"
            >
              prni.official@gmail.com
            </a>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-heading font-semibold">
            {c.s11Title}
          </h2>
          <p className="text-foreground/90 leading-relaxed">
            {c.s11PBefore}{" "}
            <Link
              href="/privacy"
              className="text-primary hover:underline underline-offset-4"
            >
              /privacy
            </Link>
            .
          </p>
        </section>

        <p className="text-xs text-muted-foreground/80 pt-2 border-t border-white/[0.06]">
          {c.disclaimer}
        </p>
      </article>
    </div>
  );
}
