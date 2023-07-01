// Cargar las variables de entorno del archivo .env
require("dotenv").config();

// Importar el módulo Express
const express = require("express");
const app = express();

// Importar las funciones del gestor de frutas
const { leerFrutas, guardarFrutas } = require("./src/frutasManager");

// Configurar el número de puerto para el servidor
const PORT = process.env.PORT || 3000;

// Crear un arreglo vacío para almacenar los datos de las frutas
let BD = [];

// Configurar el middleware para analizar el cuerpo de las solicitudes como JSON
app.use(express.json());

// Middleware para leer los datos de las frutas antes de cada solicitud
app.use((req, res, next) => {
  BD = leerFrutas(); // Leer los datos de las frutas desde el archivo
  next(); // Pasar al siguiente middleware o ruta
});

// Función para buscar la fruta en la BD, dado cierto ID.
function buscarFrutaPorID(idFruta) {
  return BD.find((fruta) => fruta.id === idFruta);
};

// Ruta principal que devuelve los datos de las frutas
app.get("/", (req, res) => {
  res.status(200).json({
    BD, 
    exito: true, 
    descripcion: "Frutas encontradas con éxito"
  });
});

// Método GET. Devuelve la fruta buscada por ID.
app.get("/id/:id", (req, res) => {
  // Tomo el parámetro ID pasado en la URL
  const idFruta = parseInt(req.params.id);

  // Verifico que el ID sea numérico
  if (!isNaN(idFruta)) {
    // Verifico la existencia de la fruta 
    const frutaBuscada = buscarFrutaPorID(idFruta);

    // Controla si la fruta existe o no.
    if (frutaBuscada) {
      // Devuelvo la fruta buscada
      res.status(200).json({ 
        frutaBuscada, 
        exito: true, 
        descripcion: 'Fruta encontrada con éxito'
      });
    } else {
      // Devuelvo mensaje de error cuando no se encuentra
      res.status(400).json({
        exito: false,
        descripcion: `La fruta ${idFruta} no existe`
      });
    };
  } else {
    res.status(400).json({
      exito: false,
      descripcion: "El ID de la fruta no es válido"
    });
  };
});

// Ruta para agregar una nueva fruta al arreglo y guardar los cambios
app.post("/", (req, res) => {
  let nuevaFruta = req.body;

  // Verifico que el usuario provea todos los atributos que posee la fruta
  // Si falta alguno, devuelvo código de error 400, y notifico qué atributo le falta.
  if (!nuevaFruta.imagen) {
    res.status(400).json({
      exito: false,
      descripcion: "La falta enviar la imágen de la fruta" 
    })
  } else if (!nuevaFruta.nombre) {
    res.status(400).json({
      exito: false,
      descripcion: "La falta enviar el nombre de la fruta" 
    })
  } else if (!nuevaFruta.importe) {
    res.status(400).json({
      exito: false,
      descripcion: "La falta enviar el importe de la fruta" 
    })
  } else if (!nuevaFruta.stock) {
    res.status(400).json({
      exito: false,
      descripcion: "La falta enviar el stock de la fruta" 
    });
  } else {
    // Genero el ID a partir de la cantidad de elementos que haya en BD. Le sumo 1 para que el ID sea consecutivo.
    const id = BD.length + 1;

    // Coloco el nuevo ID al principio de los atributos de la fruta
    nuevaFruta = Object.assign({ id }, nuevaFruta);
    BD.push(nuevaFruta); // Agregar la nueva fruta al arreglo
    guardarFrutas(BD); // Guardar los cambios en el archivo
    res.status(201).json({
      exito: true,
      descripcion: "Fruta agregada con éxito!"
    });
  };
});

// Método PUT. Permite modificar una fruta existente.
app.put("/id/:id", (req, res) => {
  const idFruta = parseInt(req.params.id);

  // Verifico que el ID sea numérico
  if (!isNaN(idFruta)) {
    const datosActualizados = req.body;
    const frutaExistente = buscarFrutaPorID(idFruta);

    // Controlo si el ID de la fruta buscada existe.
    if (frutaExistente) {
      // Verifico que haya datos para actualizar en el body, Si no hay ninguno, devuelvo error.
      if (Object.keys(datosActualizados).length === 0) {
        res.status(400).json({
          exito: false,
          descripcion: "Debe enviar algún campo para poder actualizar"
        })
      } else {
        // Sólo actualizo los campos que el usuario envía en el body, Permitiéndole actualizar los campos que necesite
        if (datosActualizados.imagen) {
          frutaExistente.imagen = datosActualizados.imagen;
        }
        if (datosActualizados.nombre) {
          frutaExistente.nombre = datosActualizados.nombre;
        }
        if (datosActualizados.importe) {
          frutaExistente.importe = datosActualizados.importe;
        }
        if (datosActualizados.stock) {
          frutaExistente.stock = datosActualizados.stock;
        }
        // Guardo la fruta actualizada
        guardarFrutas(BD);

        // Informo el estado de éxito
        res.status(200).json({
          exito: true,
          descripcion: `Fruta ${idFruta} modificada con éxito`
        });
      };
    } else {
      res.status(400).json({
        exito: false,
        descripcion: `La fruta ${idFruta} no existe`
      });
    };
  } else {
    res.status(400).json({
      exito: false,
      descripcion: `El ID de la fruta no es válido`
    });
  }
});

// Método DELETE. Permite eliminar una fruta existente.
app.delete("/id/:id", (req, res) => {
  const idFruta = parseInt(req.params.id);

  // Verifico que el ID sea numérico
  if (!isNaN(idFruta)) {
    const frutaAEliminar = buscarFrutaPorID(idFruta);

    // Busco la fruta y controlo si existe
    if (frutaAEliminar) {
      BD.splice(BD.indexOf(frutaAEliminar), 1);
      guardarFrutas(BD);

      res.status(200).json({
        exito: true,
        descripcion: `Fruta ${idFruta} eliminada con éxito`
      });
    } else {
      res.status(400).json({
        exito: false,
        descripcion: `La fruta ${idFruta} que se desea eliminar, no existe`
      });
    };
  } else {
    res.status(400).json({
      exito: false,
      descripcion: `El ID de la fruta no es válido`
    });
  };
});

// Ruta para manejar las solicitudes a rutas no existentes
app.get("*", (req, res) => {
  res.status(404).json({
    exito: false,
    descripcion: "Lo sentimos, la página que buscas no existe"
  });
});

// Iniciar el servidor y escuchar en el puerto especificado
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
