import csv
import datetime
import pathlib
import re
import sys
import xml.etree.ElementTree as ET
import zipfile


NS = {"a": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
SOURCE_FILE = "INVENTARIO referencial vehiculos.XLSX"
DEFAULT_SOURCE = pathlib.Path("cotizador") / SOURCE_FILE
DEFAULT_OUT_DIR = pathlib.Path("tmp")


def cell_text(cell, shared_strings):
    value = cell.find("a:v", NS)
    if value is None:
        return ""

    raw = value.text or ""
    if cell.attrib.get("t") == "s":
        try:
            return shared_strings[int(raw)]
        except Exception:
            return raw

    return raw


def column_number(reference):
    letters = "".join(ch for ch in reference if ch.isalpha())
    number = 0

    for letter in letters:
        number = number * 26 + ord(letter.upper()) - 64

    return number


def clean_text(value):
    return re.sub(r"\s+", " ", str(value or "").replace("�", "Ñ")).strip()


def clean_product_code(value):
    return clean_text(value).lstrip("`'\"‘’")


def to_number(value):
    try:
        text = str(value or "").strip().replace(",", ".")
        if not text or text == "#DIV/0!":
            return ""
        return round(float(text), 2)
    except Exception:
        return ""


def excel_date(value):
    try:
        number = float(str(value or "").strip())
        if number <= 0 or number > 60000:
            return ""
        date = datetime.datetime(1899, 12, 30) + datetime.timedelta(days=number)
        return date.date().isoformat()
    except Exception:
        return ""


def load_shared_strings(workbook):
    if "xl/sharedStrings.xml" not in workbook.namelist():
        return []

    root = ET.fromstring(workbook.read("xl/sharedStrings.xml"))
    strings = []

    for item in root.findall("a:si", NS):
        strings.append("".join((text.text or "") for text in item.findall(".//a:t", NS)))

    return strings


def load_sheet_paths(workbook):
    workbook_xml = ET.fromstring(workbook.read("xl/workbook.xml"))
    relationships = ET.fromstring(workbook.read("xl/_rels/workbook.xml.rels"))
    relmap = {rel.attrib["Id"]: rel.attrib["Target"] for rel in relationships}
    sheets = []

    for sheet in workbook_xml.find("a:sheets", NS):
        rid = sheet.attrib["{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"]
        sheets.append((sheet.attrib["name"], "xl/" + relmap[rid].lstrip("/")))

    return sheets


def find_header_columns(cells):
    headers = {}
    for reference, value in cells.items():
        row = "".join(ch for ch in reference if ch.isdigit())
        if row == "8":
            headers[column_number(reference)] = clean_text(value).upper()

    return {
        "saldo": next((col for col, label in headers.items() if "SALDO" in label), None),
        "liquidacion": next((col for col, label in headers.items() if "LIQUIDACION" in label), None),
        "proveedor": next((col for col, label in headers.items() if "PROOVEDOR" in label or "PROVEEDOR" in label), 4),
        "fecha_compra": next((col for col, label in headers.items() if label == "FECHA"), 2),
        "fecha_venta": next((col for col, label in headers.items() if "FECHA ENTREGA" in label), None),
        "cliente": next((col for col, label in headers.items() if "CLIENTE" in label), None),
        "comentario": next((col for col, label in headers.items() if "COMENTARIO" in label), None),
    }


def extract_rows(source):
    rows = []

    with zipfile.ZipFile(source) as workbook:
        shared_strings = load_shared_strings(workbook)

        for sheet_name, sheet_path in load_sheet_paths(workbook):
            root = ET.fromstring(workbook.read(sheet_path))
            cells = {}

            for cell in root.findall(".//a:sheetData/a:row/a:c", NS):
                cells[cell.attrib.get("r", "")] = cell_text(cell, shared_strings)

            if not any(str(value).upper().strip() == "CONTROL DE INVENTARIO" for value in cells.values()):
                continue

            description = clean_text(cells.get("B5", ""))
            product_code = ""

            for reference, value in cells.items():
                row = "".join(ch for ch in reference if ch.isdigit())
                col = column_number(reference)
                text = clean_product_code(value)
                if row == "5" and col >= 10 and text and text.upper() not in ["CODIGO", "N° DE PAGINA", "Nº DE PAGINA"]:
                    product_code = text
                    break

            if not product_code or product_code.upper() == "CODIGO" or not description:
                continue

            columns = find_header_columns(cells)
            rows_by_number = {}

            for reference, value in cells.items():
                row = int("".join(ch for ch in reference if ch.isdigit()) or 0)
                if row >= 9:
                    rows_by_number.setdefault(row, {})[column_number(reference)] = value

            balances = []
            costs = []
            suppliers = []
            purchase_dates = []
            sale_dates = []
            clients = []
            comments = []

            for row_number in sorted(rows_by_number):
                row = rows_by_number[row_number]

                if columns["saldo"]:
                    balance = to_number(row.get(columns["saldo"], ""))
                    if balance != "":
                        balances.append(balance)

                if columns["liquidacion"]:
                    cost = to_number(row.get(columns["liquidacion"], ""))
                    if cost != "" and cost > 0:
                        costs.append(cost)

                supplier = clean_text(row.get(columns["proveedor"], ""))
                if supplier:
                    suppliers.append(supplier)

                purchase_date = excel_date(row.get(columns["fecha_compra"], ""))
                if purchase_date:
                    purchase_dates.append(purchase_date)

                if columns["fecha_venta"]:
                    sale_date = excel_date(row.get(columns["fecha_venta"], ""))
                    if sale_date:
                        sale_dates.append(sale_date)

                if columns["cliente"]:
                    client = clean_text(row.get(columns["cliente"], ""))
                    if client:
                        clients.append(client)

                if columns["comentario"]:
                    comment = clean_text(row.get(columns["comentario"], ""))
                    if comment:
                        comments.append(comment)

            rows.append({
                "product_code": product_code,
                "description": description,
                "sheet_name": sheet_name,
                "reference_stock": balances[-1] if balances else 0,
                "last_cost": costs[-1] if costs else "",
                "last_supplier": suppliers[-1] if suppliers else "",
                "last_purchase_date": purchase_dates[-1] if purchase_dates else "",
                "last_sale_date": sale_dates[-1] if sale_dates else "",
                "last_client": clients[-1] if clients else "",
                "last_comment": comments[-1] if comments else "",
                "source_file": source.name,
                "active": "true",
            })

    return rows


def sql_text(value):
    if value in [None, ""]:
        return "null"
    return "'" + str(value).replace("'", "''") + "'"


def sql_number(value):
    if value in [None, ""]:
        return "null"
    return str(value)


def write_csv(rows, target):
    with target.open("w", newline="", encoding="utf-8-sig") as file:
        writer = csv.DictWriter(file, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)


def write_sql(rows, target):
    lines = [
        "-- Importa referencia historica de Vehiculos Especiales sin tocar warehouse_inventory.",
        "begin;",
        f"delete from public.vehicle_reference_catalog where source_file = {sql_text(SOURCE_FILE)};",
    ]

    for index in range(0, len(rows), 200):
        chunk = rows[index:index + 200]
        values = []

        for row in chunk:
            values.append(
                "  (" + ", ".join([
                    sql_text(row["product_code"]),
                    sql_text(row["description"]),
                    sql_text(row["sheet_name"]),
                    sql_number(row["reference_stock"]),
                    sql_number(row["last_cost"]),
                    sql_text(row["last_supplier"]),
                    sql_text(row["last_purchase_date"]),
                    sql_text(row["last_sale_date"]),
                    sql_text(row["last_client"]),
                    sql_text(row["last_comment"]),
                    sql_text(row["source_file"]),
                    "true",
                ]) + ")"
            )

        lines.append(
            "insert into public.vehicle_reference_catalog "
            "(product_code, description, sheet_name, reference_stock, last_cost, last_supplier, "
            "last_purchase_date, last_sale_date, last_client, last_comment, source_file, active) values\n"
            + ",\n".join(values) + ";"
        )

    lines.append("commit;")
    target.write_text("\n".join(lines), encoding="utf-8")


def main():
    source = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_SOURCE
    out_dir = pathlib.Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_OUT_DIR
    out_dir.mkdir(parents=True, exist_ok=True)

    rows = extract_rows(source)
    csv_target = out_dir / "vehicle_reference_catalog_import.csv"
    sql_target = out_dir / "vehicle_reference_catalog_import.sql"

    write_csv(rows, csv_target)
    write_sql(rows, sql_target)

    print(f"rows={len(rows)}")
    print(f"csv={csv_target}")
    print(f"sql={sql_target}")


if __name__ == "__main__":
    main()
