# [Einleitung](#introduction)

---

Hat.sh ist eine kostenlose [opensource] Web-App, die sichere Dateiverschlüsselung im Browser ermöglicht.

<br>

# [Funktionen](#features)

---

### Sicherheit

- [XChaCha20-Poly1305] - für symmetrische Verschlüsselung.
- [Argon2id] - für passwortbasierte Schlüsselableitung.
- [X25519] - für den Schlüsselaustausch.

Die libsodium-Bibliothek wird für alle kryptografischen Algorithmen verwendet. [Technische Details hier](#technical-details).

<br>

### Datenschutz

- Die App läuft lokal in deinem Browser.
- Es werden niemals Daten gesammelt oder an Dritte gesendet.​

<br>

### Funktionalität

- Sichere Ver-/Entschlüsselung von Dateien mit Passwörtern oder Schlüsseln.
- Sichere zufällige Passwortgenerierung.
- Asymmetrische Schlüsselpaar-Generierung.
- Authentifizierter Schlüsselaustausch.
- Schätzung der Passwortstärke.
- Peer-to-Peer verschlüsselte Dateiübertragung über WebRTC.

<br>

# [Installation](#installation)

---
Hat.sh lässt sich einfach selbst hosten und bereitstellen – entweder mit npm oder Docker.

Wenn du die App selbst hosten möchtest, folge diesen Anweisungen:

<br>

## Mit npm

Stelle vor der Installation sicher, dass [Node.js](https://nodejs.org/en/) installiert ist und du [npm](https://www.npmjs.com/) zur Verfügung hast.

<br >

1. GitHub-Repository klonen

```bash
git clone https://github.com/sh-dv/hat.sh.git hat.sh
```

2. In den Ordner wechseln

```bash
cd hat.sh
```

3. Abhängigkeiten installieren

```bash
npm install
```

4. App bauen

```bash
npm run build
```

5. Hat.sh starten

```bash
npm run start
```

Die App sollte auf Port 3391 laufen.
<br>

Wenn du die App in einer Entwicklungsumgebung starten möchtest:

<br>

```bash
npm run dev
```

<br>

## Mit Docker

Du kannst die App auf verschiedene Arten mit Docker installieren. Wähle die Methode, die dir am besten gefällt.

<br>

- #### Vom Docker Hub installieren

1. Image vom Docker Hub herunterladen

```bash
docker pull shdv/hat.sh:latest
```

2. Container starten

```bash
docker run -d -p 3991:80 shdv/hat.sh
```

<br>

- #### Image aus dem Quellcode erstellen

1. GitHub-Repository klonen

```bash
git clone https://github.com/sh-dv/hat.sh.git hat.sh
```

2. In den Ordner wechseln

```bash
cd hat.sh
```

3. Image mit Docker erstellen

```bash
docker build . -t shdv/hat.sh
```

4. Container starten

```bash
docker run -d -p 3991:80 shdv/hat.sh
```

<br>

- #### Mit Docker Compose

1. GitHub-Repository klonen

```bash
git clone https://github.com/sh-dv/hat.sh.git hat.sh
```

2. In den Ordner wechseln

```bash
cd hat.sh
```

3. Image mit Docker Compose erstellen

```bash
docker compose build
```

4. Container starten

```bash
docker compose up
```

<br>

Die App sollte auf Port 3991 laufen.

Hat.sh ist auch als Docker-Image verfügbar. Du findest es auf [Docker Hub].

<br>


# [Verwendung](#usage)

---

## Dateiverschlüsselung

- ### Mit einem Passwort

1. Öffne hat.sh.
2. Navigiere zum Verschlüsselungs-Panel.
3. Ziehe die Dateien per Drag & Drop hinein oder wähle die Dateien aus, die du verschlüsseln möchtest.
4. Gib ein Passwort ein oder generiere eines.
5. Lade die verschlüsselte Datei herunter.

> Du solltest immer ein starkes Passwort verwenden!

- ### Mit öffentlichen und privaten Schlüsseln

1. Öffne hat.sh.
2. Navigiere zum Verschlüsselungs-Panel.
3. Ziehe die Dateien per Drag & Drop hinein oder wähle die Dateien aus, die du verschlüsseln möchtest.
4. Wähle die Methode mit öffentlichem Schlüssel.
5. Gib den öffentlichen Schlüssel des Empfängers und deinen privaten Schlüssel ein oder lade sie.
   Falls du keine öffentlichen und privaten Schlüssel hast, kannst du ein Schlüsselpaar generieren.
6. Lade die verschlüsselte Datei herunter.
7. Teile deinen öffentlichen Schlüssel mit dem Empfänger, damit dieser die Datei entschlüsseln kann.

> Teile niemals deinen privaten Schlüssel mit anderen! Nur öffentliche Schlüssel sollten ausgetauscht werden.

<br>

## Dateientschlüsselung

- ### Mit einem Passwort

1. Öffne hat.sh.
2. Navigiere zum Entschlüsselungs-Panel.
3. Ziehe die Dateien per Drag & Drop hinein oder wähle die Dateien aus, die du entschlüsseln möchtest.
4. Gib das Verschlüsselungspasswort ein.
5. Lade die entschlüsselte Datei herunter.

- ### Mit öffentlichen und privaten Schlüsseln

1. Öffne hat.sh.
2. Navigiere zum Entschlüsselungs-Panel.
3. Ziehe die Dateien per Drag & Drop hinein oder wähle die Dateien aus, die du entschlüsseln möchtest.
4. Gib den öffentlichen Schlüssel des Absenders und deinen privaten Schlüssel ein oder lade sie.
5. Lade die entschlüsselte Datei herunter.

<br>

# [P2P-Übertragung](#p2p-transfer)

---

Hat.sh bietet eine Peer-to-Peer-Dateiübertragungsfunktion, mit der du Dateien direkt von einem Browser zum anderen senden kannst – Ende-zu-Ende-verschlüsselt.

<br>

### Funktionsweise

Dateien werden über [WebRTC](https://webrtc.org/) Data Channels direkt zwischen Browsern übertragen. Dabei werden keine Dateidaten über einen Server geleitet. Ein kleiner Signalisierungsserver wird nur verwendet, um die anfängliche Verbindung zwischen den Teilnehmern herzustellen.

<br>

### Eine Datei senden

1. Navigiere zum **Transfer**-Tab.
2. Wähle den **Senden**-Modus.
3. Wähle eine Datei zum Übertragen aus.
4. Gib ein Passwort ein (wird für die Ende-zu-Ende-Verschlüsselung verwendet).
5. Ein 3-Wort-Raumcode wird generiert (z.B. `tiger-moon-castle`).
6. Teile diesen Code mit dem Empfänger.
7. Sobald sich der Empfänger verbindet, startet die Übertragung automatisch.

<br>

### Eine Datei empfangen

1. Navigiere zum **Transfer**-Tab.
2. Wähle den **Empfangen**-Modus.
3. Gib den Raumcode ein, den der Absender mitgeteilt hat.
4. Gib dasselbe Passwort ein, das der Absender verwendet hat.
5. Die Datei wird übertragen, entschlüsselt und automatisch heruntergeladen.

<br>

### Sicherheit

- **Ende-zu-Ende-Verschlüsselung**: Dateien werden mit XChaCha20-Poly1305 verschlüsselt, bevor sie über den WebRTC Data Channel gesendet werden. Das Passwort wird niemals übertragen.
- **Schlüsselableitung**: Der Verschlüsselungsschlüssel wird mithilfe von Argon2id aus dem Passwort abgeleitet (wie bei der Dateiverschlüsselung).
- **Kein Server-Speicher**: Der Signalisierungsserver leitet nur Verbindungsmetadaten weiter (SDP-Angebote/-Antworten, ICE-Kandidaten). Er sieht weder die Dateidaten noch das Passwort.
- **Direktverbindung**: Sobald die WebRTC-Verbindung hergestellt ist, fließen die Daten direkt zwischen den Browsern (Peer-to-Peer). Falls eine direkte Verbindung nicht möglich ist, wird ein TURN-Relay-Server verwendet, die Daten bleiben jedoch verschlüsselt.

<br>

### Voraussetzungen

- Sowohl Sender als auch Empfänger benötigen einen modernen Browser (Chrome, Brave, Firefox, Edge).
- Beide benötigen eine Internetverbindung.
- Der Signalisierungsserver muss erreichbar sein.

<br>

# [Einschränkungen](#limitations)

---

### Dateisignatur

Mit hat.sh verschlüsselte Dateien sind anhand der Dateisignatur erkennbar, die von der App zur Überprüfung des Dateiinhalts verwendet wird. Solche Signaturen werden auch als Magic Numbers oder Magic Bytes bezeichnet. Diese Bytes sind authentifiziert und können nicht verändert werden.

### Safari und mobile Browser

Safari und mobile Browser sind aufgrund von Problemen im Zusammenhang mit Service-Workern auf eine einzelne Datei mit maximal 1 GB beschränkt. Darüber hinaus gilt diese Einschränkung auch, wenn die App den Service-Worker nicht registrieren kann (z.B. Firefox Privates Surfen).

<br>

# [Empfohlene Vorgehensweisen](#best-practices)

---

### Passwörter wählen

Die meisten Menschen haben Schwierigkeiten, Passwörter zu erstellen und sich zu merken, was zu schwachen Passwörtern und Passwort-Wiederverwendung führt. Passwortbasierte Verschlüsselung ist dadurch wesentlich unsicherer. Deshalb wird empfohlen, den integrierten Passwortgenerator zu verwenden und einen Passwort-Manager wie [Bitwarden] zu nutzen, in dem du das sichere Passwort speichern kannst.


Wenn du ein Passwort wählen möchtest, das du dir merken kannst, solltest du eine Passphrase aus 8 oder mehr Wörtern eingeben.

<br>

### Verschlüsselung mit öffentlichem Schlüssel statt Passwort verwenden

Wenn du eine Datei verschlüsselst, die du mit jemand anderem teilen möchtest, solltest du sie mit dem öffentlichen Schlüssel des Empfängers und deinem privaten Schlüssel verschlüsseln.

<br>

### Verschlüsselte Dateien teilen

Wenn du jemandem eine verschlüsselte Datei senden möchtest, empfiehlt es sich, deinen privaten Schlüssel und den öffentlichen Schlüssel des Empfängers zur Verschlüsselung der Datei zu verwenden.

Die Datei kann über jede sichere Datei-Sharing-App geteilt werden.

<br>

### Den öffentlichen Schlüssel teilen

Öffentliche Schlüssel dürfen geteilt werden. Sie können als `.public`-Datei oder als Text versendet werden.

> Teile niemals deinen privaten Schlüssel mit anderen! Nur öffentliche Schlüssel sollten ausgetauscht werden.

<br>

### Öffentliche und private Schlüssel speichern

Stelle sicher, dass du deine Verschlüsselungsschlüssel an einem sicheren Ort aufbewahrst und ein Backup auf einem externen Speicher erstellst.

Es wird nicht empfohlen, deinen privaten Schlüssel in einem Cloud-Speicher zu speichern!

<br>

### Entschlüsselungspasswörter teilen

Das Teilen von Entschlüsselungspasswörtern kann über eine sichere Ende-zu-Ende-verschlüsselte Messaging-App erfolgen. Es wird empfohlen, die Funktion _Selbstlöschende Nachrichten_ zu verwenden und das Passwort zu löschen, nachdem der Empfänger die Datei entschlüsselt hat.

> Verwende niemals dasselbe Passwort für verschiedene Dateien.

<br>

# [FAQ](#faq)

---

### Protokolliert oder speichert die App meine Daten?

Nein, hat.sh speichert niemals deine Daten. Die App läuft ausschließlich lokal in deinem Browser.

<hr style="height: 1px">

### Ist hat.sh kostenlos?

Ja, Hat.sh ist kostenlos und wird es immer bleiben. Bitte erwäge jedoch eine [Spende](https://github.com/sh-dv/hat.sh#donations), um das Projekt zu unterstützen.

<hr style="height: 1px">

### Welche Dateitypen werden unterstützt? Gibt es ein Dateigrößenlimit?

Hat.sh akzeptiert alle Dateitypen. Es gibt kein Dateigrößenlimit, d.h. Dateien jeder Größe können verschlüsselt werden.

Der Safari-Browser und mobile/Smartphone-Browser sind auf 1 GB beschränkt.

<hr style="height: 1px">

### Ich habe mein Passwort vergessen, kann ich meine Dateien trotzdem entschlüsseln?

Nein, wir kennen dein Passwort nicht. Stelle immer sicher, dass du deine Passwörter in einem Passwort-Manager speicherst.

<hr style="height: 1px">

### Warum sehe ich einen Hinweis mit "You have limited experience (single file, 1GB)"?

Das bedeutet, dass dein Browser die Service-Worker Fetch API nicht unterstützt. Daher bist du auf kleine Dateigrößen beschränkt. Siehe [Einschränkungen](#limitations) für weitere Informationen.

<hr style="height: 1px" id="why-need-private-key">

### Ist es sicher, meinen öffentlichen Schlüssel zu teilen?

Ja. Öffentliche Schlüssel dürfen geteilt werden. Sie können als `.public`-Datei oder als Text versendet werden.

Stelle jedoch sicher, dass du deinen privaten Schlüssel niemals mit anderen teilst!

<hr style="height: 1px">

### Warum fragt die App nach meinem privaten Schlüssel im Modus für Verschlüsselung mit öffentlichem Schlüssel?

Hat.sh verwendet authentifizierte Verschlüsselung. Der Absender muss seinen privaten Schlüssel bereitstellen. Aus beiden Schlüsseln wird ein neuer gemeinsamer Schlüssel berechnet, um die Datei zu verschlüsseln. Der Empfänger muss beim Entschlüsseln ebenfalls seinen privaten Schlüssel angeben. Auf diese Weise kann überprüft werden, dass die verschlüsselte Datei nicht manipuliert wurde und vom tatsächlichen Absender stammt.

<hr style="height: 1px">

### Ich habe meinen privaten Schlüssel verloren, kann er wiederhergestellt werden?

Nein. Verlorene private Schlüssel können nicht wiederhergestellt werden.

Wenn du außerdem das Gefühl hast, dass dein privater Schlüssel kompromittiert wurde (z.B. versehentlich geteilt / Computer gehackt), musst du alle Dateien entschlüsseln, die mit diesem Schlüssel verschlüsselt wurden, ein neues Schlüsselpaar generieren und die Dateien erneut verschlüsseln.

<hr style="height: 1px">

### Wie generiere ich ein Schlüsselpaar (öffentlich & privat)?

Du kannst Schlüssel auf der [Schlüsselgenerierungsseite](https://hat.sh/generate-keys) erstellen. Stelle sicher, dass du die [Schlüssel sicher aufbewahrst](#best-practices).

<hr style="height: 1px">

### Misst die App die Passwortstärke?

Wir verwenden die [zxcvbn](https://github.com/dropbox/zxcvbn) JavaScript-Implementierung, um die Entropie der Passworteingabe zu prüfen. Diese Entropie wird in einen Wert umgerechnet, der auf dem Bildschirm angezeigt wird.

<hr style="height: 1px">

### Stellt die App eine Internetverbindung her?

Sobald du die Website besuchst und die Seite geladen ist, läuft sie nur noch offline.

<hr style="height: 1px">

### Wie kann ich beitragen?

Hat.sh ist eine Open-Source-Anwendung. Du kannst helfen, sie zu verbessern, indem du Beiträge auf GitHub machst. Das Projekt wird in meiner Freizeit gepflegt. [Spenden](https://github.com/sh-dv/hat.sh#donations) jeder Höhe sind willkommen.

<hr style="height: 1px">

### Wie melde ich Fehler?

Bitte melde Fehler über [Github], indem du ein Issue mit dem Label "bug" erstellst.

<hr style="height: 1px">

### Wie melde ich eine Sicherheitslücke?

Wenn du eine gültige Sicherheitslücke findest, schreibe bitte eine E-Mail an hatsh-security@pm.me

Es gibt derzeit kein Bug-Bounty-Programm, aber dein GitHub-Konto wird im Danksagungsbereich der App-Dokumentation erwähnt.

<hr style="height: 1px">

### Warum sollte ich hat.sh verwenden?

1. Die App verwendet schnelle, moderne und sichere kryptografische Algorithmen.
2. Sie ist extrem schnell und einfach zu bedienen.
3. Sie läuft im Browser – keine Installation oder Einrichtung nötig.
4. Sie ist kostenlose Open-Source-Software und lässt sich einfach selbst hosten.

<hr style="height: 1px">

### Wann sollte ich hat.sh nicht verwenden?

1. Wenn du eine Festplatte verschlüsseln möchtest (z.B. [VeraCrypt]).
2. Wenn du häufig auf verschlüsselte Dateien zugreifen möchtest (z.B. [Cryptomator]).
3. Wenn du Dateien im selben Tool verschlüsseln und signieren möchtest (z.B. [Kryptor]).
4. Wenn du ein Kommandozeilen-Tool bevorzugst (z.B. [Kryptor]).
5. Wenn du etwas möchtest, das Industriestandards entspricht, verwende [GPG].

<br>

# [Technische Details](#technical-details)

---

### Passwort-Hashing und Schlüsselableitung

Passwort-Hashing-Funktionen leiten einen geheimen Schlüssel beliebiger Größe aus einem Passwort und einem Salt ab.

<br>

<div class="codeBox">

```javascript
let salt = sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);
let key = sodium.crypto_pwhash(
  sodium.crypto_secretstream_xchacha20poly1305_KEYBYTES,
  password,
  salt,
  sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
  sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
  sodium.crypto_pwhash_ALG_ARGON2ID13
);
```

</div>

Die Funktion `crypto_pwhash()` leitet einen 256 Bit langen Schlüssel aus einem Passwort und einem Salt ab, dessen feste Länge 128 Bit beträgt und das unvorhersagbar sein sollte.

`randombytes_buf()` ist der einfachste Weg, die 128 Bit des Salts zu befüllen.

<br>

`OPSLIMIT` repräsentiert die maximale Anzahl der durchzuführenden Berechnungen.

`MEMLIMIT` ist die maximale Menge an RAM in Bytes, die die Funktion verwenden wird.

<br>

`crypto_pwhash_OPSLIMIT_INTERACTIVE` und `crypto_pwhash_MEMLIMIT_INTERACTIVE` stellen die Basiswerte für diese beiden Parameter bereit. Dies erfordert derzeit 64 MiB dedizierten RAM, was für Operationen im Browser geeignet ist.
<br>
`crypto_pwhash_ALG_ARGON2ID13` verwendet den Argon2id-Algorithmus Version 1.3.

<br>

### Dateiverschlüsselung (Stream)

Um eine Datei mit der App zu verschlüsseln, muss der Benutzer eine gültige Datei und ein Passwort angeben. Dieses Passwort wird gehasht und daraus wird mit Argon2id ein sicherer Schlüssel abgeleitet, um die Datei zu verschlüsseln.

<br>

<div class="codeBox">

```javascript
let res = sodium.crypto_secretstream_xchacha20poly1305_init_push(key);
header = res.header;
state = res.state;

let tag = last
  ? sodium.crypto_secretstream_xchacha20poly1305_TAG_FINAL
  : sodium.crypto_secretstream_xchacha20poly1305_TAG_MESSAGE;

let encryptedChunk = sodium.crypto_secretstream_xchacha20poly1305_push(
  state,
  new Uint8Array(chunk),
  null,
  tag
);

stream.enqueue(signature, salt, header, encryptedChunk);
```

</div>

Die Funktion `crypto_secretstream_xchacha20poly1305_init_push` erstellt einen verschlüsselten Stream, bei dem ein `state` unter Verwendung des Schlüssels und eines internen, automatisch generierten Initialisierungsvektors initialisiert wird. Anschließend wird der Stream-Header in `header` gespeichert, der eine Größe von 192 Bit hat.

Dies ist die erste Funktion, die aufgerufen wird, um einen verschlüsselten Stream zu erstellen. Der Schlüssel wird für nachfolgende Operationen nicht mehr benötigt.

<br>

Ein verschlüsselter Stream beginnt mit einem kurzen Header von 192 Bit. Dieser Header muss vor der Sequenz verschlüsselter Nachrichten gesendet/gespeichert werden, da er zum Entschlüsseln des Streams erforderlich ist. Der Inhalt des Headers muss nicht geheim sein, da die Entschlüsselung mit einem anderen Header fehlschlagen würde.

Jeder Nachricht wird abhängig vom Wert von `last` ein Tag angehängt, der angibt, ob es sich um den letzten Chunk der Datei handelt oder nicht. Dieser Tag kann einer der folgenden sein:

1. `crypto_secretstream_xchacha20poly1305_TAG_MESSAGE`: Dies fügt keine Information über die Art der Nachricht hinzu.
2. `crypto_secretstream_xchacha20poly1305_TAG_FINAL`: Dies zeigt an, dass die Nachricht das Ende des Streams markiert und den geheimen Schlüssel löscht, der zum Verschlüsseln der vorherigen Sequenz verwendet wurde.

Die Funktion `crypto_secretstream_xchacha20poly1305_push()` verschlüsselt den Datei-`chunk` unter Verwendung des `state` und des `tag`, ohne zusätzliche Informationen (`null`).
<br>

Zur Verschlüsselung werden die XChaCha20-Stromchiffre und die Poly1305-MAC-Authentifizierung verwendet.

Die Funktion `stream.enqueue()` fügt die hat.sh-Signatur (Magic Bytes), das Salt und den Header hinzu, gefolgt von den verschlüsselten Chunks.

### Dateientschlüsselung (Stream)

<div class="codeBox">

```javascript
let state = sodium.crypto_secretstream_xchacha20poly1305_init_pull(header, key);

let result = sodium.crypto_secretstream_xchacha20poly1305_pull(
  state,
  new Uint8Array(chunk)
);

if (result) {
  let decryptedChunk = result.message;
  stream.enqueue(decryptedChunk);

  if (!last) {
    // continue decryption
  }
}
```

</div>

Die Funktion `crypto_secretstream_xchacha20poly1305_init_pull()` initialisiert einen State mit einem geheimen `key` und einem `header`. Der Schlüssel wird aus dem bei der Entschlüsselung angegebenen Passwort abgeleitet, und der Header wird aus der Datei extrahiert. Der Schlüssel wird für nachfolgende Operationen nicht mehr benötigt.

<br>

Die Funktion `crypto_secretstream_xchacha20poly1305_pull()` überprüft, ob der `chunk` einen gültigen Chiffretext und Authentifizierungs-Tag für den gegebenen `state` enthält.

Diese Funktion läuft in einer Schleife, bis eine Nachricht mit dem Tag `crypto_secretstream_xchacha20poly1305_TAG_FINAL` gefunden wird.

Wenn der Entschlüsselungsschlüssel falsch ist, gibt die Funktion einen Fehler zurück.

Wenn der Chiffretext oder der Authentifizierungs-Tag ungültig erscheinen, wird ein Fehler zurückgegeben.

<br>

### Zufällige Passwortgenerierung

<div class="codeBox">

```javascript
let password = sodium.to_base64(
  sodium.randombytes_buf(16),
  sodium.base64_variants.URLSAFE_NO_PADDING
);
return password;
```

</div>

Die Funktion `randombytes_buf()` füllt 128 Bit ab buf mit einer unvorhersagbaren Bytefolge.

Die Funktion `to_base64()` kodiert buf als Base64-String ohne Padding.

<br>

### Schlüsselgenerierung und -austausch

<div class="codeBox">

```javascript
const keyPair = sodium.crypto_kx_keypair();
let keys = {
  publicKey: sodium.to_base64(keyPair.publicKey),
  privateKey: sodium.to_base64(keyPair.privateKey),
};
return keys;
```
</div>

Die Funktion `crypto_kx_keypair()` generiert zufällig einen geheimen Schlüssel und einen zugehörigen öffentlichen Schlüssel. Der öffentliche Schlüssel wird in publicKey und der geheime Schlüssel in privateKey gespeichert, beide mit 256 Bit.

<br>

<div class="codeBox">

```javascript
let key = sodium.crypto_kx_client_session_keys(
  sodium.crypto_scalarmult_base(privateKey),
  privateKey,
  publicKey
);
```
</div>

Mithilfe der Schlüsselaustausch-API können zwei Parteien sicher einen Satz gemeinsamer Schlüssel berechnen, indem sie den öffentlichen Schlüssel des Gegenübers und ihren eigenen geheimen Schlüssel verwenden.

Die Funktion `crypto_kx_client_session_keys()` berechnet ein Paar von 256 Bit langen gemeinsamen Schlüsseln unter Verwendung des öffentlichen Schlüssels des Empfängers und des privaten Schlüssels des Absenders.

Die Funktion `crypto_scalarmult_base()` wird verwendet, um den öffentlichen Schlüssel des Absenders aus seinem privaten Schlüssel zu berechnen.

<br>

### XChaCha20-Poly1305

XChaCha20 ist eine Variante von ChaCha20 mit einem erweiterten Nonce, wodurch zufällige Nonces sicher verwendet werden können.

XChaCha20 benötigt keine Lookup-Tabellen und vermeidet die Möglichkeit von Timing-Angriffen.

Intern funktioniert XChaCha20 wie eine Blockchiffre im Counter-Modus. Es verwendet die HChaCha20-Hashfunktion, um einen Unterschlüssel und einen Sub-Nonce aus dem ursprünglichen Schlüssel und dem erweiterten Nonce abzuleiten, sowie einen dedizierten 64-Bit-Blockzähler, um das Inkrementieren des Nonce nach jedem Block zu vermeiden.

<br>

### V2 vs V1

- Umstellung auf xchacha20poly1305 für symmetrische Stream-Verschlüsselung und Argon2id für passwortbasierte Schlüsselableitung, anstelle von AES-256-GCM und PBKDF2.
- Verwendung der libsodium-Bibliothek für alle Kryptografie anstelle der WebCryptoApi.
- In dieser Version liest die App nicht mehr die gesamte Datei in den Speicher. Stattdessen wird sie in 64-MB-Chunks aufgeteilt, die nacheinander verarbeitet werden.
- Da keine serverseitige Verarbeitung verwendet wird, registriert die App eine fiktive Download-URL (/file), die von der Service-Worker Fetch API verarbeitet wird.
- Wenn alle Validierungen bestanden sind, wird ein neuer Stream initialisiert. Anschließend werden Datei-Chunks über Nachrichten von der Haupt-App an die Service-Worker-Datei übertragen.
- Jeder Chunk wird einzeln ver-/entschlüsselt und dem Stream hinzugefügt.
- Nachdem jeder Chunk auf die Festplatte geschrieben wurde, wird er sofort vom Browser per Garbage Collection freigegeben. Dadurch befinden sich nie mehr als wenige Chunks gleichzeitig im Speicher.

<br>

[//]: # "links"
[xchacha20-poly1305]: https://libsodium.gitbook.io/doc/secret-key_cryptography/aead/chacha20-poly1305/xchacha20-poly1305_construction
[argon2id]: https://github.com/p-h-c/phc-winner-argon2
[x25519]: https://cr.yp.to/ecdh.html
[opensource]: https://github.com/sh-dv/hat.sh
[bitwarden]: https://bitwarden.com/
[extending the salsa20 nonce paper]: https://cr.yp.to/snuffle/xsalsa-20081128.pdf
[soon]: https://tools.ietf.org/html/draft-irtf-cfrg-xchacha
[github]: https://github.com/sh-dv/hat.sh
[veracrypt]: https://veracrypt.fr
[cryptomator]: https://cryptomator.org
[kryptor]: https://github.com/samuel-lucas6/Kryptor
[gpg]: https://gnupg.org
[docker hub]: https://hub.docker.com/r/shdv/hat.sh
