import { useState } from "react"
import * as XLSX from "xlsx"

export default function App() {
  const [daten, setDaten] = useState([])

  const handleFileUpload = (e) => {
    const file = e.target.files[0]

    if (!file) return

    const reader = new FileReader()

    reader.onload = (evt) => {
      const binaryStr = evt.target.result

      const workbook = XLSX.read(binaryStr, {
        type: "binary",
      })

      const sheetName = workbook.SheetNames[0]

      const worksheet =
        workbook.Sheets[sheetName]

      const jsonData =
        XLSX.utils.sheet_to_json(worksheet)

      setDaten(jsonData)
    }

    reader.readAsBinaryString(file)
  }

  const gruppiert = daten.reduce(
    (acc, item) => {
      const leistung =
        item.Leistung || "Ohne Kategorie"

      if (!acc[leistung]) {
        acc[leistung] = []
      }

      acc[leistung].push(item.Bewohner)

      return acc
    },
    {}
  )

  const farben = [
    "red",
    "blue",
    "green",
    "purple",
    "orange",
    "pink",
    "cyan",
  ]

  return (
    <div className="min-h-screen bg-slate-100 p-10">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl p-8">

        <h1 className="text-4xl font-bold mb-2">
          Behandlungspflege Dashboard
        </h1>

        <p className="text-slate-600 text-lg mb-8">
          Übersicht aller Behandlungspflegen
        </p>

        <div className="mb-8">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            className="border p-4 rounded-2xl bg-white shadow"
          />
        </div>

        {daten.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-lg">
            Bitte Excel-Datei hochladen.
          </div>
        )}

        <div className="grid grid-cols-2 gap-5">

          {Object.entries(gruppiert).map(
            ([leistung, bewohnerListe], index) => (
              <div
                key={index}
                className={`rounded-2xl p-6 border bg-${farben[index % farben.length]}-50 border-${farben[index % farben.length]}-200`}
              >

                <div className="text-2xl font-bold mb-4">
                  {leistung}
                </div>

                <div
                  className={`text-5xl font-bold mb-5 text-${farben[index % farben.length]}-600`}
                >
                  {bewohnerListe.length}
                </div>

                <div className="space-y-2">

                  {bewohnerListe.map(
                    (bewohner, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-xl p-3 shadow-sm text-lg"
                      >
                        {bewohner}
                      </div>
                    )
                  )}

                </div>

              </div>
            )
          )}

        </div>
      </div>
    </div>
  )
}
