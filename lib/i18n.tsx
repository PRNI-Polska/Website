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
    pl: "Naród Ponad Wszystkim" 
  },
  "hero.subtitle": { 
    en: "Building a strong, unified Poland rooted in tradition and national identity.", 
    pl: "Budujemy silną, zjednoczoną Polskę zakorzenioną w tradycji i tożsamości narodowej." 
  },
  "hero.cta.manifesto": { en: "Read Our Manifesto", pl: "Czytaj Manifest" },
  "hero.cta.join": { en: "Join the Movement", pl: "Dołącz do Ruchu" },
  
  // Mission section
  "mission.title": { en: "Our Mission", pl: "Nasza Misja" },
  "mission.text": { 
    en: "We believe in the nation as the highest political value. Our movement stands for the preservation of Polish national identity, cultural unity, and the organic state that serves the interests of the nation.", 
    pl: "Wierzymy w naród jako najwyższą wartość polityczną. Nasz ruch stoi na straży zachowania polskiej tożsamości narodowej, jedności kulturowej oraz organicznego państwa służącego interesom narodu." 
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
  
  // CTA
  "cta.title": { en: "Join Our Movement", pl: "Dołącz do Naszego Ruchu" },
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
  
  return (
    <div className="flex items-center gap-1 text-sm">
      <button
        onClick={() => setLocale("pl")}
        className={`px-2 py-1 rounded transition-colors ${
          locale === "pl" 
            ? "bg-primary text-primary-foreground" 
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        PL
      </button>
      <span className="text-muted-foreground">/</span>
      <button
        onClick={() => setLocale("en")}
        className={`px-2 py-1 rounded transition-colors ${
          locale === "en" 
            ? "bg-primary text-primary-foreground" 
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        EN
      </button>
    </div>
  );
}
