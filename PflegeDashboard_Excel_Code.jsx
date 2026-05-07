import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";

/**
 * Dashboard für Behandlungspflege
 *
 * Voraussetzung:
 * 1. Excel-Datei in den public-Ordner legen, z. B.:
 *    public/behandlungspflege.xlsx
 *
 * 2. Paket installieren:
 *    npm install xlsx
 *
 * 3. DATA_URL ggf. anpassen.
 */

const DATA_URL = "/behandlungspflege.xlsx";

const weekdayMap = {
  0: "Sonntag",
  1: "Montag",
  2: "Dienstag",
  3: "Mittwoch",
  4: "Donnerstag",
  5: "Freitag",
  6: "Samstag",
};

const sectionColors = {
  Wundversorgung: "border-red-300 bg-red-50",
  Blutdruckmessung: "border-blue-300 bg-blue-50",
  Gewichtskontrolle: "border-green-300 bg-green-50",
  Insulingabe: "border-purple-300 bg-purple-50",
  "PEG-Versorgung": "border-orange-300 bg-orange-50",
  Katheterwechsel: "border-teal-300 bg-teal-50",
  Kompressionsstrümpfe: "border-slate-300 bg-slate-50",
  Schmerzpflaster: "border-pink-300 bg-pink-50",
  Sauerstoffversorgung: "border-cyan-300 bg-cyan-50",
};

const knownSections = [
  "Wundversorgung",
  "Blutdruckmessung",
  "Gewichtskontrolle",
  "Insulingabe",
  "PEG-Versorgung",
  "Katheterwechsel",
  "Kompressionsstrümpfe",
  "Schmerzpflaster",
  "Sauerstoffversorgung",
];

function clean(value) {
  return value === undefined || value === null ? "" : String(value).trim();
}

function isMarked(value) {
  const v = clean(value).toLowerCase();
  return ["x", "✔", "ja", "j", "1", "true", "fällig"].includes(v);
}

function parseExcelRows(rows) {
  const result = [];
  let currentSection = "";

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i].map(clean);
    const firstCell = row[0];

    if (knownSections.includes(firstCell)) {
      currentSection = firstCell;
      continue;
    }

    if (!currentSection) continue;

    const isHeaderRow =
      row.includes("Bewohner") &&
      row.some((cell) => cell.includes("Montag") || cell.includes("Dienstag"));

    if (isHeaderRow) continue;

    const resident = row[0];
    const detail = row[1];
    const rhythm = row[2];

    if (!resident) continue;

    const dayValues = {
      Montag: row[3],
      Dienstag: row[4],
      Mittwoch: row[5],
      Donnerstag: row[6],
      Freitag: row[7],
      Samstag: row[8],
      Sonntag: row[9],
    };

    result.push({
      section: currentSection,
      resident,
      detail,
      rhythm,
      dayValues,
    });
  }

  return result;
}

export default function PflegeDashboard() {
  const [items, setItems] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState("");

  const todayName = weekdayMap[new Date().getDay()];
  const todayDate = new Date().toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  async function loadExcel() {
    try {
      setError("");

      // Cache-Buster, damit der Bildschirm wirklich aktualisiert
      const response = await fetch(`${DATA_URL}?t=${Date.now()}`);

      if (!response.ok) {
        throw new Error("Excel-Datei konnte nicht geladen werden.");
      }

      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

      const rows = XLSX.utils.sheet_to_json(firstSheet, {
        header: 1,
        defval: "",
      });

      const parsed = parseExcelRows(rows);
      setItems(parsed);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || "Unbekannter Fehler beim Laden der Daten.");
    }
  }

  useEffect(() => {
    loadExcel();

    // Automatisch alle 60 Sekunden aktualisieren
    const interval = setInterval(loadExcel, 60000);

    return () => clearInterval(interval);
  }, []);

  const todayItems = useMemo(() => {
    return items.filter((item) => isMarked(item.dayValues[todayName]));
  }, [items, todayName]);

  const groupedTodayItems = useMemo(() => {
    return todayItems.reduce((groups, item) => {
      if (!groups[item.section]) groups[item.section] = [];
      groups[item.section].push(item);
      return groups;
    }, {});
  }, [todayItems]);

  const totalBySection = useMemo(() => {
    return knownSections.map((section) => ({
      section,
      count: todayItems.filter((item) => item.section === section).length,
    }));
  }, [todayItems]);

  return (
    <div className="min-h-screen bg-slate-100 p-6 text-slate-800">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold">Behandlungspflege Dashboard</h1>
              <p className="mt-2 text-lg text-slate-500">
                Pflegeheim Margarete · Schichtleitung
              </p>
            </div>

            <div className="text-left md:text-right">
              <div className="text-2xl font-bold">{todayName}</div>
              <div className="text-lg text-slate-500">{todayDate}</div>
              <div className="mt-1 text-sm text-slate-400">
                Aktualisiert:{" "}
                {lastUpdated
                  ? lastUpdated.toLocaleTimeString("de-DE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "lädt ..."}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-300 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {totalBySection.map((entry) => (
            <div
              key={entry.section}
              className={`rounded-2xl border-2 p-4 shadow-sm ${
                sectionColors[entry.section] || "border-slate-300 bg-white"
              }`}
            >
              <div className="text-sm font-medium text-slate-600">
                {entry.section}
              </div>
              <div className="mt-2 text-4xl font-bold">{entry.count}</div>
              <div className="text-sm text-slate-500">heute fällig</div>
            </div>
          ))}
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-lg">
          <h2 className="mb-5 text-3xl font-bold">Heute fällige Aufgaben</h2>

          {todayItems.length === 0 ? (
            <div className="rounded-2xl bg-green-50 p-6 text-xl text-green-700">
              Für heute sind keine Behandlungspflegen in der Excel-Liste markiert.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {Object.entries(groupedTodayItems).map(([section, sectionItems]) => (
                <div
                  key={section}
                  className={`rounded-3xl border-2 p-5 ${
                    sectionColors[section] || "border-slate-300 bg-slate-50"
                  }`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-2xl font-bold">{section}</h3>
                    <span className="rounded-full bg-white px-4 py-1 text-lg font-bold shadow-sm">
                      {sectionItems.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {sectionItems.map((item, index) => (
                      <div
                        key={`${item.section}-${item.resident}-${index}`}
                        className="rounded-2xl bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-xl font-bold">{item.resident}</div>
                            {item.detail && (
                              <div className="mt-1 text-slate-600">
                                {item.section === "Wundversorgung"
                                  ? "Lokalisation: "
                                  : "Besonderheit: "}
                                {item.detail}
                              </div>
                            )}
                          </div>

                          {item.rhythm && (
                            <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                              {item.rhythm}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-2xl bg-white p-4 text-sm text-slate-500 shadow-sm">
          Hinweis: Das Dashboard zeigt nur Aufgaben an, die in der Excel-Datei beim heutigen Wochentag mit
          „X“, „✔“, „Ja“ oder „fällig“ markiert sind. Dokumentation erfolgt weiterhin im Dokusystem.
        </div>
      </div>
    </div>
  );
}
