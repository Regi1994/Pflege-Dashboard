export default function App() {
  const behandlungen = [
    { name: "Wundversorgung", anzahl: 2, farbe: "red" },
    { name: "Blutdruck", anzahl: 4, farbe: "blue" },
    { name: "BZ-Messung", anzahl: 3, farbe: "green" },
    { name: "Kompressionsstrümpfe", anzahl: 5, farbe: "purple" },
  ]

  return (
    <div className="min-h-screen bg-slate-100 p-10">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-4xl font-bold mb-2">Pflege Dashboard</h1>

        <p className="text-slate-600 text-lg mb-8">
          Übersicht aller Behandlungspflegen
        </p>

        <div className="grid grid-cols-2 gap-5">
          {behandlungen.map((item, index) => (
            <div
              key={index}
              className={`rounded-2xl p-6 border bg-${item.farbe}-50 border-${item.farbe}-200`}
            >
              <div className="text-2xl font-bold mb-4">
                {item.name}
              </div>

              <div
                className={`text-6xl font-bold text-${item.farbe}-600`}
              >
                {item.anzahl}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
