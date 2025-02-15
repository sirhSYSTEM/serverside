const { Schema, model } = require("mongoose");

const employeeSchemma = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    CONSEC: Number,
    CLAVE: Number,
    DEPARTAMENTO: String,
    CURP: String,
    PROYECTO: String,
    RFC: String,
    AFILIACI: String,
    NUMEMP: Number,
    NUMPLA: Number,
    NIVEL: String,
    TIPONOM: String,
    MOD_ANTE: String,
    CLAVECAT: String,
    NOMCATE: String,
    SUELDO_GRV: Number,
    NUMQUIN: Number,
    GUARDE: Number,
    GASCOM: Number,
    FECHA_INGRESO: Date,
    SANGRE: String,
    AVISAR: String,
    TEL_EMERGENCIA1: String,
    TEL_EMERGENCIA2: String,
    NUMTARJETA: String,
    TURNOMAT: String,
    TURNOVES: String,
    SABADO: String,
    SEXO: String,
    FECHA_NAC: Date,
    LUGARNAC: String,
    CP: Number,
    TEL_PERSONAL: String,
    ALERGIA: String,
    TIPOPAG: String,
    BANCO: String,
    CUENTA: String,
    NOMINA: String,
    EMAIL: String,
    DOMICILIO: String,
    PROFES: String,
    APE_PAT: String,
    APE_MAT: String,
    NOMBRES: String,
    status: Number,
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "plantilla_humanos",
  }
);

module.exports = model("Employee", employeeSchemma);
