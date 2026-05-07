import { useState } from "react"
import * as XLSX from "xlsx"

const tage = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"]

const farben = {
  Wundversorgung: "bg-red-50 border-red-200 text-red-700",
  Blutdruckmessung: "bg-blue-50 border-blue-200 text-blue-700",
  Gewichtskontrolle: "bg-green-50 border-green-200 text-green-700",
  Insulingabe: "bg-purple-50 border-purple-200 text-purple-700",
  "PEG-Versorgung": "bg-orange-50 border-orange-200 text-orange-700",
  Katheterwechsel: "bg-teal-50 border-teal-200 text-teal-700",
  Kompressionsstrümpfe: "bg-slate-50 border-slate-200 text-slate-700",
  Schmerzpflaster: "bg-pink-50 border-pink-200 text-pink-700",
  Sauerstoffversorgung: "bg-cyan-50 border-cyan-200 text-cyan-700",
}

function istMarkiert(wert) {
  if (!wert) return false
  return ["x", "X", "✔", "ja", "Ja", "fällig"].includes(String(wert).trim())
}

export default function App() {
  const [gruppen, setGruppen] = useState({})
  const [todos, setTodos] = useState([])

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = (evt) => {
      const workbook = XLSX.read(evt.target.result, { type: "binary" })

      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" })

      let aktuelleBehandlung = ""
      const neueGruppen = {}

      rows.forEach((row) => {
        const ersteZelle = row[0]

        if (
          ersteZelle &&
          !["Bewohner", "Übersicht Behandlungspflege – Schichtleitung", "Hinweise / Besonderheiten"].includes(ersteZelle) &&
          row.slice(1).every((zelle) => zelle === "")
        ) {
          aktuelleBehandlung = ersteZelle
          if (!neueGruppen[aktuelleBehandlung]) neueGruppen[aktuelleBehandlung] = []
          return
        }

        if (row[0] === "Bewohner") return
        if (!aktuelleBehandlung) return
        if (!row[0]) return

        neueGruppen[aktuelleBehandlung].push({
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

      setGruppen(neueGruppen)

      if (workbook.SheetNames.includes("To-Do")) {
        const todoSheet = workbook.Sheets["To-Do"]
        const todoRows = XLSX.utils.sheet_to_json(todoSheet, { defval: "" })
        setTodos(todoRows)
      }
    }

    reader.readAsBinaryString(file)
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-4xl font-bold mb-2">Behandlungspflege Dashboard</h1>
        <p className="text-slate-600 text-lg mb-8">
          Übersicht nach deiner Excel-Struktur
        </p>

        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="mb-8 border p-4 rounded-2xl bg-white shadow"
        />

        {todos.length > 0 && (
          <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
            <h2 className="text-2xl font-bold mb-4">To-Do</h2>
            <div className="space-y-2">
              {todos.map((todo, index) => (
                <div key={index} className="bg-white rounded-xl p-3 shadow-sm">
                  {todo["To-Do"] || todo["Aufgabe"]} {todo["Status"] && `– ${todo["Status"]}`}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(gruppen).map(([behandlung, eintraege]) => (
            <div
              key={behandlung}
              className={`rounded-2xl border p-6 ${farben[behandlung] || "bg-slate-50 border-slate-200 text-slate-700"}`}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{behandlung}</h2>
                <div className="text-5xl font-bold">{eintraege.length}</div>
              </div>

              <div className="space-y-3">
                {eintraege.map((item, index) => (
                  <div key={index} className="bg-white text-slate-800 rounded-xl p-4 shadow-sm">
                    <div className="text-xl font-bold">{item.bewohner}</div>
                    <div className="text-slate-600">{item.detail}</div>
                    <div className="text-sm text-slate-500 mb-2">{item.rhythmus}</div>

                    <div className="flex flex-wrap gap-2">
                      {tage.map((tag) =>
                        istMarkiert(item.tage[tag]) ? (
                          <span key={tag} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
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
            Bitte deine Excel-Datei hochladen.
          </div>
        )}
      </div>
    </div>
  )
}
