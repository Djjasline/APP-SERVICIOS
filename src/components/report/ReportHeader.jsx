import React from "react";

export default function ReportHeader() {
  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        fontFamily: "Arial, sans-serif",
        fontSize: "11px",
      }}
    >
      {/* ================= HEADER SUPERIOR ================= */}
      <tr>
        {/* LOGO */}
        <td
          rowSpan={4}
          style={{
            border: "1px solid black",
            width: "140px",
            textAlign: "center",
            verticalAlign: "middle",
          }}
        >
          <img
            src="/astap-logo.jpg"
            alt="ASTAP"
            style={{ width: "90px" }}
          />
        </td>

        {/* TITULO */}
        <td
          colSpan={4}
          style={{
            border: "1px solid black",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          INFORME TÉCNICO
        </td>

        {/* VERSION */}
        <td
          colSpan={2}
          style={{ border: "1px solid black" }}
        >
          FECHA DE VERSIÓN: 26-11-25
        </td>
      </tr>

      <tr>
        <td
          colSpan={4}
          style={{ border: "1px solid black" }}
        ></td>
        <td colSpan={2} style={{ border: "1px solid black" }}>
          VERSIÓN: 01
        </td>
      </tr>

      {/* ================= CUERPO SUPERIOR ================= */}
      <tr>
        <td
          style={{
            border: "1px solid black",
            fontWeight: "bold",
            width: "180px",
          }}
        >
          REFERENCIA DE CONTRATO:
        </td>
        <td colSpan={5} style={{ border: "1px solid black" }}></td>
      </tr>

      <tr>
        <td
          style={{
            border: "1px solid black",
            fontWeight: "bold",
          }}
        >
          DESCRIPCIÓN:
        </td>
        <td colSpan={5} style={{ border: "1px solid black" }}></td>
      </tr>

      <tr>
        <td
          style={{
            border: "1px solid black",
            fontWeight: "bold",
          }}
        >
          COD. INF.:
        </td>
        <td colSpan={5} style={{ border: "1px solid black" }}></td>
      </tr>

      {/* ================= FILA FECHA / UBICACIÓN ================= */}
      <tr>
        <td
          style={{
            border: "1px solid black",
            fontWeight: "bold",
          }}
        >
          FECHA DE EMISIÓN:
        </td>
        <td style={{ border: "1px solid black", width: "40px" }}>DD</td>
        <td style={{ border: "1px solid black", width: "40px" }}>MM</td>
        <td style={{ border: "1px solid black", width: "40px" }}>AA</td>
        <td
          style={{
            border: "1px solid black",
            fontWeight: "bold",
            width: "140px",
          }}
        >
          UBICACIÓN:
        </td>
        <td style={{ border: "1px solid black" }}></td>
      </tr>

      {/* ================= RESPONSABLES ================= */}
      <tr>
        <td
          colSpan={4}
          style={{ border: "1px solid black" }}
        ></td>
        <td
          style={{
            border: "1px solid black",
            fontWeight: "bold",
          }}
        >
          TÉCNICO RESPONSABLE:
        </td>
        <td style={{ border: "1px solid black" }}></td>
      </tr>

      <tr>
        <td
          colSpan={4}
          style={{ border: "1px solid black" }}
        ></td>
        <td
          style={{
            border: "1px solid black",
            fontWeight: "bold",
          }}
        >
          CLIENTE:
        </td>
        <td style={{ border: "1px solid black" }}></td>
      </tr>

      <tr>
        <td
          colSpan={4}
          style={{ border: "1px solid black" }}
        ></td>
        <td
          style={{
            border: "1px solid black",
            fontWeight: "bold",
          }}
        >
          RESPONSABLE CLIENTE:
        </td>
        <td style={{ border: "1px solid black" }}></td>
      </tr>
    </table>
  );
}
