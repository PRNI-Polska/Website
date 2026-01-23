// file: lib/i18n.tsx
"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type Locale = "en" | "pl" | "de";

interface Translations {
  [key: string]: {
    en: string;
    pl: string;
    de?: string;
  };
}

export const translations: Translations = {
  // Navigation
  "nav.home": { en: "Home", pl: "Strona główna", de: "Startseite" },
  "nav.wings": { en: "Wings", pl: "Skrzydła", de: "Flügel" },
  "nav.announcements": { en: "Announcements", pl: "Komunikaty", de: "Mitteilungen" },
  "nav.events": { en: "Events", pl: "Wydarzenia", de: "Veranstaltungen" },
  "nav.manifesto": { en: "Manifesto", pl: "Manifest", de: "Manifest" },
  "nav.about": { en: "About", pl: "O nas", de: "Über uns" },
  "nav.contact": { en: "Contact", pl: "Kontakt", de: "Kontakt" },
  "nav.join": { en: "Join", pl: "Dołącz", de: "Beitreten" },
  
  // Party names
  "party.name.short": { en: "PRNI", pl: "PRNI", de: "PRNI" },
  "party.name.full": { 
    en: "Polish National-Integralist Movement", 
    pl: "Polski Ruch Narodowo-Integralistyczny",
    de: "Polnische National-Integralistische Bewegung"
  },
  "party.name.full.en": { 
    en: "Polish National-Integralist Movement", 
    pl: "Polish National-Integralist Movement" 
  },
  "party.name.full.pl": { 
    en: "Polski Ruch Narodowo-Integralistyczny", 
    pl: "Polski Ruch Narodowo-Integralistyczny" 
  },
  
  // Hero section
  "hero.title": { 
    en: "Nation Above All", 
    pl: "Naród Ponad Wszystkim",
    de: "Nation über alles"
  },
  "hero.subtitle": { 
    en: "Building a strong, unified Poland rooted in tradition and national identity.", 
    pl: "Budujemy silną, zjednoczoną Polskę zakorzenioną w tradycji i tożsamości narodowej.",
    de: "Wir bauen ein starkes, geeintes Polen, verwurzelt in Tradition und nationaler Identität."
  },
  "hero.cta.manifesto": { en: "Read Our Manifesto", pl: "Czytaj Manifest", de: "Manifest lesen" },
  "hero.cta.join": { en: "Join the Movement", pl: "Dołącz do Ruchu", de: "Der Bewegung beitreten" },
  
  // Mission section
  "mission.title": { en: "Our Mission", pl: "Nasza Misja", de: "Unsere Mission" },
  "mission.text": { 
    en: "We believe in the nation as the highest political value. Our movement stands for the preservation of Polish national identity, cultural unity, and the organic state that serves the interests of the nation.", 
    pl: "Wierzymy w naród jako najwyższą wartość polityczną. Nasz ruch stoi na straży zachowania polskiej tożsamości narodowej, jedności kulturowej oraz organicznego państwa służącego interesom narodu.",
    de: "Wir glauben an die Nation als höchsten politischen Wert. Unsere Bewegung steht für die Bewahrung der polnischen nationalen Identität, kulturellen Einheit und des organischen Staates, der den Interessen der Nation dient."
  },
  "mission.summary": {
    en: "We believe in the nation as the highest political value. Our movement stands for the preservation of Polish national identity and cultural unity.",
    pl: "Wierzymy w naród jako najwyższą wartość polityczną. Nasz ruch stoi na straży zachowania polskiej tożsamości narodowej i jedności kulturowej.",
    de: "Wir glauben an die Nation als höchsten politischen Wert. Unsere Bewegung steht für die Bewahrung der polnischen nationalen Identität und kulturellen Einheit."
  },
  
  // Ideology sections
  "ideology.title": { en: "Our Ideology", pl: "Nasza Ideologia" },
  "ideology.s1.title": { 
    en: "§ 1. The Nation as the Highest Political Value", 
    pl: "§ 1. Naród jako najwyższa wartość polityczna" 
  },
  "ideology.s1.text": { 
    en: "We recognize the nation as the highest political value. We understand the nation as a historical and cultural entity, standing above the interests of individuals and social groups.", 
    pl: "Uznajemy naród za najwyższą wartość polityczną. Naród pojmujemy jako byt historyczny i kulturowy, stojący ponad interesami jednostek oraz grup społecznych." 
  },
  "ideology.s2.title": { 
    en: "§ 2. Ideological and Cultural Unity", 
    pl: "§ 2. Jedność ideowa i kulturowa" 
  },
  "ideology.s2.text": { 
    en: "We advocate for the preservation of ideological and cultural unity of the national community. We recognize the necessity of defending one Polish national tradition as the foundation of identity and continuity of the nation.", 
    pl: "Opowiadamy się za zachowaniem jedności ideowej i kulturowej wspólnoty narodowej. Uznajemy konieczność obrony jednej, polskiej tradycji narodowej jako fundamentu tożsamości i ciągłości narodu." 
  },
  "ideology.s3.title": { 
    en: "§ 3. Anti-Liberalism", 
    pl: "§ 3. Antyliberalizm" 
  },
  "ideology.s3.text": { 
    en: "We reject political liberalism based on extreme pluralism and individualism, as well as cultural liberalism leading to relativization of values and weakening of national bonds.", 
    pl: "Odrzucamy liberalizm polityczny, oparty na skrajnym pluralizmie i indywidualizmie, jak również liberalizm kulturowy, prowadzący do relatywizacji wartości i osłabienia więzi narodowych." 
  },
  "ideology.s4.title": { 
    en: "§ 4. The Organic State", 
    pl: "§ 4. Państwo organiczne" 
  },
  "ideology.s4.text": { 
    en: "We recognize the state as an organic expression of the nation's will. The state is not a neutral arbiter between competing interests, but a tool for realizing the national interest.", 
    pl: "Uznajemy państwo za organiczny wyraz woli narodu. Państwo nie jest neutralnym arbitrem pomiędzy konkurującymi interesami, lecz narzędziem realizacji interesu narodowego." 
  },
  "ideology.s5.title": { 
    en: "§ 5. Economy Subordinated to the Nation", 
    pl: "§ 5. Gospodarka podporządkowana narodowi" 
  },
  "ideology.s5.text": { 
    en: "We recognize that the economy should serve the nation. We advocate neither for extreme free market nor for socialism. We permit state intervention where national interest or social stability requires it.", 
    pl: "Uznajemy, że gospodarka powinna służyć narodowi. Nie opowiadamy się ani za skrajnym wolnym rynkiem, ani za socjalizmem. Dopuszczamy interwencję państwa tam, gdzie wymaga tego interes narodowy lub stabilność społeczna." 
  },
  
  // Sections
  "section.news": { en: "Latest News", pl: "Najnowsze Wiadomości" },
  "section.news.subtitle": { en: "Stay updated with our latest announcements", pl: "Bądź na bieżąco z naszymi komunikatami" },
  "section.events": { en: "Upcoming Events", pl: "Nadchodzące Wydarzenia" },
  "section.events.subtitle": { en: "Join us at our upcoming events", pl: "Dołącz do nas na nadchodzących wydarzeniach" },
  "section.manifesto": { en: "Our Manifesto", pl: "Nasz Manifest" },
  "section.manifesto.subtitle": { 
    en: "Explore our vision and policies for building a stronger Poland.", 
    pl: "Poznaj naszą wizję i politykę budowania silniejszej Polski." 
  },
  
  // Wings - General
  "wings.back": { en: "Back to Wings", pl: "Powrót do Skrzydeł", de: "Zurück zu Flügeln" },
  "wings.joinCta": { en: "Join International Wing", pl: "Dołącz do Skrzydła", de: "Beitreten" },
  "wings.contactCta": { en: "Contact Us", pl: "Kontakt", de: "Kontakt" },
  
  // Wings - Main
  "wings.main.title": { en: "Main Wing", pl: "Skrzydło Główne", de: "Hauptabteilung" },
  "wings.main.tagline": { en: "The heart of the national movement", pl: "Serce ruchu narodowego", de: "Das Herz der nationalen Bewegung" },
  
  // Wings - Female
  "wings.female.title": { en: "Female Wing", pl: "Skrzydło Kobiece", de: "Frauenabteilung" },
  "wings.female.tagline": { en: "The strength of the nation in women's unity", pl: "Siła narodu w jedności kobiet", de: "Die Stärke der Nation in der Einheit der Frauen" },

  // Wings - International
  "wings.international.title": { en: "International Wing", pl: "Skrzydło Międzynarodowe", de: "Internationale Abteilung" },
  "wings.international.tagline": { en: "Poland's voice abroad", pl: "Głos Polski za granicą", de: "Polens Stimme im Ausland" },
  "wings.international.hero.subtitle": { 
    en: "A non-membership platform for international supporters and affiliates of the Polish national-integralist vision.", 
    pl: "Platforma współpracy dla międzynarodowych sympatyków i współpracowników polskiej wizji narodowo-integralistycznej.",
    de: "Eine Kooperationsplattform für internationale Unterstützer und Mitarbeiter der polnischen national-integralistischen Vision."
  },
  
  // International Wing - Purpose
  "wings.international.purpose.title": { 
    en: "Our Purpose", 
    pl: "Nasz Cel", 
    de: "Unser Zweck" 
  },
  "wings.international.purpose.text": { 
    en: "The International Wing serves as a bridge between PRNI and supporters abroad who share our commitment to national sovereignty, traditional values, and the preservation of European identity. We provide a structured way for international affiliates to contribute to our cause through outreach, translation, and cultural exchange—without formal party membership.", 
    pl: "Skrzydło Międzynarodowe stanowi pomost między PRNI a sympatykami za granicą, którzy podzielają nasze zaangażowanie w suwerenność narodową, tradycyjne wartości i zachowanie europejskiej tożsamości. Zapewniamy ustrukturyzowany sposób, w jaki międzynarodowi współpracownicy mogą wspierać naszą sprawę poprzez działania informacyjne, tłumaczenia i wymianę kulturową — bez formalnego członkostwa w partii.",
    de: "Die Internationale Abteilung dient als Brücke zwischen PRNI und Unterstützern im Ausland, die unser Engagement für nationale Souveränität, traditionelle Werte und die Bewahrung der europäischen Identität teilen."
  },
  
  // International Wing - Activities (Safe activities)
  "wings.international.activities.title": { 
    en: "What Affiliates Can Do", 
    pl: "Co mogą robić współpracownicy", 
    de: "Was Mitarbeiter tun können" 
  },
  "wings.international.activities.1": { 
    en: "Translate materials and publications into your native language", 
    pl: "Tłumaczyć materiały i publikacje na swój język ojczysty", 
    de: "Materialien und Publikationen in Ihre Muttersprache übersetzen" 
  },
  "wings.international.activities.2": { 
    en: "Share our message through social media and personal networks", 
    pl: "Udostępniać nasze przesłanie w mediach społecznościowych i sieciach osobistych", 
    de: "Unsere Botschaft über soziale Medien und persönliche Netzwerke teilen" 
  },
  "wings.international.activities.3": { 
    en: "Participate in online discussions, webinars, and cultural events", 
    pl: "Uczestniczyć w dyskusjach online, webinarach i wydarzeniach kulturalnych", 
    de: "An Online-Diskussionen, Webinaren und kulturellen Veranstaltungen teilnehmen" 
  },
  "wings.international.activities.4": { 
    en: "Connect like-minded individuals in your country with our movement", 
    pl: "Łączyć osoby o podobnych poglądach w swoim kraju z naszym ruchem", 
    de: "Gleichgesinnte in Ihrem Land mit unserer Bewegung verbinden" 
  },
  "wings.international.activities.5": { 
    en: "Provide insights on international affairs and media coverage", 
    pl: "Dostarczać informacje o sprawach międzynarodowych i relacjach medialnych", 
    de: "Einblicke in internationale Angelegenheiten und Medienberichterstattung geben" 
  },
  
  // International Wing - Boundaries
  "wings.international.boundaries.title": { 
    en: "Scope and Limitations", 
    pl: "Zakres i ograniczenia", 
    de: "Umfang und Grenzen" 
  },
  "wings.international.boundaries.canTitle": { 
    en: "This program is:", 
    pl: "Ten program to:", 
    de: "Dieses Programm ist:" 
  },
  "wings.international.boundaries.cannotTitle": { 
    en: "This program is not:", 
    pl: "Ten program to nie:", 
    de: "Dieses Programm ist nicht:" 
  },
  "wings.international.boundaries.can.1": { 
    en: "A platform for ideological cooperation and cultural exchange", 
    pl: "Platforma współpracy ideologicznej i wymiany kulturowej", 
    de: "Eine Plattform für ideologische Zusammenarbeit und kulturellen Austausch" 
  },
  "wings.international.boundaries.can.2": { 
    en: "An opportunity to support Polish national interests from abroad", 
    pl: "Możliwość wspierania polskich interesów narodowych z zagranicy", 
    de: "Eine Gelegenheit, polnische nationale Interessen aus dem Ausland zu unterstützen" 
  },
  "wings.international.boundaries.can.3": { 
    en: "A network for sharing information and building international solidarity", 
    pl: "Sieć wymiany informacji i budowania międzynarodowej solidarności", 
    de: "Ein Netzwerk zum Informationsaustausch und Aufbau internationaler Solidarität" 
  },
  "wings.international.boundaries.can.4": { 
    en: "Open to supporters regardless of citizenship or residence", 
    pl: "Otwarte dla sympatyków niezależnie od obywatelstwa lub miejsca zamieszkania", 
    de: "Offen für Unterstützer unabhängig von Staatsbürgerschaft oder Wohnsitz" 
  },
  "wings.international.boundaries.cannot.1": { 
    en: "Formal membership in the Polish political party PRNI", 
    pl: "Formalne członkostwo w polskiej partii politycznej PRNI", 
    de: "Formelle Mitgliedschaft in der polnischen politischen Partei PRNI" 
  },
  "wings.international.boundaries.cannot.2": { 
    en: "A path to voting rights or electoral participation in Poland", 
    pl: "Droga do praw wyborczych lub udziału w wyborach w Polsce", 
    de: "Ein Weg zu Wahlrechten oder Wahlbeteiligung in Polen" 
  },
  "wings.international.boundaries.cannot.3": { 
    en: "Representation in internal party decision-making structures", 
    pl: "Reprezentacja w wewnętrznych strukturach decyzyjnych partii", 
    de: "Vertretung in internen Entscheidungsstrukturen der Partei" 
  },
  "wings.international.boundaries.cannot.4": { 
    en: "A channel for financial contributions to Polish political campaigns", 
    pl: "Kanał wpłat finansowych na polskie kampanie polityczne", 
    de: "Ein Kanal für finanzielle Beiträge zu polnischen politischen Kampagnen" 
  },
  
  // International Wing - Disclaimer
  "wings.international.disclaimer": { 
    en: "The International Wing does not constitute membership in the Polish political party PRNI. Participation is voluntary and does not confer any legal status, voting rights, or electoral privileges within the Polish political system.", 
    pl: "Skrzydło Międzynarodowe nie stanowi członkostwa w polskiej partii politycznej PRNI. Uczestnictwo jest dobrowolne i nie nadaje żadnego statusu prawnego, praw wyborczych ani przywilejów wyborczych w polskim systemie politycznym.",
    de: "Die Internationale Abteilung stellt keine Mitgliedschaft in der polnischen politischen Partei PRNI dar. Die Teilnahme ist freiwillig und verleiht keinen rechtlichen Status, kein Wahlrecht oder Wahlprivilegien im polnischen politischen System."
  },
  
  // International Wing - Engage
  "wings.international.engage.title": { 
    en: "Get Involved", 
    pl: "Zaangażuj się", 
    de: "Machen Sie mit" 
  },
  "wings.international.engage.text": { 
    en: "Ready to support the Polish national-integralist vision from abroad? Register as an International Affiliate to receive updates, access resources, and connect with our coordination team.", 
    pl: "Gotowy, aby wspierać polską wizję narodowo-integralistyczną z zagranicy? Zarejestruj się jako Współpracownik Międzynarodowy, aby otrzymywać aktualizacje, uzyskać dostęp do zasobów i skontaktować się z naszym zespołem koordynacyjnym.",
    de: "Bereit, die polnische national-integralistische Vision aus dem Ausland zu unterstützen? Registrieren Sie sich als Internationaler Mitarbeiter."
  },
  
  // International Wing - Form
  "wings.international.form.title": { 
    en: "Register as International Affiliate", 
    pl: "Zarejestruj się jako Współpracownik Międzynarodowy", 
    de: "Als Internationaler Mitarbeiter registrieren" 
  },
  "wings.international.form.name": { en: "Full Name", pl: "Imię i nazwisko", de: "Vollständiger Name" },
  "wings.international.form.email": { en: "Email Address", pl: "Adres e-mail", de: "E-Mail-Adresse" },
  "wings.international.form.country": { en: "Country of Residence", pl: "Kraj zamieszkania", de: "Wohnsitzland" },
  "wings.international.form.countryPlaceholder": { en: "Select your country", pl: "Wybierz swój kraj", de: "Wählen Sie Ihr Land" },
  "wings.international.form.languages": { en: "Languages Spoken", pl: "Języki", de: "Gesprochene Sprachen" },
  "wings.international.form.languagesPlaceholder": { en: "e.g., German, English, French", pl: "np. niemiecki, angielski, francuski", de: "z.B. Deutsch, Englisch, Französisch" },
  "wings.international.form.interest": { en: "Area of Interest", pl: "Obszar zainteresowań", de: "Interessenbereich" },
  "wings.international.form.interestPlaceholder": { en: "Select area", pl: "Wybierz obszar", de: "Bereich auswählen" },
  "wings.international.form.interestTranslation": { en: "Translation & Localization", pl: "Tłumaczenia i lokalizacja", de: "Übersetzung & Lokalisierung" },
  "wings.international.form.interestOutreach": { en: "Outreach & Social Media", pl: "Promocja i media społecznościowe", de: "Öffentlichkeitsarbeit & Social Media" },
  "wings.international.form.interestEvents": { en: "Events & Coordination", pl: "Wydarzenia i koordynacja", de: "Veranstaltungen & Koordination" },
  "wings.international.form.interestResearch": { en: "Research & Analysis", pl: "Badania i analizy", de: "Forschung & Analyse" },
  "wings.international.form.interestOther": { en: "Other", pl: "Inne", de: "Sonstiges" },
  "wings.international.form.message": { en: "Short Message (Optional)", pl: "Krótka wiadomość (opcjonalnie)", de: "Kurze Nachricht (optional)" },
  "wings.international.form.messagePlaceholder": { en: "Tell us about yourself and how you'd like to contribute...", pl: "Opowiedz nam o sobie i jak chciałbyś się zaangażować...", de: "Erzählen Sie uns von sich und wie Sie beitragen möchten..." },
  "wings.international.form.consent": { 
    en: "I confirm that I have read and accept the principles of the movement and the privacy policy. I understand that this registration does not constitute party membership.", 
    pl: "Potwierdzam, że zapoznałem się z zasadami ruchu i polityką prywatności oraz je akceptuję. Rozumiem, że ta rejestracja nie stanowi członkostwa w partii.",
    de: "Ich bestätige, dass ich die Grundsätze der Bewegung und die Datenschutzrichtlinie gelesen und akzeptiert habe. Ich verstehe, dass diese Registrierung keine Parteimitgliedschaft darstellt."
  },
  "wings.international.form.submit": { en: "Submit Registration", pl: "Wyślij rejestrację", de: "Registrierung absenden" },
  "wings.international.form.submitting": { en: "Submitting...", pl: "Wysyłanie...", de: "Wird gesendet..." },
  "wings.international.form.success.title": { en: "Registration Received", pl: "Rejestracja otrzymana", de: "Registrierung erhalten" },
  "wings.international.form.success.text": { 
    en: "Thank you for your interest in the International Wing. Our coordination team will review your registration and contact you soon.", 
    pl: "Dziękujemy za zainteresowanie Skrzydłem Międzynarodowym. Nasz zespół koordynacyjny przejrzy Twoją rejestrację i wkrótce się z Tobą skontaktuje.",
    de: "Vielen Dank für Ihr Interesse an der Internationalen Abteilung. Unser Koordinationsteam wird Ihre Registrierung prüfen und sich bald bei Ihnen melden."
  },
  "wings.international.form.error": { en: "Something went wrong. Please try again.", pl: "Coś poszło nie tak. Spróbuj ponownie.", de: "Etwas ist schief gelaufen. Bitte versuchen Sie es erneut." },
  "wings.international.form.required": { en: "This field is required", pl: "To pole jest wymagane", de: "Dieses Feld ist erforderlich" },
  "wings.international.form.invalidEmail": { en: "Please enter a valid email address", pl: "Wprowadź prawidłowy adres e-mail", de: "Bitte geben Sie eine gültige E-Mail-Adresse ein" },
  "wings.international.form.consentRequired": { en: "You must accept the terms to continue", pl: "Musisz zaakceptować warunki, aby kontynuować", de: "Sie müssen die Bedingungen akzeptieren, um fortzufahren" },
  "wings.international.form.privacyHint": { 
    en: "Your data is handled securely and will only be used to process your registration.", 
    pl: "Twoje dane są bezpiecznie przetwarzane i będą wykorzystywane wyłącznie do obsługi Twojej rejestracji.", 
    de: "Ihre Daten werden sicher verarbeitet und nur zur Bearbeitung Ihrer Registrierung verwendet." 
  },
  "wings.international.boundaries.subtitle": { 
    en: "Understanding the scope of participation", 
    pl: "Zrozumienie zakresu uczestnictwa", 
    de: "Den Umfang der Teilnahme verstehen" 
  },

  // International Wing - How It Works
  "wings.international.howItWorks.title": { 
    en: "How International Cooperation Works", 
    pl: "Jak działa współpraca międzynarodowa", 
    de: "Wie internationale Zusammenarbeit funktioniert" 
  },
  "wings.international.howItWorks.step1.title": { en: "Connect", pl: "Połącz się", de: "Verbinden" },
  "wings.international.howItWorks.step1.desc": { 
    en: "Register as an affiliate and introduce yourself to our coordination team", 
    pl: "Zarejestruj się jako współpracownik i przedstaw się naszemu zespołowi koordynacyjnemu", 
    de: "Registrieren Sie sich als Mitarbeiter und stellen Sie sich unserem Koordinationsteam vor" 
  },
  "wings.international.howItWorks.step2.title": { en: "Contribute", pl: "Wspieraj", de: "Beitragen" },
  "wings.international.howItWorks.step2.desc": { 
    en: "Support through translations, research, outreach, or event coordination", 
    pl: "Wspieraj poprzez tłumaczenia, badania, promocję lub koordynację wydarzeń", 
    de: "Unterstützen Sie durch Übersetzungen, Forschung, Öffentlichkeitsarbeit oder Veranstaltungskoordination" 
  },
  "wings.international.howItWorks.step3.title": { en: "Collaborate", pl: "Współpracuj", de: "Zusammenarbeiten" },
  "wings.international.howItWorks.step3.desc": { 
    en: "Work with international affiliates to amplify our ideas across borders", 
    pl: "Współpracuj z międzynarodowymi współpracownikami, aby rozpowszechniać nasze idee ponad granicami", 
    de: "Arbeiten Sie mit internationalen Mitarbeitern zusammen, um unsere Ideen über Grenzen hinweg zu verbreiten" 
  },

  // International Wing - Cooperation Areas
  "wings.international.areas.title": { 
    en: "Areas of Cooperation", 
    pl: "Obszary współpracy", 
    de: "Kooperationsbereiche" 
  },
  "wings.international.areas.languages": { en: "Multilingual Support", pl: "Wsparcie wielojęzyczne", de: "Mehrsprachige Unterstützung" },
  "wings.international.areas.research": { en: "Academic Research", pl: "Badania naukowe", de: "Akademische Forschung" },
  "wings.international.areas.media": { en: "Media & Communications", pl: "Media i komunikacja", de: "Medien & Kommunikation" },
  "wings.international.areas.events": { en: "International Events", pl: "Wydarzenie międzynarodowe", de: "Internationale Veranstaltungen" },
  "wings.international.areas.dialogue": { en: "Cross-border Dialogue", pl: "Dialog transgraniczny", de: "Grenzüberschreitender Dialog" },
  "wings.international.areas.culture": { en: "Cultural Exchange", pl: "Wymiana kulturowa", de: "Kulturaustausch" },

  // Announcements
  "announcements.title": { en: "Announcements", pl: "Komunikaty", de: "Mitteilungen" },
  "announcements.subtitle": { en: "Official communications from our movement", pl: "Oficjalne komunikaty naszego ruchu", de: "Offizielle Mitteilungen unserer Bewegung" },
  "announcements.search": { en: "Search announcements...", pl: "Szukaj komunikatów...", de: "Mitteilungen suchen..." },
  "announcements.all": { en: "All", pl: "Wszystkie", de: "Alle" },
  "announcements.showing": { en: "Showing", pl: "Wyświetlanie", de: "Anzeigen" },
  "announcements.of": { en: "of", pl: "z", de: "von" },
  "announcements.none": { en: "No announcements found", pl: "Brak komunikatów", de: "Keine Mitteilungen gefunden" },

  // Events  
  "events.title": { en: "Events", pl: "Wydarzenia", de: "Veranstaltungen" },
  "events.subtitle": { en: "Upcoming gatherings and activities", pl: "Nadchodzące spotkania i działania", de: "Kommende Treffen und Aktivitäten" },
  "events.search": { en: "Search events...", pl: "Szukaj wydarzeń...", de: "Veranstaltungen suchen..." },
  "events.all": { en: "All", pl: "Wszystkie", de: "Alle" },
  "events.upcoming": { en: "Upcoming", pl: "Nadchodzące", de: "Bevorstehend" },
  "events.past": { en: "Past", pl: "Minione", de: "Vergangen" },
  "events.showing": { en: "Showing", pl: "Wyświetlanie", de: "Anzeigen" },
  "events.of": { en: "of", pl: "z", de: "von" },
  "events.none": { en: "No events found", pl: "Brak wydarzeń", de: "Keine Veranstaltungen gefunden" },

  // Manifesto
  "manifesto.title": { en: "Our Manifesto", pl: "Nasz Manifest", de: "Unser Manifest" },
  "manifesto.subtitle": { en: "The foundational document of our movement", pl: "Dokument założycielski naszego ruchu", de: "Das Gründungsdokument unserer Bewegung" },

  // CTA
  "cta.title": { en: "Join Our Movement", pl: "Dołącz do Naszego Ruchu", de: "Treten Sie unserer Bewegung bei" },
  "cta.text": { 
    en: "Be part of the national revival. Together we will build a strong, unified Poland.", 
    pl: "Bądź częścią narodowego odrodzenia. Razem zbudujemy silną, zjednoczoną Polskę." 
  },
  "cta.contact": { en: "Contact Us", pl: "Skontaktuj się" },
  "cta.learn": { en: "Learn About Us", pl: "Poznaj Nas" },
  
  // Footer
  "footer.quicklinks": { en: "Quick Links", pl: "Szybkie Linki" },
  "footer.contact": { en: "Contact Us", pl: "Kontakt" },
  "footer.rights": { en: "All rights reserved.", pl: "Wszelkie prawa zastrzeżone." },
  
  // Common
  "common.viewAll": { en: "View All", pl: "Zobacz Wszystko" },
  "common.readMore": { en: "Read More", pl: "Czytaj Więcej" },
  "common.back": { en: "Back", pl: "Wstecz" },
  "common.loading": { en: "Loading...", pl: "Ładowanie..." },
  
  // Contact form
  "contact.title": { en: "Contact Us", pl: "Kontakt" },
  "contact.subtitle": { 
    en: "Have a question or want to get involved? We'd love to hear from you.", 
    pl: "Masz pytanie lub chcesz się zaangażować? Chętnie Cię wysłuchamy." 
  },
  "contact.form.name": { en: "Name", pl: "Imię i nazwisko" },
  "contact.form.email": { en: "Email", pl: "E-mail" },
  "contact.form.subject": { en: "Subject", pl: "Temat" },
  "contact.form.message": { en: "Message", pl: "Wiadomość" },
  "contact.form.send": { en: "Send Message", pl: "Wyślij Wiadomość" },
  "contact.form.sending": { en: "Sending...", pl: "Wysyłanie..." },
  "contact.form.success": { en: "Message Sent!", pl: "Wiadomość Wysłana!" },
  
  // About
  "about.title": { 
    en: "About National Integralism", 
    pl: "O Narodowym Integralizmie" 
  },
  "about.subtitle": { 
    en: "We are building a strong and sovereign future founded on responsibility, order, and loyalty to the national community.", 
    pl: "Budujemy silną i suwerenną przyszłość opartą na odpowiedzialności, porządku oraz lojalności wobec wspólnoty narodowej." 
  },
  "about.mission.title": { en: "Our Mission", pl: "Nasza Misja" },
  "about.mission.text": { 
    en: "Our mission is to rebuild the state on conservative principles, a stable social order, and decisive, radical solutions to problems that have been ignored for years.\nWe act in the interest of the Polish nation by strengthening its identity, security, and capacity for self-determination. The state must serve the nation, protect its interests, and ensure cultural and institutional continuity.", 
    pl: "Naszą misją jest odbudowa państwa opartego na konserwatywnych zasadach, stabilnym porządku społecznym oraz zdecydowanych, radykalnych rozwiązaniach wobec problemów, które przez lata były ignorowane.\nDziałamy w interesie narodu polskiego, wzmacniając jego tożsamość, bezpieczeństwo oraz zdolność do samostanowienia. Państwo powinno służyć narodowi, chronić jego interesy i zapewniać ciągłość kulturową oraz instytucjonalną." 
  },
  "about.vision.title": { en: "Our Vision", pl: "Nasza Wizja" },
  "about.vision.text": { 
    en: "We see Poland as a state founded on morality, responsibility, and clearly defined social norms.\nOur vision is a country where the security of citizens is an absolute priority and public authority acts decisively and effectively.\nWe strive for a state free from excessive influence of international corporations that subordinate the economy and politics to external interests at the expense of national sovereignty.", 
    pl: "Widzimy Polskę jako państwo oparte na moralności, odpowiedzialności i jasno określonych normach społecznych.\nNaszą wizją jest kraj, w którym bezpieczeństwo obywateli stanowi absolutny priorytet, a władza publiczna działa stanowczo i skutecznie.\nDążymy do państwa wolnego od nadmiernego wpływu międzynarodowych korporacji, które podporządkowują gospodarkę i politykę interesom zewnętrznym kosztem suwerenności narodowej." 
  },
  "about.values.title": { en: "Our Values", pl: "Nasze Wartości" },
  
  // Values
  "about.value.nationalism.title": { en: "Nationalism", pl: "Nacjonalizm" },
  "about.value.nationalism.text": { 
    en: "The primacy of the national interest in all actions of the state. Protection of the identity, culture, language, and historical continuity of the Polish nation.", 
    pl: "Prymat interesu narodowego we wszystkich działaniach państwa. Ochrona tożsamości, kultury, języka oraz ciągłości historycznej narodu polskiego." 
  },
  "about.value.integralism.title": { en: "Integralism", pl: "Integralizm" },
  "about.value.integralism.text": { 
    en: "The unity of nation and state, cohesion between the national community and public institutions, and the inseparability of social and state interests. Integralism means a strong, unified state free from internal divisions, particularism, and systemic chaos.", 
    pl: "Jedność narodu i państwa, spójność wspólnoty narodowej z instytucjami publicznymi oraz nierozerwalność interesu społecznego i państwowego. Integralizm oznacza silne, jednolite państwo wolne od wewnętrznych podziałów, partykularyzmu i chaosu ustrojowego." 
  },
  "about.value.sovereignty.title": { en: "Sovereignty", pl: "Suwerenność" },
  "about.value.sovereignty.text": { 
    en: "Full political, economic, and legal independence enabling independent decision-making in accordance with the national interest.", 
    pl: "Pełna niezależność polityczna, gospodarcza i prawna, umożliwiająca samodzielne podejmowanie decyzji zgodnych z interesem narodu." 
  },
  "about.value.order.title": { en: "Order and Authority", pl: "Porządek i Autorytet" },
  "about.value.order.text": { 
    en: "Effective law, stable institutions, and a clear hierarchy of responsibility ensuring security and social order.", 
    pl: "Skuteczne prawo, stabilne instytucje oraz jasna hierarchia odpowiedzialności, gwarantujące bezpieczeństwo i ład społeczny." 
  },
  
  "about.leadership": { en: "Our Leadership", pl: "Nasze Kierownictwo" },
  "about.leadership.subtitle": { en: "Meet the dedicated individuals leading our movement forward.", pl: "Poznaj oddanych liderów naszego ruchu." },
  "about.team": { en: "Our Team", pl: "Nasz Zespół" },
  "about.team.subtitle": { en: "The dedicated people working to make our vision a reality.", pl: "Oddani ludzie pracujący nad realizacją naszej wizji." },
  "about.team.coming": { en: "Team information coming soon.", pl: "Informacje o zespole wkrótce." },
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("pl"); // Default to Polish

  const t = useCallback((key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }
    // Fallback: de -> en -> pl -> key
    return translation[locale] ?? translation.en ?? translation.pl ?? key;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

// Language switcher component
export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  
  const languages: { code: Locale; label: string }[] = [
    { code: "pl", label: "PL" },
    { code: "en", label: "EN" },
    { code: "de", label: "DE" },
  ];
  
  return (
    <div className="flex items-center gap-1 text-sm">
      {languages.map((lang, index) => (
        <span key={lang.code} className="flex items-center">
          {index > 0 && <span className="text-muted-foreground mx-0.5">/</span>}
          <button
            onClick={() => setLocale(lang.code)}
            className={`px-2 py-1 rounded transition-colors ${
              locale === lang.code 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {lang.label}
          </button>
        </span>
      ))}
    </div>
  );
}
