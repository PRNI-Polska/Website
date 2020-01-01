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
  "nav.merch": { pl: "Merch", en: "Merch", de: "Merch" },
  "nav.logout": { pl: "Wyloguj", en: "Logout", de: "Abmelden" },

  // Merch
  "merch.title": { pl: "Merch", en: "Merch", de: "Merch" },
  "merch.subtitle": { pl: "Oficjalny merch PRNI — dostępny wyłącznie dla członków.", en: "Official PRNI merchandise — available exclusively for members.", de: "Offizielles PRNI-Merchandise — exklusiv für Mitglieder." },
  "merch.loading": { pl: "Ładowanie produktów...", en: "Loading products...", de: "Produkte werden geladen..." },
  "merch.error": { pl: "Nie udało się załadować produktów.", en: "Failed to load products.", de: "Produkte konnten nicht geladen werden." },
  "merch.retry": { pl: "Spróbuj ponownie", en: "Try again", de: "Erneut versuchen" },
  "merch.empty": { pl: "Brak dostępnych produktów.", en: "No products available yet.", de: "Noch keine Produkte verfügbar." },
  "merch.variants": { pl: "warianty", en: "variants", de: "Varianten" },
  "merch.variant": { pl: "wariant", en: "variant", de: "Variante" },
  "merch.from": { pl: "od", en: "from", de: "ab" },
  "merch.size": { pl: "Rozmiar", en: "Size", de: "Größe" },
  "merch.color": { pl: "Kolor", en: "Color", de: "Farbe" },
  "merch.price": { pl: "Cena", en: "Price", de: "Preis" },
  "merch.addToCart": { pl: "Dodaj do koszyka", en: "Add to cart", de: "In den Warenkorb" },
  "merch.backToStore": { pl: "Wróć do sklepu", en: "Back to store", de: "Zurück zum Shop" },
  "merch.selectVariant": { pl: "Wybierz wariant", en: "Select a variant", de: "Variante wählen" },
  "merch.cart": { pl: "Koszyk", en: "Cart", de: "Warenkorb" },
  "merch.cartEmpty": { pl: "Koszyk jest pusty", en: "Cart is empty", de: "Warenkorb ist leer" },
  "merch.total": { pl: "Razem", en: "Total", de: "Gesamt" },
  "merch.checkout": { pl: "Zamów", en: "Checkout", de: "Bestellen" },
  "merch.remove": { pl: "Usuń", en: "Remove", de: "Entfernen" },
  "merch.qty": { pl: "Ilość", en: "Qty", de: "Menge" },
  "merch.orderPlaced": { pl: "Zamówienie złożone!", en: "Order placed!", de: "Bestellung aufgegeben!" },
  "merch.orderPlacedDesc": { pl: "Skontaktujemy się z Tobą w sprawie płatności i dostawy.", en: "We'll contact you about payment and delivery.", de: "Wir kontaktieren dich bezüglich Zahlung und Lieferung." },
  "merch.orderError": { pl: "Nie udało się złożyć zamówienia.", en: "Failed to place order.", de: "Bestellung fehlgeschlagen." },
  "merch.ordering": { pl: "Składanie zamówienia...", en: "Placing order...", de: "Bestellung wird aufgegeben..." },
  "merch.currency": { pl: "Waluta", en: "Currency", de: "Währung" },
  "merch.shippingInfo": { pl: "Dane wysyłki", en: "Shipping details", de: "Versanddetails" },
  "merch.fullName": { pl: "Imię i nazwisko", en: "Full name", de: "Vollständiger Name" },
  "merch.address": { pl: "Adres", en: "Address", de: "Adresse" },
  "merch.addressLine2": { pl: "Adres cd. (opcjonalnie)", en: "Apt, suite, etc. (optional)", de: "Adresszusatz (optional)" },
  "merch.city": { pl: "Miasto", en: "City", de: "Stadt" },
  "merch.stateRegion": { pl: "Województwo / Region", en: "State / Region", de: "Bundesland / Region" },
  "merch.postalCode": { pl: "Kod pocztowy", en: "Postal code", de: "Postleitzahl" },
  "merch.country": { pl: "Kraj", en: "Country", de: "Land" },
  "merch.phone": { pl: "Telefon (opcjonalnie)", en: "Phone (optional)", de: "Telefon (optional)" },
  "merch.email": { pl: "Email", en: "Email", de: "E-Mail" },
  "merch.placeOrder": { pl: "Złóż zamówienie", en: "Place order", de: "Bestellung aufgeben" },
  "merch.calculateShipping": { pl: "Oblicz dostawę", en: "Calculate shipping", de: "Versand berechnen" },
  "merch.payNow": { pl: "Zapłać", en: "Pay now", de: "Jetzt bezahlen" },
  "merch.redirectingToPayment": { pl: "Przekierowanie do płatności...", en: "Redirecting to payment...", de: "Weiterleitung zur Zahlung..." },
  "merch.orderPaid": { pl: "Płatność przebiegła pomyślnie!", en: "Payment successful!", de: "Zahlung erfolgreich!" },
  "merch.orderPaidDesc": { pl: "Twoje zamówienie zostało opłacone i przekazane do realizacji. Otrzymasz email z potwierdzeniem.", en: "Your order has been paid and submitted for fulfillment. You'll receive a confirmation email.", de: "Deine Bestellung wurde bezahlt und zur Erfüllung übermittelt. Du erhältst eine Bestätigungs-E-Mail." },
  "merch.orderCancelled": { pl: "Płatność anulowana", en: "Payment cancelled", de: "Zahlung storniert" },
  "merch.orderCancelledDesc": { pl: "Płatność została anulowana. Możesz spróbować ponownie.", en: "Payment was cancelled. You can try again.", de: "Zahlung wurde storniert. Du kannst es erneut versuchen." },
  "merch.shippingEstimate": { pl: "Szacowany koszt dostawy", en: "Estimated shipping", de: "Geschätzte Versandkosten" },
  "merch.freeShipping": { pl: "Darmowa dostawa", en: "Free shipping", de: "Kostenloser Versand" },
  "merch.backToCart": { pl: "Wróć do koszyka", en: "Back to cart", de: "Zurück zum Warenkorb" },
  "merch.subtotal": { pl: "Produkty", en: "Subtotal", de: "Zwischensumme" },
  "merch.shipping": { pl: "Wysyłka", en: "Shipping", de: "Versand" },
  "merch.tax": { pl: "Podatek", en: "Tax", de: "Steuer" },
  "merch.estimating": { pl: "Obliczanie kosztów...", en: "Estimating costs...", de: "Kosten werden berechnet..." },
  "merch.requiredField": { pl: "To pole jest wymagane", en: "This field is required", de: "Dieses Feld ist erforderlich" },
  "merch.orderConfirmed": { pl: "Zamówienie zostało złożone jako szkic w Printful. Skontaktujemy się w sprawie płatności.", en: "Order submitted as draft to Printful. We'll contact you about payment.", de: "Bestellung als Entwurf an Printful übermittelt. Wir kontaktieren dich zur Zahlung." },

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

  // Channel names
  "channel.Powitanie": { pl: "Powitanie", en: "Welcome", de: "Willkommen" },
  "channel.Ogólne": { pl: "Ogólne", en: "General", de: "Allgemein" },
  "channel.Zarząd": { pl: "Zarząd", en: "Board", de: "Vorstand" },
  "channel.Skrzydło Główne": { pl: "Skrzydło Główne", en: "Main Wing", de: "Hauptflügel" },
  "channel.Międzynarodowe": { pl: "Międzynarodowe", en: "International", de: "International" },
  "channel.Ogłoszenia wewnętrzne": { pl: "Ogłoszenia wewnętrzne", en: "Internal Announcements", de: "Interne Ankündigungen" },

  // Channel descriptions
  "channelDesc.Powitanie": { pl: "Kanał powitalny dla nowych członków", en: "Welcome channel for new members", de: "Willkommenskanal für neue Mitglieder" },
  "channelDesc.Ogólne": { pl: "Kanał ogólny dla zweryfikowanych członków", en: "General channel for verified members", de: "Allgemeiner Kanal für verifizierte Mitglieder" },
  "channelDesc.Zarząd": { pl: "Kanał zarządu i kadry kierowniczej", en: "Board and leadership channel", de: "Vorstand- und Leitungskanal" },
  "channelDesc.Skrzydło Główne": { pl: "Kanał dla członków skrzydła głównego", en: "Channel for main wing members", de: "Kanal für Hauptflügel-Mitglieder" },
  "channelDesc.Międzynarodowe": { pl: "Kanał dla skrzydła międzynarodowego", en: "Channel for international wing members", de: "Kanal für internationale Mitglieder" },
  "channelDesc.Ogłoszenia wewnętrzne": { pl: "Ważne ogłoszenia dla zweryfikowanych członków", en: "Important announcements for verified members", de: "Wichtige Ankündigungen für verifizierte Mitglieder" },

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
