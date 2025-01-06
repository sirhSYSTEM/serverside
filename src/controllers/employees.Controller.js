const { query } = require("../config/mongo");
const { querysql } = require("../config/mysql");
const employeeController = {};

// Importamos el modelo de Employee
const Employee = require("../models/Employee");
const { ObjectId } = require("mongodb");

// Función para obtener todos los empleados
employeeController.getEmployees = async (req, res) => {
  try {
    const employees = await query("plantilla_humanos", {});
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving employees", error: err });
  }
};

// Función para obtener los datos de perfil de un empleado por su ID
employeeController.getProfileData = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    const employee = await query("plantilla_humanos", {
      _id: new ObjectId(id),
    });
    const licenses = await query("plazas", { NUMPLA: employee[0].NUMPLA });

    /* ---- SE OBTIENE EL SALARIO DEL  LOS SALARIOSD EL EMPLEADO PERCEPCIONES --- */

    if (employee[0].TIPONOM === "B") {
      //CALCULO DE SALARIOS BASE ---------------------------------------->
      const salariesDataB = await querysql(
        `SELECT * FROM CAT_BASE WHERE nivel = ?`,
        [employee[0].NIVEL]
      );
      /* ------------------------------ PERCEPCIONES ------------------------------ */
      const percepcionesB = salariesDataB[0];
      delete percepcionesB.NIVEL;
      delete percepcionesB.ID;
      //SE OBTIENEN LOS DTOS DEL ISR CORRESPONDIENTE AL SUELDO BASE EN LOS LIMITES DEL EJERCICIO FISCAL 2024
      const isrDataB = await querysql(
        "SELECT * FROM CAT_ISR WHERE ? > LIMITE_INFERIOR AND ? < LIMITE_SUPERIOR",
        [percepcionesB.SUELDO_BASE, percepcionesB.SUELDO_BASE]
      );

      const isrObjectB = isrDataB[0];
      /* ------------------------------- DEDUCCIONES ------------------------------ */
      const deduccionesB = {};
      deduccionesB.ISR = (
        ((parseFloat(percepcionesB.SUELDO_BASE) -
          parseFloat(isrObjectB.LIMITE_INFERIOR)) *
          parseFloat(isrObjectB.PORCENTAJE_LIMITE_INFERIOR)) /
          100 +
        parseFloat(isrObjectB.CUOTA_FIJA)
      ).toFixed(2); // REDONDEAR EL SEGUNDO DECIMAL

      deduccionesB.FONDO_PEN = (
        parseFloat(percepcionesB.SUELDO_BASE) * 0.09
      ).toFixed(2); // REDONDEAR AL SEGUNDO DECIMAL
      deduccionesB.CUOTA_SINDICAL = (
        parseFloat(percepcionesB.SUELDO_BASE) * 0.01
      ).toFixed(2); // REDONDEAR AL SEGUNDO DECIMAL
      deduccionesB.IMSS = (
        parseFloat(percepcionesB.SUELDO_BASE) * 0.041219
      ).toFixed(2); // REDONDEAR AL SEGUNDO DECIMAL
      //verifica el statiuas de las plazas
      employee[0].percepciones = percepcionesB;
      employee[0].deducciones = deduccionesB;
      employee[0].licenses = licenses;

      res.json(employee[0]);
    } else if (employee[0].TIPONOM === "CC" || employee[0].TIPONOM === "CN") {
      //CALCUYLO DE SALARIOS CN Y CC ---------------------------------------->
      const salariesDataCC = await querysql(
        `SELECT * FROM CAT_CONTRATO WHERE NIVEL = ?`,
        [employee[0].NIVEL]
      );
      console.log(employee[0]);
      employee[0].licenses = licenses;

      res.json(employee[0]);
    }

    console.log(employee[0]);

    console.log(
      employee[0].NOMBRES +
        employee[0].APE_PAT +
        employee[0].APE_MAT +
        "---" +
        employee[0]._id
    );
  } catch (error) {
    res.status(500).json({ message: "Error al buscar el empleado", error });
  }
};

// Función para buscar empleados por una consulta
employeeController.getEmployee = async (req, res) => {
  const { query: searchQuery } = req.params;
  console.log(searchQuery);
  try {
    let empleados;
    const queryDivided = searchQuery.split(" ");

    if (searchQuery) {
      const regexQueries = [
        { CURP: { $regex: searchQuery, $options: "i" } },
        { NOMBRES: { $regex: searchQuery, $options: "i" } },
        { APE_MAT: { $regex: searchQuery, $options: "i" } },
        { APE_PAT: { $regex: searchQuery, $options: "i" } },
      ];

      if (queryDivided.length > 1) {
        regexQueries.push({
          $or: [
            {
              $and: [
                { APE_MAT: { $regex: queryDivided[0], $options: "i" } },
                { APE_PAT: { $regex: queryDivided[1], $options: "i" } },
              ],
            },
            {
              $and: [
                { APE_MAT: { $regex: queryDivided[1], $options: "i" } },
                { APE_PAT: { $regex: queryDivided[0], $options: "i" } },
              ],
            },
            {
              $and: [
                { NOMBRES: { $regex: queryDivided[0], $options: "i" } },
                { APE_PAT: { $regex: queryDivided[1], $options: "i" } },
              ],
            },
          ],
        });
      }

      empleados = await query("plantilla_humanos", { $or: regexQueries });
    } else {
      empleados = await query("plantilla_humanos", {});
    }

    const formattedEmployees = empleados.map((emp) => ({
      _id: emp._id,
      NOMBRE: `${emp.APE_PAT} ${emp.APE_MAT} ${emp.NOMBRES}`,
      CURP: emp.CURP,
      RFC: emp.RFC,
      CLAVECAT: emp.CLAVECAT,
      PROYECTO: emp.PROYECTO,
    }));

    res.json(formattedEmployees);
    console.log(formattedEmployees);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error al recuperar los datos" });
  }
};

// Exportamos el controlador de empleados
module.exports = employeeController;
