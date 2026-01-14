
            </button>
          )}
        </div>

        {/* DESCRIPCIÓN DEL EQUIPO */}
        <h3 className="font-bold text-sm">DESCRIPCIÓN DEL EQUIPO</h3>
        <table className="pdf-table">
          <tbody>
            {[
              ["NOTA", "nota"],
              ["MARCA", "marca"],
              ["MODELO", "modelo"],
              ["N° SERIE", "serie"],
              ["AÑO MODELO", "anio"],
              ["VIN / CHASIS", "vin"],
              ["PLACA", "placa"],
              ["HORAS MÓDULO", "horasModulo"],
              ["HORAS CHASIS", "horasChasis"],
              ["KILOMETRAJE", "kilometraje"],
            ].map(([l, k]) => (
              <tr key={k}>
                <td className="pdf-label">{l}</td>
                <td>
                  <input
                    className="pdf-input"
                    value={data.equipo[k]}
                    onChange={(e) =>
                      update(["equipo", k], e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* FIRMAS */}
        <table className="pdf-table">
          <thead>
            <tr>
              <th>FIRMA TÉCNICO ASTAP</th>
              <th>FIRMA CLIENTE</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-center">
                <SignatureCanvas ref={sigTecnico} canvasProps={{ width: 300, height: 120 }} />
              </td>
              <td className="text-center">
                <SignatureCanvas ref={sigCliente} canvasProps={{ width: 300, height: 120 }} />
              </td>
            </tr>
          </tbody>
        </table>

        {/* BOTONES */}
        <div className="flex justify-between pt-6">
          <button onClick={() => navigate("/informe")} className="border px-6 py-2 rounded">
            Volver
          </button>
          <button onClick={saveReport} className="bg-blue-600 text-white px-6 py-2 rounded">
            Guardar informe
          </button>
        </div>
      </div>
    </div>
  );
}
