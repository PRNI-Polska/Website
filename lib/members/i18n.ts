export type MemberLang = "pl" | "en" | "de";

export const memberTranslations = {
  // Login
  "login.title": { pl: "Strefa Członkowska", en: "Members Area", de: "Mitgliederbereich" },
  "login.subtitle": { pl: "Polski Ruch Narodowo-Integralistyczny", en: "Polish National-Integralist Movement", de: "Polnische National-Integralistische Bewegung" },
  "login.email": { pl: "Email", en: "Email", de: "E-Mail" },
  "login.password": { pl: "Hasło", en: "Password", de: "Passwort" },
  "login.submit": { pl: "Zaloguj się", en: "Sign in", de: "Anmelden" },
  "login.loading": { pl: "Logowanie...", en: "Signing in...", de: "Anmeldung..." },
  "login.noAccount": { pl: "Nie masz konta?", en: "Don't have an account?", de: "Kein Konto?" },
  "login.register": { pl: "Zarejestruj się z kodem zaproszenia", en: "Register with invite code", de: "Mit Einladungscode registrieren" },
  "login.error": { pl: "Logowanie nie powiodło się", en: "Login failed", de: "Anmeldung fehlgeschlagen" },

  // Register
  "register.title": { pl: "Rejestracja", en: "Register", de: "Registrieren" },
  "register.subtitle": { pl: "Utwórz konto za pomocą kodu zaproszenia", en: "Create your account with an invite code", de: "Erstelle dein Konto mit einem Einladungscode" },
  "register.inviteCode": { pl: "Kod zaproszenia", en: "Invite code", de: "Einladungscode" },
  "register.displayName": { pl: "Imię / pseudonim", en: "Display name", de: "Anzeigename" },
  "register.email": { pl: "Email", en: "Email", de: "E-Mail" },
  "register.password": { pl: "Hasło", en: "Password", de: "Passwort" },
  "register.confirmPassword": { pl: "Potwierdź hasło", en: "Confirm password", de: "Passwort bestätigen" },
  "register.submit": { pl: "Utwórz konto", en: "Create account", de: "Konto erstellen" },
  "register.loading": { pl: "Tworzenie konta...", en: "Creating account...", de: "Konto wird erstellt..." },
  "register.hasAccount": { pl: "Masz już konto?", en: "Already have an account?", de: "Bereits ein Konto?" },
  "register.login": { pl: "Zaloguj się", en: "Sign in", de: "Anmelden" },
  "register.success": { pl: "Konto utworzone", en: "Account created", de: "Konto erstellt" },
  "register.successMsg": { pl: "Możesz się teraz zalogować.", en: "You can now sign in.", de: "Du kannst dich jetzt anmelden." },
  "register.goToLogin": { pl: "Zaloguj się", en: "Go to login", de: "Zur Anmeldung" },
  "register.passwordMismatch": { pl: "Hasła nie są identyczne", en: "Passwords do not match", de: "Passwörter stimmen nicht überein" },
  "register.minChars": { pl: "Min. 8 znaków", en: "Min. 8 characters", de: "Mind. 8 Zeichen" },
  "register.uppercase": { pl: "Wielka litera", en: "Uppercase letter", de: "Großbuchstabe" },
  "register.lowercase": { pl: "Mała litera", en: "Lowercase letter", de: "Kleinbuchstabe" },
  "register.number": { pl: "Cyfra", en: "Number", de: "Zahl" },
  "register.weak": { pl: "Słabe", en: "Weak", de: "Schwach" },
  "register.fair": { pl: "Średnie", en: "Fair", de: "Mittel" },
  "register.good": { pl: "Dobre", en: "Good", de: "Gut" },
  "register.strong": { pl: "Silne", en: "Strong", de: "Stark" },
  "register.yourName": { pl: "Twoje imię", en: "Your name", de: "Dein Name" },
  "register.fullName": { pl: "Imię i nazwisko", en: "Full legal name", de: "Vollständiger Name" },
  "register.fullNamePlaceholder": { pl: "Jan Kowalski", en: "John Smith", de: "Max Mustermann" },
  "register.location": { pl: "Miejscowość", en: "Location", de: "Ort" },
  "register.locationPlaceholder": { pl: "Warszawa, Polska", en: "Warsaw, Poland", de: "Warschau, Polen" },
  "register.yourEmail": { pl: "twoj@email.com", en: "your@email.com", de: "deine@email.de" },
  "register.repeatPassword": { pl: "Powtórz hasło", en: "Repeat password", de: "Passwort wiederholen" },
  "register.error": { pl: "Rejestracja nie powiodła się", en: "Registration failed", de: "Registrierung fehlgeschlagen" },
  "register.genericError": { pl: "Wystąpił błąd. Spróbuj ponownie.", en: "An error occurred. Try again.", de: "Ein Fehler ist aufgetreten. Versuche es erneut." },

  // Nav
  "nav.news": { pl: "Aktualności", en: "News", de: "Neuigkeiten" },
  "nav.channels": { pl: "Kanały", en: "Channels", de: "Kanäle" },
  "nav.messages": { pl: "Wiadomości", en: "Messages", de: "Nachrichten" },
  "nav.documents": { pl: "Dokumenty", en: "Documents", de: "Dokumente" },
  "nav.logout": { pl: "Wyloguj", en: "Logout", de: "Abmelden" },

  // Home / News
  "home.title": { pl: "Aktualności", en: "News", de: "Neuigkeiten" },
  "home.subtitle": { pl: "Blog, ogłoszenia i najnowsze informacje", en: "Blog, announcements and latest updates", de: "Blog, Ankündigungen und neueste Updates" },
  "home.noPosts": { pl: "Brak postów.", en: "No posts.", de: "Keine Beiträge." },
  "home.blog": { pl: "Blog", en: "Blog", de: "Blog" },
  "home.announcement": { pl: "Ogłoszenie", en: "Announcement", de: "Ankündigung" },

  // Channels
  "channels.title": { pl: "Kanały", en: "Channels", de: "Kanäle" },
  "channels.noChannels": { pl: "Brak kanałów.", en: "No channels yet.", de: "Noch keine Kanäle." },
  "channels.noChannelsHint": { pl: "Administrator musi najpierw utworzyć kanały.", en: "An admin needs to create channels first.", de: "Ein Admin muss zuerst Kanäle erstellen." },
  "channels.noMessages": { pl: "Brak wiadomości.", en: "No messages yet.", de: "Noch keine Nachrichten." },
  "channels.firstMessage": { pl: "Napisz coś pierwszy!", en: "Be the first to say something!", de: "Sei der Erste, der etwas schreibt!" },
  "channels.writeIn": { pl: "Napisz w", en: "Write in", de: "Schreibe in" },
  "channels.writeMessage": { pl: "Napisz wiadomość...", en: "Write a message...", de: "Nachricht schreiben..." },
  "channels.loadOlder": { pl: "Załaduj starsze", en: "Load older", de: "Ältere laden" },

  // Messages / DMs
  "messages.title": { pl: "Wiadomości", en: "Messages", de: "Nachrichten" },
  "messages.new": { pl: "Nowa wiadomość", en: "New message", de: "Neue Nachricht" },
  "messages.search": { pl: "Szukaj...", en: "Search...", de: "Suchen..." },
  "messages.noConversations": { pl: "Brak rozmów", en: "No conversations", de: "Keine Gespräche" },
  "messages.startNew": { pl: "Rozpocznij nową rozmowę", en: "Start a new conversation", de: "Neues Gespräch beginnen" },
  "messages.selectConversation": { pl: "Wybierz rozmowę", en: "Select a conversation", de: "Wähle ein Gespräch" },
  "messages.noMessages": { pl: "Brak wiadomości", en: "No messages", de: "Keine Nachrichten" },
  "messages.sayHello": { pl: "Napisz coś!", en: "Say hello!", de: "Schreib was!" },
  "messages.writeMessage": { pl: "Napisz wiadomość...", en: "Write a message...", de: "Nachricht schreiben..." },
  "messages.you": { pl: "Ty", en: "You", de: "Du" },
  "messages.yesterday": { pl: "Wczoraj", en: "Yesterday", de: "Gestern" },
  "messages.today": { pl: "Dzisiaj", en: "Today", de: "Heute" },
  "messages.loadOlder": { pl: "Załaduj starsze", en: "Load older", de: "Ältere laden" },
  "messages.notFound": { pl: "Nie znaleziono", en: "Not found", de: "Nicht gefunden" },
  "messages.newMessage": { pl: "Nowa wiadomość", en: "New message", de: "Neue Nachricht" },

  // Documents
  "documents.title": { pl: "Dokumenty", en: "Documents", de: "Dokumente" },
  "documents.subtitle": { pl: "Prywatne dokumenty i materiały", en: "Private documents and resources", de: "Private Dokumente und Materialien" },
  "documents.noDocs": { pl: "Brak dokumentów.", en: "No documents.", de: "Keine Dokumente." },
  "documents.pinned": { pl: "Przypięte", en: "Pinned", de: "Angeheftet" },
  "documents.readMore": { pl: "Czytaj więcej", en: "Read more", de: "Mehr lesen" },
  "documents.showLess": { pl: "Zwiń", en: "Show less", de: "Weniger" },

  // Roles
  "role.ADMIN": { pl: "Admin", en: "Admin", de: "Admin" },
  "role.LEADERSHIP": { pl: "Kadra", en: "Leadership", de: "Leitung" },
  "role.MAIN_WING": { pl: "Główne", en: "Main", de: "Haupt" },
  "role.INTERNATIONAL": { pl: "INT", en: "INT", de: "INT" },
  "role.FEMALE_WING": { pl: "Kobiece", en: "Female", de: "Frauen" },
  "role.MEMBER": { pl: "Członek", en: "Member", de: "Mitglied" },

  // Messages - read receipts
  "messages.seen": { pl: "Widziane", en: "Seen", de: "Gesehen" },
  "messages.delivered": { pl: "Dostarczone", en: "Delivered", de: "Zugestellt" },

  // Profile
  "profile.title": { pl: "Profil", en: "Profile", de: "Profil" },
  "profile.bio": { pl: "O mnie", en: "About me", de: "Über mich" },
  "profile.bioPlaceholder": { pl: "Napisz coś o sobie...", en: "Write something about yourself...", de: "Schreibe etwas über dich..." },
  "profile.photo": { pl: "Zdjęcie (URL)", en: "Photo (URL)", de: "Foto (URL)" },
  "profile.save": { pl: "Zapisz", en: "Save", de: "Speichern" },
  "profile.saved": { pl: "Zapisano", en: "Saved", de: "Gespeichert" },
  "profile.memberSince": { pl: "Członek od", en: "Member since", de: "Mitglied seit" },
  "profile.sendMessage": { pl: "Wyślij wiadomość", en: "Send message", de: "Nachricht senden" },
  "profile.name": { pl: "Imię", en: "Name", de: "Name" },

  // Post views
  "home.views": { pl: "wyświetleń", en: "views", de: "Aufrufe" },

  // Common
  "common.error": { pl: "Wystąpił błąd. Spróbuj ponownie.", en: "An error occurred. Try again.", de: "Ein Fehler ist aufgetreten. Versuche es erneut." },
} as const;

export type MemberTranslationKey = keyof typeof memberTranslations;

export function mt(key: MemberTranslationKey, lang: MemberLang): string {
  const entry = memberTranslations[key];
  return entry[lang] || entry.pl;
}
