var express = require('express');
var app = express();
var mongoose = require('mongoose');
var hbs = require('express-handlebars');
var session = require('express-session');
var cors = require('cors');

app.use(session({secret: 'fds8yksahfkj2389kjfhsdfsdf'}));

mongoose.Promise = global.Promise;

app.engine('handlebars', hbs());
app.set('view engine', 'handlebars');

app.use(cors());

// Async / Await
async function conectar() {
    await mongoose.connect(
            'mongodb://localhost:27017/curso', 
            {useNewUrlParser: true}
    )
    console.log('Conectado!');
}
conectar();

const ArtistaSchema = mongoose.Schema({
    nombre: String,
    apellido: String
})

const ArtistaModel = mongoose.model('Artista',
                            ArtistaSchema);



app.use(express.urlencoded({extended: true}));
app.use(express.json());

// -- CORTAR ACA 
app.get('/alta', function(req, res) {
    res.render('formulario');
})

app.post('/alta', async function(req, res) {
    // req.body.nombre
    // req.body.apellido
    if (req.body.nombre=='') {
        res.render('formulario', {
            error: 'El nombre es obligatorio',
            datos: {
                nombre: req.body.nombre,
                apellido: req.body.apellido
            }
        });
        return;
    }
    await ArtistaModel.create({
        nombre: req.body.nombre,
        apellido: req.body.apellido
    });
    res.redirect('/listado');
});

app.get('/listado', async function(req, res) {
    if (!req.session.user_id) {
        res.redirect('/login');
        return;
    }
    var abc = await ArtistaModel.find().lean();
    //res.redirect('/alta');
    res.render('listado', {listado: abc});
});

app.get('/borrar/:id', async function(req, res) {
    // :id -> req.params.id
    await ArtistaModel.findByIdAndRemove(
        {_id: req.params.id}
    );
    res.redirect('/listado');
});


app.get('/editar/:id', async function(req, res) {
    var artista = await ArtistaModel.findById({
        _id: req.params.id
    }).lean();
    res.render('formulario', {datos: artista});
});

app.post('/editar/:id', async function(req, res) {
    if (req.body.nombre=='') {
        res.render('formulario', {
            error: 'El nombre es obligatorio',
            datos: {
                nombre: req.body.nombre,
                apellido: req.body.apellido
            }
        });
        return;
    }
    await ArtistaModel.findByIdAndUpdate(
        {_id: req.params.id},
        {
            nombre: req.body.nombre, 
            apellido: req.body.apellido
        }
    );
    res.redirect('/listado');
});



app.get('/buscar/:id', async function(req, res) {
    var listado = await ArtistaModel.find({_id: req.params.id});
    res.send(listado);
});

app.get('/agregar', async function(req, res) {
    var nuevoArtista = await ArtistaModel.create(
        {nombre: 'Fat', apellido: 'Mike'}
    );
    res.send(nuevoArtista);
});

app.get('/modificar', async function(req, res) {
    await ArtistaModel.findByIdAndUpdate(
        {_id: '5e56fe51143a530abc834fa8'},
        {nombre: 'Nuevo nombre', apellido: 'NA'}
    );
    res.send('ok');
});

app.get('/borrar', async function(req, res) {
    var rta = await ArtistaModel.findByIdAndRemove(
        {_id: '5e56fe51143a530abc834fa8'}
    );
    res.send(rta);
});


app.get('/contar', function(req, res) {
    if (!req.session.contador) {
        req.session.contador = 0;
    }
    req.session.contador ++;
    res.json(req.session.contador);
});

app.get('/login', function(req, res) {
    res.render('login');
});

const UsuarioSchema = mongoose.Schema({
    username: String,
    password: String,
    email: String
})
const UsuarioModel = mongoose.model('usuario', UsuarioSchema);

app.post('/login', async function(req, res) {
    // user: admin / pass: admin123
    var usuarios = await UsuarioModel.find({
        username: req.body.username,
        password: req.body.password
    });    
    
    if (usuarios.length!=0) {
        req.session.user_id = usuarios[0]._id;
        res.redirect('/listado');
    } else {
        res.send('incorrecto');
    }
});


// -- API
app.get('/api/artistas', async function(req, res) {
    var listado = await ArtistaModel.find().lean();
    res.json(listado);
});

app.get('/api/artistas/:id', async function(req, res) {
    try {
        var unArtista = await ArtistaModel.findById(req.params.id);
        res.json(unArtista); 
    } catch(e) {
        res.status(404).send('error');
    }
});

