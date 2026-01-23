// file: lib/i18n.tsx
"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type Locale = "pl" | "en" | "de";

interface Translations {
  [key: string]: {
    pl: string;
    en: string;
    de: string;
  };
}

export const translations: Translations = {
  // Navigation
  "nav.home": { pl: "Strona główna", en: "Home", de: "Startseite" },
  "nav.announcements": { pl: "Komunikaty", en: "Announcements", de: "Mitteilungen" },
  "nav.events": { pl: "Wydarzenia", en: "Events", de: "Veranstaltungen" },
  "nav.manifesto": { pl: "Manifest", en: "Manifesto", de: "Manifest" },
  "nav.about": { pl: "O nas", en: "About", de: "Über uns" },
  "nav.contact": { pl: "Kontakt", en: "Contact", de: "Kontakt" },
  
  // Party names
  "party.name.short": { pl: "PRNI", en: "PRNI", de: "PRNI" },
  "party.name.full.en": { 
    pl: "Polish National-Integralist Movement", 
    en: "Polish National-Integralist Movement",
    de: "Polnische National-Integralistische Bewegung"
  },
  "party.name.full.pl": { 
    pl: "Polski Ruch Narodowo-Integralistyczny", 
    en: "Polski Ruch Narodowo-Integralistyczny",
    de: "Polski Ruch Narodowo-Integralistyczny"
  },
  
  // Hero section
  "hero.title": { 
    pl: "Naród Ponad Wszystkim",
    en: "Nation Above All", 
    de: "Die Nation über allem"
  },
  "hero.subtitle": { 
    pl: "Budujemy silną, zjednoczoną Polskę zakorzenioną w tradycji i tożsamości narodowej.",
    en: "Building a strong, unified Poland rooted in tradition and national identity.", 
    de: "Wir bauen ein starkes, vereintes Polen, das in Tradition und nationaler Identität verwurzelt ist."
  },
  "hero.cta.manifesto": { pl: "Czytaj Manifest", en: "Read Our Manifesto", de: "Unser Manifest lesen" },
  "hero.cta.join": { pl: "Dołącz do Ruchu", en: "Join the Movement", de: "Der Bewegung beitreten" },
  
  // Mission section
  "mission.title": { pl: "Nasza Misja", en: "Our Mission", de: "Unsere Mission" },
  "mission.text": { 
    pl: "Wierzymy w naród jako najwyższą wartość polityczną. Nasz ruch stoi na straży zachowania polskiej tożsamości narodowej, jedności kulturowej oraz organicznego państwa służącego interesom narodu.",
    en: "We believe in the nation as the highest political value. Our movement stands for the preservation of Polish national identity, cultural unity, and the organic state that serves the interests of the nation.", 
    de: "Wir glauben an die Nation als höchsten politischen Wert. Unsere Bewegung steht für die Bewahrung der polnischen nationalen Identität, kultureller Einheit und des organischen Staates, der den Interessen der Nation dient."
  },
  
  // Ideology sections
  "ideology.title": { pl: "Nasza Ideologia", en: "Our Ideology", de: "Unsere Ideologie" },
  "ideology.s1.title": { 
    pl: "§ 1. Naród jako najwyższa wartość polityczna",
    en: "§ 1. The Nation as the Highest Political Value", 
    de: "§ 1. Die Nation als höchster politischer Wert"
  },
  "ideology.s1.text": { 
    pl: "Uznajemy naród za najwyższą wartość polityczną. Naród pojmujemy jako byt historyczny i kulturowy, stojący ponad interesami jednostek oraz grup społecznych.",
    en: "We recognize the nation as the highest political value. We understand the nation as a historical and cultural entity, standing above the interests of individuals and social groups.", 
    de: "Wir erkennen die Nation als den höchsten politischen Wert an. Wir verstehen die Nation als eine historische und kulturelle Einheit, die über den Interessen von Einzelpersonen und sozialen Gruppen steht."
  },
  "ideology.s2.title": { 
    pl: "§ 2. Jedność ideowa i kulturowa",
    en: "§ 2. Ideological and Cultural Unity", 
    de: "§ 2. Ideologische und kulturelle Einheit"
  },
  "ideology.s2.text": { 
    pl: "Opowiadamy się za zachowaniem jedności ideowej i kulturowej wspólnoty narodowej. Uznajemy konieczność obrony jednej, polskiej tradycji narodowej jako fundamentu tożsamości i ciągłości narodu.",
    en: "We advocate for the preservation of ideological and cultural unity of the national community. We recognize the necessity of defending one Polish national tradition as the foundation of identity and continuity of the nation.", 
    de: "Wir setzen uns für die Bewahrung der ideologischen und kulturellen Einheit der nationalen Gemeinschaft ein. Wir erkennen die Notwendigkeit an, eine polnische nationale Tradition als Grundlage der Identität und Kontinuität der Nation zu verteidigen."
  },
  "ideology.s3.title": { 
    pl: "§ 3. Antyliberalizm",
    en: "§ 3. Anti-Liberalism", 
    de: "§ 3. Antiliberalismus"
  },
  "ideology.s3.text": { 
    pl: "Odrzucamy liberalizm polityczny, oparty na skrajnym pluralizmie i indywidualizmie, jak również liberalizm kulturowy, prowadzący do relatywizacji wartości i osłabienia więzi narodowych.",
    en: "We reject political liberalism based on extreme pluralism and individualism, as well as cultural liberalism leading to relativization of values and weakening of national bonds.", 
    de: "Wir lehnen den politischen Liberalismus ab, der auf extremem Pluralismus und Individualismus basiert, sowie den kulturellen Liberalismus, der zur Relativierung von Werten und zur Schwächung nationaler Bindungen führt."
  },
  "ideology.s4.title": { 
    pl: "§ 4. Państwo organiczne",
    en: "§ 4. The Organic State", 
    de: "§ 4. Der organische Staat"
  },
  "ideology.s4.text": { 
    pl: "Uznajemy państwo za organiczny wyraz woli narodu. Państwo nie jest neutralnym arbitrem pomiędzy konkurującymi interesami, lecz narzędziem realizacji interesu narodowego.",
    en: "We recognize the state as an organic expression of the nation's will. The state is not a neutral arbiter between competing interests, but a tool for realizing the national interest.", 
    de: "Wir erkennen den Staat als organischen Ausdruck des Willens der Nation an. Der Staat ist kein neutraler Schiedsrichter zwischen konkurrierenden Interessen, sondern ein Werkzeug zur Verwirklichung des nationalen Interesses."
  },
  "ideology.s5.title": { 
    pl: "§ 5. Gospodarka podporządkowana narodowi",
    en: "§ 5. Economy Subordinated to the Nation", 
    de: "§ 5. Der Nation untergeordnete Wirtschaft"
  },
  "ideology.s5.text": { 
    pl: "Uznajemy, że gospodarka powinna służyć narodowi. Nie opowiadamy się ani za skrajnym wolnym rynkiem, ani za socjalizmem. Dopuszczamy interwencję państwa tam, gdzie wymaga tego interes narodowy lub stabilność społeczna.",
    en: "We recognize that the economy should serve the nation. We advocate neither for extreme free market nor for socialism. We permit state intervention where national interest or social stability requires it.", 
    de: "Wir erkennen an, dass die Wirtschaft der Nation dienen sollte. Wir befürworten weder einen extremen freien Markt noch den Sozialismus. Wir erlauben staatliche Intervention, wo es das nationale Interesse oder die soziale Stabilität erfordert."
  },
  "ideology.s6.title": { 
    pl: "§ 6. Zasady współpracy międzynarodowej",
    en: "§ 6. Principles of International Cooperation", 
    de: "§ 6. Grundsätze der internationalen Zusammenarbeit"
  },
  "ideology.s6.text": { 
    pl: "Opowiadamy się za współpracą międzynarodową opartą na poszanowaniu suwerenności, samostanowienia oraz pełnej niezależności politycznej i gospodarczej państw. Wszelkie formy integracji ponadnarodowej uznajemy za dopuszczalne wyłącznie wówczas, gdy nie naruszają one nadrzędności interesu narodowego, nie ograniczają kompetencji państwa w kluczowych obszarach oraz pozostają oparte na dobrowolności i równoprawności uczestników.",
    en: "We advocate for international cooperation based on respect for sovereignty, self-determination, and full political and economic independence of states. We consider all forms of supranational integration admissible only when they do not violate the supremacy of national interest, do not limit state competences in key areas, and remain based on voluntariness and equality of participants.", 
    de: "Wir befürworten internationale Zusammenarbeit auf der Grundlage der Achtung von Souveränität, Selbstbestimmung und vollständiger politischer und wirtschaftlicher Unabhängigkeit der Staaten. Wir betrachten alle Formen supranationaler Integration nur dann als zulässig, wenn sie den Vorrang des nationalen Interesses nicht verletzen, die staatlichen Kompetenzen in Schlüsselbereichen nicht einschränken und auf Freiwilligkeit und Gleichberechtigung der Teilnehmer basieren."
  },
  "ideology.s7.title": { 
    pl: "§ 7. Bezpieczeństwo i obronność państwa",
    en: "§ 7. State Security and Defense", 
    de: "§ 7. Staatliche Sicherheit und Verteidigung"
  },
  "ideology.s7.text": { 
    pl: "Uznajemy, że bezpieczeństwo państwa powinno opierać się na zdolności do samodzielnej obrony oraz na współpracy międzynarodowej o wyłącznie obronnym charakterze. Sprzeciwiamy się polityce ekspansji militarnej, wykorzystywaniu sojuszy wojskowych jako narzędzi presji politycznej oraz działaniom prowadzącym do destabilizacji ładu międzynarodowego. Trwałe bezpieczeństwo może być budowane jedynie w oparciu o równowagę sił, odpowiedzialność państw oraz poszanowanie ich suwerenności.",
    en: "We recognize that state security should be based on the ability for self-defense and on international cooperation of exclusively defensive nature. We oppose policies of military expansion, the use of military alliances as tools of political pressure, and actions leading to the destabilization of international order. Lasting security can only be built on the basis of balance of power, state responsibility, and respect for their sovereignty.", 
    de: "Wir erkennen an, dass die staatliche Sicherheit auf der Fähigkeit zur Selbstverteidigung und auf internationaler Zusammenarbeit ausschließlich defensiver Natur basieren sollte. Wir lehnen eine Politik der militärischen Expansion, den Einsatz von Militärbündnissen als Instrumente politischen Drucks und Handlungen ab, die zur Destabilisierung der internationalen Ordnung führen. Dauerhafte Sicherheit kann nur auf der Grundlage eines Kräftegleichgewichts, staatlicher Verantwortung und der Achtung ihrer Souveränität aufgebaut werden."
  },
  "ideology.s8.title": { 
    pl: "§ 8. Degeneracja moralna współczesnego społeczeństwa",
    en: "§ 8. Moral Degeneration of Modern Society", 
    de: "§ 8. Moralische Degeneration der modernen Gesellschaft"
  },
  "ideology.s8.text": { 
    pl: "Sprzeciwiamy się ogarniającym świat globalizmowi oraz międzynarodowym korporacjom wspierającym liberalne i progresywne inicjatywy mające na celu destabilizację i kontrolę narodów, w wyniku których współczesne społeczeństwa poddawane są procesowi głębokiej erozji moralnej i aksjologicznej — jeśli proces ten nie zostanie powstrzymany, doprowadzi on do destrukcji ładu społecznego i tożsamości narodowej.",
    en: "We oppose the globalism engulfing the world and international corporations supporting liberal and progressive initiatives aimed at destabilizing and controlling nations, as a result of which modern societies are subjected to a process of deep moral and axiological erosion — if this process is not stopped, it will lead to the destruction of social order and national identity.", 
    de: "Wir lehnen den die Welt erfassenden Globalismus und internationale Konzerne ab, die liberale und progressive Initiativen unterstützen, die auf die Destabilisierung und Kontrolle von Nationen abzielen, wodurch moderne Gesellschaften einem Prozess tiefer moralischer und axiologischer Erosion ausgesetzt sind — wenn dieser Prozess nicht gestoppt wird, wird er zur Zerstörung der sozialen Ordnung und der nationalen Identität führen."
  },
  
  // Sections
  "section.news": { pl: "Najnowsze Wiadomości", en: "Latest News", de: "Neueste Nachrichten" },
  "section.news.subtitle": { pl: "Bądź na bieżąco z naszymi komunikatami", en: "Stay updated with our latest announcements", de: "Bleiben Sie über unsere neuesten Ankündigungen informiert" },
  "section.events": { pl: "Nadchodzące Wydarzenia", en: "Upcoming Events", de: "Kommende Veranstaltungen" },
  "section.events.subtitle": { pl: "Dołącz do nas na nadchodzących wydarzeniach", en: "Join us at our upcoming events", de: "Nehmen Sie an unseren kommenden Veranstaltungen teil" },
  "section.manifesto": { pl: "Nasz Manifest", en: "Our Manifesto", de: "Unser Manifest" },
  "section.manifesto.subtitle": { 
    pl: "Poznaj naszą wizję i politykę budowania silniejszej Polski.",
    en: "Explore our vision and policies for building a stronger Poland.", 
    de: "Entdecken Sie unsere Vision und Politik für den Aufbau eines stärkeren Polens."
  },
  
  // CTA
  "cta.title": { pl: "Dołącz do Naszego Ruchu", en: "Join Our Movement", de: "Treten Sie unserer Bewegung bei" },
  "cta.text": { 
    pl: "Bądź częścią narodowego odrodzenia. Razem zbudujemy silną, zjednoczoną Polskę.",
    en: "Be part of the national revival. Together we will build a strong, unified Poland.", 
    de: "Seien Sie Teil der nationalen Erneuerung. Gemeinsam werden wir ein starkes, vereintes Polen aufbauen."
  },
  "cta.contact": { pl: "Skontaktuj się", en: "Contact Us", de: "Kontaktieren Sie uns" },
  "cta.learn": { pl: "Poznaj Nas", en: "Learn About Us", de: "Erfahren Sie mehr" },
  
  // Footer
  "footer.quicklinks": { pl: "Szybkie Linki", en: "Quick Links", de: "Schnelllinks" },
  "footer.contact": { pl: "Kontakt", en: "Contact Us", de: "Kontakt" },
  "footer.rights": { pl: "Wszelkie prawa zastrzeżone.", en: "All rights reserved.", de: "Alle Rechte vorbehalten." },
  
  // Common
  "common.viewAll": { pl: "Zobacz Wszystko", en: "View All", de: "Alle anzeigen" },
  "common.readMore": { pl: "Czytaj Więcej", en: "Read More", de: "Mehr lesen" },
  "common.back": { pl: "Wstecz", en: "Back", de: "Zurück" },
  "common.loading": { pl: "Ładowanie...", en: "Loading...", de: "Laden..." },
  
  // Contact form
  "contact.title": { pl: "Kontakt", en: "Contact Us", de: "Kontakt" },
  "contact.subtitle": { 
    pl: "Masz pytanie lub chcesz się zaangażować? Chętnie Cię wysłuchamy.",
    en: "Have a question or want to get involved? We'd love to hear from you.", 
    de: "Haben Sie eine Frage oder möchten Sie sich engagieren? Wir freuen uns von Ihnen zu hören."
  },
  "contact.form.name": { pl: "Imię i nazwisko", en: "Name", de: "Name" },
  "contact.form.email": { pl: "E-mail", en: "Email", de: "E-Mail" },
  "contact.form.subject": { pl: "Temat", en: "Subject", de: "Betreff" },
  "contact.form.message": { pl: "Wiadomość", en: "Message", de: "Nachricht" },
  "contact.form.send": { pl: "Wyślij Wiadomość", en: "Send Message", de: "Nachricht senden" },
  "contact.form.sending": { pl: "Wysyłanie...", en: "Sending...", de: "Senden..." },
  "contact.form.success": { pl: "Wiadomość Wysłana!", en: "Message Sent!", de: "Nachricht gesendet!" },
  
  // About
  "about.title": { 
    pl: "O Narodowym Integralizmie",
    en: "About National Integralism", 
    de: "Über den Nationalen Integralismus"
  },
  "about.subtitle": { 
    pl: "Budujemy silną i suwerenną przyszłość opartą na odpowiedzialności, porządku oraz lojalności wobec wspólnoty narodowej.",
    en: "We are building a strong and sovereign future founded on responsibility, order, and loyalty to the national community.", 
    de: "Wir bauen eine starke und souveräne Zukunft auf, die auf Verantwortung, Ordnung und Loyalität gegenüber der nationalen Gemeinschaft gegründet ist."
  },
  "about.mission.title": { pl: "Nasza Misja", en: "Our Mission", de: "Unsere Mission" },
  "about.mission.text": { 
    pl: "Naszą misją jest odbudowa państwa opartego na konserwatywnych zasadach, stabilnym porządku społecznym oraz zdecydowanych, radykalnych rozwiązaniach wobec problemów, które przez lata były ignorowane.\nDziałamy w interesie narodu polskiego, wzmacniając jego tożsamość, bezpieczeństwo oraz zdolność do samostanowienia. Państwo powinno służyć narodowi, chronić jego interesy i zapewniać ciągłość kulturową oraz instytucjonalną.",
    en: "Our mission is to rebuild the state on conservative principles, a stable social order, and decisive, radical solutions to problems that have been ignored for years.\nWe act in the interest of the Polish nation by strengthening its identity, security, and capacity for self-determination. The state must serve the nation, protect its interests, and ensure cultural and institutional continuity.", 
    de: "Unsere Mission ist es, den Staat auf konservativen Prinzipien, einer stabilen sozialen Ordnung und entschlossenen, radikalen Lösungen für Probleme, die jahrelang ignoriert wurden, wieder aufzubauen.\nWir handeln im Interesse der polnischen Nation, indem wir ihre Identität, Sicherheit und Fähigkeit zur Selbstbestimmung stärken. Der Staat muss der Nation dienen, ihre Interessen schützen und kulturelle sowie institutionelle Kontinuität gewährleisten."
  },
  "about.vision.title": { pl: "Nasza Wizja", en: "Our Vision", de: "Unsere Vision" },
  "about.vision.text": { 
    pl: "Widzimy Polskę jako państwo oparte na moralności, odpowiedzialności i jasno określonych normach społecznych.\nNaszą wizją jest kraj, w którym bezpieczeństwo obywateli stanowi absolutny priorytet, a władza publiczna działa stanowczo i skutecznie.\nDążymy do państwa wolnego od nadmiernego wpływu międzynarodowych korporacji, które podporządkowują gospodarkę i politykę interesom zewnętrznym kosztem suwerenności narodowej.",
    en: "We see Poland as a state founded on morality, responsibility, and clearly defined social norms.\nOur vision is a country where the security of citizens is an absolute priority and public authority acts decisively and effectively.\nWe strive for a state free from excessive influence of international corporations that subordinate the economy and politics to external interests at the expense of national sovereignty.", 
    de: "Wir sehen Polen als einen Staat, der auf Moral, Verantwortung und klar definierten sozialen Normen gegründet ist.\nUnsere Vision ist ein Land, in dem die Sicherheit der Bürger absolute Priorität hat und die öffentliche Autorität entschlossen und effektiv handelt.\nWir streben nach einem Staat, der frei von übermäßigem Einfluss internationaler Konzerne ist, die Wirtschaft und Politik externen Interessen auf Kosten der nationalen Souveränität unterordnen."
  },
  "about.values.title": { pl: "Nasze Wartości", en: "Our Values", de: "Unsere Werte" },
  
  // Values
  "about.value.nationalism.title": { pl: "Nacjonalizm", en: "Nationalism", de: "Nationalismus" },
  "about.value.nationalism.text": { 
    pl: "Prymat interesu narodowego we wszystkich działaniach państwa. Ochrona tożsamości, kultury, języka oraz ciągłości historycznej narodu polskiego.",
    en: "The primacy of the national interest in all actions of the state. Protection of the identity, culture, language, and historical continuity of the Polish nation.", 
    de: "Der Vorrang des nationalen Interesses in allen Handlungen des Staates. Schutz der Identität, Kultur, Sprache und historischen Kontinuität der polnischen Nation."
  },
  "about.value.integralism.title": { pl: "Integralizm", en: "Integralism", de: "Integralismus" },
  "about.value.integralism.text": { 
    pl: "Jedność narodu i państwa, spójność wspólnoty narodowej z instytucjami publicznymi oraz nierozerwalność interesu społecznego i państwowego. Integralizm oznacza silne, jednolite państwo wolne od wewnętrznych podziałów, partykularyzmu i chaosu ustrojowego.",
    en: "The unity of nation and state, cohesion between the national community and public institutions, and the inseparability of social and state interests. Integralism means a strong, unified state free from internal divisions, particularism, and systemic chaos.", 
    de: "Die Einheit von Nation und Staat, der Zusammenhalt zwischen der nationalen Gemeinschaft und öffentlichen Institutionen sowie die Untrennbarkeit von sozialen und staatlichen Interessen. Integralismus bedeutet einen starken, einheitlichen Staat, frei von internen Spaltungen, Partikularismus und systemischem Chaos."
  },
  "about.value.sovereignty.title": { pl: "Suwerenność", en: "Sovereignty", de: "Souveränität" },
  "about.value.sovereignty.text": { 
    pl: "Pełna niezależność polityczna, gospodarcza i prawna, umożliwiająca samodzielne podejmowanie decyzji zgodnych z interesem narodu.",
    en: "Full political, economic, and legal independence enabling independent decision-making in accordance with the national interest.", 
    de: "Volle politische, wirtschaftliche und rechtliche Unabhängigkeit, die eine unabhängige Entscheidungsfindung im Einklang mit dem nationalen Interesse ermöglicht."
  },
  "about.value.order.title": { pl: "Porządek i Autorytet", en: "Order and Authority", de: "Ordnung und Autorität" },
  "about.value.order.text": { 
    pl: "Skuteczne prawo, stabilne instytucje oraz jasna hierarchia odpowiedzialności, gwarantujące bezpieczeństwo i ład społeczny.",
    en: "Effective law, stable institutions, and a clear hierarchy of responsibility ensuring security and social order.", 
    de: "Effektives Recht, stabile Institutionen und eine klare Verantwortungshierarchie, die Sicherheit und soziale Ordnung gewährleisten."
  },
  
  "about.leadership": { pl: "Nasze Kierownictwo", en: "Our Leadership", de: "Unsere Führung" },
  "about.leadership.subtitle": { pl: "Poznaj oddanych liderów naszego ruchu.", en: "Meet the dedicated individuals leading our movement forward.", de: "Lernen Sie die engagierten Persönlichkeiten kennen, die unsere Bewegung vorantreiben." },
  "about.team": { pl: "Nasz Zespół", en: "Our Team", de: "Unser Team" },
  "about.team.subtitle": { pl: "Oddani ludzie pracujący nad realizacją naszej wizji.", en: "The dedicated people working to make our vision a reality.", de: "Die engagierten Menschen, die daran arbeiten, unsere Vision Wirklichkeit werden zu lassen." },
  "about.team.coming": { pl: "Informacje o zespole wkrótce.", en: "Team information coming soon.", de: "Teaminformationen folgen in Kürze." },
  "about.member.contact": { pl: "Kontakt", en: "Contact", de: "Kontakt" },
  
  // Contact page
  "contact.form.title": { pl: "Wyślij wiadomość", en: "Send a Message", de: "Nachricht senden" },
  "contact.form.description": { 
    pl: "Wypełnij formularz poniżej, a my skontaktujemy się z Tobą najszybciej jak to możliwe.",
    en: "Fill out the form below and we'll get back to you as soon as possible.", 
    de: "Füllen Sie das Formular aus und wir werden uns so schnell wie möglich bei Ihnen melden."
  },
  "contact.form.name.placeholder": { pl: "Twoje imię", en: "Your name", de: "Ihr Name" },
  "contact.form.email.placeholder": { pl: "twoj@email.com", en: "your@email.com", de: "ihre@email.com" },
  "contact.form.subject.placeholder": { pl: "O czym chcesz porozmawiać?", en: "What is this about?", de: "Worum geht es?" },
  "contact.form.message.placeholder": { pl: "Twoja wiadomość...", en: "Your message...", de: "Ihre Nachricht..." },
  "contact.form.success.text": { 
    pl: "Dziękujemy za kontakt. Odpowiemy najszybciej jak to możliwe.",
    en: "Thank you for reaching out. We'll get back to you soon.", 
    de: "Vielen Dank für Ihre Nachricht. Wir werden uns bald bei Ihnen melden."
  },
  "contact.form.sendAnother": { pl: "Wyślij kolejną wiadomość", en: "Send Another Message", de: "Weitere Nachricht senden" },
  "contact.form.required": { 
    pl: "* Wymagane pola. Twoje dane będą poufne.",
    en: "* Required fields. Your information will be kept confidential.", 
    de: "* Pflichtfelder. Ihre Daten werden vertraulich behandelt."
  },
  
  // Events page
  "events.title": { pl: "Wydarzenia", en: "Events", de: "Veranstaltungen" },
  "events.subtitle": { 
    pl: "Odkryj nadchodzące wydarzenia i dołącz do naszych inicjatyw.",
    en: "Discover upcoming events and join our initiatives.", 
    de: "Entdecken Sie kommende Veranstaltungen und nehmen Sie an unseren Initiativen teil."
  },
  "events.calendar": { pl: "Kalendarz", en: "Calendar", de: "Kalender" },
  "events.list": { pl: "Lista", en: "List", de: "Liste" },
  "events.subscribe": { pl: "Subskrybuj kalendarz", en: "Subscribe to Calendar", de: "Kalender abonnieren" },
  "events.today": { pl: "Dziś", en: "Today", de: "Heute" },
  "events.upcoming": { pl: "Nadchodzące wydarzenia", en: "Upcoming Events", de: "Kommende Veranstaltungen" },
  "events.past": { pl: "Minione wydarzenia", en: "Past Events", de: "Vergangene Veranstaltungen" },
  "events.none": { pl: "Brak zaplanowanych wydarzeń.", en: "No upcoming events scheduled.", de: "Keine kommenden Veranstaltungen geplant." },
  "events.rsvp": { pl: "Zapisz się", en: "RSVP", de: "Anmelden" },
  "events.addToCalendar": { pl: "Dodaj do kalendarza", en: "Add to Calendar", de: "Zum Kalender hinzufügen" },
  "events.contactOrganizer": { pl: "Kontakt z organizatorem", en: "Contact Organizer", de: "Organisator kontaktieren" },
  "events.more": { pl: "więcej", en: "more", de: "mehr" },
  
  // Days of week
  "days.sun": { pl: "Ndz", en: "Sun", de: "So" },
  "days.mon": { pl: "Pon", en: "Mon", de: "Mo" },
  "days.tue": { pl: "Wt", en: "Tue", de: "Di" },
  "days.wed": { pl: "Śr", en: "Wed", de: "Mi" },
  "days.thu": { pl: "Czw", en: "Thu", de: "Do" },
  "days.fri": { pl: "Pt", en: "Fri", de: "Fr" },
  "days.sat": { pl: "Sob", en: "Sat", de: "Sa" },
  
  // Announcements page
  "announcements.title": { pl: "Komunikaty", en: "Announcements", de: "Mitteilungen" },
  "announcements.subtitle": { 
    pl: "Bądź na bieżąco z najnowszymi wiadomościami naszego ruchu.",
    en: "Stay updated with the latest news and announcements from our party.", 
    de: "Bleiben Sie über die neuesten Nachrichten und Mitteilungen unserer Partei informiert."
  },
  "announcements.search": { pl: "Szukaj komunikatów...", en: "Search announcements...", de: "Mitteilungen suchen..." },
  "announcements.all": { pl: "Wszystkie", en: "All", de: "Alle" },
  "announcements.showing": { pl: "Wyświetlanie", en: "Showing", de: "Anzeige" },
  "announcements.of": { pl: "z", en: "of", de: "von" },
  "announcements.for": { pl: "dla", en: "for", de: "für" },
  "announcements.in": { pl: "w", en: "in", de: "in" },
  "announcements.none": { pl: "Nie znaleziono komunikatów.", en: "No announcements found.", de: "Keine Mitteilungen gefunden." },
  "announcements.adjustFilters": { pl: "Spróbuj zmienić filtry.", en: "Try adjusting your filters.", de: "Versuchen Sie, Ihre Filter anzupassen." },
  "announcements.previous": { pl: "Poprzednia", en: "Previous", de: "Zurück" },
  "announcements.next": { pl: "Następna", en: "Next", de: "Weiter" },
  
  // Category labels
  "category.NEWS": { pl: "Wiadomości", en: "News", de: "Nachrichten" },
  "category.PRESS_RELEASE": { pl: "Komunikat prasowy", en: "Press Release", de: "Pressemitteilung" },
  "category.POLICY": { pl: "Polityka", en: "Policy", de: "Politik" },
  "category.CAMPAIGN": { pl: "Kampania", en: "Campaign", de: "Kampagne" },
  "category.COMMUNITY": { pl: "Społeczność", en: "Community", de: "Gemeinschaft" },
  "category.OTHER": { pl: "Inne", en: "Other", de: "Andere" },
  
  // Party name (full with locale awareness)
  "party.name.full": {
    pl: "Polski Ruch Narodowo-Integralistyczny",
    en: "Polish National-Integralist Movement",
    de: "Polnische National-Integralistische Bewegung"
  },

  // ============================================================================
  // WINGS GATEWAY
  // ============================================================================
  
  // Navigation
  "nav.wings": { pl: "Skrzydła", en: "Wings", de: "Flügel" },
  "nav.positions": { pl: "Nasze Stanowiska", en: "Our Positions", de: "Unsere Positionen" },
  "nav.news": { pl: "Aktualności", en: "News", de: "Nachrichten" },
  "nav.join": { pl: "Dołącz", en: "Join", de: "Beitreten" },
  
  // Wings Gateway Homepage
  "wings.gateway.title": { 
    pl: "Wybierz swoje Skrzydło", 
    en: "Choose Your Wing", 
    de: "Wähle deinen Flügel" 
  },
  "wings.gateway.subtitle": { 
    pl: "Trzy filary jednego ruchu", 
    en: "Three pillars of one movement", 
    de: "Drei Säulen einer Bewegung" 
  },
  
  // Main Wing
  "wings.main.title": { pl: "Skrzydło Główne", en: "Main Wing", de: "Hauptflügel" },
  "wings.main.tagline": { 
    pl: "Serce ruchu narodowego", 
    en: "The heart of the national movement", 
    de: "Das Herz der nationalen Bewegung" 
  },
  "wings.main.cta": { pl: "Wejdź", en: "Enter", de: "Eintreten" },
  "wings.main.purpose.title": { pl: "Cel", en: "Purpose", de: "Zweck" },
  "wings.main.purpose.text": { 
    pl: "Skrzydło Główne stanowi centralny organ operacyjny Polskiego Ruchu Narodowo-Integralistycznego. Odpowiada za kształtowanie doktryny, koordynację działań na poziomie krajowym oraz rozwój struktury organizacyjnej.", 
    en: "The Main Wing serves as the central operational body of the Polish National-Integralist Movement. It is responsible for shaping doctrine, coordinating activities at the national level, and developing the organizational structure.", 
    de: "Der Hauptflügel dient als zentrales operatives Organ der Polnischen National-Integralistischen Bewegung. Er ist verantwortlich für die Gestaltung der Doktrin, die Koordination der Aktivitäten auf nationaler Ebene und die Entwicklung der Organisationsstruktur." 
  },
  "wings.main.responsibilities.title": { pl: "Zakres działań", en: "Responsibilities", de: "Aufgabenbereiche" },
  "wings.main.responsibilities.1": { 
    pl: "Opracowanie i realizacja programu politycznego", 
    en: "Development and implementation of the political program", 
    de: "Entwicklung und Umsetzung des politischen Programms" 
  },
  "wings.main.responsibilities.2": { 
    pl: "Koordynacja struktur regionalnych", 
    en: "Coordination of regional structures", 
    de: "Koordination regionaler Strukturen" 
  },
  "wings.main.responsibilities.3": { 
    pl: "Rekrutacja i szkolenie członków", 
    en: "Member recruitment and training", 
    de: "Rekrutierung und Schulung von Mitgliedern" 
  },
  "wings.main.responsibilities.4": { 
    pl: "Planowanie kampanii i wydarzeń", 
    en: "Campaign and event planning", 
    de: "Kampagnen- und Veranstaltungsplanung" 
  },
  "wings.main.engage.title": { pl: "Zaangażuj się", en: "Get Involved", de: "Engagiere dich" },
  "wings.main.engage.text": { 
    pl: "Dołącz do Skrzydła Głównego i weź aktywny udział w budowaniu silnego ruchu narodowego.", 
    en: "Join the Main Wing and take an active part in building a strong national movement.", 
    de: "Tritt dem Hauptflügel bei und nimm aktiv am Aufbau einer starken nationalen Bewegung teil." 
  },
  
  // International Wing
  "wings.international.title": { pl: "Skrzydło Międzynarodowe", en: "International Wing", de: "Internationaler Flügel" },
  "wings.international.tagline": { 
    pl: "Głos Polski za granicą", 
    en: "Poland's voice abroad", 
    de: "Polens Stimme im Ausland" 
  },
  "wings.international.cta": { pl: "Wejdź", en: "Enter", de: "Eintreten" },
  "wings.international.purpose.title": { pl: "Cel", en: "Purpose", de: "Zweck" },
  "wings.international.purpose.text": { 
    pl: "Skrzydło Międzynarodowe odpowiada za komunikację zewnętrzną, budowanie relacji z ruchami pokrewnymi za granicą oraz reprezentowanie stanowiska PRNI na arenie międzynarodowej.", 
    en: "The International Wing is responsible for external communications, building relationships with like-minded movements abroad, and representing PRNI's position on the international stage.", 
    de: "Der Internationale Flügel ist verantwortlich für externe Kommunikation, den Aufbau von Beziehungen zu gleichgesinnten Bewegungen im Ausland und die Vertretung der Position der PRNI auf internationaler Ebene." 
  },
  "wings.international.responsibilities.title": { pl: "Zakres działań", en: "Responsibilities", de: "Aufgabenbereiche" },
  "wings.international.responsibilities.1": { 
    pl: "Tłumaczenia materiałów i komunikatów", 
    en: "Translation of materials and communications", 
    de: "Übersetzung von Materialien und Mitteilungen" 
  },
  "wings.international.responsibilities.2": { 
    pl: "Budowanie partnerstw zagranicznych", 
    en: "Building foreign partnerships", 
    de: "Aufbau ausländischer Partnerschaften" 
  },
  "wings.international.responsibilities.3": { 
    pl: "Publikacje i oświadczenia międzynarodowe", 
    en: "International publications and statements", 
    de: "Internationale Publikationen und Erklärungen" 
  },
  "wings.international.responsibilities.4": { 
    pl: "Koordynacja z Polonią", 
    en: "Coordination with the Polish diaspora", 
    de: "Koordination mit der polnischen Diaspora" 
  },
  "wings.international.engage.title": { pl: "Jak pomóc", en: "How to Help", de: "Wie man helfen kann" },
  "wings.international.engage.text": { 
    pl: "Posługujesz się językami obcymi? Masz kontakty za granicą? Skrzydło Międzynarodowe potrzebuje Twoich umiejętności.", 
    en: "Do you speak foreign languages? Have contacts abroad? The International Wing needs your skills.", 
    de: "Sprichst du Fremdsprachen? Hast du Kontakte im Ausland? Der Internationale Flügel braucht deine Fähigkeiten." 
  },
  
  // Female Wing
  "wings.female.title": { pl: "Skrzydło Kobiece", en: "Female Wing", de: "Frauenflügel" },
  "wings.female.tagline": { 
    pl: "Siła narodu w jedności kobiet", 
    en: "The nation's strength in women's unity", 
    de: "Die Stärke der Nation in der Einheit der Frauen" 
  },
  "wings.female.cta": { pl: "Wkrótce", en: "Coming Soon", de: "Bald verfügbar" },
  "wings.female.comingSoon": { 
    pl: "Strona w przygotowaniu", 
    en: "Page under construction", 
    de: "Seite im Aufbau" 
  },
  "wings.female.notify": { pl: "Powiadom mnie", en: "Notify me", de: "Benachrichtige mich" },
  "wings.female.purpose.text": { 
    pl: "Skrzydło Kobiece powstaje, aby zjednoczyć głos polskich kobiet w ruchu narodowym. Szczegóły wkrótce.", 
    en: "The Female Wing is being established to unite the voice of Polish women in the national movement. Details coming soon.", 
    de: "Der Frauenflügel wird gegründet, um die Stimme der polnischen Frauen in der nationalen Bewegung zu vereinen. Details folgen in Kürze." 
  },
  
  // Wing page common
  "wings.back": { pl: "Powrót do Skrzydeł", en: "Back to Wings", de: "Zurück zu Flügeln" },
  "wings.joinCta": { pl: "Dołącz teraz", en: "Join now", de: "Jetzt beitreten" },
  "wings.contactCta": { pl: "Skontaktuj się", en: "Get in touch", de: "Kontakt aufnehmen" },
  
  // Mission summary (homepage)
  "mission.summary": { 
    pl: "Budujemy silną, zjednoczoną Polskę zakorzenioną w tradycji i tożsamości narodowej. Odrzucamy liberalizm i globalizm. Stawiamy naród ponad wszystkim.", 
    en: "We are building a strong, unified Poland rooted in tradition and national identity. We reject liberalism and globalism. We place the nation above all.", 
    de: "Wir bauen ein starkes, vereintes Polen auf, das in Tradition und nationaler Identität verwurzelt ist. Wir lehnen Liberalismus und Globalismus ab. Wir stellen die Nation über alles." 
  },
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
    return translation[locale];
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
        aria-label="Polski"
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
        aria-label="English"
      >
        EN
      </button>
      <span className="text-muted-foreground">/</span>
      <button
        onClick={() => setLocale("de")}
        className={`px-2 py-1 rounded transition-colors ${
          locale === "de" 
            ? "bg-primary text-primary-foreground" 
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="Deutsch"
      >
        DE
      </button>
    </div>
  );
}
