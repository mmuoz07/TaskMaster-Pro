// Este archivo ya no conecta a PostgreSQL, usa memoria volátil
module.exports = {
    query: async (text, params) => {
        console.log("Consulta simulada ejecutada");
        return { rows: [] }; // Devuelve siempre vacío para no dar error
    }
};