app.post('/api/artistas', async function(req, res) {
    var artista = await ArtistaModel.create({
        nombre: req.body.nombre,
        apellido: req.body.apellido
    });
    res.json(artista);
});

app.put('/api/artistas/:id', async function(req, res) {
    try {
        await ArtistaModel.findByIdAndUpdate(
            req.params.id,
            {
                nombre: req.body.nombre,
                apellido: req.body.apellido
            }
        );
        res.status(200).send('ok');
    } catch(e) {
        res.status(404).send('error');
    }
});

app.delete('/api/artistas/:id', async function(req, res) {
    try {
        await ArtistaModel.findByIdAndDelete(req.params.id);
        res.status(204).send();
    }catch(e) {
        res.status(404).send('no encontrado');
    }
});


// <form action="/enviar_form" method="post">
app.post('/enviar_form', async function(req, res) {
    // <input type="text" name="nombre" />
    // req.body.nombre
    await ArtistaModel.create({
        nombre: req.body.nombre,
        apellido: req.body.apellido
    });

});



app.get('/signin', function(req, res) {
    res.render('signin_form');
});


app.post('/signin', async function(req, res) {
    if (req.body.username=="" || req.body.password=="") {
        res.render('signin_form', {
            error: 'El usuario/password es obligatorio', 
            datos: req.body
        });
        return;
    }
    await UsuarioModel.create({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
    });
    res.redirect('/login');
});








app.get('/buscar', function(req, res) {
    var listado = [
        {
          "userId": 1,
          "id": 1,
          "title": "delectus aut autem",
          "completed": false
        },
        {
          "userId": 1,
          "id": 2,
          "title": "quis ut nam facilis et officia qui",
          "completed": false
        },
        {
          "userId": 1,
          "id": 3,
          "title": "fugiat veniam minus",
          "completed": false
        },
        {
          "userId": 1,
          "id": 4,
          "title": "et porro tempora",
          "completed": true
        },
        {
          "userId": 1,
          "id": 5,
          "title": "laboriosam mollitia et enim quasi adipisci quia provident illum",
          "completed": false
        },
        {
          "userId": 1,
          "id": 6,
          "title": "qui ullam ratione quibusdam voluptatem quia omnis",
          "completed": false
        },
        {
          "userId": 1,
          "id": 7,
          "title": "illo expedita consequatur quia in",
          "completed": false
        },
        {
          "userId": 1,
          "id": 8,
          "title": "quo adipisci enim quam ut ab",
          "completed": true
        },
        {
          "userId": 1,
          "id": 9,
          "title": "molestiae perspiciatis ipsa",
          "completed": false
        },
        {
          "userId": 1,
          "id": 10,
          "title": "illo est ratione doloremque quia maiores aut",
          "completed": true
        },
        {
          "userId": 1,
          "id": 11,
          "title": "vero rerum temporibus dolor",
          "completed": true
        },
        {
          "userId": 1,
          "id": 12,
          "title": "ipsa repellendus fugit nisi",
          "completed": true
        },
        {
          "userId": 1,
          "id": 13,
          "title": "et doloremque nulla",
          "completed": false
        },
        {
          "userId": 1,
          "id": 14,
          "title": "repellendus sunt dolores architecto voluptatum",
          "completed": true
        },
        {
          "userId": 1,
          "id": 15,
          "title": "ab voluptatum amet voluptas",
          "completed": true
        },
        {
          "userId": 1,
          "id": 16,
          "title": "accusamus eos facilis sint et aut voluptatem",
          "completed": true
        },
        {
          "userId": 1,
          "id": 17,
          "title": "quo laboriosam deleniti aut qui",
          "completed": true
        },
        {
          "userId": 1,
          "id": 18,
          "title": "dolorum est consequatur ea mollitia in culpa",
          "completed": false
        },
        {
          "userId": 1,
          "id": 19,
          "title": "molestiae ipsa aut voluptatibus pariatur dolor nihil",
          "completed": true
        },
        {
          "userId": 1,
          "id": 20,
          "title": "ullam nobis libero sapiente ad optio sint",
          "completed": true
        }
      ];

      // Buscar id=7
      for(i=0; i<listado.length; i++) {
        //listado[i].completed = false;

        listado[i].usuario = 'Juan';
      }
      res.send(listado);
});








app.listen(3000, function() {
    console.log('App en localhost');
});




/*
app.post('form', function(req, res) {
    UsuarioModel.create({
        req.params.username: username;
        req.params.password: password;
    })
    req.send('ok');
});
*/


