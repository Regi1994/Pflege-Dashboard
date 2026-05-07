
export default function App() {
  return (
    <div className="min-h-screen bg-slate-100 p-10">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-4xl font-bold mb-6">Pflege Dashboard</h1>
        <p className="text-lg text-slate-600">
          Das Projekt wurde erfolgreich eingerichtet.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
            <div className="text-xl font-bold">Wundversorgung</div>
            <div className="text-5xl mt-3 font-bold text-red-600">2</div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
            <div className="text-xl font-bold">Blutdruck</div>
            <div className="text-5xl mt-3 font-bold text-blue-600">4</div>
          </div>
        </div>
      </div>
    </div>
  )
}
