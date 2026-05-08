import { useState } from "react"
import * as XLSX from "xlsx"

const tage = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"]

function markiert(wert) {
  return ["x", "X", "✔", "✓", "ja", "Ja"].includes(String(wert).trim())
}

export default function App() {
  const [gruppen, setGruppen] = useState({})

  function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = (evt) => {
      const workbook = XLSX.read(evt.target.result, { type: "binary" })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" })

      let aktuelleKategorie = ""
      const daten = {}

      rows.forEach((row) => {
        const erste = String(row[0] || "").trim()

        if (!erste) return

        const istUeberschrift =
          erste !== "Bewohner" &&
          !erste.includes("Übersicht") &&
          !erste.includes("Hinweise") &&
          row.slice(1).every((zelle) => !zelle)

        if (istUeberschrift) {
          aktuelleKategorie = erste
          daten[aktuelleKategorie] = []
          return
        }

        if (erste === "Bewohner") return
        if (!aktuelleKategorie) return

        daten[aktuelleKategorie].push({
          bewohner: row[0],
          detail: row[1],
          rhythmus: row[2],
          tage: {
            Montag: row[3],
            Dienstag: row[4],
            Mittwoch: row[5],
            Donnerstag: row[6],
            Freitag: row[7],
            Samstag: row[8],
            Sonntag: row[9],
          },
        })
      })

      setGruppen(daten)
    }

    reader.readAsBinaryString(file)
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-4xl font-bold mb-2">
          Behandlungspflege Dashboard
        </h1>

        <p className="text-slate-600 text-lg mb-8">
          Übersicht nach Behandlungspflege und Wochentagen
        </p>

        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="mb-8 border p-4 rounded-2xl bg-white shadow"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(gruppen).map(([kategorie, eintraege]) => (
            <div key={kategorie} className="rounded-2xl border bg-slate-50 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{kategorie}</h2>
                <div className="text-5xl font-bold text-blue-600">
                  {eintraege.length}
                </div>
              </div>

              <div className="space-y-3">
                {eintraege.map((item, index) => (
                  <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="text-xl font-bold">{item.bewohner}</div>

                    {item.detail && (
                      <div className="text-slate-600">
                        {item.detail}
                      </div>
                    )}

                    {item.rhythmus && (
                      <div className="text-sm text-slate-500 mb-2">
                        {item.rhythmus}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mt-2">
                      {tage.map((tag) =>
                        markiert(item.tage[tag]) ? (
                          <span
                            key={tag}
                            className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold"
                          >
                            {tag}
                          </span>
                        ) : null
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {Object.keys(gruppen).length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-lg">
            Bitte Excel-Datei hochladen.
          </div>
        )}
      </div>
    </div>
  )
}
