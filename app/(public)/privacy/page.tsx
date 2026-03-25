// file: app/(public)/privacy/page.tsx
"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function PrivacyPage() {
  const { t } = useI18n();
  const org = `PRNI — ${t("party.name.full")}`;

  return (
    <div className="container-custom py-12 md:py-16">
      <article className="max-w-3xl mx-auto space-y-10">
        <header className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">
            Polityka prywatności
          </h1>
          <p className="text-sm text-muted-foreground">
            Ostatnia aktualizacja: marzec 2026 · Serwis:{" "}
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
            1. Administrator danych
          </h2>
          <p className="text-foreground/90 leading-relaxed">
            Administratorem danych osobowych przetwarzanych w związku z korzystaniem z serwisu internetowego{" "}
            <span className="text-foreground">www.prni.org.pl</span> jest{" "}
            <strong className="text-foreground font-medium">{org}</strong> (dalej: „Administrator”).
          </p>
          <p className="text-foreground/90 leading-relaxed">
            W sprawach dotyczących ochrony danych osobowych możesz skontaktować się z Administratorem pod adresem e-mail:{" "}
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
            2. Jakie dane zbieramy i w jakim celu
          </h2>
          <p className="text-foreground/90 leading-relaxed">
            W zależności od tego, z jakiej funkcji serwisu korzystasz, możemy przetwarzać m.in.:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-foreground/90 leading-relaxed text-muted-foreground">
            <li>
              <span className="text-foreground/90">
                dane techniczne i logi serwera (np. adres IP, data i czas żądania, typ przeglądarki) — w celu zapewnienia
                działania strony, bezpieczeństwa oraz rozwiązywania problemów technicznych;
              </span>
            </li>
            <li>
              <span className="text-foreground/90">
                dane podane dobrowolnie w formularzach (np. imię i nazwisko, adres e-mail, treść wiadomości) — w celu
                udzielenia odpowiedzi lub realizacji zgłoszenia;
              </span>
            </li>
            <li>
              <span className="text-foreground/90">
                dane związane z zapisem na newsletter (zwykle adres e-mail) — w celu wysyłki informacji, o ile wyraziłeś
                na to zgodę;
              </span>
            </li>
            <li>
              <span className="text-foreground/90">
                dane z formularzy rekrutacyjnych — w celu rozpatrzenia aplikacji i kontaktu w sprawie członkostwa lub
                współpracy, w zakresie niezbędnym do tego procesu.
              </span>
            </li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Podstawą prawną przetwarzania może być m.in. wykonanie umowy lub podjęcie działań przed jej zawarciem na Twoje
            żądanie (art. 6 ust. 1 lit. b RODO), prawnie uzasadniony interes Administratora (art. 6 ust. 1 lit. f RODO), np.
            bezpieczeństwo IT i statystyka zanonimizowana, lub Twoja zgoda (art. 6 ust. 1 lit. a RODO), gdy jest wymagana.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-heading font-semibold">
            3. Pliki cookie i podobne technologie
          </h2>
          <p className="text-foreground/90 leading-relaxed">
            Serwis może wykorzystywać pliki cookie oraz podobne mechanizmy (np. local storage) w celu zapewnienia
            podstawowego działania strony, zapamiętywania preferencji (np. języka) oraz — jeśli to wdrożone — w celach
            analitycznych. Możesz zarządzać plikami cookie w ustawieniach swojej przeglądarki.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-heading font-semibold">4. Analityka</h2>
          <p className="text-foreground/90 leading-relaxed">
            Jeśli korzystamy z narzędzi analitycznych (np. do zrozumienia ruchu na stronie), dane mogą być zbierane w formie
            zagregowanej lub pseudonimizowanej. Szczegóły zależą od konkretnego narzędzia; w razie stosowania analityki
            wymagającej zgody, poprosimy o nią zgodnie z obowiązującym prawem.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-heading font-semibold">5. Newsletter</h2>
          <p className="text-foreground/90 leading-relaxed">
            Zapis na newsletter jest dobrowolny. Adres e-mail wykorzystujemy wyłącznie do wysyłki treści związanych z
            działalnością {org}, o ile nie wskażemy inaczej. Możesz w każdej chwili zrezygnować z otrzymywania wiadomości
            (link rezygnacji w stopce maila lub kontakt na adres podany powyżej).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-heading font-semibold">6. Formularze kontaktowe</h2>
          <p className="text-foreground/90 leading-relaxed">
            Dane z formularza kontaktowego przetwarzamy w celu udzielenia odpowiedzi i obsługi korespondencji. Nie
            wykorzystujemy ich do marketingu bez odrębnej zgody, chyba że jednoznacznie z niej korzystasz.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-heading font-semibold">7. Formularze rekrutacyjne</h2>
          <p className="text-foreground/90 leading-relaxed">
            Informacje przekazane w procesie rekrutacji lub zgłoszenia członkowskiego przetwarzamy wyłącznie w zakresie
            potrzebnym do rozpatrzenia zgłoszenia i dalszego kontaktu. Okres przechowywania zależy od charakteru procesu i
            obowiązujących przepisów; po jego zakończeniu dane usuwamy lub ograniczamy przetwarzanie, jeśli przepisy nie
            wymagają dłuższego archiwizowania.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-heading font-semibold">
            8. Usługi podmiotów trzecich
          </h2>
          <p className="text-foreground/90 leading-relaxed">
            W związku z działalnością serwisu mogą być wykorzystywani dostawcy zewnętrzni, którzy przetwarzają dane w
            swoim imieniu lub jako podmioty przetwarzające na zlecenie Administratora, m.in.:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-foreground/90 leading-relaxed text-muted-foreground">
            <li>
              <span className="text-foreground/90">
                <strong className="text-foreground font-medium">Stripe</strong> — obsługa płatności online. Przy składaniu
                zamówienia lub darowizny dane płatnicze przetwarza Stripe zgodnie z własną polityką prywatności i regulaminem.
              </span>
            </li>
            <li>
              <span className="text-foreground/90">
                <strong className="text-foreground font-medium">Gelato</strong> (lub powiązany operator realizacji) —
                produkcja i wysyłka zamówień merchu. Dane niezbędne do realizacji dostawy (np. adres) mogą być przekazywane
                temu partnerowi wyłącznie w celu wykonania zamówienia.
              </span>
            </li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Zachęcamy do zapoznania się z dokumentami prywatności tych usług na ich stronach.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-heading font-semibold">
            9. Okres przechowywania i bezpieczeństwo
          </h2>
          <p className="text-foreground/90 leading-relaxed">
            Przechowujemy dane tak długo, jak jest to niezbędne do realizacji celów, dla których zostały zebrane, oraz przez
            okres wymagany przepisami prawa. Stosujemy środki organizacyjne i techniczne odpowiednie do ryzyka, aby chronić
            dane przed nieuprawnionym dostępem, utratą lub zmianą.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl md:text-2xl font-heading font-semibold">
            10. Twoje prawa (RODO)
          </h2>
          <p className="text-foreground/90 leading-relaxed">
            Przysługują Ci m.in. następujące prawa w zakresie danych osobowych:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-foreground/90 leading-relaxed text-muted-foreground">
            <li>
              <span className="text-foreground/90">
                <strong className="text-foreground font-medium">Dostęp</strong> — uzyskanie informacji, czy i jakie dane
                przetwarzamy;
              </span>
            </li>
            <li>
              <span className="text-foreground/90">
                <strong className="text-foreground font-medium">Sprostowanie</strong> — poprawienie nieprawidłowych danych;
              </span>
            </li>
            <li>
              <span className="text-foreground/90">
                <strong className="text-foreground font-medium">Usunięcie („prawo do bycia zapomnianym”)</strong> — w
                przypadkach przewidzianych prawem;
              </span>
            </li>
            <li>
              <span className="text-foreground/90">
                <strong className="text-foreground font-medium">Ograniczenie przetwarzania</strong>;
              </span>
            </li>
            <li>
              <span className="text-foreground/90">
                <strong className="text-foreground font-medium">Przenoszenie danych</strong> — o ile dane przetwarzamy w
                sposób zautomatyzowany na podstawie zgody lub umowy;
              </span>
            </li>
            <li>
              <span className="text-foreground/90">
                <strong className="text-foreground font-medium">Sprzeciw</strong> — wobec przetwarzania opartego na
                prawnie uzasadnionym interesie, z przyczyn związanych z Twoją szczególną sytuacją;
              </span>
            </li>
            <li>
              <span className="text-foreground/90">
                <strong className="text-foreground font-medium">Cofnięcie zgody</strong> — w dowolnym momencie, bez wpływu
                na zgodność z prawem przetwarzania przed cofnięciem;
              </span>
            </li>
            <li>
              <span className="text-foreground/90">
                <strong className="text-foreground font-medium">Skarga</strong> — do organu nadzorczego (w Polsce: Prezes
                Urzędu Ochrony Danych Osobowych).
              </span>
            </li>
          </ul>
          <p className="text-foreground/90 leading-relaxed">
            Aby skorzystać z praw, napisz na{" "}
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
          <h2 className="text-xl md:text-2xl font-heading font-semibold">11. Zmiany polityki</h2>
          <p className="text-foreground/90 leading-relaxed">
            Możemy aktualizować niniejszą politykę, aby odzwierciedlić zmiany w serwisie lub w przepisach. Aktualna wersja
            będzie zawsze dostępna pod adresem{" "}
            <Link href="/privacy" className="text-primary hover:underline underline-offset-4">
              /privacy
            </Link>
            .
          </p>
        </section>

        <p className="text-xs text-muted-foreground/80 pt-2 border-t border-white/[0.06]">
          Niniejszy dokument ma charakter informacyjny i nie zastępuje indywidualnej porady prawnej. W razie wątpliwości
          skonsultuj się z doradcą lub organem nadzorczym.
        </p>
      </article>
    </div>
  );
}
